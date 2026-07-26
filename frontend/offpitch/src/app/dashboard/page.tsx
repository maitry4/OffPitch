import Image from "next/image";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import {
  CreateSessionCard,
  JoinSessionCard,
} from "@/components/dashboard/SessionCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | OffPitch",
  description: "Create or join a karaoke session",
};

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans">
      <Image
        src="/desktop_bg_3.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 z-[5] bg-black/45" />

      <div className="absolute bottom-0 right-0 z-10 h-[85vh] w-full sm:h-full sm:w-[65%] sm:translate-x-6 lg:translate-x-20">
        <Image
          src="/girl_img.png"
          alt=""
          fill
          priority
          className="scale-110 object-contain object-bottom sm:scale-125 sm:object-right-bottom"
        />
      </div>

      <div className="relative z-20 flex min-h-screen flex-col">
        <DashboardHeader />
        <DashboardHero />

        <main className="relative flex-1 px-6 pb-10 pt-4 sm:px-10 sm:pb-12 sm:pt-6 lg:pl-14 lg:pt-8">
          <div className="grid max-w-4xl grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            <CreateSessionCard />
            <JoinSessionCard />
          </div>
        </main>
      </div>
    </div>
  );
}
