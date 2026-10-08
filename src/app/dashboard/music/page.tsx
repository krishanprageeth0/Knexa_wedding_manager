"use client";

import { motion } from "framer-motion";
import { Music, Play, XOctagon, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function MusicPlaylist() {
  const { workspaceId } = useAuth();
  const [songs, setSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSong, setNewSong] = useState({ title: "", artist: "", moment: "Must Play" });

  useEffect(() => {
    if (workspaceId) fetchSongs();
  }, [workspaceId]);

  const fetchSongs = async () => {
    const { data } = await supabase
      .from("music_playlist")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setSongs(data);
    setIsLoading(false);
  };

  const handleAddSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const { data } = await supabase
      .from("music_playlist")
      .insert([{
        workspace_id: workspaceId,
        title: newSong.title,
        artist: newSong.artist,
        moment: newSong.moment
      }])
      .select();

    if (data) {
      setSongs([data[0], ...songs]);
      setIsAdding(false);
      setNewSong({ title: "", artist: "", moment: "Must Play" });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setSongs(songs.filter(s => s.id !== id));
    await supabase.from("music_playlist").delete().eq("id", id);
  };

  const mustPlay = songs.filter(s => s.moment === "Must Play");
  const doNotPlay = songs.filter(s => s.moment === "Do Not Play");

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Music & Playlist</h1>
          <p className="text-sage-green mt-2">Curate the perfect vibe for your special day</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 transition-colors shadow-md flex items-center"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Song</>}
        </button>
      </motion.div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAddSong}
          className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Song Title</label>
            <input required value={newSong.title} onChange={e => setNewSong({...newSong, title: e.target.value})} type="text" placeholder="e.g. Perfect" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Artist</label>
            <input required value={newSong.artist} onChange={e => setNewSong({...newSong, artist: e.target.value})} type="text" placeholder="e.g. Ed Sheeran" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Category</label>
            <select value={newSong.moment} onChange={e => setNewSong({...newSong, moment: e.target.value})} className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none">
              <option value="Must Play">Must Play</option>
              <option value="Do Not Play">Do Not Play</option>
            </select>
          </div>
          <div className="md:col-span-4 text-right mt-2">
            <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Song"}
            </button>
          </div>
        </motion.form>
      )}

      {isLoading ? (
        <p className="text-center text-deep-charcoal/60 py-10">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Must Play List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6 border border-sage-green/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sage-green/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-sage-green/20 flex items-center justify-center mr-4">
                <Play className="w-5 h-5 text-sage-green fill-sage-green" />
              </div>
              <h2 className="text-xl font-medium text-deep-charcoal">Must Play</h2>
            </div>

            <div className="space-y-3">
              {mustPlay.length === 0 && <p className="text-sm text-deep-charcoal/50">No songs added.</p>}
              {mustPlay.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-sage-green/20 hover:border-sage-green/50 transition-colors group">
                  <div className="flex items-center">
                    <Music className="w-4 h-4 text-sage-green/60 mr-4 shrink-0" />
                    <div>
                      <h3 className="font-medium text-deep-charcoal">{song.title}</h3>
                      <p className="text-xs text-deep-charcoal/60 mt-0.5">{song.artist}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(song.id)} className="text-rose-gold/50 hover:text-rose-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Do Not Play List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-3xl p-6 border border-rose-gold/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-gold/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-rose-gold/20 flex items-center justify-center mr-4">
                <XOctagon className="w-5 h-5 text-rose-gold" />
              </div>
              <h2 className="text-xl font-medium text-deep-charcoal">Do Not Play</h2>
            </div>

            <div className="space-y-3">
              {doNotPlay.length === 0 && <p className="text-sm text-deep-charcoal/50">No songs added.</p>}
              {doNotPlay.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-rose-gold/20 hover:border-rose-gold/50 transition-colors group">
                  <div className="flex items-center">
                    <Music className="w-4 h-4 text-rose-gold/40 mr-4 shrink-0" />
                    <div>
                      <h3 className="font-medium text-deep-charcoal line-through decoration-rose-gold/30">{song.title}</h3>
                      <p className="text-xs text-deep-charcoal/60 mt-0.5">{song.artist}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(song.id)} className="text-rose-gold/50 hover:text-rose-gold opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
