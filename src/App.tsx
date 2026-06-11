import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import DashboardView from './views/DashboardView';
import GroupView from './views/GroupView';
import Navigation from './components/Navigation';
import { auth, db, googleProvider } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Save user to firestore
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          const userData: any = {
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            profile_image: user.photoURL,
          };
          
          if (!userDoc.exists()) {
            userData.created_at = Date.now();
            await setDoc(userRef, userData, { merge: true });
          }
          setCurrentUser(userData);
        } catch (error) {
          console.error("Error setting up user profile:", error);
          setCurrentUser({
            id: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            profile_image: user.photoURL,
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
     return <div className="w-full h-full flex items-center justify-center bg-[#F8F8F7]"><LoaderCircle className="animate-spin text-teal-600" size={32} /></div>;
  }

  if (!currentUser) {
     return (
       <div className="w-full h-full flex items-center justify-center bg-[#F8F8F7] flex-col gap-6">
         <div className="flex items-center gap-3">
           <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">S</div>
           <span className="text-2xl font-bold tracking-tight">Serene</span>
         </div>
         <button onClick={handleLogin} className="bg-black text-white px-6 py-3 rounded-xl font-bold tracking-tight shadow-lg hover:bg-black/80 transition-colors">
            Continue with Google
         </button>
       </div>
     );
  }

  return (
    <HashRouter>
      <div className="w-full h-full bg-[#F8F8F7] text-[#1A1A1A] flex flex-col font-sans overflow-hidden">
        <Navigation currentUser={currentUser} />
        
        <main className="flex-1 overflow-y-auto pb-[180px] md:pb-0 md:overflow-hidden md:flex md:flex-col relative">
          <Routes>
            <Route path="/" element={<DashboardView currentUser={currentUser} />} />
            <Route path="/groups" element={<DashboardView currentUser={currentUser} />} />
            <Route path="/activity" element={<div className="flex items-center justify-center h-full text-black/40 font-medium">Activity feature coming soon.</div>} />
            <Route path="/profile" element={
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden">
                  {currentUser.profile_image ? (
                    <img src={currentUser.profile_image} referrerPolicy="no-referrer" alt="Profile" className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <h2 className="text-xl font-bold">{currentUser.name}</h2>
                <div className="text-black/50">{currentUser.email}</div>
                <button 
                  onClick={() => auth.signOut()}
                  className="mt-6 px-6 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            } />
            <Route path="/group/:id" element={<GroupView currentUser={currentUser} />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
