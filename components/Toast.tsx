import React, { useEffect, useState } from 'react';
import { Notification } from '../types';

interface ToastProps {
  toast: Notification;
  onClose: (id: number) => void;
}

const ICONS = {
    success: (
        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
    error: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
    info: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
    ),
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    // This state will help manage the exit animation
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Set a timer to start the exit animation just before the toast should be removed
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 4700); // 5000ms total - 300ms for animation

        // Set a timer to call the onClose handler to remove the toast from the DOM
        const removalTimer = setTimeout(() => {
            onClose(toast.id);
        }, 5000);

        // Cleanup timers on component unmount
        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removalTimer);
        };
    }, [toast.id, onClose]);

    // Handler for the close button
    const handleClose = () => {
        setIsExiting(true);
        // Allow time for the fade-out animation before calling onClose
        setTimeout(() => {
            onClose(toast.id);
        }, 300);
    };

    const baseClasses = "relative flex items-start p-4 w-full max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden";
    // Apply fade-in on mount, and fade-out when exiting
    const animationClass = isExiting ? 'animate-fade-out' : 'animate-fade-in';

    return (
        <div className={`${baseClasses} ${animationClass}`}>
            <div className="flex-shrink-0">{ICONS[toast.type]}</div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{toast.message}</p>
                {toast.link && (
                    <a
                        href={toast.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 text-sm font-semibold text-primary hover:text-primary-dark underline"
                    >
                        View on HashScan
                    </a>
                )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button
                    onClick={handleClose}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            {/* The progress bar should only be visible when the toast is not exiting */}
            {!isExiting && <div className="absolute bottom-0 left-0 h-1 bg-primary/50 animate-progress"></div>}
        </div>
    );
};

export default Toast;