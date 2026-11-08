import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
 icon: LucideIcon;
 title: string;
 description: string;
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

export const EmptyState: React.FC<EmptyStateProps> = ({
 icon: Icon,
 title,
 description,
 action,
 secondaryAction,
 className = '',
}) => {
 return (
 <div className={`flex flex-col items-center justify-center p-12 text-center bg-bg-card rounded-md border border-dashed border-gray-300 ${className}`}>
 <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4">
 <Icon className="w-8 h-8 text-gray-500 dark:text-text-mute" />
 </div>
 <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>
 <p className="text-text-mute max-w-sm mb-6">{description}</p>
 <div className="flex gap-3">
 {secondaryAction && (
 <Button onClick={secondaryAction.onClick} variant="secondary">
 {secondaryAction.label}
 </Button>
 )}
 {action && (
 <Button onClick={action.onClick} variant="primary">
 {action.label}
 </Button>
 )}
 </div>
 </div>
 );
};
