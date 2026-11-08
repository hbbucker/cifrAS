import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EducationalEmptyStateProps {
  icon: LucideIcon;
  title: string;
  steps: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EducationalEmptyState: React.FC<EducationalEmptyStateProps> = ({
  icon: Icon,
  title,
  steps,
  action,
  secondaryAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-bg-card rounded-md border border-dashed border-[#aa3bff]/50 ${className}`}>
      <div className="w-20 h-20 bg-[#aa3bff]/10 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-[#aa3bff]" />
      </div>
      <h3 className="text-xl font-bold text-text-main mb-6">{title}</h3>
      
      <div className="flex flex-col items-start gap-4 mb-8 text-left">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#aa3bff]/20 text-[#aa3bff] flex items-center justify-center font-bold">
              {index + 1}
            </div>
            <p className="text-text-mute text-base">{step.replace(/^\d+\.\s*/, '')}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {secondaryAction && (
          <Button onClick={secondaryAction.onClick} variant="secondary" className="px-8 py-3 text-base">
            {secondaryAction.label}
          </Button>
        )}
        {action && (
          <Button onClick={action.onClick} variant="primary" className="px-8 py-3 text-base shadow-lg shadow-[#aa3bff]/30 animate-bounce">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};
