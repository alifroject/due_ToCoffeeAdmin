// functions/src/setAdmin.ts
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";

admin.initializeApp();

const db = admin.firestore();
const MAX_WAIT_TIME = 30; // in minutes
const NOTIFY_INTERVAL = 5; // in minutes

export const setAdmin = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can call this function."
    );
  }

  const { email } = request.data as { email?: string };

  if (!email) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email is required to set admin role."
    );
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    return {
      message: `Successfully set admin role for ${email}`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    throw new functions.https.HttpsError("internal", errorMessage);
  }
});

// 🔔 Send notification every 5 minutes before expiration
async function sendPickupNotification(userId: string, orderId: string, minutesLeft: number) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    if (!userData?.fcmToken) return;

    const message = {
      token: userData.fcmToken,
      notification: {
        title: `Order ${orderId} Pickup Reminder`,
        body: `Your food will expire in ${minutesLeft} minutes. Please pick it up soon!`,
      },
      data: {
        order_id: orderId,
        minutes_left: minutesLeft.toString(),
      },
    };

    await admin.messaging().send(message);
    console.log(`Reminder sent: order ${orderId}, ${minutesLeft} mins left`);
  } catch (error) {
    console.error("Error sending reminder notification:", error);
  }
}

// 🔔 Send final notification after 30 minutes
export async function sendFinalExpiryNotification(userId: string, orderId: string) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return;

    const userData = userDoc.data();
    if (!userData?.fcmToken) return;

    const message = {
      token: userData.fcmToken,
      notification: {
        title: `Order ${orderId} Expired`,
        body: `Your food is expired. You can no longer take your order.`,
      },
      data: {
        order_id: orderId,
        minutes_left: "0",
        expired: "true",
      },
    };

    await admin.messaging().send(message);
    console.log(`Final expiry notification sent for order ${orderId}`);
  } catch (error) {
    console.error("Error sending final expiry notification:", error);
  }
}

export const monitorPickupStatus = onSchedule("every 1 minutes", async (event) => {
  const now = admin.firestore.Timestamp.now();

  const txSnapshot = await db.collection("transactions")
    .where("queue_status.ready_for_pickup", "==", true)
    .where("queue_number_status", "==", "waiting")
    .get();

 

  const batch = db.batch();

  for (const doc of txSnapshot.docs) {
    const data = doc.data();
    const orderId = doc.id;
    const userId = data.userId;
    const queueStatus = data.queue_status || {};
    const updatedAt = data.updated_at;

    if (queueStatus.picked_up === true) {
      console.log(`Order ${orderId} already picked up, skipping.`);
      continue;
    }

    if (!updatedAt) {
      console.warn(`Order ${orderId} missing updated_at field.`);
      continue;
    }

    const diffMs = now.toMillis() - updatedAt.toMillis();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes >= MAX_WAIT_TIME) {
      // ⛔ Mark order as expired
      batch.update(doc.ref, {
        queue_number_status: "expired",
      });

      const queueDocRef = db.collection("queue").doc(orderId);
      batch.set(queueDocRef, {
        queue_number_status: "expired",
        updated_at: now,
      }, { merge: true });

      // 🔔 Send final expiry notification
      await sendFinalExpiryNotification(userId, orderId);
      console.log(`Order ${orderId} expired after ${diffMinutes} minutes.`);
    } else {
      // 🔔 Send notification every NOTIFY_INTERVAL
      const minutesLeft = MAX_WAIT_TIME - diffMinutes;
      const isCloseToNotifyInterval = minutesLeft % NOTIFY_INTERVAL <= 1;

      if (isCloseToNotifyInterval && minutesLeft > 0) {
        await sendPickupNotification(userId, orderId, minutesLeft);
      }

    }
  }

  await batch.commit();
  return;
});
