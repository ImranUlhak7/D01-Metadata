/**
 * Combines a date-time string (where time is always 00:00:00) with a separate time string.
 *
 * @param {string} dateTimeStr - An ISO 8601 formatted date-time string where time portion must be "00:00:00"
 *                              (e.g., "2025-03-12T00:00:00")
 * @param {string} timeStr - A 24-hour format time string (HH:mm:ss)
 *                          (e.g., "06:05:00")
 * @returns {string} A new ISO 8601 formatted date-time string with the original date and new time,
 *                  or the original dateTimeStr if input validation fails
 */
export default function GetCombinedDateAndTime(dateTimeStr, timeStr) {
  // Validate date format (YYYY-MM-DDTHH:mm:ss where time is always 00:00:00)
  const datePattern = /^\d{4}-\d{2}-\d{2}T00:00:00$/;
  if (!datePattern.test(dateTimeStr)) {
      // If the format is not what we expect, just return the date as is.
      return dateTimeStr;
  }

  // Validate time format (HH:mm:ss)
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!timePattern.test(timeStr)) {
      // If the format is not what we expect, just return the date as is.
      return dateTimeStr;
  }

  // Extract the date portion (everything before T)
  const datePart = dateTimeStr.split('T')[0];

  // Combine date and new time
  return `${datePart}T${timeStr}`;
}
