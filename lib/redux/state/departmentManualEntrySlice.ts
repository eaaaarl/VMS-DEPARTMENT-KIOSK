import { Department } from "@/feature/department/api/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DepartmentManualEntryState {
  departmentManualEntry: Department | null;
}

export const initialState: DepartmentManualEntryState = {
  departmentManualEntry: null,
};

export const departmentManualEntrySlice = createSlice({
  name: "departmentManualEntry",
  initialState,
  reducers: {
    setDepartmentManualEntry: (state, action: PayloadAction<Department>) => {
      state.departmentManualEntry = action.payload;
    },
    clearDepartmentManualEntry: (state) => {
      state.departmentManualEntry = null;
    },
  },
});

export const { setDepartmentManualEntry, clearDepartmentManualEntry } =
  departmentManualEntrySlice.actions;
export const departmentManualEntryReducer = departmentManualEntrySlice.reducer;
