"use client";
import HeaderInventory from "./HeaderInventory"
import TransactionInv from "./TransactionInven"
import TopProductsPage from "./TopProducts"

export default function InventoryMain() {
    return (
        <div>
            <HeaderInventory />
            <TransactionInv />
            <TopProductsPage/>
        </div>
    );
}
