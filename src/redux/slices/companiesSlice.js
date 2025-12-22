import { createSlice } from '@reduxjs/toolkit';

// Create a Redux slice for the 'companies' portion of the state
export const companiesSlice = createSlice({
  name: 'companies', // The name of the slice
  initialState: {
    drawerState: {
      open: false,
      mode: 'create',
      record: null,
    },
  },
  reducers: {
    setCompaniesDrawerState: (state, action) => {
      state.drawerState = action.payload;
    },
  },
});

// Export the action creator
export const { setCompaniesDrawerState } = companiesSlice.actions;

// Export the reducer
export default companiesSlice.reducer;
