/**
 * Format quiz duration in minutes into a human-readable string in Indonesian.
 * If minutes >= 60, it will convert to hours (e.g. "1 jam", "1 jam 30 menit").
 * It also caps the formatted duration display at 24 hours (1440 minutes).
 */
export function formatQuizDuration(minutes: number | undefined | null): string {
  if (!minutes || minutes <= 0) return "Tanpa Batasan";
  
  // Cap at 24 hours (1440 minutes)
  const capped = Math.min(minutes, 1440);
  
  if (capped < 60) {
    return `${capped} menit`;
  }
  
  const hours = Math.floor(capped / 60);
  const mins = capped % 60;
  
  if (mins === 0) {
    return `${hours} jam`;
  }
  
  return `${hours} jam ${mins} menit`;
}

/**
 * Format seconds countdown into hh:mm:ss if >= 1 hour, or mm:ss if < 1 hour.
 */
export function formatCountdownTime(seconds: number): string {
  if (seconds <= 0) return "0:00";
  
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
