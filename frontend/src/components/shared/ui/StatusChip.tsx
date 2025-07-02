import { styled } from "@mui/material/styles";
import { Chip } from "@mui/material";
import type { ChipProps } from "@mui/material";

export const StatusChip = styled(Chip)<ChipProps & { status?: "success" | "warning" | "error" | "info" }>(
  ({ theme, status = "info" }) => {
    const colors = {
      success: {
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.contrastText,
      },
      warning: {
        backgroundColor: theme.palette.warning.light,
        color: theme.palette.warning.contrastText,
      },
      error: {
        backgroundColor: theme.palette.error.light,
        color: theme.palette.error.contrastText,
      },
      info: {
        backgroundColor: theme.palette.info.light,
        color: theme.palette.info.contrastText,
      },
    };

    return {
      ...colors[status],
      fontWeight: 600,
      fontSize: "0.75rem",
      height: "auto",
      padding: theme.spacing(0.5, 1),
      "&:hover": {
        backgroundColor: theme.palette[status].main,
      },
    };
  },
);
