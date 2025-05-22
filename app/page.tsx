"use server";
import { getYearbookEntries } from "@/lib/actions";
import { YearbookCarousel } from "@/components/yearbook-carousel";
import { YearbookQRCode } from "@/components/qr-code";

export default async function Home() {
  const entries = await getYearbookEntries();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Super Yearbook</h1>

        {entries.length === 0 ? (
          <div className="text-center p-12 border rounded-lg text-gray-600 bg-white">
            <h2 className="text-2xl font-semibold mb-4">No entries yet!</h2>
            <p className="text-gray-600">
              Scan the QR code in the bottom right corner to add the first
              yearbook entry.
            </p>
          </div>
        ) : (
          <YearbookCarousel entries={entries} />
        )}
      </div>

      <YearbookQRCode />
    </main>
  );
}
