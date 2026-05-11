"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
    userName: string;
    userLevel: string;
    totalHours: number;
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function VolunteerNavbar({ userName, userLevel, totalHours, isCollapsed, onToggle }: NavbarProps) {
    const pathname = usePathname();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

    const allLinks = [
        { icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', title: 'Feed', href: '/feed' },
        { icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z', title: 'QR', href: '/scan' },
        { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', title: 'Perfil', href: '/profile' },
        { icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', title: 'Dashboard', href: '/volunteer-dashboard' },
        { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', title: 'Actividades', href: '/my-activities' },
        { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Certificados', href: '/certificates' },
    ];

    const mobileMainLinks = allLinks.slice(0, 3);
    const mobileExtraLinks = allLinks.slice(3);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/auth/login';
    };

    return (
        <>
            {/* DESKTOP SIDEBAR */}
            <aside className={`hidden lg:block fixed inset-y-0 left-0 bg-[#0f0f0f] border-r border-[#1f1f1f] z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <div className="h-full flex flex-col relative">
                    {/* Toggle Button */}
                    <button
                        onClick={onToggle}
                        className="absolute -right-3 top-10 w-6 h-6 bg-[#22c55e] rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform z-50"
                    >
                        <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Logo Area */}
                    <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className="w-10 h-10 relative rounded-full overflow-hidden bg-[#111110] shrink-0">
                            <Image src="/logo.png" alt="TRIBU Logo" fill className="object-cover" priority />
                        </div>
                        {!isCollapsed && <span className="font-bold text-xl text-white tracking-widest">TRIBU</span>}
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="flex-1 px-2 py-4 overflow-y-auto no-scrollbar">
                        {allLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`group flex items-center px-4 py-3 mb-1 transition-all border-l-2 ${isActive
                                            ? 'border-[#22c55e] bg-[rgba(34,197,94,0.08)] text-[#22c55e]'
                                            : 'border-transparent text-[#555] hover:text-[#aaa] hover:bg-[#161616]'
                                        }`}
                                >
                                    <svg className={`shrink-0 w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                                    </svg>
                                    {!isCollapsed && <span className="text-sm truncate">{link.title}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Desktop User Section */}
                    <div className="border-t border-[#1f1f1f] p-4">
                        <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
                            <div className="w-10 h-10 shrink-0 rounded-full bg-[#22c55e] text-black flex items-center justify-center font-bold text-lg">
                                {userName.charAt(0)}
                            </div>
                            {!isCollapsed && (
                                <div className="ml-3 overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                                    <p className="text-xs text-[#22c55e]">{userLevel}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={handleLogout} className={`flex items-center w-full text-[#444] hover:text-red-500 transition-colors ${isCollapsed ? 'justify-center' : 'px-4'}`}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {!isCollapsed && <span className="ml-2 text-sm">Salir</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAV (Igual al paso anterior) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-[#1f1f1f] z-40 h-16">
                <div className="grid grid-cols-4 h-full">
                    {mobileMainLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="flex items-center justify-center">
                            <svg className={`w-7 h-7 ${pathname === link.href ? 'text-[#22c55e]' : 'text-[#555]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                            </svg>
                        </Link>
                    ))}
                    <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="flex items-center justify-center text-[#555]">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Popover Menu */}
                {isMoreMenuOpen && (
                    <>
                        <div className="fixed inset-0 bg-black/60 z-[-1]" onClick={() => setIsMoreMenuOpen(false)} />
                        <div className="absolute bottom-20 right-4 bg-[#161616] border border-[#1f1f1f] rounded-2xl p-2 min-w-[180px] shadow-2xl">
                            {mobileExtraLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMoreMenuOpen(false)}
                                    className="flex items-center space-x-3 p-4 text-[#aaa] hover:text-white"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
                                    </svg>
                                    <span className="text-sm font-medium">{link.title}</span>
                                </Link>
                            ))}
                            <button onClick={handleLogout} className="flex items-center space-x-3 p-4 text-red-500 w-full border-t border-[#1f1f1f] mt-1">
                                <span className="text-sm font-medium">Cerrar sesión</span>
                            </button>
                        </div>
                    </>
                )}
            </nav>
        </>
    );
}
