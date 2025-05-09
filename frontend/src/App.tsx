import { Suspense, lazy } from "react";
import { Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { notificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, { DocumentTitleHandler, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { authProvider } from "./authProvider";
import { PublicHeader } from "./components/header/public";
import { AdminLayout } from "./components/AdminLayout";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ForgotPassword } from "./pages/forgotPassword";
import Login from "./pages/login";
import { Register } from "./pages/register";
import { Home } from "./pages/home";
import { InformationHome, AcademicPrograms, BusRoutes, Canteens, ConvenienceStores } from "./pages/information";
import { BookingForm } from "./pages/booking";
import BookingConfirmation from "./pages/booking/Confirmation";
import PaymentPage from "./pages/payment";
import Checkin from "./pages/checkin";
import dataProviders from "./dataProviders";
import PrivateRoute from "./components/PrivateRoute";
import TestimonialsPage from "./pages/testimonial";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import UserDashboard from "./pages/user-dashboard";
import { UserRole } from "./types/auth.types";
import BookingManagement from "./pages/admin-dashboard/booking/bookingManagement";
import CheckInManagement from "./pages/admin-dashboard/check-in/checkInManagement";
import PaymentSuccessPage from "./pages/payment/success";

const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <DevtoolsProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Refine
                  authProvider={authProvider}
                  dataProvider={dataProviders}
                  notificationProvider={notificationProvider}
                  routerProvider={routerBindings}
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
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
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
                      <Route path="/information" element={<InformationHome />} />
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
                        path="/admin"
                        element={
                          <AdminLayout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <AdminDashboard />
                            </Suspense>
                          </AdminLayout>
                        }
                      />
                      <Route
                        path="/admin/bookings"
                        element={
                          <AdminLayout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <BookingManagement />
                            </Suspense>
                          </AdminLayout>
                        }
                      />
                      <Route
                        path="/admin/check-ins"
                        element={
                          <AdminLayout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <CheckInManagement />
                            </Suspense>
                          </AdminLayout>
                        }
                      />
                    </Route>

                    {/* User Routes */}
                    <Route element={<PrivateRoute requiredRole={UserRole.USER} />}>
                      <Route path="/user-dashboard" element={<UserDashboard />} />
                    </Route>

                    <Route path="/payment/:bookingId" element={<PaymentPage />} />
                    <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </LocalizationProvider>
            </DevtoolsProvider>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
