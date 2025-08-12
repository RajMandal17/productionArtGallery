import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TourStep {
  target: string; // CSS selector for the target element
  title: string;
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  userRole?: 'CUSTOMER' | 'ARTIST' | 'ADMIN';
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  userRole
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  // Update target element when step changes
  useEffect(() => {
    if (!isOpen) return;
    
    const target = document.querySelector(steps[currentStep]?.target);
    setTargetElement(target);
    
    if (target) {
      // Highlight the element by scrolling to it
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Calculate tooltip position
      const rect = target.getBoundingClientRect();
      const position = steps[currentStep]?.position || 'bottom';
      
      let top = 0;
      let left = 0;
      
      switch (position) {
        case 'top':
          top = rect.top - 10 - 150; // 150px height for tooltip + 10px spacing
          left = rect.left + rect.width / 2 - 150; // Center horizontally
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 75; // Center vertically
          left = rect.right + 10;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2 - 150; // Center horizontally
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 75; // Center vertically
          left = rect.left - 10 - 300; // 300px width for tooltip + 10px spacing
          break;
      }
      
      // Make sure tooltip stays within viewport
      top = Math.max(10, Math.min(window.innerHeight - 150 - 10, top));
      left = Math.max(10, Math.min(window.innerWidth - 300 - 10, left));
      
      setTooltipPosition({ top, left });
    }
  }, [currentStep, steps, isOpen]);

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour completed
      if (onComplete) onComplete();
      onClose();
    }
  };

  // Handle previous step
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip tour
  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || !steps.length) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={handleSkip} />
      
      {/* Highlight element with spotlight effect */}
      {targetElement && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            position: 'absolute',
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 0, 0, 0.5)',
            borderRadius: '4px',
            zIndex: 51
          }}
        />
      )}
      
      {/* Tooltip */}
      <div
        className="fixed z-[52] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 w-[300px]"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        {/* Close button */}
        <button 
          onClick={handleSkip}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <X size={16} />
        </button>
        
        {/* Progress indicator */}
        <div className="flex mb-2 gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full ${
                index === currentStep ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <h3 className="text-lg font-bold mb-2 dark:text-white">
          {steps[currentStep]?.title}
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {steps[currentStep]?.content}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-3 py-1 text-sm rounded ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Previous
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {currentStep < steps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Predefined tour steps for each user role
export const customerTourSteps: TourStep[] = [
  {
    target: '.header-logo',
    title: 'Welcome to ArtMarket',
    content: 'Click here anytime to return to the homepage.',
    position: 'bottom'
  },
  {
    target: '.search-bar',
    title: 'Find Artwork',
    content: 'Search for artwork by title, artist, or keywords.',
    position: 'bottom'
  },
  {
    target: '.browse-art-link',
    title: 'Browse Artwork',
    content: 'Explore all available artwork in our gallery.',
    position: 'bottom'
  },
  {
    target: '.cart-icon',
    title: 'Shopping Cart',
    content: 'View items you\'ve added to your cart before checkout.',
    position: 'left'
  },
  {
    target: '.profile-menu',
    title: 'Your Account',
    content: 'Access your profile, orders, and account settings.',
    position: 'left'
  }
];

export const artistTourSteps: TourStep[] = [
  {
    target: '.header-logo',
    title: 'Welcome, Artist!',
    content: 'Click here anytime to return to the homepage.',
    position: 'bottom'
  },
  {
    target: '.create-artwork',
    title: 'Create New Listings',
    content: 'Add your artwork to the gallery for customers to purchase.',
    position: 'right'
  },
  {
    target: '.manage-artworks',
    title: 'Manage Your Artwork',
    content: 'Edit, update or remove your artwork listings.',
    position: 'right'
  },
  {
    target: '.artist-orders',
    title: 'Track Orders',
    content: 'View and manage orders of your artwork.',
    position: 'bottom'
  },
  {
    target: '.artist-profile',
    title: 'Your Artist Profile',
    content: 'Update your bio and showcase information for customers.',
    position: 'left'
  }
];

export const adminTourSteps: TourStep[] = [
  {
    target: '.admin-dashboard',
    title: 'Admin Dashboard',
    content: 'Welcome to your control center. Manage users, artwork, and settings.',
    position: 'bottom'
  },
  {
    target: '.user-management',
    title: 'User Management',
    content: 'Review and manage user accounts, including artist approvals.',
    position: 'right'
  },
  {
    target: '.artwork-management',
    title: 'Artwork Management',
    content: 'Review, approve, or remove artwork from the marketplace.',
    position: 'bottom'
  },
  {
    target: '.order-management',
    title: 'Order Management',
    content: 'Track and manage customer orders across the platform.',
    position: 'right'
  },
  {
    target: '.analytics-panel',
    title: 'Analytics',
    content: 'View platform statistics and performance metrics.',
    position: 'right'
  }
];

export default OnboardingTour;
