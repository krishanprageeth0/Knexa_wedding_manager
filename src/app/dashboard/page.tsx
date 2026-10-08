"use client";

import { motion } from "framer-motion";
import { Heart, CreditCard, Users, CheckSquare, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardOverview() {
  const [daysLeft, setDaysLeft] = useState(0);
  const { workspaceDetails, workspaceId } = useAuth();
  
  // Real-time aggregates
  const [budgetSpent, setBudgetSpent] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(0);
  const [rsvpCount, setRsvpCount] = useState(0);
  const [guestTotal, setGuestTotal] = useState(0);
  const [tasksLeft, setTasksLeft] = useState(0);
  const [tasksTotal, setTasksTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dateStr = workspaceDetails?.wedding_date || "2026-10-15";
    const weddingDate = new Date(`${dateStr}T00:00:00`).getTime();
    const now = new Date().getTime();
    const distance = weddingDate - now;
    setDaysLeft(Math.max(0, Math.ceil(distance / (1000 * 60 * 60 * 24))));
  }, [workspaceDetails]);

  useEffect(() => {
    if (workspaceId) fetchDashboardData();
  }, [workspaceId]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    
    // 1. Budget Data
    const { data: budgetData } = await supabase.from("budget_items").select("estimated_cost, actual_cost, advance_paid").eq("workspace_id", workspaceId);
    if (budgetData) {
      const est = budgetData.reduce((acc, curr) => acc + Number(curr.estimated_cost), 0);
      const spent = budgetData.reduce((acc, curr) => acc + Number(curr.advance_paid), 0); // Money out of pocket
      setBudgetTotal(est);
      setBudgetSpent(spent);
    }

    // 2. Guest Data
    const { data: guestData } = await supabase.from("guests").select("rsvp_received").eq("workspace_id", workspaceId);
    if (guestData) {
      setGuestTotal(guestData.length);
      setRsvpCount(guestData.filter(g => g.rsvp_received).length);
    }

    // 3. Checklist Data
    const { data: checklistData } = await supabase.from("checklists").select("is_completed").eq("workspace_id", workspaceId);
    if (checklistData) {
      setTasksTotal(checklistData.length);
      setTasksLeft(checklistData.filter(t => !t.is_completed).length);
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Romantic Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full h-64 md:h-80 rounded-[2rem] overflow-hidden mb-12 shadow-lg"
      >
        <img 
          src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Wedding Banner" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal/80 via-deep-charcoal/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row justify-between items-end">
          <div>
            <p className="text-white/80 font-medium tracking-widest uppercase text-sm mb-2 flex items-center">
              <Heart className="w-4 h-4 mr-2 text-rose-gold fill-rose-gold" /> The Journey Begins
            </p>
            <h1 className="text-5xl md:text-6xl font-serif text-white">
              {workspaceDetails?.couple_names || "Loading..."}
            </h1>
          </div>
          <div className="glass px-6 py-4 rounded-2xl mt-4 md:mt-0 border border-white/20 text-center min-w-[120px]">
            <p className="text-3xl font-serif text-white">{daysLeft}</p>
            <p className="text-xs font-medium text-white/80 uppercase tracking-widest mt-1">Days to go</p>
          </div>
        </div>
      </motion.div>

      {/* Real-time Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-3xl border border-rose-gold/30 bg-rose-gold/5 flex flex-col justify-between">
          <div className="flex items-center text-rose-gold mb-4">
            <CreditCard className="w-5 h-5 mr-2" />
            <span className="font-medium">Budget Tracked</span>
          </div>
          <div>
            <p className="text-3xl font-serif text-deep-charcoal mb-1">
              {isLoading ? "..." : `Rs ${budgetSpent.toLocaleString()}`}
            </p>
            <p className="text-sm text-deep-charcoal/60">
              of Rs {budgetTotal.toLocaleString()} Est.
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-3xl border border-sage-green/30 bg-sage-green/5 flex flex-col justify-between">
          <div className="flex items-center text-sage-green mb-4">
            <Users className="w-5 h-5 mr-2" />
            <span className="font-medium">Guest RSVPs</span>
          </div>
          <div>
            <p className="text-3xl font-serif text-deep-charcoal mb-1">
              {isLoading ? "..." : rsvpCount}
            </p>
            <p className="text-sm text-deep-charcoal/60">
              of {guestTotal} Invited
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 rounded-3xl border border-deep-charcoal/20 bg-white/50 flex flex-col justify-between">
          <div className="flex items-center text-deep-charcoal mb-4">
            <CheckSquare className="w-5 h-5 mr-2" />
            <span className="font-medium">Checklist</span>
          </div>
          <div>
            <p className="text-3xl font-serif text-deep-charcoal mb-1">
              {isLoading ? "..." : tasksLeft}
            </p>
            <p className="text-sm text-deep-charcoal/60">
              Tasks remaining out of {tasksTotal}
            </p>
          </div>
        </motion.div>

      </div>

      {/* Quick Actions Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-3xl p-8 border border-rose-gold/20"
      >
        <h2 className="text-2xl font-serif text-deep-charcoal mb-6">Continue Planning</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/checklist" className="p-4 rounded-2xl bg-white/60 hover:bg-white border border-transparent hover:border-rose-gold/30 transition-all text-center group">
            <div className="w-12 h-12 mx-auto bg-rose-gold/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-6 h-6 text-rose-gold" />
            </div>
            <p className="font-medium text-deep-charcoal text-sm">Tasks</p>
          </Link>
          <Link href="/dashboard/guests" className="p-4 rounded-2xl bg-white/60 hover:bg-white border border-transparent hover:border-sage-green/30 transition-all text-center group">
            <div className="w-12 h-12 mx-auto bg-sage-green/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-sage-green" />
            </div>
            <p className="font-medium text-deep-charcoal text-sm">Guests</p>
          </Link>
          <Link href="/dashboard/budget" className="p-4 rounded-2xl bg-white/60 hover:bg-white border border-transparent hover:border-rose-gold/30 transition-all text-center group">
            <div className="w-12 h-12 mx-auto bg-rose-gold/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6 text-rose-gold" />
            </div>
            <p className="font-medium text-deep-charcoal text-sm">Budget</p>
          </Link>
          <Link href="/dashboard/timeline" className="p-4 rounded-2xl bg-white/60 hover:bg-white border border-transparent hover:border-deep-charcoal/30 transition-all text-center group">
            <div className="w-12 h-12 mx-auto bg-deep-charcoal/5 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-deep-charcoal" />
            </div>
            <p className="font-medium text-deep-charcoal text-sm">Timeline</p>
          </Link>
        </div>
      </motion.div>

    </div>
  );
}
