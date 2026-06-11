import React, { useState } from 'react';
import { LoaderCircle, X, SplitSquareHorizontal, Camera, CheckCircle2 } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { addExpense } from '../lib/api';

export default function AddExpenseDialog({ group, currentUser, onClose, onAdded }: { group: any, currentUser: any, onClose: () => void, onAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [excludedMemberIds, setExcludedMemberIds] = useState<string[]>([]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setReceiptImage(url);
    }
  };

  const toggleMember = (memberId: string) => {
    setExcludedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || isNaN(Number(amount))) return;
    
    const includedMembers = group.members.filter((m: any) => !excludedMemberIds.includes(m.user_id));
    if (includedMembers.length === 0) return;

    setLoading(true);

    const numAmount = Number(amount);
    const splitAmount = numAmount / includedMembers.length;

    const participants = includedMembers.map((m: any) => ({
      user_id: m.user_id,
      share_value: splitAmount,
      user: m.user
    }));

    try {
      await addExpense(group.id, {
        title,
        amount: numAmount,
        paid_by: currentUser.id,
        payer: currentUser,
        date: new Date().toISOString(),
        split_method: 'equal',
        participants
      });
      onAdded();
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center sm:p-4">
      {/* Overlay to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 fade-in duration-300">
        <header className="px-6 py-5 border-b border-black/5 flex items-center justify-between bg-[#F8F8F7]">
          <h2 className="text-xl font-bold tracking-tight">Add Expense</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-black/40 hover:text-black rounded-full hover:bg-black/5 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest font-bold text-black/40">Description</label>
            <input 
              type="text" 
              placeholder="E.g. Dinner at Mario's"
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
              className="w-full text-lg border-b-2 border-black/10 focus:border-black py-2 outline-none bg-transparent font-medium placeholder:text-black/20 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest font-bold text-black/40">Amount</label>
            <div className="relative">
              <span className="absolute left-0 top-2 text-2xl font-light text-black/40">$</span>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full text-4xl border-b-2 border-black/10 focus:border-black py-2 pl-6 outline-none bg-transparent font-light tabular-nums placeholder:text-black/10 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest font-bold text-black/40">Receipt</label>
            <div className="relative">
              <input 
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                id="receipt-upload"
                onChange={handleImageCapture}
              />
              {receiptImage ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-black/10 shadow-sm">
                  <img src={receiptImage} alt="Receipt preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setReceiptImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-md cursor-pointer shadow-sm"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label htmlFor="receipt-upload" className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-black/10 hover:border-black/20 hover:bg-black/5 rounded-xl font-bold tracking-tight cursor-pointer transition-all">
                  <Camera size={20} className="text-black/60" />
                  <span className="text-black/60">Capture Receipt</span>
                </label>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase tracking-widest font-bold text-black/40">Included Members</label>
            <div className="border border-black/10 rounded-xl overflow-hidden flex flex-col bg-white">
              {group.members.map((m: any) => {
                const isIncluded = !excludedMemberIds.includes(m.user_id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMember(m.user_id)}
                    className="flex items-center justify-between p-3 border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={m.user} isCurrentUser={m.user.id === currentUser.id} className="w-8 h-8 text-[10px]" />
                      <span className={`text-sm font-bold tracking-tight ${isIncluded ? 'text-black' : 'text-black/40 line-through'}`}>
                        {m.user.name} {m.user.id === currentUser.id ? '(You)' : ''}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isIncluded ? 'bg-teal-600 border-teal-600 shadow-sm' : 'border-black/20 bg-white'}`}>
                      {isIncluded && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
            {excludedMemberIds.length > 0 && group.members.length - excludedMemberIds.length > 0 && (
              <p className="text-xs font-medium text-black/50 mt-1">
                Amount will be split equally among {group.members.length - excludedMemberIds.length} members.
              </p>
            )}
            {group.members.length - excludedMemberIds.length === 0 && (
              <p className="text-xs font-bold text-rose-600 mt-1">
                At least one member must be included.
              </p>
            )}
          </div>

          <button 
            type="submit" 
            disabled={!title || !amount || loading || group.members.length - excludedMemberIds.length === 0}
            className="w-full py-4 mt-2 bg-black text-white rounded-xl font-bold tracking-tight hover:bg-black/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer flex justify-center items-center"
          >
            {loading ? <LoaderCircle className="animate-spin" size={20} /> : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
