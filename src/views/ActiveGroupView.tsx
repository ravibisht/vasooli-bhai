import React, { useState } from 'react';
import { Plus, Receipt, User, LoaderCircle } from 'lucide-react';
import AddExpenseDialog from '../components/AddExpenseDialog';
import TransactionHistory from '../components/TransactionHistory';
import UserAvatar from '../components/UserAvatar';
import { closeGroup } from '../lib/api';

export default function ActiveGroupView({ group, currentUser, onReload }: { group: any, currentUser: any, onReload: () => void }) {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isLeader = group.leader_id === currentUser.id;

  const handleCloseGroup = async () => {
    setIsClosing(true);
    try {
      await closeGroup(group.id);
      onReload();
    } catch(e) {
      console.error(e);
    } finally {
      setIsClosing(false);
    }
  };

  const calculateTotalSpend = () => {
    return group.expenses.reduce((acc: number, ex: any) => acc + ex.amount, 0);
  };

  return (
    <>
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto overflow-hidden">
        {/* Left Column: Feed / Expenses List */}
        <section className="flex-1 border-r border-black/5 flex flex-col bg-[#F8F8F7] md:p-10 p-6 overflow-y-auto">
          <header className="hidden md:flex mb-10 justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-black/40 font-semibold mb-2">Active Group</p>
              <h1 className="text-4xl font-light tracking-tight">{group.name}</h1>
            </div>
          </header>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Transaction History</h2>
            <span className="text-sm font-medium text-black/40">{group.expenses.length} total</span>
          </div>

          <div className="flex flex-col gap-4 mb-24 md:mb-0">
            <TransactionHistory group={group} currentUser={currentUser} />
          </div>
        </section>

        {/* Right Column: Group Stats & Actions */}
        <section className="w-full md:w-80 lg:w-96 bg-white p-6 md:p-10 flex flex-col border-l border-black/5 shrink-0 overflow-y-auto hidden md:flex">
          <div className="mb-10 p-6 bg-[#F8F8F7] rounded-2xl border border-black/5 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/40 font-bold mb-2">Total Spend</p>
            <h2 className="text-5xl font-light tabular-nums tracking-tighter text-black">${calculateTotalSpend().toFixed(2)}</h2>
          </div>

          <div className="mb-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-black/40 mb-4">Members ({group.members.length})</h3>
            <div className="flex flex-col gap-3">
              {group.members.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3">
                  <UserAvatar user={m.user} isCurrentUser={m.user.id === currentUser.id} className="w-8 h-8 text-xs" />
                  <span className="font-medium text-sm">{m.user.name} {m.user.id === currentUser.id ? '(You)' : ''}</span>
                  {m.role === 'leader' && <span className="ml-auto px-2 py-0.5 bg-black/5 text-black/60 rounded text-[9px] font-bold uppercase tracking-widest">Leader</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-6 border-t border-black/5">
            <button 
              onClick={() => setIsAddingExpense(true)}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold tracking-tight hover:bg-teal-700 cursor-pointer flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={20} /> Add Expense
            </button>
            {isLeader && (
              <button 
                onClick={handleCloseGroup}
                disabled={isClosing}
                className="w-full py-4 bg-black text-white rounded-xl font-bold tracking-tight hover:bg-black/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {isClosing ? <LoaderCircle className="animate-spin mx-auto" /> : 'Settle Up Group'}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Mobile Fixed Actions - replacing bottom tab on this view optionally, or sitting above it. For now, a floating Fab for adding, or fixed bar. */}
      <div className="md:hidden fixed bottom-[72px] right-6 z-20">
         <button 
           onClick={() => setIsAddingExpense(true)}
           className="w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer">
           <Plus size={24} strokeWidth={3} />
         </button>
      </div>

      {isLeader && (
        <div className="md:hidden fixed bottom-[72px] left-6 z-20">
           <button 
             onClick={handleCloseGroup}
             disabled={isClosing || group.expenses.length === 0}
             className="px-5 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer font-bold tracking-tight text-sm disabled:opacity-50">
             {isClosing ? <LoaderCircle className="animate-spin" size={20} /> : 'Settle Up'}
           </button>
        </div>
      )}

      {isAddingExpense && (
        <AddExpenseDialog 
          group={group} 
          currentUser={currentUser} 
          onClose={() => setIsAddingExpense(false)} 
          onAdded={() => { setIsAddingExpense(false); onReload(); }} 
        />
      )}
    </>
  );
}
