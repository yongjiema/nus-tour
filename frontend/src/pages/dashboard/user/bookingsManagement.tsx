import React from "react";
import { DashboardContainer } from "../../../components/shared/dashboard";
import { BookingsTab } from "./components/BookingsTab";

const UserBookingsManagement: React.FC = () => {
  return (
    <DashboardContainer>
      <BookingsTab />
    </DashboardContainer>
  );
};

export default UserBookingsManagement;
