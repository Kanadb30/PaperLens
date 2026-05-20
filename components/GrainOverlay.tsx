export function GrainOverlay() {
  return (
    <>
      <svg width="0" height="0" className="hidden">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 1 0" />
        </filter>
      </svg>
      <div className="grain-overlay" style={{ filter: 'url(#grain)' }} />
    </>
  );
}
