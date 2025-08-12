import React, { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, TooltipRenderProps } from 'react-joyride';
import { useOnboardingTour } from '../../hooks/useOnboardingTour';

interface TooltipProps extends TooltipRenderProps {
  step: Step;
}

const CustomTooltip: React.FC<TooltipProps> = ({
  backProps,
  continuous,
  index,
  isLastStep,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
}) => (
  <div {...tooltipProps} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-xs">
    <h2 className="text-lg font-semibold mb-2 text-primary-600 dark:text-primary-400">{step.title}</h2>
    <div className="mb-4 text-gray-700 dark:text-gray-300">{step.content}</div>
    
    <div className="flex justify-between">
      {index > 0 && (
        <button
          {...backProps}
          className="px-4 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
        >
          Back
        </button>
      )}
      
      <div className="flex-1"></div>
      
      <button
        {...skipProps}
        className="px-4 py-1 text-sm mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Skip
      </button>
      
      <button
        {...primaryProps}
        className="px-4 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
      >
        {isLastStep ? 'Done' : 'Next'}
      </button>
    </div>
  </div>
);

// Define tour steps for different user roles
const customerSteps: Step[] = [
  {
    target: '.browse-art-link',
    title: 'Browse Artwork',
    content: 'Discover amazing artwork from our talented artists.',
    disableBeacon: true,
  },
  {
    target: '.cart-icon',
    title: 'Shopping Cart',
    content: 'Items you add to your cart will appear here.',
  },
  {
    target: '.user-menu',
    title: 'Your Account',
    content: 'Access your profile, orders and account settings.',
  },
  {
    target: '.artwork-filters',
    title: 'Filter Artwork',
    content: 'Narrow down artwork by style, medium, price, and more.',
  }
];

const artistSteps: Step[] = [
  {
    target: '.artist-dashboard-link',
    title: 'Artist Dashboard',
    content: 'Manage your artwork and orders here.',
    disableBeacon: true,
  },
  {
    target: '.create-artwork-btn',
    title: 'Create Artwork',
    content: 'Add new artwork to your portfolio.',
  },
  {
    target: '.orders-section',
    title: 'Manage Orders',
    content: 'View and manage orders from customers.',
  },
  {
    target: '.artist-analytics',
    title: 'Analytics',
    content: 'Track your sales performance and audience engagement.',
  }
];

const adminSteps: Step[] = [
  {
    target: '.admin-dashboard-link',
    title: 'Admin Dashboard',
    content: 'Manage the entire marketplace from here.',
    disableBeacon: true,
  },
  {
    target: '.user-management',
    title: 'User Management',
    content: 'Manage users, artists, and customers.',
  },
  {
    target: '.artwork-approvals',
    title: 'Artwork Approvals',
    content: 'Review and approve artwork submissions.',
  },
  {
    target: '.admin-analytics',
    title: 'Platform Analytics',
    content: 'Monitor platform performance and sales metrics.',
  }
];

const OnboardingTour: React.FC = () => {
  const { showTour, completeTour, closeTour, userRole } = useOnboardingTour();
  const [tourSteps, setTourSteps] = useState<Step[]>([]);
  
  // Set the appropriate steps based on user role
  useEffect(() => {
    switch(userRole) {
      case 'ARTIST':
        setTourSteps(artistSteps);
        break;
      case 'ADMIN':
        setTourSteps(adminSteps);
        break;
      case 'CUSTOMER':
      default:
        setTourSteps(customerSteps);
    }
  }, [userRole]);
  
  // Handle tour callbacks
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      completeTour();
    }
  };
  
  return (
    <Joyride
      steps={tourSteps}
      run={showTour}
      continuous
      showSkipButton
      scrollToFirstStep
      spotlightClicks
      hideCloseButton
      disableOverlayClose
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          primaryColor: '#6366F1', // Indigo 500 from Tailwind
          zIndex: 10000,
        },
        spotlight: {
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
      callback={handleJoyrideCallback}
    />
  );
};

export default OnboardingTour;
