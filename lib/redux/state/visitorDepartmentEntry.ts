import { Department } from "@/feature/department/api/interface";
import { createSlice } from "@reduxjs/toolkit";

interface VisitorDepartmentEntry {
  VisitorDepartmentEntry: Department | null;
}

export const initialState: VisitorDepartmentEntry = {
  VisitorDepartmentEntry: null,
};

export const VisitorDepartmentEntrySlice = createSlice({
  name: "VisitorDepartmentSignInEntry",
  initialState,
  reducers: {
    setVisitorDepartmentEntry: (state, action) => {
      state.VisitorDepartmentEntry = action.payload;
    },
    clearVisitorDepartmentEntry: (state) => {
      state.VisitorDepartmentEntry = null;
    },
  },
});

export const { setVisitorDepartmentEntry, clearVisitorDepartmentEntry } =
  VisitorDepartmentEntrySlice.actions;
export const VisitorDepartmentSignInEntryReducer =
  VisitorDepartmentEntrySlice.reducer;
