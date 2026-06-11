import React, { useState } from 'react';
import { X } from 'lucide-react';

interface RaiseDisputeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, comment: string) => void;
}

const REASONS = [
  { id: 'incorrect_expense', label: 'Incorrect expense' },
  { id: 'wrong_split', label: 'Wrong split amount' },
  { id: 'duplicate', label: 'Duplicate entry' },
  { id: 'other', label: 'Other' },
];

export function RaiseDisputeDialog({ isOpen, onClose, onSubmit }: RaiseDisputeDialogProps) {
  const [selectedReason, setSelectedReason] = useState(REASONS[0].id);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-black/5 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <header className="flex items-center justify-between p-6 pb-4 border-b border-black/5">
          <h2 className="text-xl font-medium tracking-tight text-black">Raise dispute</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-black/60 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-[11px] uppercase tracking-widest font-bold text-black/40">Reason</label>
            <div className="flex flex-col gap-2">
              {REASONS.map((reason) => (
                <label 
                  key={reason.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedReason === reason.id 
                      ? 'border-black bg-[#F8F8F7]' 
                      : 'border-black/10 hover:bg-black/5'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedReason === reason.id ? 'border-black' : 'border-black/20'
                  }`}>
                    {selectedReason === reason.id && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                  <span className="text-sm font-medium text-black">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] uppercase tracking-widest font-bold text-black/40">Additional comments</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Explain the issue..."
              className="w-full h-24 p-3 text-sm rounded-xl border border-black/10 bg-[#F8F8F7] outline-none focus:border-black focus:bg-white transition-colors resize-none placeholder:text-black/40"
            />
          </div>
        </div>

        <footer className="p-6 border-t border-black/5 bg-[#F8F8F7] flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight text-black/60 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onSubmit(selectedReason, comment);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight bg-black text-white hover:bg-black/90 transition-colors shadow-sm cursor-pointer"
          >
            Submit Dispute
          </button>
        </footer>
      </div>
    </div>
  );
}
