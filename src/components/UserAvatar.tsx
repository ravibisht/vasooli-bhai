import React from 'react';

export default function UserAvatar({ 
  user, 
  className = "w-8 h-8 text-xs", 
  isCurrentUser = false,
  showYou = false
}: { 
  user: { name?: string, avatarUrl?: string }, 
  className?: string, 
  isCurrentUser?: boolean,
  showYou?: boolean
}) {
  if (!user || !user.name) {
    return <div className={`rounded-full bg-slate-200 shrink-0 ${className}`} />;
  }

  const initials = user.name.split(' ').map((n: string) => n?.[0] || '').join('').substring(0, 2).toUpperCase();
  
  if (user.avatarUrl) {
    return (
      <img src={user.avatarUrl} alt={user.name} className={`rounded-full object-cover shrink-0 ${className}`} />
    );
  }
  
  if (isCurrentUser) {
    return (
      <div className={`rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shadow-inner shrink-0 ${className}`}>
        {showYou ? 'YOU' : initials}
      </div>
    );
  }

  return (
    <div className={`rounded-full bg-slate-200 flex items-center justify-center font-bold text-black/60 shrink-0 ${className}`}>
      {initials}
    </div>
  );
}
