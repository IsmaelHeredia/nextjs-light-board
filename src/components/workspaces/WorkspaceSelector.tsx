"use client";

import React, { useState } from "react";
import { Chip } from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setActiveWorkspace } from "@/store/reducers/workspaceSlice";
import WorkspaceManager from "./WorkspaceManager";
import { Workspace } from "@/type";

interface Props {
    workspaces: Workspace[];
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>;
    onUpdate: (ws: Workspace) => void;
    onDelete: (id: string) => void;
}

export default function WorkspaceSelector({
    workspaces,
    setWorkspaces,
    onUpdate,
    onDelete,
}: Props) {
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);

    const activeWorkspaceId = useSelector(
        (state: RootState) => state.workspace.activeWorkspaceId
    );

    const activeWorkspace = workspaces.find(
        (w) => w.id === activeWorkspaceId
    );

    return (
        <>
            <Chip
                icon={<BusinessCenterIcon fontSize="small" />}
                label={activeWorkspace?.title || "Seleccionar Workspace"}
                onClick={() => setOpen(true)}
                sx={{
                    fontWeight: 700,
                    cursor: "pointer",
                }}
            />

            <WorkspaceManager
                open={open}
                onClose={() => setOpen(false)}
                workspaces={workspaces}
                setWorkspaces={setWorkspaces}
                onSelectWorkspace={(id: string) => {
                    const selectedWs = workspaces.find(w => w.id === id);

                    if (selectedWs) {
                        dispatch(setActiveWorkspace(selectedWs));
                    }

                    setOpen(false);
                }}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
        </>
    );
}
