"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sales from "../../components/reports/Sales";
import BestSelling from "../../components/reports/BestSelling";
import LocationAverage from "../../components/reports/LocationAverage";



export default function MainReport() {


    return (
        <>
            <div className="text-black">
                <Sales />
                <BestSelling />
                <LocationAverage />

            </div>
        </>
    )
}