import { useCreate } from "@refinedev/core";
import type { FeedbackRequest } from "../types/api.types";

export const useCreateFeedback = () => {
  const { mutate, isPending } = useCreate();

  const createFeedback = (data: FeedbackRequest) => {
    mutate({
      resource: "feedback",
      values: data,
    });
  };

  return { createFeedback, isPending };
};
