"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, BellRing, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SmartTimeline() {
  const { workspaceId } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEvent, setNewEvent] = useState({ time: "", title: "", location: "" });

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEvent, setEditEvent] = useState({ time: "", title: "", location: "" });

  useEffect(() => {
    if (workspaceId) fetchEvents();
  }, [workspaceId]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("timeline_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("start_time", { ascending: true });
    if (data) setEvents(data);
    setIsLoading(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const today = new Date().toISOString().split("T")[0];
    const startTimeStr = `${today}T${newEvent.time}:00`;
    
    const { data } = await supabase
      .from("timeline_events")
      .insert([{
        workspace_id: workspaceId,
        title: newEvent.title,
        description: newEvent.location,
        start_time: new Date(startTimeStr).toISOString(),
      }])
      .select();

    if (data) {
      const allEvents = [...events, data[0]];
      allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setEvents(allEvents);
      setIsAdding(false);
      setNewEvent({ time: "", title: "", location: "" });
    }
    setIsSubmitting(false);
  };

  const handleEditClick = (event: any) => {
    setEditingId(event.id);
    const dateObj = new Date(event.start_time);
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    setEditEvent({
      time: `${hours}:${minutes}`,
      title: event.title,
      location: event.description || "",
    });
  };

  const handleUpdateEvent = async () => {
    if (!editingId) return;
    
    const today = new Date().toISOString().split("T")[0];
    const startTimeStr = `${today}T${editEvent.time}:00`;

    const { data } = await supabase
      .from("timeline_events")
      .update({
        title: editEvent.title,
        description: editEvent.location,
        start_time: new Date(startTimeStr).toISOString(),
      })
      .eq("id", editingId)
      .select();

    if (data) {
      let allEvents = events.map(e => e.id === editingId ? data[0] : e);
      allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setEvents(allEvents);
      setEditingId(null);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      await supabase.from("timeline_events").delete().eq("id", id);
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Smart Timeline</h1>
          <p className="text-sage-green mt-2">Your wedding day schedule</p>
        </div>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
          }}
          className="px-5 py-2.5 bg-sage-green text-white rounded-xl text-sm font-medium hover:bg-sage-green/90 transition-colors shadow-md flex items-center"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Schedule</>}
        </button>
      </motion.div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddEvent}
            className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end overflow-hidden"
          >
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Time</label>
              <input required value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} type="time" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Title</label>
              <input required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} type="text" placeholder="e.g. Poruwa Ceremony" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Location</label>
              <input value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} type="text" placeholder="e.g. Grand Hall" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
            </div>
            <div className="md:col-span-4 mt-2 text-right">
              <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <p className="text-center text-deep-charcoal/60 py-10">Loading...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-deep-charcoal/60 py-10">No events added yet.</p>
      ) : (
        <div className="relative border-l-2 border-rose-gold/30 ml-6 space-y-10 mt-4">
          {events.map((event, idx) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-8 group"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full bg-ivory border-4 border-rose-gold shadow-sm z-10" />
              
              {editingId === event.id ? (
                <div className="glass p-5 rounded-2xl border border-rose-gold bg-white/60 shadow-sm relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="block text-xs text-deep-charcoal/70 mb-1">Time</label>
                      <input type="time" value={editEvent.time} onChange={e => setEditEvent({...editEvent, time: e.target.value})} className="w-full px-3 py-1.5 border border-rose-gold/30 rounded-lg bg-white/80 outline-none text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-deep-charcoal/70 mb-1">Title</label>
                      <input type="text" value={editEvent.title} onChange={e => setEditEvent({...editEvent, title: e.target.value})} className="w-full px-3 py-1.5 border border-rose-gold/30 rounded-lg bg-white/80 outline-none text-sm" />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs text-deep-charcoal/70 mb-1">Location</label>
                      <input type="text" value={editEvent.location} onChange={e => setEditEvent({...editEvent, location: e.target.value})} className="w-full px-3 py-1.5 border border-rose-gold/30 rounded-lg bg-white/80 outline-none text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-deep-charcoal/10 text-deep-charcoal text-xs font-medium rounded-lg hover:bg-deep-charcoal/20">Cancel</button>
                    <button onClick={handleUpdateEvent} className="px-3 py-1.5 bg-sage-green text-white text-xs font-medium rounded-lg flex items-center hover:bg-sage-green/90"><Check className="w-3.5 h-3.5 mr-1" /> Save</button>
                  </div>
                </div>
              ) : (
                <div className="glass p-6 rounded-2xl border border-white hover:border-rose-gold/30 transition-colors relative">
                  {/* Action Buttons (Hover) */}
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(event)} className="p-1.5 text-sage-green hover:bg-sage-green/10 rounded-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteEvent(event.id)} className="p-1.5 text-rose-gold/60 hover:text-rose-gold hover:bg-rose-gold/10 rounded-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                    <div className="flex items-center text-rose-gold font-medium mb-2 md:mb-0">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatTime(event.start_time)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-medium text-deep-charcoal mb-2 pr-12">{event.title}</h3>
                  
                  <div className="flex items-center text-sm text-deep-charcoal/60">
                    <MapPin className="w-4 h-4 mr-1.5" />
                    {event.description || "No Location"}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
