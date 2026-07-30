"use client";

import { displayName, getInitials } from "@/lib/initials";
import type { SessionMember } from "@/lib/sessions";
import { MemberTile } from "./MemberTile";

export function ParticipantGrid({ members }: { members: SessionMember[] }) {
  const labeled = members.map((m) => ({
    ...m,
    label: m.isYou ? "You" : displayName(m.name, m.username, m.email),
    initials: getInitials(m.name, m.username, m.email),
  }));

  const mobile = labeled.slice(0, 4);
  const desktopOthers = labeled.filter((m) => !m.isYou).slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 lg:hidden">
        {mobile.map((m) => (
          <MemberTile
            key={m.id}
            name={m.label}
            initials={m.initials}
            isActive={m.isHost}
            className="aspect-[4/3] min-h-[110px]"
          />
        ))}
        {mobile.length === 0 && (
          <p className="col-span-2 text-center text-sm text-white/40">No one here yet</p>
        )}
      </div>

      <div className="hidden gap-3 lg:grid lg:grid-cols-5">
        {desktopOthers.map((m) => (
          <MemberTile
            key={m.id}
            name={m.label}
            initials={m.initials}
            className="aspect-[5/4] min-h-[120px]"
          />
        ))}
        {desktopOthers.length === 0 && (
          <p className="col-span-5 text-sm text-white/40">Waiting for friends to join…</p>
        )}
      </div>
    </>
  );
}
