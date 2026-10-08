"use client";

import { motion } from "framer-motion";
import { Plus, Phone, Ruler, Sparkles, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function BridalParty() {
  const { workspaceId } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", phone: "", measurements: "", tasks: "" });

  useEffect(() => {
    if (workspaceId) fetchMembers();
  }, [workspaceId]);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("bridal_party")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setMembers(data);
    setIsLoading(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const { data } = await supabase
      .from("bridal_party")
      .insert([{
        workspace_id: workspaceId,
        name: newMember.name,
        role: newMember.role,
        contact_number: newMember.phone,
        measurements: { details: newMember.measurements },
        tasks: newMember.tasks ? [newMember.tasks] : []
      }])
      .select();

    if (data) {
      setMembers([data[0], ...members]);
      setIsAdding(false);
      setNewMember({ name: "", role: "", phone: "", measurements: "", tasks: "" });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    await supabase.from("bridal_party").delete().eq("id", id);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">VIP & Bridal Party</h1>
          <p className="text-sage-green mt-2">Manage your closest crew for the big day</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 transition-colors shadow-md flex items-center"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Member</>}
        </button>
      </motion.div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAddMember}
          className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Name</label>
            <input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} type="text" placeholder="e.g. Emma Wilson" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Role</label>
            <input required value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} type="text" placeholder="e.g. Maid of Honor" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Phone</label>
            <input required value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} type="text" placeholder="e.g. +94 77 111 2222" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Measurements / Attire Details</label>
            <input value={newMember.measurements} onChange={e => setNewMember({...newMember, measurements: e.target.value})} type="text" placeholder="e.g. Dress Size: 8, Shoes: 6" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Assigned Task</label>
            <input value={newMember.tasks} onChange={e => setNewMember({...newMember, tasks: e.target.value})} type="text" placeholder="e.g. Hold the rings" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-3 text-right mt-2">
            <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Member"}
            </button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <p className="text-center text-deep-charcoal/60 py-10">Loading...</p>
      ) : members.length === 0 ? (
        <p className="text-center text-deep-charcoal/60 py-10">No bridal party members added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, idx) => (
            <motion.div 
              key={member.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-3xl border border-rose-gold/20 relative overflow-hidden group hover:border-rose-gold/40 transition-colors"
            >
              <button 
                onClick={() => handleDelete(member.id)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-rose-gold/10 text-rose-gold/50 hover:text-rose-gold transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-gold/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex flex-col items-center text-center mb-6 relative">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-rose-gold/20 flex items-center justify-center mb-4 overflow-hidden">
                  <span className="text-3xl text-white font-serif">{member.name.charAt(0)}</span>
                </div>
                <h2 className="text-xl font-medium text-deep-charcoal">{member.name}</h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-sage-green mt-1">
                  {member.role}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-deep-charcoal/70 bg-white/40 p-3 rounded-xl border border-white/50">
                  <Phone className="w-4 h-4 mr-3 text-rose-gold shrink-0" />
                  {member.contact_number || "No contact info"}
                </div>
                
                <div className="flex items-start text-sm text-deep-charcoal/70 bg-white/40 p-3 rounded-xl border border-white/50">
                  <Ruler className="w-4 h-4 mr-3 text-sage-green shrink-0 mt-0.5" />
                  <span className="leading-tight">{member.measurements?.details || "No measurements"}</span>
                </div>

                <div className="flex items-start text-sm text-deep-charcoal/70 bg-white/40 p-3 rounded-xl border border-white/50">
                  <Sparkles className="w-4 h-4 mr-3 text-rose-gold shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    {member.tasks && member.tasks.length > 0 ? member.tasks[0] : "No assigned tasks"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
