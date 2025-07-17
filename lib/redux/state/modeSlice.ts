import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type LayoutModeType = "Kiosk" | "User" | null;
export type DeviceType = "mobile" | "tablet" | null;

interface ModeState {
  LayoutMode: LayoutModeType;
  deviceType: DeviceType;
  isLandscape: boolean;
}

export const InitialState: ModeState = {
  LayoutMode: null,
  deviceType: null,
  isLandscape: false,
};

const modeSlice = createSlice({
  name: "mode",
  initialState: InitialState,
  reducers: {
    setLayoutMode: (state, action: PayloadAction<LayoutModeType>) => {
      state.LayoutMode = action.payload;
    },
    toggleLayoutMode: (state) => {
      state.LayoutMode = state.LayoutMode === "Kiosk" ? "User" : "Kiosk";
    },
    setDeviceType: (state, action: PayloadAction<DeviceType>) => {
      state.deviceType = action.payload;
    },
    setOrientation: (state, action: PayloadAction<boolean>) => {
      state.isLandscape = action.payload;
    },
  },
});

export const { setLayoutMode, toggleLayoutMode, setDeviceType, setOrientation } = modeSlice.actions;
export const modeReducer = modeSlice.reducer;
