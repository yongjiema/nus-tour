import { AppBar, Toolbar, Typography, Avatar, Box } from "@mui/material";
import { useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { ColorModeContext } from "../../contexts/color-mode";
import type { AuthUser } from "../../types/auth.types";

interface RefineLayoutHeaderProps {
  sticky?: boolean;
}

const RefineLayoutHeader: React.FC<RefineLayoutHeaderProps> = ({ sticky = true }) => {
  const { mode: _mode, setMode: _setMode } = useContext(ColorModeContext);

  const { pathname } = useLocation();
  const { data: user } = useGetIdentity<AuthUser>();

  const shouldRenderHeader = useMemo(() => {
    return !["/login", "/register"].includes(pathname);
  }, [pathname]);

  const showColorModeToggle = useMemo(() => {
    return !["/login", "/register"].includes(pathname);
  }, [pathname]);

  // Create display name from firstName and lastName
  const displayName = useMemo(() => {
    if (!user) return "User";
    const firstName = user.firstName ?? "";
    const lastName = user.lastName ?? "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    return fullName || user.email.split("@")[0] || "User";
  }, [user]);

  if (!shouldRenderHeader) {
    return null;
  }

  return (
    <AppBar position={sticky ? "sticky" : "static"} elevation={0} sx={{ bgcolor: "background.paper" }}>
      <Toolbar>
        <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1 }}>
          NUS Tour
        </Typography>

        {showColorModeToggle && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {user && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {displayName}
                </Typography>
                <Avatar src={user.avatar} alt={displayName} sx={{ width: 32, height: 32 }}>
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default RefineLayoutHeader;
