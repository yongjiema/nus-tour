import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDateDisplay = (dateString: string): string => {
  try {
    return dayjs(dateString).format("MMM D, YYYY");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export const formatDateTimeDisplay = (dateString: string): string => {
  try {
    return dayjs(dateString).format("MMM D, YYYY h:mm A");
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

export const formatTimeAgo = (dateString: string): string => {
  try {
    return dayjs(dateString).fromNow();
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Unknown time";
  }
};
