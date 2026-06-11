import React from 'react';
import { Receipt, CheckCircle2 } from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function TransactionHistory({ group, currentUser }: { group: any, currentUser: any }) {
  // Combine logic
  const items = [];
  
  if (group.expenses) {
    group.expenses.forEach((ex: any) => {
      items.push({
        id: ex.id,
        type: 'expense',
        title: ex.title,
        amount: ex.amount,
        date: new Date(ex.date).getTime(),
        actorName: ex.payer.id === currentUser.id ? 'You' : ex.payer.name,
        actor: ex.payer
      });
    });
  }

  if (group.settlements) {
    group.settlements.forEach((s: any) => {
      items.push({
        id: s.id,
        type: 'settlement',
        title: 'Group Settled',
        amount: null,
        date: new Date(s.created_at).getTime(), // Using created_at for chronological sorting
        actorName: 'System',
        actor: null
      });
    });
  }

  // Sort descending
  items.sort((a, b) => b.date - a.date);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-black/10 rounded-2xl bg-black/[0.02] text-sm text-black/40 font-medium">
        No transactions yet. Add the first expense!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item: any) => (
        <div key={`${item.type}-${item.id}`} className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            {item.type === 'expense' ? (
              <div className="relative w-10 h-10 shrink-0">
                <UserAvatar user={item.actor} isCurrentUser={item.actor?.id === currentUser.id} className="w-10 h-10 text-xs" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-50 rounded-full flex items-center justify-center border border-white">
                  <Receipt size={10} className="text-teal-700" />
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold tracking-tight">{item.title}</span>
              <span className="text-xs text-black/50">
                {item.type === 'expense' ? `Paid by ` : ''}
                <span className="font-medium text-black/80">{item.actorName}</span> 
                {' on '}
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            {item.type === 'expense' && (
              <div className="font-bold tabular-nums text-lg">${Number(item.amount).toFixed(2)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
