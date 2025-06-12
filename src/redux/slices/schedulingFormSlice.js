import { createSlice } from '@reduxjs/toolkit';

// Create a Redux slice for the 'schedulingForm'
export const schedulingFormSlice = createSlice({
  name: 'schedulingForm',
  initialState: {
    isSchedulingFormOpen: false,
  },
  reducers: {
    setIsSchedulingFormOpen: (state, action) => {
      state.isSchedulingFormOpen = action.payload;
    },
  },
});

export const { setIsSchedulingFormOpen } = schedulingFormSlice.actions;

export default schedulingFormSlice.reducer;
