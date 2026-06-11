import { db } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, where, writeBatch } from 'firebase/firestore';

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export async function createGroup(data: any) {
  const groupRef = doc(collection(db, 'groups'));
  const groupId = groupRef.id;

  await setDoc(groupRef, {
    ...data,
    id: groupId,
    created_at: Date.now()
  });

  return { id: groupId, ...data };
}

export async function getGroup(groupId: string) {
  const gRef = doc(db, 'groups', groupId);
  const snap = await getDoc(gRef);
  if (!snap.exists()) return null;
  const groupData = snap.data();

  // Get members
  // We saved memberIds on group as array, but also need member objects with 'user'
  const members = groupData.members || [];

  // Get expenses
  const expSnap = await getDocs(collection(db, 'groups', groupId, 'expenses'));
  const expenses: any[] = [];
  expSnap.forEach(d => expenses.push(d.data()));
  expenses.sort((a, b) => b.created_at - a.created_at);

  // Get settlements
  const setSnap = await getDocs(collection(db, 'groups', groupId, 'settlements'));
  const settlements: any[] = [];
  setSnap.forEach(d => settlements.push(d.data()));

  return {
    ...groupData,
    id: snap.id,
    members,
    expenses,
    settlements
  };
}

export async function addExpense(groupId: string, data: any) {
  const expRef = doc(collection(db, 'groups', groupId, 'expenses'));
  const expenseId = expRef.id;
  const expense = {
    ...data,
    id: expenseId,
    created_at: Date.now()
  };
  await setDoc(expRef, expense);
  return expense;
}

export async function closeGroup(groupId: string) {
  const group = await getGroup(groupId);
  if (!group || group.status !== 'active') throw new Error("Group already closed");

  const batch = writeBatch(db);

  const groupRef = doc(db, 'groups', groupId);
  batch.update(groupRef, { status: 'closed' });

  // Calculate Net Balances
  let balances: Record<string, number> = {};
  group.members.forEach((m: any) => {
    balances[m.user_id] = 0;
  });

  group.expenses.forEach((ex: any) => {
    if (balances[ex.paid_by] !== undefined) balances[ex.paid_by] += ex.amount;
    else balances[ex.paid_by] = ex.amount;

    ex.participants.forEach((p: any) => {
      if (balances[p.user_id] !== undefined) balances[p.user_id] -= p.share_value;
      else balances[p.user_id] = -p.share_value;
    });
  });

  const settlementRef = doc(collection(db, 'groups', groupId, 'settlements'));
  
  const settlementMembers = Object.entries(balances).map(([userId, netAmount]) => {
     let direction = 'settled';
     if (netAmount < -0.01) direction = 'owes_leader';
     if (netAmount > 0.01) direction = 'owed_by_leader';

     return {
       id: generateId(),
       user_id: userId,
       user: group.members.find((m: any) => m.user_id === userId)?.user || { id: userId, name: "Unknown" },
       net_amount: Math.abs(netAmount),
       direction,
       approval_status: 'pending'
     };
  });

  const settlement = {
    id: settlementRef.id,
    group_id: groupId,
    leader_id: group.leader_id,
    created_at: Date.now(),
    deadline: Date.now() + (group.settlement_delay || 24) * 3600 * 1000,
    members: settlementMembers
  };

  batch.set(settlementRef, settlement);

  await batch.commit();
  return settlement;
}

export async function updateSettlementMemberAction(groupId: string, settlementId: string, memberId: string, action: string, reason?: string) {
  const setRef = doc(db, 'groups', groupId, 'settlements', settlementId);
  const setSnap = await getDoc(setRef);
  if (!setSnap.exists()) throw new Error("Settlement not found");
  
  const settlement = setSnap.data();
  const updatedMembers = settlement.members.map((m: any) => {
     if (m.id === memberId) {
       return {
         ...m,
         approval_status: action === 'approve' ? 'approved' : 'disputed',
         responded_at: Date.now()
       };
     }
     return m;
  });

  await updateDoc(setRef, { members: updatedMembers });
}
