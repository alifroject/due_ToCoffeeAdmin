"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ReportMain from "../../components/reports/ReportMain";


export default function Reports() {


    return (
        <>
            <div className="text-black">
                <ReportMain />

            </div>
        </>
    )
}