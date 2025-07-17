import { Department } from "@/feature/department/api/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DepartmentState {
  currentDepartment: Department | null;
}

export const initialState: DepartmentState = {
  currentDepartment: null,
};

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    setSelectedDepartment: (state, action: PayloadAction<Department>) => {
      state.currentDepartment = action.payload;
    },
    resetSelectedDepartment: (state, action) => {
      state.currentDepartment = null;
    },
  },
});

export const { resetSelectedDepartment, setSelectedDepartment } =
  departmentSlice.actions;

export const departmentReducer = departmentSlice.reducer;
