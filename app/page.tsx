import { getYearbookEntries } from "@/lib/actions";
import { RealTimeYearbook } from "@/components/realtime-yearbook";
import Image from "next/image";
import logo from "@/public/Logo_super_school.png";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const entries = await getYearbookEntries();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="flex w-full h-full justify-center items-center absolute top-0 left-0 z-50">
        <Image src={logo} alt="logo" width={240} height={240}></Image>
      </div>
      <div className="w-full max-w-6xl mx-auto relative">
        {entries && <RealTimeYearbook initialEntries={entries} />}
      </div>
    </main>
  );
}
