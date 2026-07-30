import { KaraokeHouseView } from "@/components/karaoke-house/KaraokeHouseView";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ inviteCode: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { inviteCode } = await params;
  return {
    title: `Room ${inviteCode.toUpperCase()} | OffPitch`,
    description: "Sing together in a private karaoke room",
  };
}

export default async function KaraokeHousePage({ params }: Props) {
  const { inviteCode } = await params;
  return <KaraokeHouseView inviteCode={inviteCode.toUpperCase()} />;
}
