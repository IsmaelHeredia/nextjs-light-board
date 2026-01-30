"use client";

import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  CssBaseline,
} from "@mui/material";

import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import InfoIcon from "@mui/icons-material/Info";

import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

import { useDispatch, useSelector } from "react-redux";
import { changeMode, selectTheme } from "@/store/reducers/themesSlice";
import { setActiveWorkspace, updateActiveWorkspace } from "@/store/reducers/workspaceSlice";

import AboutModal from "@/components/modals/AboutModal";
import WorkspaceSelector from "@/components/workspaces/WorkspaceSelector";

import { useEffect, useState } from "react";
import { Workspace } from "@/type";
import { RootState } from "@/store/store";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.themes.mode);
  const theme = useSelector(selectTheme);
  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId
  );

  const [openAbout, setOpenAbout] = useState(false);

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspaces");
        const data = await res.json();
        setWorkspaces(data);
      } catch (err) {
        console.error("Error cargando workspaces:", err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (workspaces.length === 0) return;

    const currentActive = workspaces.find((w) => w.id === activeWorkspaceId);

    if (!activeWorkspaceId || !currentActive) {
      dispatch(setActiveWorkspace(workspaces[0]));
    } else {
      dispatch(updateActiveWorkspace(currentActive));
    }
  }, [activeWorkspaceId, workspaces, dispatch]);

  const handleUpdateWorkspace = async (updated: Workspace) => {
    try {
      const res = await fetch(`/api/workspaces/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const workspaceFromDb = await res.json();

        setWorkspaces(prev =>
          prev.map(ws => ws.id === workspaceFromDb.id ? workspaceFromDb : ws)
        );

        dispatch(updateActiveWorkspace(workspaceFromDb));
      }
    } catch (error) {
      console.error("Error al actualizar workspace:", error);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    await fetch(`/api/workspaces/${id}`, { method: "DELETE" });
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <AppBar position="fixed" elevation={0} sx={{ border: "none" }}>
          <Toolbar
            sx={{
              justifyContent: "space-between",
              backgroundColor: theme.palette.customNavbar?.background,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <WysiwygIcon />
              <Typography fontWeight={700}>Light Board</Typography>

              {!loading && (
                <WorkspaceSelector
                  workspaces={workspaces}
                  setWorkspaces={setWorkspaces}
                  onUpdate={handleUpdateWorkspace}
                  onDelete={handleDeleteWorkspace}
                />
              )}
            </Box>

            <Box>
              <Tooltip title="Tema">
                <IconButton
                  onClick={() =>
                    dispatch(
                      changeMode({
                        mode: mode === "light" ? "dark" : "light",
                      })
                    )
                  }
                >
                  {mode === "light" ? <DarkModeIcon /> : <WbSunnyIcon />}
                </IconButton>
              </Tooltip>

              <Tooltip title="About">
                <IconButton onClick={() => setOpenAbout(true)}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>

        <AboutModal open={openAbout} handleClose={() => setOpenAbout(false)} />

        <main
          style={{
            marginTop: 64,
            height: "calc(100vh - 64px)",
            overflow: "hidden",
          }}
        >
          {children}
        </main>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}