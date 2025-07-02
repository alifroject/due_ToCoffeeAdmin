"use client";
import RevenueHeader from "@/components/dahsboard/sales/Revenue";
import TransactionStatsPage from "@/components/dahsboard/sales/TransactionStatsPage";
import TransactionMapPage from "@/components/dahsboard/sales/MapAnalytic";
import WebhookAnalyticsPage from "@/components/dahsboard/sales/WebhookAnalyticsPage";



export default function SalesMain() {


    return (
        <>
            <div className="p-6">
                
                <RevenueHeader />
                <TransactionStatsPage/>
                <TransactionMapPage/>
                <WebhookAnalyticsPage/>
                {/* More components can go here */}
            </div>
        </>
    )
}