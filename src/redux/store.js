import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/auth/authSlice';

import { bridgedApi } from '../services/api';

// Create and configure the Redux store
const store = configureStore({
  reducer: {
    // Include reducers for different parts of your application
    app: appReducer, // App related state
    auth: authReducer, // Authentication related state
    [bridgedApi.reducerPath]: bridgedApi.reducer, // API related state
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(bridgedApi.middleware), // Apply middleware for API
});

export default store;
