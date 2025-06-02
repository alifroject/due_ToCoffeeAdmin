"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/app/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import ProductCategoryButtons from "../../components/products/ProductCategoryButtons";
import CoffeeSection from "../../components/products/CoffeeSection";
import DrinkSection from "../../components/products/DrinkSection";
import PastrySection from "../../components/products/PastrySection";
import FoodSection from "../../components/products/FoodSection";

export default function ProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read category from URL query, default to "coffee"
  const initialCategory = searchParams.get("category") || "coffee";
  const [category, setCategory] = useState(initialCategory);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Whenever category changes, update the URL query param without refreshing the page
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("category", category);
    window.history.replaceState(null, "", url.toString());
  }, [category]);

  // Category to background image mapping
  const categoryBackgrounds: Record<string, string> = {
    coffee: "/cofeebean.jpg",
    drink: "/beverages.jpg",
    pastry: "/pastries.jpg",
    food: "/food.jpg",
  };

  const backgroundImage = categoryBackgrounds[category] || "/defaultbg.jpg";

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative">
      <div
        className="m-5 bg-cover bg-center rounded-2xl p-8 shadow-lg relative z-10 transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold mb-6 text-white text-center drop-shadow-md bg-black px-4 py-2 rounded-[20px] inline-block">
            Our Products
          </h1>
        </div>



        <ProductCategoryButtons selected={category} setSelected={setCategory} />
      </div>

      <div className="-mt-24 bg-orange-200 pt-[100px] rounded-xl p-6 shadow-inner relative z-0">
        {category === "coffee" && <CoffeeSection />}
        {category === "drink" && <DrinkSection />}
        {category === "pastry" && <PastrySection />}
        {category === "food" && <FoodSection />}
      </div>
    </div>
  );
}
