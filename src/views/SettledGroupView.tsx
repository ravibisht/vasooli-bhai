import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { RaiseDisputeDialog } from '../components/RaiseDisputeDialog';
import TransactionHistory from '../components/TransactionHistory';
import UserAvatar from '../components/UserAvatar';
import { updateSettlementMemberAction } from '../lib/api';

export default function SettledGroupView({ group, currentUser, onReload }: { group: any, currentUser: any, onReload: () => void }) {
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);

  const handleApprove = async () => {
    const settlement = group.settlements[0];
    const mySm = settlement.members.find((m: any) => m.user_id === currentUser.id);
    if (!mySm) return;

    try {
      await updateSettlementMemberAction(group.id, settlement.id, mySm.id, 'approve');
      onReload();
    } catch(e) {
      console.error(e);
    }
  };

  const handleDispute = async (reason: string, comment: string) => {
    const settlement = group.settlements[0];
    const mySm = settlement.members.find((m: any) => m.user_id === currentUser.id);
    if (!mySm) return;

    try {
      await updateSettlementMemberAction(group.id, settlement.id, mySm.id, 'dispute', reason);
      onReload();
    } catch(e) {
      console.error(e);
    }
  };

  const leader = group.members.find((m: any) => m.role === 'leader')?.user;
  const settlement = group.settlements[0];
  const mySm = settlement.members.find((sm: any) => sm.user_id === currentUser.id);
  const otherMembers = settlement.members.filter((sm: any) => sm.user_id !== currentUser.id && sm.user_id !== leader.id);

  const remainHours = Math.max(0, Math.floor((new Date(settlement.deadline).getTime() - Date.now()) / (1000 * 60 * 60)));
  const remainMins = Math.max(0, Math.floor(((new Date(settlement.deadline).getTime() - Date.now()) / (1000 * 60)) % 60));

  return (
    <>
      <div className="flex flex-col md:hidden w-full max-w-lg mx-auto">
        {/* Mobile Net Position Hero */}
        <section className="p-8 bg-white border-b border-black/5 flex flex-col items-center text-center mt-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-black/40 font-bold mb-4">Your Net Position</p>
          <h2 className={`text-6xl font-light tabular-nums tracking-tighter mb-3 ${mySm.direction === 'owes_leader' ? 'text-rose-600' : 'text-emerald-600'}`}>
            {mySm.direction === 'owes_leader' ? '-' : '+'}${mySm.net_amount.toFixed(2)}
          </h2>
          <p className="text-sm border border-black/10 py-2 px-5 rounded-full bg-[#F8F8F7] text-black/60 font-medium tracking-tight">
            {mySm.direction === 'owes_leader' ? 'Payable to' : 'Receivable from'} <span className="text-black font-bold">{leader.name}</span>
          </p>
        </section>

        {/* Auto Approval Card Mobile */}
        <section className="p-4">
          <div className="p-5 border border-black/5 rounded-2xl bg-white shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-end">
              <span className="text-[11px] uppercase tracking-widest font-bold text-black/40">Auto-Approval In</span>
              <span className="text-sm font-bold tabular-nums">{remainHours}h {remainMins}m</span>
            </div>
            <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.max(0, 100 - (remainHours/24)*100)}%` }}></div>
            </div>
          </div>
        </section>

        {/* Members List Mobile */}
        <section className="px-4 pb-6">
           <div className="flex items-center justify-between mb-4 mt-2 px-2">
              <p className="text-[11px] uppercase tracking-widest font-bold text-black/40">Settlement Info</p>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-[9px] font-bold uppercase tracking-wider">In Progress</span>
           </div>
           
           <div className="flex flex-col bg-white rounded-2xl border border-black/5 overflow-hidden">
             {otherMembers.map((sm: any) => (
               <div key={sm.id} className="flex items-center justify-between p-4 border-b border-black/5">
                 <div className="flex items-center gap-3">
                    <UserAvatar user={sm.user} className="w-9 h-9 text-[10px]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm tracking-tight text-black">{sm.user.name}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${sm.approval_status === 'approved' ? 'text-emerald-600' : 'text-black/40'}`}>{sm.approval_status}</span>
                    </div>
                 </div>
                 <span className={`tabular-nums font-bold text-sm ${sm.direction === 'owes_leader' ? 'text-black/80' : 'text-emerald-600'}`}>
                    {sm.direction === 'owes_leader' ? '-' : '+'}${Number(sm.net_amount).toFixed(2)}
                 </span>
               </div>
             ))}
             
             <div className="flex items-center justify-between p-4 border-b border-black/5 bg-teal-50/50">
               <div className="flex items-center gap-3">
                  <UserAvatar user={currentUser} isCurrentUser={true} showYou={true} className="w-9 h-9 text-xs shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-black">{currentUser.name}</span>
                    <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">
                      {mySm.approval_status === 'pending' ? 'Action Needed' : mySm.approval_status}
                    </span>
                  </div>
               </div>
               <span className={`tabular-nums font-bold text-sm ${mySm.direction === 'owes_leader' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {mySm.direction === 'owes_leader' ? '-' : '+'}${Number(mySm.net_amount).toFixed(2)}
               </span>
             </div>

             <div className="flex items-center justify-between p-4">
               <div className="flex items-center gap-3">
                  <UserAvatar user={leader} className="w-9 h-9 text-xs" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-black flex items-center gap-1.5">
                      {leader.name} 
                      <span className="bg-black text-white px-1.5 py-[2px] rounded text-[8px] uppercase tracking-widest font-bold">Hub</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-black/40 tracking-wider">Leader</span>
                  </div>
               </div>
               <span className="tabular-nums font-medium text-black/60 text-xs">Net Clearing</span>
             </div>
           </div>
        </section>

        {/* Mobile History */}
        <section className="px-4 pb-[160px]">
           <div className="flex items-center justify-between mb-4 mt-8 px-2">
              <p className="text-[11px] uppercase tracking-widest font-bold text-black/40">Transaction History</p>
           </div>
           <TransactionHistory group={group} currentUser={currentUser} />
        </section>
      </div>

      {/* Mobile Fixed Action Area - directly above Tab bar */}
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 px-4 py-3 bg-white/90 backdrop-blur-md border-t border-black/5 z-20 flex gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.02)] pt-[calc(0.75rem+env(safe-area-inset-bottom))] pb-3">
         <button 
           onClick={() => setIsDisputeDialogOpen(true)}
           className="flex-1 py-3.5 border border-black/10 bg-white text-black/80 rounded-xl text-sm font-bold tracking-tight active:scale-95 transition-all shadow-sm cursor-pointer"
         >
           Dispute
         </button>
         <button 
           onClick={handleApprove}
           disabled={mySm.approval_status !== 'pending'}
           className="flex-[2] py-3.5 bg-black text-white rounded-xl text-sm font-bold tracking-tight active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
           {mySm.approval_status === 'approved' ? 'Approved' : 'Approve Settlement'}
         </button>
      </div>

      {/* Desktop Split Pane Layout (hidden on mobile) */}
      <div className="hidden md:flex flex-1 overflow-hidden w-full max-w-7xl mx-auto">
        {/* Left Pane: Settlement List */}
        <section className="w-3/5 p-10 border-r border-black/5 flex flex-col overflow-y-auto bg-[#F8F8F7]">
          <header className="mb-10 flex justify-between items-start">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-black/40 font-semibold mb-2">Settlement Hub</p>
              <h1 className="text-4xl font-light tracking-tight">Net Balances</h1>
            </div>
            <button className="px-4 py-2.5 bg-white border border-black/5 rounded-xl text-sm font-bold tracking-tight shadow-sm hover:bg-black/5 transition-colors flex items-center gap-2 cursor-pointer">
              <Download size={16} />
              <span>Report</span>
            </button>
          </header>

          <div className="flex-1 flex flex-col">
            <div className="grid grid-cols-4 pb-4 border-b border-black/10 text-[11px] uppercase tracking-wider font-bold text-black/40">
              <div className="col-span-1">Member</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Net Balance</div>
            </div>
            
            <div className="overflow-y-auto">
              {otherMembers.map((sm: any) => (
                <div key={sm.id} className="grid grid-cols-4 py-6 border-b border-black/5 items-center">
                  <div className="col-span-1 flex items-center gap-3">
                    <UserAvatar user={sm.user} className="w-8 h-8 text-xs" />
                    <span className="font-medium text-sm">{sm.user.name}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <span className={`px-2.5 py-1 ${sm.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-black/5 text-black/40'} rounded text-[10px] font-bold uppercase tracking-tight`}>{sm.approval_status}</span>
                  </div>
                  <div className={`col-span-2 text-right tabular-nums font-medium ${sm.direction === 'owes_leader' ? 'text-black/80' : 'text-emerald-600'}`}>
                    {sm.direction === 'owes_leader' ? '-' : '+'}${Number(sm.net_amount).toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-4 py-6 border-b border-black/5 items-center bg-teal-50/50 -mx-4 px-4 rounded-2xl my-2 shadow-sm border">
                <div className="col-span-1 flex items-center gap-3">
                  <UserAvatar user={currentUser} isCurrentUser={true} showYou={true} className="w-8 h-8 text-[10px]" />
                  <span className="font-bold text-sm">{currentUser.name}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className={`px-2.5 py-1 ${mySm.approval_status === 'pending' ? 'bg-amber-50 text-amber-700' : (mySm.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')} rounded text-[10px] font-bold uppercase tracking-tight`}>{mySm.approval_status}</span>
                </div>
                <div className={`col-span-2 text-right tabular-nums font-bold ${mySm.direction === 'owes_leader' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {mySm.direction === 'owes_leader' ? '-' : '+'}${Number(mySm.net_amount).toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-4 py-6 border-b border-black/5 items-center">
                <div className="col-span-1 flex items-center gap-3">
                  <UserAvatar user={leader} className="w-8 h-8 text-[10px]" />
                  <span className="font-medium italic text-sm text-black/80">{leader.name}</span>
                </div>
                <div className="col-span-1 flex justify-center">
                  <span className="px-2.5 py-1 bg-black/80 text-white rounded text-[10px] font-bold uppercase tracking-tight">Hub</span>
                </div>
                <div className="col-span-2 text-right tabular-nums font-medium text-black/60 text-sm">Net Clearing</div>
              </div>
            </div>
            
            <div className="mt-12 py-8 border-t border-black/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold tracking-tight">Transaction History</h2>
              </div>
              <TransactionHistory group={group} currentUser={currentUser} />
            </div>
          </div>
        </section>

        {/* Right Pane: Action Center */}
        <section className="w-2/5 min-w-[380px] bg-white p-12 flex flex-col border-l border-black/5 overflow-y-auto">
          <div className="mb-auto">
            <p className="text-[11px] uppercase tracking-[0.2em] text-black/40 font-bold mb-8">Your Net Position</p>
            
            <div className="mb-10">
              <h2 className={`text-7xl lg:text-7xl font-light tabular-nums tracking-tighter mb-4 ${mySm.direction === 'owes_leader' ? 'text-rose-600' : 'text-emerald-600'}`}>
                 {mySm.direction === 'owes_leader' ? '-' : '+'}${mySm.net_amount.toFixed(2)}
              </h2>
              <p className="text-lg text-black/60 font-medium tracking-tight">
                {mySm.direction === 'owes_leader' ? 'Payable to' : 'Receivable from'} <span className="text-black underline underline-offset-4 decoration-black/20 font-bold">{leader.name}</span>
              </p>
            </div>

            <div className="p-6 border border-black/5 rounded-2xl bg-[#F8F8F7] mb-12 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <span className="text-[11px] uppercase tracking-widest font-bold text-black/40">Auto-Approval In</span>
                <span className="text-sm font-bold tabular-nums">{remainHours}h {remainMins}m</span>
              </div>
              <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.max(0, 100 - (remainHours/24)*100)}%` }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleApprove}
                disabled={mySm.approval_status !== 'pending'}
                className="w-full py-4 bg-black text-white rounded-xl font-bold tracking-tight hover:bg-black/90 cursor-pointer transition-colors shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mySm.approval_status === 'approved' ? 'Approved' : 'Approve Settlement'}
              </button>
              <button 
                onClick={() => setIsDisputeDialogOpen(true)}
                className="w-full py-4 border border-black/10 bg-white text-black/80 rounded-xl font-bold tracking-tight hover:bg-black/5 cursor-pointer transition-colors text-base"
              >
                Raise Dispute
              </button>
            </div>
          </div>

          <footer className="pt-8 border-t border-black/5 mt-8">
            <div className="flex items-start gap-4 text-black/40">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <p className="text-[11px] leading-relaxed font-medium">
                By approving, you confirm all associated expenses are accurate. Once all members approve, Rahul will initiate the collection workflow via your committed mandate.
              </p>
            </div>
          </footer>
        </section>
      </div>

      <RaiseDisputeDialog 
        isOpen={isDisputeDialogOpen}
        onClose={() => setIsDisputeDialogOpen(false)}
        onSubmit={handleDispute}
      />
    </>
  );
}
