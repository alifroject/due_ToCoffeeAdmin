"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QueueNumberColumn from "../../components/reports/Sales";


export default function Reports() {


    return (
        <>
            <div className="text-black">
                <QueueNumberColumn />
            </div>
        </>
    )
}