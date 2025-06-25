import { createSlice } from '@reduxjs/toolkit';

// Create a Redux slice for the 'auth' portion of the state
export const authSlice = createSlice({
  name: 'auth', // The name of the slice
  initialState: {
    data: {
      isAuth: true, // Set the initial 'isAuth' state to false
      accessToken: '',
      fullname: '',
    },
  },
  reducers: {
    // Reducer function to set the 'isAuth' state
    setIsAuth: (state, action) => {
      state.data.isAuth = action.payload;
    },
    // Reducer function to set the entire 'data' object
    setAuthData: (state, action) => {
      state.data = action.payload;
    },
    // Reducer function to set the 'accessToken'
    setAuthAccessToken: (state, action) => {
      state.data.accessToken = action.payload;
    },
  },
});

// Export the action creators
export const { setIsAuth, setAuthData, setAuthAccessToken } = authSlice.actions;

// Export the reducer
export default authSlice.reducer;
