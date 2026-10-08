"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, FileText, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function MemoriesGallery() {
  const { workspaceId } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMemory, setNewMemory] = useState({ title: "", url: "" });

  useEffect(() => {
    if (workspaceId) fetchMemories();
  }, [workspaceId]);

  const fetchMemories = async () => {
    const { data } = await supabase
      .from("memories")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (data) setFiles(data);
    setIsLoading(false);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const type = newMemory.url.endsWith(".pdf") ? "pdf" : "image";

    const { data } = await supabase
      .from("memories")
      .insert([{
        workspace_id: workspaceId,
        file_type: type,
        file_url: newMemory.url,
        title: newMemory.title
      }])
      .select();

    if (data) {
      setFiles([data[0], ...files]);
      setIsAdding(false);
      setNewMemory({ title: "", url: "" });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    await supabase.from("memories").delete().eq("id", id);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Our Memories</h1>
          <p className="text-sage-green mt-2">Your digital vault for inspiration and highlights</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 bg-sage-green text-white rounded-xl text-sm font-medium hover:bg-sage-green/90 transition-colors shadow-md flex items-center"
        >
          {isAdding ? "Cancel" : <><UploadCloud className="w-4 h-4 mr-2" /> Add Link</>}
        </button>
      </motion.div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMemory}
            className="glass p-6 rounded-2xl border border-rose-gold/20 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 items-end overflow-hidden"
          >
            <div>
              <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Image / Doc URL</label>
              <input required value={newMemory.url} onChange={e => setNewMemory({...newMemory, url: e.target.value})} type="url" placeholder="https://image-url.com/photo.jpg" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
            </div>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Title</label>
                <input required value={newMemory.title} onChange={e => setNewMemory({...newMemory, title: e.target.value})} type="text" placeholder="e.g. Venue Inspo" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
              </div>
              <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 disabled:opacity-50 h-[42px]">
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {isLoading ? (
        <p className="text-center text-deep-charcoal/60 py-10">Loading memories...</p>
      ) : files.length === 0 ? (
        <p className="text-center text-deep-charcoal/60 py-10">No memories added yet. Add a link above.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file, idx) => (
            <motion.div 
              key={file.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative aspect-square rounded-2xl overflow-hidden glass border border-rose-gold/20 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(file.id);
                }}
                className="absolute top-3 right-3 z-10 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-gold"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {file.file_type === "image" ? (
                <>
                  <img 
                    src={file.file_url} 
                    alt={file.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm font-medium">{file.title}</p>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/40">
                  <FileText className="w-12 h-12 text-sage-green mb-3" />
                  <p className="text-sm font-medium text-deep-charcoal text-center px-4 truncate w-full">{file.title}</p>
                  <a href={file.file_url} target="_blank" rel="noreferrer" className="text-xs text-sage-green hover:underline mt-2">View File</a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
