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



// Helper to send notification to user
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
    console.log(`Notification sent for order ${orderId}, ${minutesLeft} minutes left`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}
export const monitorPickupStatus = onSchedule("every 3 minutes", async (event) => {
  const now = admin.firestore.Timestamp.now();

  const txSnapshot = await db.collection("transactions")
    .where("queue_status.ready_for_pickup", "==", true)
    .where("queue_number_status", "==", "waiting")
    .get();

  if (txSnapshot.empty) {
    console.log("No transactions waiting for pickup.");
    return; // ✅ Ubah ini
  }

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
      batch.update(doc.ref, {
        queue_number_status: "expired",
      });

      const queueDocRef = db.collection("queue").doc(orderId);
      batch.set(queueDocRef, {
        queue_number_status: "expired",
        updated_at: now,
      }, { merge: true });

      console.log(`Order ${orderId} expired after ${diffMinutes} minutes.`);
    } else {
      if (diffMinutes % NOTIFY_INTERVAL === 0) {
        const minutesLeft = MAX_WAIT_TIME - diffMinutes;
        await sendPickupNotification(userId, orderId, minutesLeft);
      }
    }
  }

  await batch.commit();
  return; // ✅ Ganti dari "return null"
});
