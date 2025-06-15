
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex space-x-2">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`flex-1 h-2 rounded-full transition-all duration-300 ease-in-out ${
            index < currentStep ? 'bg-amber-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressBar;
