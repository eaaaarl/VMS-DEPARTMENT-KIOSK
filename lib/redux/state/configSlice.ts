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
    setIpAddress: (state, action: PayloadAction<string>) => {
      state.ipAddress = action.payload;
    },
    setPort: (state, action: PayloadAction<number>) => {
      state.port = action.payload;
    },
    resetConfig: (state) => {
      state.ipAddress = "";
      state.port = 0;
    },
  },
});

export const { setIpAddress, setPort, resetConfig } = configSlice.actions;

export const configReducer = configSlice.reducer;
