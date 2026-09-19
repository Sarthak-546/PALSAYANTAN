interface ScanOverlayProps {
  isScanning: boolean;
  scanProgress: number; // 0..100
}

export const ScanOverlay = ({ isScanning, scanProgress }: ScanOverlayProps) => {
  if (!isScanning) return null;
  const pct = Math.min(100, Math.max(0, scanProgress));

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="w-64 h-64 border-2 border-green-500 rounded-lg relative overflow-hidden">
        <div
          className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_15px_#4ade80] transition-all duration-200"
          style={{ top: `${pct}%` }}
        />
        <div
          className="absolute top-0 left-0 right-0 bg-green-500/20 transition-all duration-200"
          style={{ height: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ScanOverlay;
