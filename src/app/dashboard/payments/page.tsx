"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function PaymentReminders() {
  const { workspaceId } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPayment, setNewPayment] = useState({ vendor: "", type: "", amount: "", dueDate: "" });

  useEffect(() => {
    if (workspaceId) fetchPayments();
  }, [workspaceId]);

  const fetchPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("due_date", { ascending: true });
      
    if (data) {
      // Auto-update overdue status based on current date
      const today = new Date().toISOString().split("T")[0];
      const updatedData = data.map(p => {
        if (p.status !== "paid" && p.due_date < today) {
          return { ...p, status: "overdue" };
        }
        if (p.status === "overdue" && p.due_date >= today) {
          return { ...p, status: "pending" };
        }
        return p;
      });
      setPayments(updatedData);
      
      // Update DB for overdue items silently
      const overdues = updatedData.filter(p => p.status === "overdue" && data.find(orig => orig.id === p.id)?.status !== "overdue");
      for (const p of overdues) {
        supabase.from("payments").update({ status: "overdue" }).eq("id", p.id).then();
      }
    }
    setIsLoading(false);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const today = new Date().toISOString().split("T")[0];
    const status = newPayment.dueDate < today ? "overdue" : "pending";

    const { data } = await supabase
      .from("payments")
      .insert([{
        workspace_id: workspaceId,
        vendor: newPayment.vendor,
        type: newPayment.type,
        amount: Number(newPayment.amount),
        due_date: newPayment.dueDate,
        status: status
      }])
      .select();

    if (data) {
      const allPayments = [...payments, data[0]];
      allPayments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      setPayments(allPayments);
      setIsAdding(false);
      setNewPayment({ vendor: "", type: "", amount: "", dueDate: "" });
    }
    setIsSubmitting(false);
  };

  const handleMarkPaid = async (id: string) => {
    setPayments(payments.map(p => p.id === id ? { ...p, status: "paid" } : p));
    await supabase.from("payments").update({ status: "paid" }).eq("id", id);
  };

  const handleDelete = async (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
    await supabase.from("payments").delete().eq("id", id);
  };

  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Payment Reminders</h1>
          <p className="text-sage-green mt-2">Track upcoming vendor payments and due dates</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 transition-colors shadow-md flex items-center"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Schedule</>}
        </button>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-2xl border border-rose-gold/20 bg-white/50">
          <p className="text-sm font-medium text-deep-charcoal/70">Total Pending</p>
          <p className="text-3xl font-serif text-deep-charcoal mt-2">Rs {totalPending.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-2xl border border-rose-gold/50 bg-rose-gold/10">
          <div className="flex items-center text-rose-gold mb-1">
            <AlertCircle className="w-4 h-4 mr-2" />
            <p className="text-sm font-medium">Overdue Amount</p>
          </div>
          <p className="text-3xl font-serif text-rose-gold mt-1">Rs {totalOverdue.toLocaleString()}</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddPayment}
            className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end overflow-hidden"
          >
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Vendor</label>
              <input required value={newPayment.vendor} onChange={e => setNewPayment({...newPayment, vendor: e.target.value})} type="text" placeholder="e.g. Lumina Studios" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Payment Type</label>
              <input required value={newPayment.type} onChange={e => setNewPayment({...newPayment, type: e.target.value})} type="text" placeholder="e.g. Advance" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Amount (Rs)</label>
              <input required value={newPayment.amount} onChange={e => setNewPayment({...newPayment, amount: e.target.value})} type="number" placeholder="50000" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Due Date</label>
              <input required value={newPayment.dueDate} onChange={e => setNewPayment({...newPayment, dueDate: e.target.value})} type="date" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
            </div>
            <div className="md:col-span-4 mt-2 text-right">
              <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="glass rounded-2xl border border-rose-gold/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-rose-gold/5 border-b border-rose-gold/10">
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80">Vendor / Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-right">Amount</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-center">Due Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-center">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-deep-charcoal/60">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-sm text-deep-charcoal/60">No payments scheduled yet.</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="border-b border-rose-gold/10 hover:bg-white/40 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-medium text-deep-charcoal">{payment.vendor}</p>
                    <p className="text-xs text-deep-charcoal/60 mt-0.5">{payment.type}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-deep-charcoal">
                    Rs {Number(payment.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center text-sm text-deep-charcoal/70">
                      <Calendar className="w-4 h-4 mr-2 text-sage-green" />
                      {new Date(payment.due_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        payment.status === "paid" ? "bg-sage-green/10 text-sage-green" :
                        payment.status === "overdue" ? "bg-rose-gold/20 text-rose-gold" :
                        "bg-deep-charcoal/10 text-deep-charcoal"
                      }`}>
                        {payment.status === "paid" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {payment.status === "overdue" && <AlertCircle className="w-3 h-3 mr-1" />}
                        {payment.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {payment.status !== "paid" && (
                      <button 
                        onClick={() => handleMarkPaid(payment.id)}
                        className="text-xs font-medium text-sage-green hover:bg-sage-green/10 px-3 py-1.5 rounded-lg transition-colors mr-2"
                      >
                        Mark as Paid
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(payment.id)}
                      className="text-rose-gold/50 hover:text-rose-gold hover:bg-rose-gold/10 p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
