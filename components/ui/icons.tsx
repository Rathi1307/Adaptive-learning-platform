import { LucideProps } from "lucide-react";

export const Lighthouse = (props: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M8 9h8" />
        <path d="M12 9V5" />
        <path d="m3 14 3-8 1 9" />
        <path d="m21 14-3-8-1 9" />
        <path d="M21 21v-3" />
        <path d="M3 21v-3" />
        <path d="M12 3a2 2 0 1 0 0 4 2 2 0 1 0 0-4Z" />
        <path d="M3 14h18" />
        <path d="M4 21h16" />
        <path d="m14 14 2.8 7" />
        <path d="m10 14-2.8 7" />
        <path d="M17 14v7" />
        <path d="M7 14v7" />
        <path d="M13 10V5" />
        <path d="M11 10V5" />
    </svg>
);

// Better Lighthouse version for "guiding light"
export const LighthouseSymbol = (props: LucideProps) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M16.5 12.5 12 2l-4.5 10.5" />
        <path d="M8 12.5h8" />
        <path d="M6 14.5a3 3 0 0 1 3 3v4h6v-4a3 3 0 0 1 3-3" />
        <path d="M4 22h16" />
        <path d="M12 2a4 4 0 0 1 4 4" />
        <path d="M12 2a4 4 0 0 0-4 4" />
        <line x1="12" x2="12" y1="2" y2="5" />
        <line x1="2" x2="6" y1="5" y2="7" />
        <line x1="22" x2="18" y1="5" y2="7" />
    </svg>
);
