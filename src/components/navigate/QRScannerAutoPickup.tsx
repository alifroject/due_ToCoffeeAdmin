import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
  order_id: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QRScannerPopup({ order_id, onClose, onSuccess }: Props) {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const qrRegion = document.getElementById("qr-reader");
    if (qrRegion) qrRegion.innerHTML = "";

    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: 250,
        showCameraSwitcher: false,
      } as any,
      false
    );

    scannerRef.current.render(
      async (decodedText: string) => {
        if (processing) return;
        setProcessing(true);
        setLoading(true);

        try {
          if (decodedText === order_id) {
            setSuccessMsg("QR Code is valid!");
            setErrorMsg("");

            setTimeout(() => {
              setLoading(false);
              onSuccess();
              handleClose();
            }, 1500);
          } else {
            setErrorMsg("QR code mismatch. Please scan the correct code.");
            setSuccessMsg("");
            setLoading(false);
            setProcessing(false);
          }
        } catch (err) {
          setErrorMsg("Failed to process QR code.");
          setSuccessMsg("");
          setLoading(false);
          setProcessing(false);
          console.error(err);
        }
      },
      (error) => {
        if (error && !error.includes("NotFoundException")) {
          console.warn("QR scanning error:", error);
        }
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []); // <--- IMPORTANT: empty dependency array

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg p-6 relative w-[320px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          aria-label="Close Scanner"
        >
          ✕
        </button>

        <h2 className="text-lg text-black font-bold mb-4">Scan QR Code</h2>
        <div id="qr-reader" className="w-full" />

        {loading && (
          <div className="flex flex-col justify-center items-center h-24 mt-2">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>

            <div className="flex items-center mt-3 text-sm text-gray-700">
              <svg
                className="w-5 h-5 mr-2 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
              </svg>
              <span>This order has been scanned...</span>
            </div>
          </div>
        )}


        {successMsg && (
          <p className="text-green-600 mt-4 font-semibold">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="text-red-600 mt-4 font-semibold">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
