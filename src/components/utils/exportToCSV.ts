import { Transaction } from "@/components/orderHistory/types/transaction";

const formatDate = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const d = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const t = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  return `${d} ${t}`;
};

export const exportTransactionsToCSV = (
  transactions: Transaction[],
  fromDate: Date,
  toDate: Date,
  selectedStatus: string
) => {
  const filtered = transactions.filter((t) => {
    const createdAt = t.created_at.toDate();
    const inRange = createdAt >= fromDate && createdAt <= toDate;
    const matchesStatus =
      selectedStatus === "" ||
      t.queue_number_status.toLowerCase() === selectedStatus.toLowerCase();
    return inRange && matchesStatus;
  });

  const headers = [
    "Order ID",
    "Amount",
    "Status",
    "Queue Number Status",
    "Created At",
    "User Name",
    "User Email",
    "User Phone",
  ];

  const rows = filtered.map((t) => [
    t.order_id,
    t.amount,
    t.status,
    t.queue_number_status,
    formatDate(t.created_at.toDate()),
    t.userName,
    t.userEmail,
    t.userPhone,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `transactions_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
