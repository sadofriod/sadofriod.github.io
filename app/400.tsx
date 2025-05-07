'use client';

import Link from "next/link";
import { useEffect } from "react";

export default function BadRequestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-24">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-gray-100">400</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Bad Request</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          The server could not process your request due to invalid syntax or parameters.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="w-full sm:w-auto"
          >
            Try again
          </button>
          <button className="w-full sm:w-auto">
            <Link href="/">Return Home</Link>
          </button>
        </div>
      </div>
    </div>
  );
}
