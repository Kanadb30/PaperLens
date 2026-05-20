export function ScanningLine({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute left-0 w-full h-[2px] bg-[var(--accent-amber)] shadow-[0_0_8px_var(--accent-amber)] animate-scanline z-50 opacity-80" />
  );
}
