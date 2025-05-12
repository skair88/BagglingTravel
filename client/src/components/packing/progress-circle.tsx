import React from 'react';

interface ProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ 
  progress, 
  size = 48, 
  strokeWidth = 2,
  label
}) => {
  const radius = (size / 2) - (strokeWidth * 2);
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  // Constrain progress between 0-100
  const safeProgress = Math.min(100, Math.max(0, progress));
  
  // Calculate viewBox based on size
  const viewBox = `0 0 ${size} ${size}`;
  
  // Calculate font size based on circle size
  const fontSize = size / 4;
  
  return (
    <div className="flex flex-col items-center">
      <div className={`relative h-${size / 4} w-${size / 4}`} style={{ width: size, height: size }}>
        <svg className="h-full w-full" viewBox={viewBox}>
          <circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            fill="none" 
            stroke="#E5E7EB" 
            strokeWidth={strokeWidth}
          />
          <circle 
            cx={size / 2} 
            cy={size / 2} 
            r={radius} 
            fill="none" 
            stroke="#3B82F6" 
            strokeWidth={strokeWidth} 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text 
            x={size / 2} 
            y={size / 2 + fontSize / 3} 
            textAnchor="middle" 
            fontSize={fontSize} 
            fontWeight="600" 
            fill="#1F2937"
          >
            {safeProgress}%
          </text>
        </svg>
      </div>
      {label && <span className="text-xs text-text-secondary mt-1">{label}</span>}
    </div>
  );
};

export default ProgressCircle;
