import React from 'react';

interface SkeletonCardProps {
 count?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 1 }) => {
 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="skeleton-grid">
 {Array.from({ length: count }).map((_, i) => (
 <div 
 key={i} 
 className="bg-bg-card rounded-lg shadow-sm border border-border-main p-4 animate-pulse"
 data-testid="skeleton-card"
 >
 <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
 <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
 
 <div className="flex gap-2 mb-4">
 <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
 <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
 </div>
 
 <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-main">
 <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
 <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
 </div>
 </div>
 ))}
 </div>
 );
};
