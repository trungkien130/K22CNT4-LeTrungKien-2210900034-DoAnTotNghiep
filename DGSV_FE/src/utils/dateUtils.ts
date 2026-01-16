/**
 * Formats a date string into a Vietnamese locale date string (dd/mm/yyyy).
 * @param date The date string or object to format.
 * @returns The formatted date string, or "Chưa cập nhật" if input is null/undefined.
 */
export const formatDate = (date?: string | Date | null): string => {
    if (!date) return "Chưa cập nhật";
    return new Date(date).toLocaleDateString("vi-VN");
};
