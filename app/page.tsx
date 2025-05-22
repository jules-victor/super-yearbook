import { getYearbookEntries } from "@/lib/actions"
import { RealTimeYearbook } from "@/components/realtime-yearbook"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Home() {
  const entries = await getYearbookEntries()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-6xl mx-auto">
        <RealTimeYearbook initialEntries={entries} />
      </div>
    </main>
  )
}
