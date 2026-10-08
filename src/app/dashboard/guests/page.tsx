"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, CheckCircle2, Circle, Link as LinkIcon, ExternalLink, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function GuestsPage() {
  const { workspaceId } = useAuth();
  const [inviteUrl, setInviteUrl] = useState("https://sarah-kevin.vercel.app");
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [guests, setGuests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newGuest, setNewGuest] = useState({ name: "", phone: "", pax: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchGuests();
    }
  }, [workspaceId]);

  const fetchGuests = async () => {
    const { data } = await supabase
      .from("guests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setGuests(data);
    setIsLoading(false);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from("guests")
      .insert([{ 
        workspace_id: workspaceId, 
        name: newGuest.name, 
        contact_number: newGuest.phone,
        pax: newGuest.pax
      }])
      .select();
      
    if (data) {
      setGuests([data[0], ...guests]);
      setIsAdding(false);
      setNewGuest({ name: "", phone: "", pax: 1 });
    }
    setIsSubmitting(false);
  };

  const handleSendWhatsApp = async (guest: any) => {
    const invitationLink = `${inviteUrl}?guest=${guest.id}`;
    const message = `Hello ${guest.name}! ✨\n\nYou are warmly invited to our wedding. \n\nPlease view your digital invitation and RSVP here:\n${invitationLink}\n\nWe can't wait to celebrate with you!\n\n---\nCreated via knexa System`;
    
    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${guest.contact_number}?text=${encodedMessage}`;
    
    window.open(waLink, "_blank");
    
    await supabase.from("guests").update({ invite_sent: true }).eq("id", guest.id);
    setGuests(guests.map(g => g.id === guest.id ? { ...g, invite_sent: true } : g));
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Guest List</h1>
          <p className="text-sage-green mt-2">Manage invitations and RSVPs</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 transition-colors shadow-md flex items-center"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Guest</>}
        </button>
      </motion.div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAddGuest}
          className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Guest Name</label>
            <input required value={newGuest.name} onChange={e => setNewGuest({...newGuest, name: e.target.value})} type="text" placeholder="e.g. Aunt Mary" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">WhatsApp Number</label>
            <input required value={newGuest.phone} onChange={e => setNewGuest({...newGuest, phone: e.target.value})} type="text" placeholder="94701234567" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <button disabled={isSubmitting} type="submit" className="w-full px-4 py-2 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save Guest"}
          </button>
        </motion.form>
      )}

      {/* Digital Invitation Link Setup */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-6 rounded-2xl border border-sage-green/30 mb-8 bg-sage-green/5 flex flex-col md:flex-row md:items-center justify-between"
      >
        <div className="flex items-start mb-4 md:mb-0">
          <div className="w-10 h-10 rounded-full bg-sage-green/20 flex items-center justify-center mr-4 shrink-0">
            <LinkIcon className="w-5 h-5 text-sage-green" />
          </div>
          <div>
            <h2 className="font-medium text-deep-charcoal">Link Digital Invitation</h2>
            <p className="text-sm text-deep-charcoal/60 mt-1">
              Connect your external wedding website to automatically generate unique links for WhatsApp.
            </p>
          </div>
        </div>
        <div className="flex items-center w-full md:w-auto">
          {isEditingUrl ? (
            <div className="flex w-full md:w-80">
              <input 
                type="text" 
                value={inviteUrl}
                onChange={(e) => setInviteUrl(e.target.value)}
                className="flex-1 px-4 py-2 border border-sage-green/30 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-sage-green bg-white/60"
                placeholder="https://your-wedding-site.com"
              />
              <button 
                onClick={() => setIsEditingUrl(false)}
                className="px-4 py-2 bg-sage-green text-white rounded-r-xl text-sm font-medium hover:bg-sage-green/90"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center bg-white/50 px-4 py-2.5 rounded-xl border border-sage-green/20 w-full md:w-80 cursor-pointer hover:bg-white/80 transition-colors" onClick={() => setIsEditingUrl(true)}>
              <span className="text-sm text-deep-charcoal/70 truncate flex-1">{inviteUrl || "Enter URL here..."}</span>
              <ExternalLink className="w-4 h-4 text-sage-green ml-2" />
            </div>
          )}
        </div>
      </motion.div>

      <div className="glass rounded-2xl border border-rose-gold/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-rose-gold/5 border-b border-rose-gold/10">
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80">Guest Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80">Contact</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-center">RSVP</th>
              <th className="px-6 py-4 text-sm font-semibold text-deep-charcoal/80 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-6 text-center text-sm text-deep-charcoal/60">Loading...</td></tr>
            ) : guests.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-sm text-deep-charcoal/60">No guests added yet. Click "+ Add Guest" above.</td></tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest.id} className="border-b border-rose-gold/10 hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-deep-charcoal">{guest.name}</td>
                  <td className="px-6 py-4 text-sm text-deep-charcoal/70">{guest.contact_number}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {guest.rsvp_received ? (
                        <CheckCircle2 className="w-5 h-5 text-sage-green" />
                      ) : (
                        <Circle className="w-5 h-5 text-rose-gold/40" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSendWhatsApp(guest)}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        guest.invite_sent
                          ? "bg-sage-green/10 text-sage-green hover:bg-sage-green/20"
                          : "bg-deep-charcoal text-white hover:bg-deep-charcoal/90 shadow-sm"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                      {guest.invite_sent ? "Resend Invite" : "Send Invite"}
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
