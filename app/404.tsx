'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-24">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 dark:text-gray-100">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
