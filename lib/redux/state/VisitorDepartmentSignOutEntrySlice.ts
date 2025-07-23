import { Department } from "@/feature/department/api/interface";
import { createSlice } from "@reduxjs/toolkit";

interface VisitorDepartmentSignOutEntryState {
  VisitorDepartmentSignOutEntry: Department | null;
}

export const initialState: VisitorDepartmentSignOutEntryState = {
  VisitorDepartmentSignOutEntry: null,
};

export const VisitorDepartmentSignOutEntrySlice = createSlice({
  name: "VisitorDepartmentEntry",
  initialState,
  reducers: {
    setVisitorDepartmentSignOutEntry: (state, action) => {
      state.VisitorDepartmentSignOutEntry = action.payload;
    },
    clearVisitorDepartmentSignOutEntry: (state) => {
      state.VisitorDepartmentSignOutEntry = null;
    },
  },
});

export const {
  setVisitorDepartmentSignOutEntry,
  clearVisitorDepartmentSignOutEntry,
} = VisitorDepartmentSignOutEntrySlice.actions;
export const VisitorDepartmentEntryReducer =
  VisitorDepartmentSignOutEntrySlice.reducer;
