"use client";
import HeaderInventory from "./HeaderInventory"
import TransactionInv from "./TransactionInven"

export default function InventoryMain() {
    return (
        <div className="w-full max-w-full  overflow-x-hidden">
            <HeaderInventory />
            <TransactionInv />
        </div>
    );
}
