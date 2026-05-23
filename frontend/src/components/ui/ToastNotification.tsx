import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error';

interface ToastNotificationProps {
  message: string;
  type: ToastType;
}

const typeStyles: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: { bg: 'bg-[#10B981] text-white', icon: <CheckCircle className="w-5 h-5" /> },
  warning: { bg: 'bg-[#F59E0B] text-white', icon: <AlertTriangle className="w-5 h-5" /> },
  error: { bg: 'bg-[#EF4444] text-white', icon: <XCircle className="w-5 h-5" /> },
};

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    // Trigger exit animation before unmount
    const exitTimer = setTimeout(() => setIsVisible(false), 2800);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded shadow-lg pointer-events-auto transition-opacity duration-200 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${typeStyles[type].bg}`}
    >
      {typeStyles[type].icon}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
};
