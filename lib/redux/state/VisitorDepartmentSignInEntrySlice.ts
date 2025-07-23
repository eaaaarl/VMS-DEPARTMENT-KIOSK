import { Department } from "@/feature/department/api/interface";
import { createSlice } from "@reduxjs/toolkit";

interface VisitorDepartmentSignInEntryState {
  VisitorDepartmentSignInEntry: Department | null;
}

export const initialState: VisitorDepartmentSignInEntryState = {
  VisitorDepartmentSignInEntry: null,
};

export const VisitorDepartmentSignInEntrySlice = createSlice({
  name: "VisitorDepartmentSignInEntry",
  initialState,
  reducers: {
    setVisitorDepartmentSignInEntry: (state, action) => {
      state.VisitorDepartmentSignInEntry = action.payload;
    },
    clearVisitorDepartmentSignInEntry: (state) => {
      state.VisitorDepartmentSignInEntry = null;
    },
  },
});

export const {
  setVisitorDepartmentSignInEntry,
  clearVisitorDepartmentSignInEntry,
} = VisitorDepartmentSignInEntrySlice.actions;
export const VisitorDepartmentSignInEntryReducer =
  VisitorDepartmentSignInEntrySlice.reducer;
