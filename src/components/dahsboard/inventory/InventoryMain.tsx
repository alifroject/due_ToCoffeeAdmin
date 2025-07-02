"use client";
import HeaderInventory from "./HeaderInventory"
import TransactionInv from "./TransactionInven"
import TopProductsPage from "./TopProducts"
import LastAnalyticsPage from "./FeedbackLestProducts"

export default function InventoryMain() {
    return (
        <div>
            <HeaderInventory />
            <TransactionInv />
            <TopProductsPage/>
            <LastAnalyticsPage/>
        </div>
    );
}
