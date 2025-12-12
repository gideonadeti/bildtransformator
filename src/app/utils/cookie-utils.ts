import axios from "axios";

/**
 * Clears the refreshToken cookie by calling the Next.js API route.
 * This is necessary because the cookie is httpOnly and cannot be cleared from client-side JavaScript.
 * Uses axios directly (not the instance) since this calls a frontend API route, not the backend.
 */
export const clearRefreshTokenCookie = async () => {
  try {
    await axios.post("/api/auth/clear-cookie");
  } catch (error) {
    // Silently fail - cookie might already be cleared or network error
    // This is not critical for the user experience
    console.error("Failed to clear refresh token cookie:", error);
  }
};
