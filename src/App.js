import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { MotionConfig } from 'motion/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppRouter from './routes/AppRouter';
import { setIsDarkTheme } from './redux/slices/appSlice';
import useAuthHandler from './utils/controllers/useAuthHandler';

function App() {
  useAuthHandler();
  const dispatch = useDispatch();

  // Check for the saved theme preference in local storage and set it
  useEffect(() => {
    const savedTheme = localStorage.getItem('isDarkTheme');
    if (savedTheme !== null) {
      const isDark = savedTheme === 'true';
      dispatch(setIsDarkTheme(isDark));
      document.body.className = isDark ? 'dark' : 'light';
      document.documentElement.className = isDark ? 'dark' : 'light';
    }
  }, [dispatch]);

  return (
    // Reduced motion: Motion animations keep their fades and drop transforms.
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <AppRouter />
      </TooltipProvider>
      <Toaster
        position="top-right"
        duration={1500}
        visibleToasts={3}
        offset={{ top: 72, right: 24, bottom: 24, left: 24 }}
      />
    </MotionConfig>
  );
}

export default App;
