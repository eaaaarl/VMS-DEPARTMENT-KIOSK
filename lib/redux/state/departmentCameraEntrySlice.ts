import { Department } from "@/feature/department/api/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DepartmentCameraState {
  departmentCameraEntry: Department | null;
}

const initialState: DepartmentCameraState = {
  departmentCameraEntry: null,
};

export const departmentCameraEntrySlice = createSlice({
  name: "departmentCameraEntry",
  initialState,
  reducers: {
    setDepartmentCameraEntry: (state, action: PayloadAction<Department>) => {
      state.departmentCameraEntry = action.payload;
    },
    clearDepartmentCameraEntry: (state) => {
      state.departmentCameraEntry = null;
    },
  },
});

export const { setDepartmentCameraEntry, clearDepartmentCameraEntry } =
  departmentCameraEntrySlice.actions;
export const departmentCameraEntryReducer = departmentCameraEntrySlice.reducer;
