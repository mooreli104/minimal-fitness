/**
 * Parses a weight string like "185 lbs", "90kg", "100 kg", "225" into a number.
 * Returns null if the string contains no parseable number.
 */
export const parseWeight = (weightStr: string): number | null => {
  if (!weightStr || !weightStr.trim()) return null;
  const match = weightStr.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return isNaN(value) ? null : value;
};
