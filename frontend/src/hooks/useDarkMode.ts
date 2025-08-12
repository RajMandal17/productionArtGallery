import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useDarkMode = () => {
  // Check if user has a preference saved in localStorage
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  // Or check if they prefer dark mode at OS level
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Initialize state based on preferences
  const [theme, setTheme] = useState<Theme>(
    savedTheme || (prefersDark ? 'dark' : 'light')
  );

  // Apply theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Function to toggle theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return { theme, toggleTheme };
};
