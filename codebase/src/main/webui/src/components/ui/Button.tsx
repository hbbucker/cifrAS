import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 isLoading?: boolean;
 variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
 size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
 children,
 isLoading = false,
 variant = 'primary',
 size = 'md',
 className = '',
 disabled,
 ...props
}) => {
 const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none';
 
 const variantClasses = {
 primary: 'bg-[#aa3bff] hover:bg-[#902be6] text-white disabled:bg-[#aa3bff]/50',
 secondary: 'bg-gray-100 hover:bg-gray-200 text-text-main disabled:opacity-50',
 danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-600/50',
 ghost: 'hover:bg-bg-elevated text-gray-700 disabled:opacity-50',
 };

 const sizeClasses = {
 sm: 'px-3 py-1.5 text-sm',
 md: 'px-4 py-2 text-base',
 lg: 'px-6 py-3 text-lg',
 };

 return (
 <button
 className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
 disabled={disabled || isLoading}
 {...props}
 >
 {isLoading && <Spinner size="sm" className="mr-2" />}
 {children}
 </button>
 );
};
