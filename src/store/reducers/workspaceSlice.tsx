import { Workspace } from "@/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeWorkspace: Workspace | null;
}

const initialState: WorkspaceState = {
  activeWorkspaceId: null,
  activeWorkspace: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveWorkspace: (state, action: PayloadAction<Workspace | null>) => {
      state.activeWorkspace = action.payload;
      state.activeWorkspaceId = action.payload ? action.payload.id : null;
    },
    updateActiveWorkspace: (state, action: PayloadAction<Workspace>) => {
      if (state.activeWorkspaceId === action.payload.id) {
        state.activeWorkspace = action.payload;
      }
    },
    removeActiveWorkspace: (state, action: PayloadAction<string>) => {
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspace = null;
        state.activeWorkspaceId = null;
      }
    },
  },
});

export const { setActiveWorkspace, updateActiveWorkspace, removeActiveWorkspace } = workspaceSlice.actions;
export default workspaceSlice.reducer;