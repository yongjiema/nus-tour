import { Box, Button, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ButtonProps } from "@mui/material";

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  justifyContent: "flex-end",
  marginTop: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
  },
}));

interface FormActionsProps {
  onCancel?: () => void;
  onSubmit?: () => void;
  cancelText?: string;
  submitText?: string;
  isLoading?: boolean;
  disabled?: boolean;
  submitButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
}

export const FormActions = ({
  onCancel,
  onSubmit,
  cancelText = "Cancel",
  submitText = "Submit",
  isLoading = false,
  disabled = false,
  submitButtonProps,
  cancelButtonProps,
}: FormActionsProps) => {
  return (
    <ActionsContainer>
      {onCancel && (
        <Button variant="outlined" onClick={onCancel} disabled={isLoading} {...cancelButtonProps}>
          {cancelText}
        </Button>
      )}
      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={disabled || isLoading}
        type="submit"
        sx={{
          minWidth: 120, // Ensure consistent button width
          position: "relative", // For spinner positioning
        }}
        {...submitButtonProps}
      >
        {isLoading && (
          <CircularProgress
            size={20}
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              marginLeft: "-10px",
              marginTop: "-10px",
              color: "inherit",
            }}
          />
        )}
        <span style={{ visibility: isLoading ? "hidden" : "visible" }}>{submitText}</span>
      </Button>
    </ActionsContainer>
  );
};
