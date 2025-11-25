import type React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M13.2 6.1a5 5 0 0 0-8.4 4.4 5.2 5.2 0 0 0 3.2 4.5v2.5h4v-2.5a5.2 5.2 0 0 0 3.2-4.5 5 5 0 0 0-2-4.4Z" />
    <path d="M8 18h8" />
    <path d="M12 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    <path d="m9 11 2 2 4-4" />
    <path d="M18 5 17 7l-2-1 1-2 1-2 1 2 2 1-1 2Z" />
  </svg>
);
