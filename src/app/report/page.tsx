"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sales from "../../components/reports/Sales";
import BestSelling from "../../components/reports/BestSelling";


export default function Reports() {


    return (
        <>
            <div className="text-black">
                <Sales />
                <BestSelling />
            </div>
        </>
    )
}