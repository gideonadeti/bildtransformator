export const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;

  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[index]}`;
};

/**
 * Parses a human-entered megabytes value into bytes.
 * Returns null for empty or invalid input.
 */
export const parseMegabytesInput = (value: string): number | null => {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const numeric = Number.parseFloat(trimmed.replace(",", "."));

  if (!Number.isFinite(numeric) || numeric < 0) return null;

  return Math.round(numeric * 1024 * 1024);
};
