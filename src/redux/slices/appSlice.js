import { createSlice } from "@reduxjs/toolkit";

// Create a Redux slice for the 'app' portion of the state
export const appSlice = createSlice({
  name: "app", // The name of the slice
  initialState: {
    isDarkTheme: false, // Initial state for the 'isDarkTheme' property
  },
  reducers: {
    // Reducer function for switching the theme
    switchTheme: (state) => {
      // Toggle the 'isDarkTheme' property in the state
      state.isDarkTheme = !state.isDarkTheme;
    },
    setIsDarkTheme: (state, action) => {
      state.isDarkTheme = action.payload;
    },
  },
});

// Export the action creator
export const { switchTheme, setIsDarkTheme } = appSlice.actions;

// Export the reducer
export default appSlice.reducer;
