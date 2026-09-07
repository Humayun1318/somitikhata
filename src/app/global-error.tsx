'use client';

export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center bg-white p-6 text-gray-900">
          <section className="text-center">
            <h1 className="text-xl font-semibold">Application error</h1>
            <p className="mt-2 text-sm">Please reload the application.</p>
          </section>
        </main>
      </body>
    </html>
  );
}
