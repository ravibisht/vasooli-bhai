import React from 'react';
import { Home, Users, Activity, User, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';

export default function Navigation({ currentUser }: { currentUser: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Desktop Top Navigation Bar (Hidden on Mobile) */}
      <nav className="hidden md:flex items-center justify-between px-10 py-6 border-b border-black/5 bg-white shrink-0">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-teal-700 cursor-pointer" onClick={() => navigate('/')}>SettleUp</span>
          <div className="flex items-center gap-6 text-sm font-medium text-black/50">
            <span className={`cursor-pointer hover:text-black/80 ${location.pathname === '/' ? 'text-black' : ''}`} onClick={() => navigate('/')}>Dashboard</span>
            <span className="cursor-pointer hover:text-black/80">Groups</span>
            <span className="cursor-pointer hover:text-black/80">Activity</span>
            <span className="cursor-pointer hover:text-black/80">Profile</span>
          </div>
        </div>
        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
          <UserAvatar user={currentUser} isCurrentUser={true} className="w-8 h-8 text-xs bg-teal-100 border border-teal-200 text-teal-700" />
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 pb-[env(safe-area-inset-bottom)] pt-2 px-6 h-[72px] flex items-center justify-between z-[100]">
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${location.pathname === '/' ? 'text-teal-700' : 'text-black/40 hover:text-black'}`}
        >
          <Home size={22} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => navigate('/groups')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${location.pathname === '/groups' ? 'text-teal-700' : 'text-black/40 hover:text-black'}`}
        >
          <Users size={22} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Groups</span>
        </button>
        <div className="relative -top-6">
           <button 
             onClick={() => window.dispatchEvent(new CustomEvent('open-new-group'))}
             className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg border-[3px] border-white active:scale-95 transition-transform cursor-pointer">
             <Plus size={24} strokeWidth={3} />
           </button>
        </div>
        <button 
          onClick={() => navigate('/activity')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${location.pathname === '/activity' ? 'text-teal-700' : 'text-black/40 hover:text-black'}`}
        >
          <Activity size={22} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Activity</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-12 ${location.pathname === '/profile' ? 'text-teal-700' : 'text-black/40 hover:text-black'}`}
        >
          <User size={22} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </>
  );
}
