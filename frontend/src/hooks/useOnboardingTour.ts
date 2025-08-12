import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const useOnboardingTour = () => {
  const { state } = useAppContext();
  const [showTour, setShowTour] = useState(false);
  
  // Check if we should show the tour based on user's role and first-time visit
  useEffect(() => {
    const hasCompletedTour = localStorage.getItem('onboarding_completed');
    
    // Only show tour to logged-in users who haven't seen it before
    if (state.auth.isAuthenticated && state.auth.user && !hasCompletedTour) {
      // Wait a bit before showing the tour to ensure page is fully loaded
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [state.auth.isAuthenticated, state.auth.user]);
  
  // Mark tour as completed
  const completeTour = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setShowTour(false);
  };
  
  // Close tour without marking as completed
  const closeTour = () => {
    setShowTour(false);
  };
  
  // Get appropriate tour steps based on user role
  const getUserRole = () => {
    return state.auth.user?.role || 'CUSTOMER';
  };
  
  return {
    showTour,
    completeTour,
    closeTour,
    userRole: getUserRole(),
  };
};
