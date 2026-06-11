import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import SettledGroupView from './SettledGroupView';
import ActiveGroupView from './ActiveGroupView';
import { getGroup } from '../lib/api';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function GroupView({ currentUser }: { currentUser: any }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadGroup = async () => {
    if (!id) return;
    try {
      const data = await getGroup(id);
      if (!data) {
        navigate('/');
        return;
      }
      setGroup(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'groups', id), () => {
      loadGroup();
    });
    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return <div className="w-full h-full flex items-center justify-center"><LoaderCircle className="animate-spin text-teal-600" /></div>;
  }

  if (!group) return null;

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Mobile Top Navigation */}
      <nav className="md:hidden flex items-center justify-between px-6 py-5 bg-white border-b border-black/5 shrink-0 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-black/60 hover:text-black cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span className="font-bold tracking-tight text-sm">{group.name}</span>
        <div className="w-8"></div>
      </nav>

      {group.status === 'closed' ? (
        <SettledGroupView group={group} currentUser={currentUser} onReload={loadGroup} />
      ) : (
        <ActiveGroupView group={group} currentUser={currentUser} onReload={loadGroup} />
      )}
    </div>
  );
}
