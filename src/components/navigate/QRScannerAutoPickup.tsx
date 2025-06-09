import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Props {
  order_id?: string;
  onClose: () => void;
  onSuccess: () => void; // callback for success
}

export default function QRScannerPopup({ onClose, onSuccess }: Props) {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false); // for spinner after scan
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const stopCamera = () => {
    const video = document.querySelector("video");
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

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
        try {
          if (scannerRef.current) {
            await scannerRef.current.clear();
            stopCamera();
            scannerRef.current = null;
          }
          setSuccess(true);
          setLoading(true); // show spinner

          // Wait 1 second (simulate processing)
          setTimeout(() => {
            setLoading(false);
            onSuccess(); // notify parent to update status & UI
            onClose();   // close popup automatically
          }, 1000);
        } catch {
          setErrorMsg("Failed to process QR code.");
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
        scannerRef.current.clear().catch(() => {});
        stopCamera();
        scannerRef.current = null;
      }
    };
  }, [onClose, onSuccess]);

  const handleClose = async () => {
    if (scannerRef.current) {
      await scannerRef.current.clear().catch(() => {});
      stopCamera();
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

        {loading ? (
          <div className="flex justify-center items-center h-24">
            {/* Simple spinner */}
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
          </div>
        ) : success ? (
          <div className="flex flex-col text-black items-center text-green-600">
            <p className="text-lg font-semibold">Order marked as picked up!</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg text-black font-bold mb-4">Scan QR Code</h2>
            <div id="qr-reader" className="w-full" />
            {errorMsg && <p className="text-red-600 mt-2">{errorMsg}</p>}
          </>
        )}
      </div>
    </div>
  );
}
