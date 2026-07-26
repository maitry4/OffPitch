import Image from "next/image";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { StartSingingButton } from "@/components/ui/StartSingingButton";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { WaveIcon } from "@/components/ui/WaveIcon";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black font-sans">
      <Image
        src="/desktop_bg_3.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 z-[5] bg-black/45" />
      <div className="absolute bottom-0 right-0 z-10 h-full w-full sm:w-[65%]">
        <Image
          src="/girl_img.png"
          alt="Woman wearing headphones, singing"
          fill
          priority
          className="object-contain object-bottom sm:object-right-bottom"
        />
      </div>

      <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-12 sm:py-8">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]">
            <WaveIcon className="h-5 w-5" />
          </span>
          <span className="hidden text-2xl font-bold text-white sm:inline">
            Off<span className="text-red-500">Pitch</span>
          </span>
        </div>

        <GoogleButton />
      </header>

      <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 sm:items-start sm:px-12 sm:pl-16 lg:pl-35 lg:justify-center">
        <div className="max-w-xl">
          <h1 className="text-6xl font-extrabold leading-none tracking-tight text-white sm:text-7xl">
            Off<span className="text-red-500">&nbsp;Pitch</span>
          </h1>

          <p className="mt-4 text-2xl font-medium text-white sm:text-3xl">
            Invite. <span className="text-red-500">Sing.</span> Share the Moment.
          </p>

          <WaveDivider className="mt-4 h-5 w-52 text-red-500" />

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
            No audience. No pressure. Just you and your friends in a private
            karaoke room with live lyrics, real-time audio, and{" "}
            <span className="text-white">unforgettable</span> moments worth
            replaying.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <StartSingingButton />
          </div>
        </div>
      </main>
    </div>
  );
}
