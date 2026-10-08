"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function BudgetPlanner() {
  const { workspaceId } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newItem, setNewItem] = useState({
    category: "",
    item_name: "",
    estimated_cost: "",
    actual_cost: "",
    advance_paid: ""
  });

  useEffect(() => {
    if (workspaceId) {
      fetchBudgetItems();
    }
  }, [workspaceId]);

  const fetchBudgetItems = async () => {
    const { data } = await supabase
      .from("budget_items")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setCategories(data);
    setIsLoading(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const { data, error } = await supabase.from("budget_items").insert([{
      workspace_id: workspaceId,
      category: newItem.category,
      item_name: newItem.item_name,
      estimated_cost: Number(newItem.estimated_cost),
      actual_cost: Number(newItem.actual_cost) || Number(newItem.estimated_cost),
      advance_paid: Number(newItem.advance_paid) || 0
    }]).select();

    if (data) {
      setCategories([data[0], ...categories]);
      setIsAdding(false);
      setNewItem({ category: "", item_name: "", estimated_cost: "", actual_cost: "", advance_paid: "" });
    }
    setIsSubmitting(false);
  };

  const totalEstimated = categories.reduce((sum, c) => sum + Number(c.estimated_cost || 0), 0);
  const totalActual = categories.reduce((sum, c) => sum + Number(c.actual_cost || 0), 0);
  const totalPaid = categories.reduce((sum, c) => sum + Number(c.advance_paid || 0), 0);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Budget Planner</h1>
          <p className="text-sage-green mt-2">Track expenses and payments</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-deep-charcoal text-white rounded-xl text-sm font-medium flex items-center hover:bg-deep-charcoal/90 transition-colors shadow-md"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Expense</>}
        </button>
      </motion.div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAddExpense}
          className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-6 gap-4 items-end"
        >
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Category</label>
            <input required value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} type="text" placeholder="e.g. Venue" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Item Name</label>
            <input required value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} type="text" placeholder="e.g. Grand Hotel" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Estimated LKR</label>
            <input required value={newItem.estimated_cost} onChange={e => setNewItem({...newItem, estimated_cost: e.target.value})} type="number" placeholder="100000" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Advance Paid</label>
            <input value={newItem.advance_paid} onChange={e => setNewItem({...newItem, advance_paid: e.target.value})} type="number" placeholder="50000" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-1">
            <button disabled={isSubmitting} type="submit" className="w-full px-4 py-2 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 disabled:opacity-50 h-10">
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl border border-rose-gold/30 bg-rose-gold/5 relative overflow-hidden"
        >
          <p className="text-sm font-medium text-deep-charcoal/70 mb-1">Estimated Budget</p>
          <h2 className="text-3xl font-serif text-deep-charcoal">Rs {totalEstimated.toLocaleString()}</h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl border border-sage-green/30 bg-sage-green/5 relative overflow-hidden"
        >
          <p className="text-sm font-medium text-deep-charcoal/70 mb-1">Actual Cost</p>
          <h2 className="text-3xl font-serif text-deep-charcoal">Rs {totalActual.toLocaleString()}</h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-6 rounded-2xl border border-white relative overflow-hidden"
        >
          <p className="text-sm font-medium text-deep-charcoal/70 mb-1">Total Paid</p>
          <h2 className="text-3xl font-serif text-deep-charcoal">Rs {totalPaid.toLocaleString()}</h2>
          <div className="mt-4 w-full bg-white/50 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-sage-green transition-all duration-1000" 
              style={{ width: `${totalActual > 0 ? (totalPaid / totalActual) * 100 : 0}%` }}
            />
          </div>
        </motion.div>
      </div>

      <div className="glass rounded-2xl border border-rose-gold/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-rose-gold/5 border-b border-rose-gold/10">
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80">Category / Item</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-right">Estimated</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-right">Actual Cost</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-right">Advance Paid</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-deep-charcoal/60">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-deep-charcoal/60">No expenses added yet. Click "+ Add Expense" above.</td></tr>
            ) : (
              categories.map((item) => (
                <tr key={item.id} className="border-b border-rose-gold/10 hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-deep-charcoal">{item.item_name}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sage-green/10 text-sage-green uppercase tracking-wider">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-deep-charcoal/70">
                    Rs {Number(item.estimated_cost).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-deep-charcoal">
                    Rs {Number(item.actual_cost).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-sage-green font-medium">
                    Rs {Number(item.advance_paid).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-rose-gold">
                    Rs {(Number(item.actual_cost) - Number(item.advance_paid)).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
