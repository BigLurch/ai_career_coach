import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          AI Career Coach
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Förbättra ditt CV, matcha mot jobbannonser och få en konkret roadmap mot ditt drömjobb.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-black px-5 py-3 text-white hover:opacity-90"
          >
            Skapa konto
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-5 py-3 hover:bg-white"
          >
            Logga in
          </Link>
        </div>
      </div>
    </main>
  );
}