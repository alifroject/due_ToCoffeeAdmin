"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { dbFire } from "../../../app/firebase/firebase";

interface Product {
    name: string;
    imageUrl: string;
    productId: string;
    quantity: number; // total quantity sold
}

interface TransactionItem {
    productId: string;
    quantity: number;
}

export default function TopProductsPage() {
    const [topProducts, setTopProducts] = useState<{
        coffees: Product[];
        pastries: Product[];
        foods: Product[];
        drinks: Product[];
    }>({
        coffees: [],
        pastries: [],
        foods: [],
        drinks: [],
    });

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchTopProducts = async () => {
            const categoryCollections = [
                "coffees",
                "pastries",
                "foods",
                "drinks",
            ] as const;
            type Category = (typeof categoryCollections)[number];

            const allProducts: Record<
                Category,
                Record<string, Omit<Product, "quantity">>
            > = {
                coffees: {},
                pastries: {},
                foods: {},
                drinks: {},
            };

            for (const category of categoryCollections) {
                const snapshot = await getDocs(collection(dbFire, category));
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    allProducts[category][doc.id] = {
                        name: data.name,
                        imageUrl: data.imageUrl,
                        productId: doc.id,
                    };
                });
            }

            const productCount: Record<string, number> = {};

            const transactionsSnapshot = await getDocs(
                collection(dbFire, "transactions")
            );
            transactionsSnapshot.forEach((doc) => {
                const data = doc.data();
                const items: TransactionItem[] = data.items || [];

                items.forEach((item) => {
                    if (!item.productId || !item.quantity) return;
                    productCount[item.productId] =
                        (productCount[item.productId] || 0) + item.quantity;
                });
            });

            const categorizedTopProducts: typeof topProducts = {
                coffees: [],
                pastries: [],
                foods: [],
                drinks: [],
            };

            for (const category of categoryCollections) {
                const categoryProducts = allProducts[category];
                const scored: Product[] = [];

                for (const productId in categoryProducts) {
                    const productData = categoryProducts[productId];
                    const soldQty = productCount[productId] || 0;
                    if (soldQty > 0) {
                        scored.push({
                            ...productData,
                            quantity: soldQty,
                        });
                    }
                }

                scored.sort((a, b) => b.quantity - a.quantity);
                categorizedTopProducts[category] = scored.slice(0, 4);
            }

            setTopProducts(categorizedTopProducts);
        };

        fetchTopProducts();
    }, []);

    const handleClickProduct = (product: Product) => {
        setSelectedProduct(product);
    };

    const renderColumn = (categoryName: keyof typeof topProducts) => (
        <div className="flex flex-col items-center gap-6">
            {topProducts[categoryName].map((product) => (
                <div
                    key={product.productId}
                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-300 cursor-pointer hover:scale-105 transition"
                    onClick={() => handleClickProduct(product)}
                >
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-8">
            <h1 className="text-2xl font-normal mb-8 text-left text-gray-800 flex items-center gap-2">
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
                        d="M4 6h16M4 10h10M4 14h6M4 18h4"
                    />
                </svg>
                Top 4 Bestselling Products by Category
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-center">
                {/* COFFEES */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 text-center hover:shadow-lg transition">
                    <h2 className="font-semibold mb-4 text-purple-700 border-b pb-2">
                        Coffees
                    </h2>
                    {renderColumn("coffees")}
                </div>

                {/* DRINKS */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 text-center hover:shadow-lg transition">
                    <h2 className="font-semibold mb-4 text-purple-700 border-b pb-2">
                        Drinks
                    </h2>
                    {renderColumn("drinks")}
                </div>

                {/* PASTRIES */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 text-center hover:shadow-lg transition">
                    <h2 className="font-semibold mb-4 text-purple-700 border-b pb-2">
                        Pastries
                    </h2>
                    {renderColumn("pastries")}
                </div>

                {/* FOODS */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 text-center hover:shadow-lg transition">
                    <h2 className="font-semibold mb-4 text-purple-700 border-b pb-2">
                        Foods
                    </h2>
                    {renderColumn("foods")}
                </div>
            </div>

            {/* POPUP */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center shadow-lg relative">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-2 right-4 text-gray-500 hover:text-red-500 text-xl font-bold"
                        >
                            ×
                        </button>
                        <img
                            src={selectedProduct.imageUrl}
                            alt={selectedProduct.name}
                            className="w-40 h-40 rounded-full mx-auto object-cover mb-4 border-4 border-purple-400"
                        />
                        <h3 className="text-xl font-bold mb-2 text-gray-800">
                            {selectedProduct.name}
                        </h3>
                        <p className="text-gray-600">
                            Total sold: {selectedProduct.quantity}
                        </p>
                    </div>
                </div>
            )}
        </div>

    );
}
