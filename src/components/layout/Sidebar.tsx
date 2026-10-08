"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  LayoutDashboard,
  Wallet,
  CalendarClock,
  ListTodo,
  Users,
  Store,
  Images,
  LogOut,
  Armchair,
  Music,
  Crown,
  CreditCard,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Budget", href: "/dashboard/budget", icon: Wallet },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Timeline", href: "/dashboard/timeline", icon: CalendarClock },
  { name: "Checklist", href: "/dashboard/checklist", icon: ListTodo },
  { name: "Guests", href: "/dashboard/guests", icon: Users },
  { name: "Seating Plan", href: "/dashboard/seating", icon: Armchair },
  { name: "Bridal Party", href: "/dashboard/bridal-party", icon: Crown },
  { name: "Music Playlist", href: "/dashboard/music", icon: Music },
  { name: "Vendors", href: "/dashboard/vendors", icon: Store },
  { name: "Memories", href: "/dashboard/memories", icon: Images },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut, workspaceDetails, userRole } = useAuth();

  return (
    <aside className="w-72 border-r border-rose-gold/20 glass flex flex-col h-full z-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-gold/10 to-transparent pointer-events-none" />
      
      <div className="p-8 flex flex-col items-center text-center mt-4">
        <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-rose-gold/20 flex items-center justify-center mb-4 overflow-hidden relative">
          <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Couple" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-cursive text-deep-charcoal leading-tight">
          {workspaceDetails?.couple_names || "Sarah & Kevin"}
        </h2>
        <p className="text-xs text-sage-green/80 uppercase tracking-widest mt-2 font-medium">
          {workspaceDetails?.wedding_date || "15 Oct 2026"}
        </p>
      </div>

      <nav className="flex-1 px-5 space-y-1 mt-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="block">
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center px-4 py-3.5 rounded-2xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-rose-gold/15 to-transparent text-rose-gold font-medium border-l-4 border-rose-gold shadow-sm"
                    : "text-deep-charcoal/70 hover:bg-white/40 hover:text-deep-charcoal border-l-4 border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 mr-4 ${isActive ? "text-rose-gold" : "text-sage-green/70"}`} />
                <span className="text-sm">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}

        {userRole === "SUPER_ADMIN" && (
          <Link href="/admin-portal" className="block mt-4 pt-4 border-t border-rose-gold/20">
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-4 py-3.5 rounded-2xl transition-all text-rose-gold font-medium bg-rose-gold/10 border-l-4 border-rose-gold shadow-sm"
            >
              <LayoutDashboard className="w-5 h-5 mr-4 text-rose-gold" />
              <span className="text-sm">Admin Portal</span>
            </motion.div>
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-rose-gold/10">
        <button 
          onClick={signOut}
          className="flex items-center w-full px-4 py-3 text-deep-charcoal/70 hover:text-rose-gold transition-colors rounded-xl hover:bg-white/40"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
