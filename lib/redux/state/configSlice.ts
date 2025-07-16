import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ConfigState {
  ipAddress: string;
  port: number;
}

const initialState: ConfigState = {
  ipAddress: "",
  port: 0,
};

export const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<ConfigState>) => {
      state.ipAddress = action.payload.ipAddress;
      state.port = action.payload.port;
    },
    resetConfig: (state) => {
      state.ipAddress = "";
      state.port = 0;
    },
  },
});

export const { setConfig, resetConfig } = configSlice.actions;

export const configReducer = configSlice.reducer;
