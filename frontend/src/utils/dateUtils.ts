import { format, parseISO, formatDistance } from "date-fns";

export const formatDateDisplay = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export const formatDateTimeDisplay = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "MMM d, yyyy h:mm a");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export const formatTimeAgo = (dateString: string): string => {
  try {
    return formatDistance(parseISO(dateString), new Date(), { addSuffix: true });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Unknown time";
  }
};
