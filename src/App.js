import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ConfigProvider, notification } from 'antd';
import AppRouter from './routes/AppRouter';
import { getTheme } from './theme/themeData';
import useGetWindowWidth from './utils/controllers/useGetWindowWidth';
import { setIsDarkTheme } from './redux/slices/appSlice';
import useAuthHandler from './utils/controllers/useAuthHandler';

function App() {
  useAuthHandler();
  const dispatch = useDispatch();
  const isDarkTheme = useSelector(state => state.app.isDarkTheme);
  const width = useGetWindowWidth();

  // Check for the saved theme preference in local storage and set it
  useEffect(() => {
    const savedTheme = localStorage.getItem('isDarkTheme');
    if (savedTheme !== null) {
      // Set the theme in Redux state and update the document body class
      dispatch(setIsDarkTheme(savedTheme === 'true'));
      document.body.className = savedTheme === 'true' ? 'dark' : 'light';
    }

    //Set all ant design notification duration
    notification.config({
      duration: 2,
    });
  }, [dispatch]);

  return (
    <ConfigProvider theme={getTheme(isDarkTheme, width)}>
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;
