import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-amber-500 transition-all duration-300 ease-in-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default ProgressBar;