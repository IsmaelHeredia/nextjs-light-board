import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { getTheme } from "@/skins/theme";

interface ThemeState {
  mode: "light" | "dark";
  theme_mode: number;
}

const initialState: ThemeState = {
  mode: "light",
  theme_mode: 1,
};

const themesSlice = createSlice({
  name: "themes",
  initialState,
  reducers: {
    changeMode: (state, action: PayloadAction<{ mode: "light" | "dark" }>) => {
      state.mode = action.payload.mode;
    },
    setThemeMode: (state, action: PayloadAction<number>) => {
      state.theme_mode = action.payload;
    },
  },
});

export const selectTheme = createSelector(
  (state: RootState) => state.themes.mode,
  (mode) => getTheme(mode)
);

export const { changeMode, setThemeMode } = themesSlice.actions;
export default themesSlice.reducer;