export function LensFocusing({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin-slow ${className}`} width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeDasharray="10 13.5" className="animate-[spin_4s_linear_infinite]" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="var(--accent-amber)" strokeWidth="2" strokeDasharray="10 8" className="animate-[spin_3s_linear_infinite_reverse]" />
    </svg>
  );
}
