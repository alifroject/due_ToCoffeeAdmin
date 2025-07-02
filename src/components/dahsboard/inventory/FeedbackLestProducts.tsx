"use client";

import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    DocumentData,
} from "firebase/firestore";
import { dbFire } from "../../../app/firebase/firebase";

interface Product {
    name: string;
    imageUrl: string;
    productId: string;
    quantity: number;
    category: string;
}

export default function LastAnalyticsPage() {
    const [rareProducts, setRareProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchRareProducts = async () => {
            const categoryCollections = ["coffees", "pastries", "foods", "drinks"];
            const productMap: Record<string, Product> = {};

            // Step 1: Load all products from each category
            for (const category of categoryCollections) {
                const snapshot = await getDocs(collection(dbFire, category));
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    productMap[doc.id] = {
                        name: data.name,
                        imageUrl: data.imageUrl,
                        productId: doc.id,
                        quantity: 0, // initial
                        category,
                    };
                });
            }

            // Step 2: Load transaction data and count purchases
            const transactionsSnapshot = await getDocs(collection(dbFire, "transactions"));
            transactionsSnapshot.forEach((doc) => {
                const items: { productId: string; quantity: number }[] = doc.data().items || [];
                items.forEach((item) => {
                    if (item.productId && productMap[item.productId]) {
                        productMap[item.productId].quantity += item.quantity;
                    }
                });
            });

            // Step 3: Sort by lowest quantity and pick 4 random from the bottom
            const allProducts = Object.values(productMap);
            allProducts.sort((a, b) => a.quantity - b.quantity);

            const fewSold = allProducts.slice(0, 10); // bottom 10
            const randomFour = fewSold.sort(() => 0.5 - Math.random()).slice(0, 4);

            setRareProducts(randomFour);
        };

        fetchRareProducts();
    }, []);

    const feedbacks = [
        {
            user: "Anna W.",
            message: "Love the pastries! Would like more drink combos.",
        },
        {
            user: "John D.",
            message: "The coffee is great, but app performance could be better.",
        },
        {
            user: "Sarah M.",
            message: "More vegetarian food options would be amazing!",
        },
        {
            user: "Alex T.",
            message: "Smooth checkout, fast delivery. Keep it up!",
        },
    ];

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m5-9v9m4-9v9m4-9l2 9"
                            />
                        </svg>
                        Buy 1 Get 1 Opportunity
                    </h2>

                    <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                        Analytics show these products are underperforming. Consider offering them as a <strong className="text-blue-700">Buy 1 Get 1</strong> promotion to boost sales.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {rareProducts.map((product, index) => (
                            <div
                                key={product.productId}
                                className={`bg-blue-400 rounded-xl p-3 shadow-sm hover:shadow-md transition text-center ${index % 2 !== 0 ? 'mt-6' : ''
                                    }`}
                            >
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-20 h-20 mx-auto rounded-full object-cover border border-gray-300"
                                />
                                <p className="mt-2 text-sm font-medium  text-white">{product.name}</p>
                                <p className="text-[11px]  text-white">Sold: {product.quantity}</p>
                            </div>
                        ))}

                    </div>
                </div>


                {/* FEEDBACK RIGHT BOX */}
                <div className="bg-white rounded-xl p-6 shadow-md border">
                    <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                        💬 User Feedbacks
                    </h2>
                    <div className="space-y-4">
                        {feedbacks.map((f, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg shadow-sm border">
                                <p className="text-sm text-gray-800 font-semibold mb-1">{f.user}</p>
                                <p className="text-sm text-gray-600 italic">"{f.message}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
