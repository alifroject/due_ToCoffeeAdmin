"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { dbFire } from "@/app/firebase/firebase";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Map from "../../../components/maps/Map";
import {
    User,
    Mail,
    Phone,
    BadgeInfo,
    CreditCard,
    Wallet,
    CalendarDays,
    CheckCircle,
    Clock
} from "lucide-react";


interface Item {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

interface Transaction {
    order_id: string;
    userName: string;
    userEmail: string;
    userId: string;
    userPhone: string;
    amount: number;
    status: string;
    created_at: any; // Firebase Timestamp
    items: Item[];
    location: {
        latitude: number;
        longitude: number;
    };
    queue_status: {  // Add queue status directly to the transaction
        accepted: boolean;
        in_progress: boolean;
        almost_ready: boolean;
        ready_for_pickup: boolean;
        picked_up: boolean
    };
}


interface Product {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
}

export default function TransactionDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [productImages, setProductImages] = useState<Record<string, string>>({});
    const collections = ["coffees", "drinks", "foods", "pastries"];
    const [statusFields, setStatusFields] = useState<Record<string, boolean>>({});

    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedStatusField, setSelectedStatusField] = useState<keyof typeof predefinedNotes>("accepted");

    const [selectedNote, setSelectedNote] = useState("");
    const [customNotes, setCustomNotes] = useState<Record<Status, string>>({
        accepted: "",
        in_progress: "",
        almost_ready: "",
        ready_for_pickup: "",
    });

    const [showSuccess, setShowSuccess] = useState(false);


    type Status = "accepted" | "in_progress" | "almost_ready" | "ready_for_pickup";

    const predefinedNotes = {
        accepted: [
            "✅ Order received and being processed.",
            "🕒 Please wait while we prepare your order.",
            "📥 Your order has entered the queue.",
        ],
        in_progress: [
            "🔥 Order is now being prepared.",
            "👨‍🍳 Our chef is working on your items.",
            "🍳 Preparing your food/drinks now.",
        ],
        almost_ready: [
            "⏳ Order is almost ready!",
            "📦 Finalizing your order packaging.",
            "🚀 Your order will be ready soon.",
        ],
        ready_for_pickup: [
            "📍 Your order is ready for pickup!",
            "✅ Please come to the counter to collect.",
            "📦 Order ready and waiting for you.",
        ],
    };

    useEffect(() => {
        if (showSuccess) {
            const timer = setTimeout(() => setShowSuccess(false), 2500); // Hide after 2.5s
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);



    const saveNoteToTransaction = async (note: string, status: Status) => {
        if (!transaction) return;

        const finalNote = customNotes[status]?.trim() || note;

        const transactionDocRef = doc(dbFire, "transactions", transaction.order_id);
        await updateDoc(transactionDocRef, {
            custom_note: finalNote,
            updated_at: serverTimestamp(),
        });
    };


    const updateTransactionStatus = async (field: Status) => {
        // Show modal to ask for a note before updating status
        setSelectedStatusField(field);
        setShowNoteModal(true); // Show modal when any status button is clicked
    };

    const handleModalSubmit = async () => {
        if (selectedStatusField) {
            await saveNoteToTransaction(selectedNote, selectedStatusField); // Now passes status
            await performStatusUpdate(selectedStatusField);
            setShowNoteModal(false);
            setShowSuccess(true);
        }
    };


    // Helper function to generate queue number based on current hour
    const getDoubleLettersByHour = (date: Date) => {
        const hour = date.getHours();
        const openingHour = 7;
        const closingHour = 21;

        if (hour < openingHour || hour > closingHour) return "XX";

        const index = hour - openingHour;
        const charCode = "A".charCodeAt(0) + index;
        const letter = String.fromCharCode(charCode);
        return letter + letter;
    };

    // Perform the actual status update after confirmation
    const performStatusUpdate = async (field: Status) => {
        if (!transaction) return;

        const transactionDocRef = doc(dbFire, "transactions", transaction.order_id);
        const resetFields = {
            accepted: false,
            in_progress: false,
            almost_ready: false,
            ready_for_pickup: false,
            picked_up: false
        };

        const updatedFields = {
            ...resetFields,
            [field]: true,
            updated_at: serverTimestamp(),
        };

        try {
            // Update transaction status
            await updateDoc(transactionDocRef, {
                queue_status: updatedFields,
            });

            // Update queue order status
            await updateQueueOrderStatus(field);

            if (field === "ready_for_pickup") {
                const order_id = transaction.order_id;
                const now = new Date();
                const timeCode = getDoubleLettersByHour(now);
                const minuteCode = String(now.getMinutes()).padStart(2, "0");

                const newQueueNumber = `${timeCode}${minuteCode}`;

                const transactionRef = doc(dbFire, "transactions", order_id);
                await updateDoc(transactionRef, {
                    queue_number: newQueueNumber,
                    queue_number_status: "waiting",
                });

                const queueRef = doc(dbFire, "queue", order_id);
                await setDoc(queueRef, {
                    queue_number: newQueueNumber,
                    queue_number_status: "waiting",
                    updated_at: now,
                    userId: transaction.userId, // ✅ Tambahkan ini
                }, { merge: true });
            }


            // Update local state
            setStatusFields((prevFields) => ({
                ...resetFields,
                [field]: true,
            }));

        } catch (err) {
            console.error("❌ Error updating status:", err);
        }
    };


    // Check admin access
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdTokenResult(true);
                const isAdmin =
                    token.claims.role === "admin" || user.email === "due-to2026@gmail.com";
                setIsAdmin(isAdmin);
            } else {
                setIsAdmin(false);
            }
        });
    }, []);



    const updateQueueOrderStatus = async (field: string) => {
        if (!transaction) return;

        const queueDocRef = doc(dbFire, "queueOrders", transaction.order_id);
        const queueSnap = await getDoc(queueDocRef);

        const resetFields = {
            accepted: false,
            in_progress: false,
            almost_ready: false,
            ready_for_pickup: false,
            picked_up: false
        };

        const updatedFields = {
            ...resetFields,
            [field]: true,
            userId: transaction.userId,
            userEmail: transaction.userEmail,
            order_id: transaction.order_id,
            created_at: serverTimestamp(),
        };

        try {
            if (queueSnap.exists()) {
                await updateDoc(queueDocRef, updatedFields);
            } else {
                await setDoc(queueDocRef, updatedFields);
            }

            // ✅ Update local state so buttons reflect new active status
            setStatusFields((prevFields) => ({
                ...resetFields,
                [field]: true, // update the clicked status
            }));


        } catch (err) {
            console.error("❌ Error updating status:", err);
        }
    };



    // Check admin access
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdTokenResult(true);
                const isAdmin =
                    token.claims.role === "admin" || user.email === "due-to2026@gmail.com";
                setIsAdmin(isAdmin);
            } else {
                setIsAdmin(false);
            }
        });
    }, []);

    // Fetch transaction data
    const fetchTransactionDetails = async () => {
        if (!id) return;

        try {
            const docRef = doc(dbFire, "transactions", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data() as Transaction;
                setTransaction(data);

                // Ambil status antrian
                const queueDocRef = doc(dbFire, "queueOrders", data.order_id);
                const queueSnap = await getDoc(queueDocRef);

                if (queueSnap.exists()) {
                    const queueData = queueSnap.data() as Record<string, any>;
                    setStatusFields({
                        accepted: queueData.accepted || false,
                        in_progress: queueData.in_progress || false,
                        almost_ready: queueData.almost_ready || false,
                        ready_for_pickup: queueData.ready_for_pickup || false,
                        picked_up: queueData.picked_up || false,

                    });
                }

                await fetchAllItemImages(data.items);
            } else {
                console.error("Transaction not found.");
            }
        } catch (error) {
            console.error("Error fetching transaction details:", error);
        } finally {
            setLoading(false);
        }
    };


    // Fetch product image from collections
    const fetchProductImage = async (id: string): Promise<string> => {
        if (!id) return ""; // Prevent undefined id

        for (const collection of collections) {
            try {
                const productRef = doc(dbFire, collection, id);
                const productSnap = await getDoc(productRef);
                if (productSnap.exists()) {
                    const data = productSnap.data() as Product;
                    return data.imageUrl;
                }
            } catch (err) {
                console.warn("⚠️ Error fetching from collection:", collection, err);
            }
        }

        return ""; // fallback if not found
    };


    // Loop through item IDs to fetch their imageUrls
    const fetchAllItemImages = async (items: Item[]) => {
        const images: Record<string, string> = {};
        for (const item of items) {
            if (!item.productId) continue; // Skip if ID is missing
            const imageUrl = await fetchProductImage(item.productId);
            images[item.productId] = imageUrl;
        }

        setProductImages(images);
    };

    useEffect(() => {
        if (isAdmin) fetchTransactionDetails();
    }, [id, isAdmin]);

    if (isAdmin === null)
        return <p className="text-gray-500 p-6">Checking admin access...</p>;

    if (!isAdmin)
        return (
            <p className="text-red-600 font-semibold p-6">
                ⛔ Access denied. Admins only.
            </p>
        );

    return (
        <div className="p-6 mx-auto">
            <div className="sticky top-[80px] z-50">
                <button
                    onClick={() => window.history.back()}
                    className="bg-red-600 backdrop-blur-md text-white hover:bg-red-400 hover:text-white rounded-full w-11 h-11 flex items-center justify-center shadow-md border border-gray-300"
                    aria-label="Go back"
                >
                    ←
                </button>
            </div>
            {loading ? (
                <p className="text-gray-400 animate-pulse">Loading transaction details...</p>
            ) : transaction ? (
                <>
                    <div className="space-y-6">
                        <h1 className="text-3xl md:text-2xl text-gray-900 mb-4">Transaction Details</h1>

                        {/* Make this a 2-column layout on desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Transaction Info Card */}
                            <div className="bg-white/40 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200 space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900">Transaction Info</h2>

                                {/* Top Row: Status, Amount, Date */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-800 text-sm md:text-base">
                                    {/* Status */}
                                    <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm">
                                        <CreditCard className="w-5 h-5 text-gray-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-black">Status</p>
                                            <p
                                                className={
                                                    transaction.status === "paid"
                                                        ? "text-green-600 font-semibold flex items-center gap-1"
                                                        : "text-yellow-600 font-semibold flex items-center gap-1"
                                                }
                                            >
                                                {transaction.status === "paid" ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <Clock className="w-4 h-4" />
                                                )}
                                                {transaction.status === "paid" ? "Paid" : "Pending"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm">
                                        <Wallet className="w-5 h-5 text-gray-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-black">Total</p>
                                            <p>
                                                {transaction && transaction.amount !== undefined
                                                    ? `Rp${transaction.amount.toLocaleString("id-ID")}`
                                                    : "Rp0"}
                                            </p>
                                        </div>
                                    </div>


                                    {/* Date */}
                                    <div className="flex items-start gap-3 p-4 bg-white/50 backdrop-blur-md rounded-xl border border-gray-200 shadow-sm">
                                        <CalendarDays className="w-5 h-5 text-gray-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-black">Date</p>
                                            <p>
                                                {transaction.created_at.toDate().toLocaleString("id-ID", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    second: "2-digit",
                                                    hour12: false,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Info (Below) */}
                                <div className="grid grid-cols-1 gap-6 text-gray-700 text-sm md:text-base font-sans">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-black">User</p>
                                            <p>{transaction.userName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-gray-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-black">Email</p>
                                            <p>{transaction.userEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-gray-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-black">Phone</p>
                                            <p>{transaction.userPhone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <BadgeInfo className="w-5 h-5 text-gray-600 mt-1" />
                                        <div>
                                            <p className="font-semibold text-black">User ID</p>
                                            <p>{transaction.userId}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* Item Details */}
                            <div className="bg-white/40 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-gray-200 space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">Item Details</h2>
                                {transaction.items && transaction.items.length > 0 ? (
                                    <ul className="grid grid-cols-1 gap-4">
                                        {transaction.items.map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-4 bg-white/40 backdrop-blur-lg border border-gray-200 rounded-xl p-4 shadow hover:shadow-md transition-all duration-200"
                                            >
                                                <img
                                                    src={productImages[item.productId] || "/placeholder.png"}
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-gray-800">{item.name}</span>
                                                        <span className="text-sm text-gray-600">
                                                            Qty: {item.quantity} x Rp{item.price.toLocaleString("id-ID")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No items found.</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-20">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Queue Status</h3>
                            <div className="grid md:grid-cols-2 gap-4 font-medium">
                                {["accepted", "in_progress", "almost_ready", "ready_for_pickup"].map((status) => (
                                    <div
                                        key={status}
                                        className={`w-full py-3 px-5 rounded-xl shadow-inner transition-all duration-300 text-white text-center tracking-wide capitalize
          ${statusFields[status] ? "bg-green-600 cursor-not-allowed opacity-80" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}
        `}
                                        onClick={() => {
                                            if (!statusFields[status]) updateTransactionStatus(status as Status);
                                        }}
                                    >
                                        {status.replace(/_/g, " ")}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {showNoteModal && selectedStatusField && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 transform transition-all duration-300 animate-slideUp">
                                    <h3 className="text-xl font-bold text-gray-800 text-center">
                                        Note for <span className="capitalize text-blue-600">{selectedStatusField.replace(/_/g, " ")}</span>
                                    </h3>

                                    {/* Predefined Notes */}
                                    <div className="space-y-2">
                                        {predefinedNotes[selectedStatusField]?.map((note, index) => (
                                            <div
                                                key={index}
                                                onClick={() => setSelectedNote(note)}
                                                className={`w-full py-2 px-4 rounded-md cursor-pointer text-white transition font-semibold text-center
              ${selectedNote === note
                                                        ? 'bg-red-700 ring-2 ring-red-400'
                                                        : 'bg-blue-600 hover:bg-blue-700'}
            `}
                                            >
                                                {note}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Custom Note */}
                                    <textarea
                                        value={customNotes[selectedStatusField] || ""}
                                        onChange={(e) =>
                                            setCustomNotes((prev) => ({
                                                ...prev,
                                                [selectedStatusField]: e.target.value,
                                            }))
                                        }
                                        placeholder="Or add your custom note here..."
                                        className="w-full text-gray-800 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                                    />


                                    {/* Action Buttons */}
                                    <div className="flex justify-end gap-4 pt-2">
                                        <div
                                            onClick={() => setShowNoteModal(false)}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md cursor-pointer transition"
                                        >
                                            Cancel
                                        </div>
                                        <div
                                            onClick={handleModalSubmit}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md cursor-pointer transition"
                                        >
                                            Submit
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}




                    </div>
                    <Map lat={transaction.location.latitude} lng={transaction.location.longitude} />

                </>

            ) : (
                <p className="text-red-500">Transaction not found.</p>
            )}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-green-100 text-green-800 font-semibold px-6 py-4 rounded-xl shadow-md animate-bounceIn">
                        ✅ Status updated!
                    </div>
                </div>
            )}


        </div>
    );


}