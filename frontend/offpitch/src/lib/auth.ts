const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * Starts Google sign-in via the Java backend.
 * Wire this to the backend OAuth endpoint when ready.
 */
export async function signInWithGoogle(): Promise<void> {
  // TODO: redirect or fetch from Java backend, e.g.:
  // window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  void API_BASE_URL;
}
