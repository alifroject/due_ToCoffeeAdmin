type Transaction = {
    created_at: {
        seconds: number;
        nanoseconds: number;
    };
    queue_number_status: string;
};


export function formatTransactionData(transactions: Transaction[]) {
    const dateMap: Record<
        string,
        { pickedUp: number; expired: number }
    > = {};

    let pickedUpTotal = 0;
    let expiredTotal = 0;

    transactions.forEach((tx) => {
        const date = new Date(tx.created_at.seconds * 1000)
            .toISOString()
            .split("T")[0]; // format: YYYY-MM-DD

        if (!dateMap[date]) {
            dateMap[date] = { pickedUp: 0, expired: 0 };
        }

        if (tx.queue_number_status === "picked up") {
            dateMap[date].pickedUp += 1;
            pickedUpTotal++;
        } else if (tx.queue_number_status === "expired") {
            dateMap[date].expired += 1;
            expiredTotal++;
        }
    });

    const sortedDates = Object.keys(dateMap).sort();

    const lineChartData = sortedDates.map((date) => ({
        date,
        "picked up": dateMap[date].pickedUp,
        expired: dateMap[date].expired,
    }));

    const barChartData = [
        { status: "picked up", count: pickedUpTotal },
        { status: "expired", count: expiredTotal },
    ];

    return {
        lineChartData,
        barChartData,
    };
}
