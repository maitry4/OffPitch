"use client";

import { signInWithGoogle } from "@/lib/auth";
import { glowButtonClass } from "./glowButtonStyles";

export function StartSingingButton() {
  return (
    <button
      type="button"
      onClick={() => signInWithGoogle()}
      className={glowButtonClass}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
      Start Singing
    </button>
  );
}
