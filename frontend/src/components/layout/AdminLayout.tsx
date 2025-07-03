import React from "react";
import { Outlet } from "react-router-dom";
import { ThemedLayoutV2, ThemedSiderV2, ThemedTitleV2 } from "@refinedev/mui";
import AdminHeader from "../header/admin";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export const AdminLayout: React.FC = () => {
  return (
    <ThemedLayoutV2
      Header={() => <AdminHeader />}
      Sider={() => (
        <ThemedSiderV2
          fixed
          Title={({ collapsed }) => <ThemedTitleV2 collapsed={collapsed} text="NUS Tour" icon={<LocationOnIcon />} />}
          render={({ items /*, logout*/ }) => <>{items}</>}
        />
      )}
    >
      <Outlet />
    </ThemedLayoutV2>
  );
};
