import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
 title?: string;
 message?: string;
 onRetry?: () => void;
 className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
 title = 'Something went wrong',
 message = 'An unexpected error occurred. Please try again.',
 onRetry,
 className = '',
}) => {
 return (
 <div className={`flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 ${className}`}>
 <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
 <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>
 <p className="text-text-mute max-w-md mb-6">{message}</p>
 {onRetry && (
 <Button onClick={onRetry} variant="secondary">
 Try Again
 </Button>
 )}
 </div>
 );
};
