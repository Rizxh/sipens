import { APP_NAME } from '../../config/app';

/**
 * Logo mark SIPENS — grafik penilaian naik + bintang nominasi sales terbaik.
 * Gunakan currentColor agar menyesuaikan konteks (sidebar gelap, login terang).
 */
export default function SipensLogo({ className = 'w-6 h-6', title = APP_NAME, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
      {...props}
    >
      <title>{title}</title>
      <rect x="3" y="18.5" width="18" height="2" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="4.5" y="13" width="4" height="5.5" rx="1.2" fill="currentColor" opacity="0.5" />
      <rect x="10" y="9.5" width="4" height="9" rx="1.2" fill="currentColor" opacity="0.75" />
      <rect x="15.5" y="5.5" width="4" height="13" rx="1.2" fill="currentColor" />
      <path
        d="M17.5 2.2l.58 1.18 1.3.19-.94.92.22 1.29-1.16-.61-1.16.61.22-1.29-.94-.92 1.3-.19.58-1.18z"
        fill="currentColor"
      />
      <path
        d="M7.2 11.8c1.6-2.2 3.4-3.3 5.8-3.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
