import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-black font-sans">
      {/* Background image */}
      <Image
        src="/desktop_bg_3.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />
      {/* Black overlay */}
      <div className="absolute inset-0 z-[5] bg-black/45" />
      {/* Girl image, right side */}
      <div className="absolute bottom-0 right-0 z-10 h-full w-full sm:w-[65%]">
        <Image
          src="/girl_img.png"
          alt="Woman wearing headphones, singing"
          fill
          priority
          className="object-contain object-bottom sm:object-right-bottom"
        />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-12 sm:py-8">
        <div className="flex items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-red-500 text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]">
            <WaveIcon className="h-5 w-5" />
          </span>
          <span className="text-2xl font-bold text-white">
            Off<span className="text-red-500">Pitch</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#"
            className="hidden text-base text-white/90 transition hover:text-white sm:block"
          >
            Login
          </a>
          <a
            href="#"
            className="rounded-full bg-red-600 px-6 py-2.5 text-base font-medium text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] transition hover:bg-red-500"
          >
            Sign Up
          </a>
        </div>
      </header>

      {/* Hero content */}
<main className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 sm:px-12 sm:items-start sm:pl-16 lg:pl-35 lg:justify-center">        <div className="max-w-xl">
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
            <Link
              href="#"
  className="flex items-center gap-3 rounded-full border border-red-500/50 bg-black/40 px-7 py-4 text-base font-medium text-white backdrop-blur-sm shadow-[inset_0_0_20px_rgba(220,38,38,0.5),0_0_15px_rgba(220,38,38,0.3)] transition hover:bg-black/60 hover:shadow-[inset_0_0_25px_rgba(220,38,38,0.7),0_0_20px_rgba(220,38,38,0.4)]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Singing
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function WaveIcon({ className }: { className?: string }) {
  const heights = [4, 8, 12, 16, 10, 6, 12, 8, 4];
  return (
    <svg viewBox="0 0 36 20" className={className} fill="none">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 4}
          y={10 - h / 2}
          width="2"
          height={h}
          rx="1"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function WaveDivider({ className }: { className?: string }) {
  const heights = [6, 14, 8, 18, 6, 12, 16, 8, 14, 6, 10, 18, 8, 14, 6, 10, 16, 8, 12, 6];
  return (
    <svg viewBox="0 0 200 20" className={className} fill="none">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 10}
          y={10 - h / 2}
          width="3"
          height={h}
          rx="1.5"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}