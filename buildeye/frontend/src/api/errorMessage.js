// Turns an axios error into a message a non-technical user can act on.
// The most common real-world failure isn't "wrong password" — it's the
// backend not running at all, which axios reports very differently
// (err.request exists but err.response doesn't) from a normal 4xx/5xx.
export function getErrorMessage(err, fallback) {
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }
  if (err?.request) {
    return "Can't reach the Buildeye server. Make sure the backend is running — open a terminal, run \"cd backend && npm run dev\", then try again.";
  }
  return fallback;
}
