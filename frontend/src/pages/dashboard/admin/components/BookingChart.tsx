import React from "react";
import { Box, Paper, Typography, Skeleton, useTheme, Alert } from "@mui/material";
import { styled } from "@mui/system";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import InsightsIcon from "@mui/icons-material/Insights";
import { SectionTitle } from "../../../../components/shared/ui";

const ChartContainer = styled(Paper)(({ theme: _theme }) => ({
  padding: "24px",
  borderRadius: "12px",
  height: "100%",
  overflow: "hidden",
}));

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload?.length) {
    return (
      <Paper sx={{ p: 1.5, boxShadow: 3, border: "none" }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">
          {`Count: ${payload[0].value}`}
        </Typography>
      </Paper>
    );
  }
  return null;
};

interface BookingChartProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

const BookingChart: React.FC<BookingChartProps> = React.memo(({ data, isLoading }) => {
  const theme = useTheme();

  // Define chart colors based on the theme
  const colors = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];

  // Simple data validation
  const hasValidData = React.useMemo(() => {
    return data.length > 0;
  }, [data]);

  return (
    <Box mt={5}>
      <SectionTitle variant="h5" gutterBottom>
        <InsightsIcon /> Booking Statistics
      </SectionTitle>
      <ChartContainer elevation={2}>
        <div style={{ width: "100%", height: 360 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
              <Skeleton variant="rectangular" width="100%" height="80%" sx={{ borderRadius: "8px" }} animation="wave" />
              <Box mt={2} width="100%">
                <Skeleton width="60%" height={24} />
              </Box>
            </Box>
          ) : hasValidData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                aria-label="Booking statistics chart"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: theme.palette.text.secondary }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  tick={{ fill: theme.palette.text.secondary }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" p={3}>
              <Alert severity="warning" sx={{ width: "100%", mb: 2 }}>
                Unable to display chart. Data format is invalid or missing.
              </Alert>
              <Typography variant="body2" color="text.secondary" align="center">
                Please refresh the dashboard or check the data source.
              </Typography>
            </Box>
          )}
        </div>
      </ChartContainer>
    </Box>
  );
});

export default BookingChart;
