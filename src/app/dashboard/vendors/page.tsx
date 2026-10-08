"use client";

import { motion } from "framer-motion";
import { Store, Phone, Mail, FileText, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function VendorHub() {
  const { workspaceId } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVendor, setNewVendor] = useState({ category: "", name: "", phone: "", email: "", advance: "", balance: "" });

  useEffect(() => {
    if (workspaceId) fetchVendors();
  }, [workspaceId]);

  const fetchVendors = async () => {
    const { data } = await supabase
      .from("vendors")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setVendors(data);
    setIsLoading(false);
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const { data } = await supabase
      .from("vendors")
      .insert([{
        workspace_id: workspaceId,
        category: newVendor.category,
        name: newVendor.name,
        contact_details: { phone: newVendor.phone, email: newVendor.email },
        advance_paid: Number(newVendor.advance) || 0,
        balance: Number(newVendor.balance) || 0
      }])
      .select();

    if (data) {
      setVendors([data[0], ...vendors]);
      setIsAdding(false);
      setNewVendor({ category: "", name: "", phone: "", email: "", advance: "", balance: "" });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setVendors(vendors.filter(v => v.id !== id));
    await supabase.from("vendors").delete().eq("id", id);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Vendor Hub</h1>
          <p className="text-sage-green mt-2">Manage your wedding suppliers & contracts</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 transition-colors shadow-md flex items-center"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Vendor</>}
        </button>
      </motion.div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAddVendor}
          className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Category</label>
            <input required value={newVendor.category} onChange={e => setNewVendor({...newVendor, category: e.target.value})} type="text" placeholder="e.g. Photography" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Business Name</label>
            <input required value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} type="text" placeholder="e.g. Lumina Studios" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Phone</label>
            <input required value={newVendor.phone} onChange={e => setNewVendor({...newVendor, phone: e.target.value})} type="text" placeholder="e.g. +94 77 123 4567" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Email</label>
            <input value={newVendor.email} onChange={e => setNewVendor({...newVendor, email: e.target.value})} type="email" placeholder="e.g. hello@vendor.com" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Advance Paid</label>
            <input required value={newVendor.advance} onChange={e => setNewVendor({...newVendor, advance: e.target.value})} type="number" placeholder="50000" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Balance Remaining</label>
            <input required value={newVendor.balance} onChange={e => setNewVendor({...newVendor, balance: e.target.value})} type="number" placeholder="50000" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-3 text-right mt-2">
            <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Vendor"}
            </button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <p className="text-center text-deep-charcoal/60 py-10">Loading...</p>
      ) : vendors.length === 0 ? (
        <p className="text-center text-deep-charcoal/60 py-10">No vendors added yet. Click "+ Add Vendor" above.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((vendor, idx) => (
            <motion.div 
              key={vendor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-6 rounded-3xl border border-rose-gold/20 hover:border-rose-gold/40 transition-colors group relative"
            >
              <button 
                onClick={() => handleDelete(vendor.id)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-rose-gold/10 text-rose-gold/50 hover:text-rose-gold transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-gold/20 to-sage-green/20 flex items-center justify-center mr-4 shrink-0">
                  <Store className="w-6 h-6 text-deep-charcoal" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-sage-green bg-sage-green/10 px-2 py-0.5 rounded-full">
                    {vendor.category}
                  </span>
                  <h2 className="text-xl font-medium text-deep-charcoal mt-1">{vendor.name}</h2>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-deep-charcoal/70">
                  <Phone className="w-4 h-4 mr-3 text-rose-gold" />
                  {vendor.contact_details?.phone || "No phone"}
                </div>
                <div className="flex items-center text-sm text-deep-charcoal/70">
                  <Mail className="w-4 h-4 mr-3 text-rose-gold" />
                  {vendor.contact_details?.email || "No email"}
                </div>
              </div>

              <div className="bg-white/40 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-deep-charcoal/60 mb-1">Advance Paid</p>
                  <p className="text-lg font-medium text-sage-green">Rs {Number(vendor.advance_paid).toLocaleString()}</p>
                </div>
                <div className="h-10 w-px bg-rose-gold/20 mx-4" />
                <div className="text-right">
                  <p className="text-xs text-deep-charcoal/60 mb-1">Balance</p>
                  <p className="text-lg font-medium text-rose-gold">Rs {Number(vendor.balance).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
