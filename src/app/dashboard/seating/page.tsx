"use client";

import { motion } from "framer-motion";
import { Plus, Users as UsersIcon, X, UserMinus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SeatingPlan() {
  const { workspaceId } = useAuth();
  const [tables, setTables] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTable, setNewTable] = useState({ name: "", capacity: 10 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<{ [tableId: string]: string }>({});

  useEffect(() => {
    if (workspaceId) {
      fetchData();
    }
  }, [workspaceId]);

  const fetchData = async () => {
    const [tablesRes, guestsRes] = await Promise.all([
      supabase.from("seating_tables").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: true }),
      supabase.from("guests").select("*").eq("workspace_id", workspaceId)
    ]);
    
    if (tablesRes.data) setTables(tablesRes.data);
    if (guestsRes.data) setGuests(guestsRes.data);
    setIsLoading(false);
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const { data } = await supabase
      .from("seating_tables")
      .insert([{
        workspace_id: workspaceId,
        table_name: newTable.name,
        capacity: Number(newTable.capacity) || 10
      }])
      .select();

    if (data) {
      setTables([...tables, data[0]]);
      setIsAdding(false);
      setNewTable({ name: "", capacity: 10 });
    }
    setIsSubmitting(false);
  };

  const handleAssignGuest = async (tableId: string) => {
    const guestId = selectedGuest[tableId];
    if (!guestId) return;

    await supabase.from("guests").update({ table_id: tableId }).eq("id", guestId);
    setGuests(guests.map(g => g.id === guestId ? { ...g, table_id: tableId } : g));
    setSelectedGuest({ ...selectedGuest, [tableId]: "" });
  };

  const handleRemoveGuest = async (guestId: string) => {
    await supabase.from("guests").update({ table_id: null }).eq("id", guestId);
    setGuests(guests.map(g => g.id === guestId ? { ...g, table_id: null } : g));
  };

  const unassignedGuests = guests.filter(g => !g.table_id);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Seating Plan</h1>
          <p className="text-sage-green mt-2">Organize your guests into tables effortlessly</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 transition-colors shadow-md flex items-center"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Table</>}
        </button>
      </motion.div>

      {/* Unassigned Guests Warning */}
      {!isLoading && unassignedGuests.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-gold/10 border border-rose-gold/30 p-4 rounded-xl mb-8 flex justify-between items-center">
          <p className="text-sm font-medium text-deep-charcoal">
            You have <span className="font-bold text-rose-gold">{unassignedGuests.length}</span> unassigned guests.
          </p>
        </motion.div>
      )}

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAddTable}
          className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
        >
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Table Name</label>
            <input required value={newTable.name} onChange={e => setNewTable({...newTable, name: e.target.value})} type="text" placeholder="e.g. Table 1 (Family)" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Capacity (Seats)</label>
            <input required value={newTable.capacity} onChange={e => setNewTable({...newTable, capacity: parseInt(e.target.value) || 10})} type="number" min="1" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-1 text-right">
            <button disabled={isSubmitting} type="submit" className="w-full px-6 py-2 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 disabled:opacity-50 h-[42px]">
              {isSubmitting ? "Creating..." : "Create Table"}
            </button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <p className="text-center text-deep-charcoal/60 py-10">Loading seating plan...</p>
      ) : tables.length === 0 ? (
        <p className="text-center text-deep-charcoal/60 py-10">No tables created yet. Click "+ Add Table" to start.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table, idx) => {
            const tableGuests = guests.filter(g => g.table_id === table.id);
            const isFull = tableGuests.length >= table.capacity;

            return (
              <motion.div 
                key={table.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass rounded-3xl p-6 border border-rose-gold/20 shadow-sm relative overflow-hidden flex flex-col"
              >
                {/* Table Graphic */}
                <div className={`w-32 h-32 mx-auto border-[6px] rounded-full flex flex-col items-center justify-center mb-6 relative transition-colors ${isFull ? 'border-sage-green/40 bg-sage-green/10' : 'border-rose-gold/20 bg-white/40'}`}>
                  <UsersIcon className={`w-6 h-6 mb-1 ${isFull ? 'text-sage-green' : 'text-rose-gold'}`} />
                  <span className="text-xl font-serif text-deep-charcoal">{table.capacity}</span>
                  <span className="text-[10px] uppercase tracking-wider text-deep-charcoal/50">Seats</span>
                </div>

                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium text-deep-charcoal">{table.table_name}</h3>
                  <p className={`text-xs font-medium mt-1 ${isFull ? 'text-sage-green' : 'text-rose-gold'}`}>
                    {tableGuests.length} / {table.capacity} Assigned
                  </p>
                </div>

                {/* Assignment Controls */}
                {!isFull && unassignedGuests.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    <select 
                      value={selectedGuest[table.id] || ""}
                      onChange={(e) => setSelectedGuest({...selectedGuest, [table.id]: e.target.value})}
                      className="flex-1 text-xs px-2 py-1.5 rounded-lg bg-white/60 border border-sage-green/30 outline-none"
                    >
                      <option value="">Select guest...</option>
                      {unassignedGuests.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                    <button 
                      onClick={() => handleAssignGuest(table.id)}
                      disabled={!selectedGuest[table.id]}
                      className="px-3 py-1.5 bg-sage-green text-white text-xs font-medium rounded-lg disabled:opacity-50 hover:bg-sage-green/90"
                    >
                      Add
                    </button>
                  </div>
                )}

                <div className="flex-1">
                  <div className="space-y-2">
                    {tableGuests.length === 0 ? (
                      <p className="text-xs text-center text-deep-charcoal/40 italic">Empty Table</p>
                    ) : (
                      tableGuests.map((guest, i) => (
                        <div key={guest.id} className="text-sm text-deep-charcoal/80 bg-white/50 px-3 py-2 rounded-lg border border-white flex justify-between items-center group">
                          <span>{i + 1}. {guest.name}</span>
                          <button onClick={() => handleRemoveGuest(guest.id)} className="text-rose-gold/40 hover:text-rose-gold opacity-0 group-hover:opacity-100 transition-opacity">
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
