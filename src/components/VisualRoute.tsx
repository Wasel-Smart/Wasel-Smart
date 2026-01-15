import { MapPin, Navigation } from 'lucide-react';
import { cn } from '../lib/utils';

interface VisualRouteProps {
    from: string;
    to: string;
    duration?: string;
    className?: string;
    compact?: boolean;
}

export function VisualRoute({ from, to, duration, className, compact = false }: VisualRouteProps) {
    if (compact) {
        return (
            <div className={cn("flex items-center gap-3", className)}>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-teal-500 bg-white dark:bg-slate-900" />
                    <div className="w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
                    <div className="w-2.5 h-2.5 rounded-sm border-2 border-orange-500 bg-white dark:bg-slate-900" />
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{from}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{to}</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex gap-4", className)}>
            <div className="flex flex-col items-center pt-1">
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 shadow-sm">
                    <Navigation className="w-4 h-4" />
                </div>
                <div className="w-0.5 grow bg-gradient-to-b from-teal-500/50 via-gray-200 to-orange-500/50 dark:from-teal-500/30 dark:via-gray-700 dark:to-orange-500/30 my-1 min-h-[40px]" />
                <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 shadow-sm">
                    <MapPin className="w-4 h-4" />
                </div>
            </div>

            <div className="flex flex-col justify-between py-1 gap-6">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Pickup</p>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight font-heading">{from}</h3>
                </div>
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Dropoff</p>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight font-heading">{to}</h3>
                </div>
            </div>
        </div>
    );
}
