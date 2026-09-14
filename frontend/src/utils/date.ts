/**
 * Official Government of India Date Formatter
 * Enforces strict DD-MM-YYYY format per Ministry standards.
 */
export function formatGovDate(
  dateInput?: string | Date | number | null,
  includeTime: boolean = false
): string {
  if (!dateInput) return 'N/A';

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'N/A';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (!includeTime) {
      return `${day}-${month}-${year}`;
    }

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes} IST`;
  } catch {
    return 'N/A';
  }
}
