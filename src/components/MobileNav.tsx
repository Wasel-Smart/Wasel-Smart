import { Home, Map, Wallet, User, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface MobileNavProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
    const navItems = [
        { id: 'dashboard', icon: Home, label: 'Home' },
        { id: 'my-trips', icon: Map, label: 'Trips' },
        { id: 'find-ride', icon: Car, label: 'Ride', isFab: true },
        { id: 'wallet', icon: Wallet, label: 'Wallet' },
        { id: 'profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:hidden pointer-events-none">
            <div className="flex items-center gap-1 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full shadow-lg shadow-black/5 pointer-events-auto">
                {navItems.map((item) => {
                    const isActive = currentPage === item.id;

                    if (item.isFab) {
                        return (
                            <motion.button
                                key={item.id}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onNavigate(item.id)}
                                className="flex items-center justify-center w-12 h-12 mx-2 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-full shadow-lg shadow-teal-500/30"
                            >
                                <item.icon className="w-6 h-6" />
                            </motion.button>
                        )
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300",
                                isActive ? "text-teal-600 dark:text-teal-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-teal-50 dark:bg-teal-900/20 rounded-full"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">
                                <item.icon className={cn("w-5 h-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
