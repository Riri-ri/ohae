interface CatLogoProps {
  className?: string;
}

/** Забавный нестандартный логотип минифигмы — кот. */
export function CatLogo({ className }: CatLogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M6 11l1-8 7 4.5a12 12 0 0 1 8 0L29 3l1 8a10.5 10.5 0 0 1-2.5 15H8.5A10.5 10.5 0 0 1 6 11z"
        fill="#ffb703"
      />
      <circle cx="12.5" cy="14.5" r="1.9" fill="#2b2130" />
      <circle cx="19.5" cy="14.5" r="1.9" fill="#2b2130" />
      <path d="M14 19h4" stroke="#2b2130" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 21.5l-2 1.6M16 21.5l2 1.6" stroke="#2b2130" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
