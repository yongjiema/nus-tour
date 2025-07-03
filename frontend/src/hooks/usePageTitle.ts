import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook for managing page titles following React and Refine best practices
 * This hook automatically sets the document title based on the current route
 */
export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const getPageTitle = (pathname: string): string => {
      // Map routes to descriptive titles
      switch (pathname) {
        case "/":
          return "NUS Tour | Home";
        case "/login":
          return "Login | NUS Tour";
        case "/register":
          return "Register | NUS Tour";
        case "/forgot-password":
          return "Forgot Password | NUS Tour";
        case "/information":
          return "Information | NUS Tour";
        case "/booking":
          return "Book a Tour | NUS Tour";
        case "/checkin":
          return "Check In | NUS Tour";
        case "/testimonials":
          return "Testimonials | NUS Tour";
        case "/dashboard/user":
          return "User Dashboard | NUS Tour";
        case "/dashboard/admin":
        case "/admin":
          return "Admin Dashboard | NUS Tour";
        case "/admin/bookings":
          return "Booking Management | NUS Tour";
        case "/admin/check-ins":
          return "Check-In Management | NUS Tour";
        default:
          return "NUS Tour";
      }
    };

    const title = getPageTitle(location.pathname);
    document.title = title;
  }, [location.pathname]);
};
