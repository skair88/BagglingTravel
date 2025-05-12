import React from 'react';

interface ProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  progress,
  size = 40,
  strokeWidth = 4,
  label
}) => {
  // Ensure progress is between 0-100
  const normalizedProgress = Math.max(0, Math.min(100, progress));
  
  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb" // Gray-200
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f59e0b" // Amber-500
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      
      {/* Percentage text in center */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {normalizedProgress}%
      </div>
      
      {/* Optional label */}
      {label && (
        <span className="mt-1 text-xs text-gray-600">{label}</span>
      )}
    </div>
  );
};

export default ProgressCircle;