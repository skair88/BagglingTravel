import React from 'react';
import { Check } from 'lucide-react';

interface PurposeOption {
  id: string;
  name: string;
  description: string;
}

interface PurposeSelectorProps {
  options: PurposeOption[];
  selectedPurpose: string;
  onChange: (purposeId: string) => void;
}

const PurposeSelector: React.FC<PurposeSelectorProps> = ({
  options,
  selectedPurpose,
  onChange,
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-medium mb-3">Trip Purpose</h2>
      
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selectedPurpose === option.id;
          
          return (
            <div 
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`
                relative flex flex-col p-3 
                border rounded-md cursor-pointer transition-colors
                ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </div>
                
                {isSelected && (
                  <div className="text-primary">
                    <Check size={20} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PurposeSelector;