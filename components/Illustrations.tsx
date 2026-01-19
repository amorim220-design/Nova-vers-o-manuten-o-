
import React from 'react';

export const HotelIllustration: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="70" width="100" height="90" rx="4" fill="currentColor" fillOpacity="0.1"/>
        <rect x="40" y="60" width="120" height="100" rx="6" stroke="currentColor" strokeWidth="2.5"/>
        <rect x="65" y="85" width="20" height="20" rx="2" fill="currentColor" fillOpacity="0.2"/>
        <rect x="115" y="85" width="20" height="20" rx="2" fill="currentColor" fillOpacity="0.2"/>
        <rect x="65" y="115" width="20" height="20" rx="2" fill="currentColor" fillOpacity="0.2"/>
        <rect x="115" y="115" width="20" height="20" rx="2" fill="currentColor" fillOpacity="0.2"/>
        <path d="M80 160V130C80 124.477 84.4772 120 90 120H110C115.523 120 120 124.477 120 130V160" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M125 40L145 60H55L75 40H125Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
);

export const ScheduleIllustration: React.FC<{className?: string}> = ({ className }) => (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="50" y="50" width="100" height="110" rx="8" stroke="currentColor" strokeWidth="2.5"/>
        <rect x="50" y="50" width="100" height="25" rx="0" fill="currentColor" fillOpacity="0.1"/>
        <circle cx="70" cy="62.5" r="4" fill="currentColor" fillOpacity="0.2"/>
        <circle cx="85" cy="62.5" r="4" fill="currentColor" fillOpacity="0.2"/>
        <path d="M70 95L85 110L115 80" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M70 130H130" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M70 145H110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);
