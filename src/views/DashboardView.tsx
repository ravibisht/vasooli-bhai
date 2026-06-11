import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle, Plus, ChevronRight } from 'lucide-react';
import CreateGroupDialog from '../components/CreateGroupDialog';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function DashboardView({ currentUser }: { currentUser: any }) {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenGroup = () => setIsCreating(true);
    window.addEventListener('open-new-group', handleOpenGroup as EventListener);
    return () => window.removeEventListener('open-new-group', handleOpenGroup as EventListener);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', currentUser.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gs: any[] = [];
      snapshot.forEach(doc => {
        gs.push({ id: doc.id, ...doc.data() });
      });
      // Sort by created_at desc locally
      gs.sort((a, b) => b.created_at - a.created_at);
      setGroups(gs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (loading) {
    return <div className="w-full h-full flex flex-col justify-center items-center"><LoaderCircle className="animate-spin text-teal-600" /></div>;
  }

  return (
    <>
      <div className="w-full h-full p-6 md:p-10 flex flex-col overflow-y-auto max-w-4xl mx-auto pb-32 md:pb-0">
        <header className="mb-10 flex justify-between items-center mt-4">
          <div>
             <p className="text-[11px] uppercase tracking-[0.2em] text-black/40 font-semibold mb-2">Good morning</p>
             <h1 className="text-4xl font-light tracking-tight">{currentUser.name}</h1>
          </div>
        </header>

        <section className="mb-12">
           <div className="flex justify-between items-end mb-6">
             <h2 className="text-xl font-bold tracking-tight">Your Groups</h2>
             <button onClick={() => setIsCreating(true)} className="text-sm font-bold text-teal-700 flex items-center gap-1 hover:text-teal-800 cursor-pointer">
               <Plus size={16} /> New Group
             </button>
           </div>
           
           <div className="flex flex-col gap-4">
             {groups.map(g => (
               <div 
                 key={g.id} 
                 onClick={() => navigate(`/group/${g.id}`)}
                 className="bg-white p-5 rounded-2xl border border-black/5 flex items-center justify-between cursor-pointer hover:shadow-sm transition-all hover:border-black/10 active:scale-[0.99]"
               >
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                     {g.category === 'trip' ? '🏖️' : g.category === 'office' ? '💼' : g.category === 'flatmates' ? '🏠' : '✨'}
                   </div>
                   <div className="flex flex-col">
                     <span className="font-bold tracking-tight text-lg">{g.name}</span>
                     <span className="text-xs font-medium text-black/40">{g.memberIds?.length || 0} members • {g.status === 'active' ? 'Active' : 'Settlement'}</span>
                   </div>
                 </div>
                 <ChevronRight className="text-black/20" />
               </div>
             ))}
             {groups.length === 0 && (
               <div className="text-center py-10 border border-dashed border-black/10 rounded-2xl bg-black/[0.02] text-sm text-black/40 font-medium">
                 No groups yet. Create one to start settling.
               </div>
             )}
           </div>
        </section>
      </div>

      {isCreating && (
        <CreateGroupDialog 
          currentUser={currentUser}
          onClose={() => setIsCreating(false)}
          onCreated={() => setIsCreating(false)}
        />
      )}
    </>
  );
}
