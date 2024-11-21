import { Box, TextField } from "@mui/material";
import { Create } from "@refinedev/mui";
import { useForm, FieldError } from "@refinedev/react-hook-form";

export const CategoryCreate = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading },
    register,
    formState: { errors },
  } = useForm({});

  return (
    <Create isLoading={formLoading} saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("title", {
            required: "This field is required",
          })}
          error={!!(errors as FieldError)?.title}
          helperText={(errors as FieldError)?.title?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="text"
          label={"Title"}
          name="title"
        />
      </Box>
    </Create>
  );
};
