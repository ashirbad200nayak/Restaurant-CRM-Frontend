import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VegIndicatorProps {
  veg: boolean;
  className?: string;
  showLabel?: boolean;
}

export const VegIndicator = ({ veg, className, showLabel = false }: VegIndicatorProps) => {
  if (veg) {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        <div className="w-5 h-5 border-2 border-veg rounded flex items-center justify-center">
          <div className="w-2 h-2 bg-veg rounded-full" />
        </div>
        {showLabel && <span className="text-xs font-medium text-veg">Veg</span>}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="w-5 h-5 border-2 border-nonveg rounded flex items-center justify-center">
        <div className="w-2 h-2 bg-nonveg rounded-full" />
      </div>
      {showLabel && <span className="text-xs font-medium text-nonveg">Non-Veg</span>}
    </div>
  );
};
