import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-800 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
        <span className="inline-flex items-center gap-1 font-semibold bg-amber-600 text-white px-2 py-0.5 rounded text-[11px] tracking-wide uppercase">
          <ShieldAlert className="w-3.5 h-3.5" /> Demo Data
        </span>
        <span className="truncate">
          AirIndex India observations and historical trends are generated using synthetic market calibrations for evaluation.
          This platform is an independent statistical intelligence tool and is <strong>not</strong> the official Consumer Price Index (CPI) issued by MoSPI.
        </span>
      </div>
    </div>
  );
}
