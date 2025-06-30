import { Refine } from "@refinedev/core";
import { useNotificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { authProvider } from "./authProvider";
import { PublicHeader } from "./components/header/public";
import { AdminLayout } from "./components/AdminLayout";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ForgotPassword } from "./pages/forgotPassword";
import Login from "./pages/login";
import Register from "./pages/register";
import { Home } from "./pages/home";
import { Information } from "./pages/information";
import { AcademicPrograms } from "./pages/information/AcademicPrograms";
import { BusRoutes } from "./pages/information/BusRoutes";
import { Canteens } from "./pages/information/Canteens";
import { ConvenienceStores } from "./pages/information/ConvenienceStores";
import { BookingForm } from "./pages/booking";
import BookingConfirmation from "./pages/booking/Confirmation";
import PaymentPage from "./pages/payment";
import Checkin from "./pages/checkin";
import dataProviders from "./dataProviders";
import PrivateRoute from "./components/PrivateRoute";
import TestimonialsPage from "./pages/testimonial";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import UserDashboard from "./pages/dashboard/user";
import { UserRole } from "./types/auth.types";
import PaymentSuccessPage from "./pages/payment/success";
import AdminDashboard from "./pages/dashboard/admin";
import AdminBookingManagement from "./pages/dashboard/admin/bookingManagement";
import AdminCheckInManagement from "./pages/dashboard/admin/checkInManagement";

const RefineApp = () => {
  return (
    <Refine
      authProvider={authProvider}
      dataProvider={dataProviders}
      notificationProvider={useNotificationProvider}
      resources={[
        {
          name: "bookings",
          list: "/admin/bookings",
          create: "/admin/bookings/create",
          edit: "/admin/bookings/edit/:id",
        },
        {
          name: "check_ins",
          list: "/admin/check-ins",
          create: "/admin/check-ins/create",
          edit: "/admin/check-ins/edit/:id",
        },
      ]}
      options={{
        syncWithLocation: false,
        warnWhenUnsavedChanges: false,
        useNewQueryKeys: true,
        projectId: "7OkvOR-FCEx0r-2vArZl",
      }}
    >
      <Routes>
        <Route element={<PublicHeader />}>
          <Route index path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/information" element={<Information />} />
          <Route path="/information/academic-programs" element={<AcademicPrograms />} />
          <Route path="/information/bus-routes" element={<BusRoutes />} />
          <Route path="/information/canteens" element={<Canteens />} />
          <Route path="/information/convenience-stores" element={<ConvenienceStores />} />
          <Route path="/booking" element={<BookingForm />} />
          <Route path="/booking/confirmation" element={<BookingConfirmation />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/payment/success/:id" element={<PaymentSuccessPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute requiredRole={UserRole.ADMIN} />}>
          <Route
            path="/dashboard/admin"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminLayout>
                <AdminBookingManagement />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/check-ins"
            element={
              <AdminLayout>
                <AdminCheckInManagement />
              </AdminLayout>
            }
          />
        </Route>

        {/* User Routes */}
        <Route element={<PrivateRoute requiredRole={UserRole.USER} />}>
          <Route path="/dashboard/user" element={<UserDashboard />} />
        </Route>

        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
      </Routes>
    </Refine>
  );
};

function App() {
  return (
    <ColorModeContextProvider>
      <CssBaseline />
      <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
      <RefineSnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <BrowserRouter>
            <RefineApp />
          </BrowserRouter>
        </LocalizationProvider>
      </RefineSnackbarProvider>
    </ColorModeContextProvider>
  );
}

export default App;
