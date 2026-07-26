"use client";

import { glowButtonClass } from "./glowButtonStyles";

export function StartSingingButton() {
  const handleSignIn = async () => {
    const { signIn } = await import("next-auth/react");
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <button
      type="button"
      onClick={handleSignIn}
      className={glowButtonClass}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
      Start Singing
    </button>
  );
}
