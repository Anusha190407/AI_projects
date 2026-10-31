import React, { useState } from 'react';
import { DataStatus } from '../../types';

interface KnownAssumptionBadgeProps {
  status?: DataStatus;
  children: React.ReactNode;
  note?: string;
  onEditAssumption?: () => void;
}

export const KnownAssumptionBadge: React.FC<KnownAssumptionBadgeProps> = ({
  status = 'Known',
  children,
  note,
  onEditAssumption
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (status === 'Known') {
    return <>{children}</>;
  }

  return (
    <span
      className="relative inline-flex items-center group cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onEditAssumption}
    >
      <span className="border-b-2 border-dotted border-amber-500 text-amber-900 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/30 px-1 rounded-sm">
        {children}
      </span>
      <span className="ml-1 text-[10px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-amber-500 text-slate-950">
        Assumption
      </span>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-xl border border-amber-500/40 z-50 pointer-events-none">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
            <span>⚠️</span> Unconfirmed Assumption
          </div>
          <div className="text-[11px] leading-relaxed text-slate-300">
            {note || 'This value is an estimate or unconfirmed supplier projection. Click to adjust assumption parameters.'}
          </div>
          {onEditAssumption && (
            <div className="mt-1.5 pt-1 border-t border-slate-800 text-[10px] text-amber-300 font-medium">
              Click to edit & recalculate
            </div>
          )}
        </div>
      )}
    </span>
  );
};

