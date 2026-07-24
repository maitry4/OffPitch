import { WaveVertical } from "@/components/ui/WaveDivider";

export function DashboardHero() {
  return (
    <section className="relative overflow-hidden px-6 sm:px-10">

      <div className="relative z-10 max-w-lg py-6 sm:max-w-xl sm:py-10 lg:py-12">
        <h1 className="text-[1.75rem] font-bold leading-snug text-white sm:text-4xl lg:text-[3.7rem] lg:leading-tight">
          Invite. Sing. Share{" "}
          <span className="text-red-500">Moments.</span>
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/50 sm:max-w-md sm:text-[1rem]">
          Create a private karaoke session or join your friend&apos;s room and
          start singing together.
        </p>
      </div>
    </section>
  );
}
