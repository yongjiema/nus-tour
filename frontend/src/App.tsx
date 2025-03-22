import { Suspense, lazy } from "react";
import { Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { notificationProvider, RefineSnackbarProvider, ThemedLayoutV2 } from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, { DocumentTitleHandler, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { PublicHeader } from "./components/header/public";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { CustomLayout } from "./components/layout";
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
import { TourInformationHome } from "./pages/tour-information/Home";
import TestimonialsPage from "./pages/testimonial";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import UserDashboard from "./pages/user-dashboard";
import { UserRole } from "./types/auth.types";
import BookingManagement from "./pages/admin-dashboard/booking/bookingManagement";
import CheckInManagement from "./pages/admin-dashboard/check-in/checkInManagement";

const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));
const TourInfoManagement = lazy(() => import("./pages/admin-dashboard/TourInfoManagement"));

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <BrowserRouter>
        <RefineKbarProvider>
          <ColorModeContextProvider>
            <CssBaseline />
            <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
            <RefineSnackbarProvider>
              <DevtoolsProvider>
                <Refine
                  authProvider={authProvider}
                  dataProvider={dataProviders.backend}
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
                    {
                      name: "information",
                      list: "/information",
                    },
                    {
                      name: "tourInformation",
                      list: "/tour-information",
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
                    <Route
                      element={
                        <CustomLayout Header={() => <PublicHeader />}>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Outlet />
                          </Suspense>
                        </CustomLayout>
                      }
                    >
                      <Route index element={<Home />} />
                      <Route path="/information">
                        <Route index element={<InformationHome />} />
                        <Route path="academic-programs" element={<AcademicPrograms />} />
                        <Route path="bus-routes" element={<BusRoutes />} />
                        <Route path="canteens" element={<Canteens />} />
                        <Route path="convenience-stores" element={<ConvenienceStores />} />
                      </Route>
                      <Route path="/tour-information" element={<TourInformationHome />} />
                      <Route path="/booking">
                        <Route index element={<BookingForm />} />
                        <Route path="confirmation" element={<BookingConfirmation />} />
                      </Route>
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="/checkin" element={<Checkin />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                    </Route>

                    <Route element={<PrivateRoute />}>
                      <Route
                        path="/admin"
                        element={
                          <CustomLayout Header={Header}>
                            <Suspense fallback={<div>Loading...</div>}>
                              <AdminDashboard />
                            </Suspense>
                          </CustomLayout>
                        }
                      />
                      <Route
                        path="/admin/tour-info"
                        element={
                          <CustomLayout Header={Header}>
                            <Suspense fallback={<div>Loading...</div>}>
                              <TourInfoManagement />
                            </Suspense>
                          </CustomLayout>
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
              </DevtoolsProvider>
            </RefineSnackbarProvider>
          </ColorModeContextProvider>
        </RefineKbarProvider>
      </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
