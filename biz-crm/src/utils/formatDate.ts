/**
 * Format date to readable string
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("uz-UZ", defaultOptions).format(dateObj);
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format date to time string (HH:MM)
 */
export function formatTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid time";
  }

  return new Intl.DateTimeFormat("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Hozirgina";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} daqiqa oldin`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} soat oldin`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} kun oldin`;
  }

  return formatDate(dateObj);
}

/**
 * Get month name
 */
export function getMonthName(monthIndex: number): string {
  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "Iyun",
    "Iyul",
    "Avgust",
    "Sentabr",
    "Oktabr",
    "Noyabr",
    "Dekabr",
  ];

  return months[monthIndex] || "Unknown";
}
