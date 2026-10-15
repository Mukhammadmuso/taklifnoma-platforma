/** Platforma belgisi: konvert va qopqoq uchidagi sakkiz qirrali yulduz (muhr o'rnida) */
export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="3" y="7" width="26" height="19" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M4 9l12 9.2L28 9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 15l3 3-3 3-3-3z M13.9 15.9h4.2v4.2h-4.2z" fill="currentColor" />
    </svg>
  );
}
