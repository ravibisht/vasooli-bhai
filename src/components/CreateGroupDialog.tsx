import React, { useState } from 'react';
import { LoaderCircle, X, CheckSquare } from 'lucide-react';
import { createGroup } from '../lib/api';

export default function CreateGroupDialog({ currentUser, onClose, onCreated }: { currentUser: any, onClose: () => void, onCreated: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('trip');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    setLoading(true);

    try {
      await createGroup({
        name,
        category,
        leader_id: currentUser.id,
        settlement_delay: 24,
        status: 'active',
        memberIds: [currentUser.id],
        members: [{
          id: Math.random().toString(36).substring(2, 10),
          user_id: currentUser.id,
          role: 'leader',
          joined_at: Date.now(),
          user: currentUser
        }]
      });
      onCreated();
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 fade-in duration-300">
        <header className="px-6 py-5 border-b border-black/5 flex items-center justify-between bg-[#F8F8F7]">
          <h2 className="text-xl font-bold tracking-tight">Create Group</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-black/40 hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest font-bold text-black/40">Group Name</label>
            <input 
              type="text" 
              placeholder="E.g. Weekend in Goa"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="w-full text-lg border-b-2 border-black/10 focus:border-black py-2 outline-none bg-transparent font-medium placeholder:text-black/20 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] uppercase tracking-widest font-bold text-black/40 mb-1">Category</label>
            <div className="grid grid-cols-2 gap-3">
               <button 
                 type="button"
                 onClick={() => setCategory('trip')}
                 className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm tracking-tight transition-all cursor-pointer ${category === 'trip' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
               >
                 🏖️ Trip
               </button>
               <button 
                 type="button"
                 onClick={() => setCategory('office')}
                 className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm tracking-tight transition-all cursor-pointer ${category === 'office' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
               >
                 💼 Office
               </button>
               <button 
                 type="button"
                 onClick={() => setCategory('flatmates')}
                 className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm tracking-tight transition-all cursor-pointer ${category === 'flatmates' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
               >
                 🏠 Flatmates
               </button>
               <button 
                 type="button"
                 onClick={() => setCategory('other')}
                 className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-sm tracking-tight transition-all cursor-pointer ${category === 'other' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-black/10 text-black/60 hover:bg-black/5'}`}
               >
                 ✨ Other
               </button>
            </div>
          </div>

          <div className="bg-black/5 border border-black/5 rounded-xl p-4 flex items-start gap-3 mt-2">
            <CheckSquare className="text-black/60 mt-0.5 shrink-0" size={18} />
            <div className="flex flex-col gap-1">
               <span className="text-sm font-bold text-black/80">You'll act as the Leader</span>
               <span className="text-xs font-medium text-black/50">As the creator, you manage expenses and initiate the final settlement.</span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!name || loading}
            className="w-full py-4 mt-2 bg-black text-white rounded-xl font-bold tracking-tight hover:bg-black/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer flex justify-center items-center"
          >
            {loading ? <LoaderCircle className="animate-spin" size={20} /> : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}
