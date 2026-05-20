export function Footer() {
  return (
    <footer className="w-full py-8 border-t border-[var(--border)] bg-[var(--bg-card)] mt-auto flex-shrink-0">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-[var(--text-muted)] font-mono text-xs">
        <div className="mb-4 md:mb-0 flex items-center space-x-2">
          <span className="text-[var(--accent-amber)] font-display text-lg">P</span>
          <span>PaperLens &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex space-x-6">
          <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Privacy</span>
          <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Terms</span>
          <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Contact</span>
        </div>
      </div>
    </footer>
  );
}
