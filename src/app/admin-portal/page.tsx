"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPortal() {
  const { user, userRole, isLoading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCouple, setNewCouple] = useState({ names: "", date: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || userRole !== "SUPER_ADMIN") {
        router.push("/");
      } else {
        fetchWorkspaces();
      }
    }
  }, [user, userRole, isLoading, router]);

  const fetchWorkspaces = async () => {
    const { data } = await supabase.from("workspaces").select("*");
    if (data) setWorkspaces(data);
  };

  const handleAddCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupleNames: newCouple.names,
          weddingDate: newCouple.date,
          email: newCouple.email
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAdding(false);
        setNewCouple({ names: "", date: "", email: "" });
        fetchWorkspaces();
        alert(`Couple added successfully!\nSince emails are rate-limited, they can login with:\nPassword: ${data.defaultPassword}`);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Failed to create couple.");
    }
    setIsSubmitting(false);
  };

  if (isLoading || !user || userRole !== "SUPER_ADMIN") return null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-ivory p-8">
      <div className="max-w-6xl mx-auto w-full">
        <header className="flex justify-between items-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-deep-charcoal"
          >
            knexa System <span className="text-rose-gold font-serif font-normal">- Admin</span>
          </motion.h1>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 transition-colors"
          >
            {isAdding ? "Cancel" : "+ New Couple"}
          </button>
        </header>

        {isAdding && (
          <motion.form 
            onSubmit={handleAddCouple}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl border border-sage-green/20 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Couple Names</label>
              <input required value={newCouple.names} onChange={e => setNewCouple({...newCouple, names: e.target.value})} type="text" placeholder="e.g. Sarah & Kevin" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-rose-gold/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Wedding Date</label>
              <input required value={newCouple.date} onChange={e => setNewCouple({...newCouple, date: e.target.value})} type="date" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-rose-gold/30" />
            </div>
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Couple's Email</label>
              <input required value={newCouple.email} onChange={e => setNewCouple({...newCouple, email: e.target.value})} type="email" placeholder="couple@example.com" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:outline-none focus:ring-2 focus:ring-rose-gold/30" />
            </div>
            <div className="md:col-span-3 text-right mt-2">
              <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 transition-colors disabled:opacity-50">
                {isSubmitting ? "Creating..." : "Create Workspace & Send Invite"}
              </button>
            </div>
          </motion.form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl border border-rose-gold/20 col-span-1 lg:col-span-2"
          >
            <h2 className="text-xl font-medium text-deep-charcoal mb-4">Active Workspaces</h2>
            <div className="space-y-3">
              {workspaces.length === 0 ? (
                <p className="text-sm text-deep-charcoal/60">No workspaces found.</p>
              ) : (
                workspaces.map((couple) => (
                  <div key={couple.id} className="flex justify-between items-center p-4 bg-white/50 rounded-xl border border-sage-green/20">
                    <div>
                      <h3 className="font-medium text-deep-charcoal">{couple.couple_names}</h3>
                      <p className="text-sm text-deep-charcoal/60">Date: {couple.wedding_date || "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-sage-green/20 text-sage-green text-xs font-semibold rounded-full">
                        {couple.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl border border-sage-green/20"
          >
            <h2 className="text-xl font-medium text-deep-charcoal mb-4">System Metrics</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-deep-charcoal/70">Total Couples</p>
                <p className="text-3xl font-serif text-deep-charcoal">{workspaces.length}</p>
              </div>
              <div className="h-px bg-deep-charcoal/10" />
              <div>
                <p className="text-sm text-deep-charcoal/70">Storage Used</p>
                <p className="text-3xl font-serif text-deep-charcoal">4.2 GB</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
