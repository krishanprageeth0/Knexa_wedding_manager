"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Plus, Calendar, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Checklist() {
  const { workspaceId } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", deadline: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (workspaceId) fetchTasks();
  }, [workspaceId]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("checklists")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true }); // Oldest first (chronological)
    if (data) setTasks(data);
    setIsLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) return;
    setIsSubmitting(true);

    const { data } = await supabase
      .from("checklists")
      .insert([{
        workspace_id: workspaceId,
        title: newTask.title,
        deadline: newTask.deadline ? new Date(newTask.deadline).toISOString() : null,
      }])
      .select();

    if (data) {
      setTasks([...tasks, data[0]]);
      setIsAdding(false);
      setNewTask({ title: "", deadline: "" });
    }
    setIsSubmitting(false);
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    await supabase.from("checklists").update({ is_completed: !currentStatus }).eq("id", id);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    await supabase.from("checklists").delete().eq("id", id);
  };

  const progress = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.is_completed).length / tasks.length) * 100);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-serif text-deep-charcoal">Checklist</h1>
          <p className="text-sage-green mt-2">Track your planning progress</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-serif text-rose-gold">{progress}%</p>
          <p className="text-xs text-deep-charcoal/60 uppercase tracking-wider font-medium mt-1">Completed</p>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-deep-charcoal/5 rounded-full overflow-hidden mb-10">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-rose-gold" 
        />
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-deep-charcoal">Tasks</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-deep-charcoal text-white rounded-xl text-sm font-medium hover:bg-deep-charcoal/90 transition-colors shadow-sm flex items-center"
        >
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-1.5" /> Add Task</>}
        </button>
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleAddTask}
          className="glass p-6 rounded-2xl border border-rose-gold/20 mb-6 flex flex-col md:flex-row gap-4 items-end"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Task Title</label>
            <input required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} type="text" placeholder="e.g. Hire Photographer" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-deep-charcoal/70 mb-1">Deadline (Optional)</label>
            <input value={newTask.deadline} onChange={e => setNewTask({...newTask, deadline: e.target.value})} type="date" className="w-full px-4 py-2 border border-rose-gold/20 rounded-xl bg-white/50 focus:ring-2 focus:ring-rose-gold/30 outline-none" />
          </div>
          <button disabled={isSubmitting} type="submit" className="px-6 py-2 bg-rose-gold text-white rounded-xl text-sm font-medium hover:bg-rose-gold/90 disabled:opacity-50 h-10">
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </motion.form>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-deep-charcoal/60 py-10">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-center text-deep-charcoal/60 py-10">No tasks added yet. Click "+ Add Task" to begin.</p>
        ) : (
          tasks.map((task, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={task.id} 
              className={`glass p-5 rounded-2xl border transition-all group ${
                task.is_completed 
                  ? "bg-white/40 border-sage-green/20" 
                  : "bg-white/70 border-rose-gold/20 hover:border-rose-gold/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => toggleTask(task.id, task.is_completed)}
                  className={`transition-colors flex-shrink-0 ${task.is_completed ? "text-sage-green" : "text-rose-gold/40 hover:text-rose-gold"}`}
                >
                  {task.is_completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
                <div className="flex-1">
                  <h3 className={`font-medium transition-all ${task.is_completed ? "text-deep-charcoal/40 line-through" : "text-deep-charcoal"}`}>
                    {task.title}
                  </h3>
                  {task.deadline && (
                    <div className="flex items-center mt-1">
                      <Calendar className={`w-3.5 h-3.5 mr-1.5 ${task.is_completed ? "text-deep-charcoal/30" : "text-sage-green"}`} />
                      <span className={`text-xs ${task.is_completed ? "text-deep-charcoal/30" : "text-sage-green"}`}>
                        By {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-rose-gold/50 hover:text-rose-gold transition-opacity p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
