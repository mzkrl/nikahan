"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html>
            <body className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-amber-50">
                <h2 className="text-2xl font-bold text-amber-900 mb-4">Something went wrong!</h2>
                <p className="text-amber-800 mb-6 max-w-md">
                    Terjadi kesalahan saat memuat aplikasi. Silakan coba muat ulang halaman.
                </p>
                <button
                    onClick={() => reset()} // Attempt to recover by re-rendering segment
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg shadow hover:bg-amber-700 transition"
                >
                    Try again
                </button>
            </body>
        </html>
    );
}
