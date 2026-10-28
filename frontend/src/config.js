export const fileUrl = (path) =>
  path && path.startsWith("/uploads")
    ? `${import.meta.env.VITE_API_URL || ""}${path}`
    : path;