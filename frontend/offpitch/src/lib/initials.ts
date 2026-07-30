export function getInitials(name?: string | null, username?: string | null, email?: string | null) {
  const source = (name || username || email || "").trim();
  if (!source) return "?";

  if (source.includes("@")) {
    const local = source.split("@")[0] ?? source;
    return local.slice(0, 2).toUpperCase();
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function displayName(name?: string | null, username?: string | null, email?: string | null) {
  return (name || username || email?.split("@")[0] || "Singer").trim();
}
