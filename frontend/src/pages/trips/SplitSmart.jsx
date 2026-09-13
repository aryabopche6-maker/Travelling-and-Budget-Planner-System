import React, { useState, useMemo } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeIndianRupee, Receipt, Plus, AlertCircle, Check, X,
  ArrowUpRight, ArrowDownLeft, Users, Wallet, Filter, Trash2,
  ChevronDown, IndianRupee
} from 'lucide-react';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';
import AnimatedNumber from '../../components/animations/AnimatedNumber';

// ─── helpers ────────────────────────────────────────────────────────────────
const SPLIT_TYPES = ['EQUAL', 'CUSTOM'];
const STATUS_COLORS = {
  ACCEPTED:  'bg-teal/10 text-teal border-teal/20',
  PENDING:   'bg-blue-500/10  text-blue-400 border-blue-400/20',
  DISPUTED:  'bg-golden/10 text-golden border-golden/30',
  SETTLED:   'bg-gray-500/10  text-gray-400 border-gray-400/20',
};

function seed(members) {
  return [
    {
      id: 'e1',
      title: 'Dinner at Seaside',
      amount: 4500,
      paidById: members[0]?.id || '1',
      paidByName: members[0]?.name || 'You',
      date: '2024-05-20',
      status: 'ACCEPTED',
      splitType: 'EQUAL',
      participants: members.map(m => m.id),
      disputeReason: '',
    },
    {
      id: 'e2',
      title: 'Taxi to Hotel',
      amount: 1200,
      paidById: members[1]?.id || members[0]?.id || '1',
      paidByName: members[1]?.name || members[0]?.name || 'You',
      date: '2024-05-21',
      status: 'PENDING',
      splitType: 'EQUAL',
      participants: members.map(m => m.id),
      disputeReason: '',
    },
    {
      id: 'e3',
      title: 'Scuba Diving Gear',
      amount: 8000,
      paidById: members[1]?.id || members[0]?.id || '1',
      paidByName: members[1]?.name || members[0]?.name || 'You',
      date: '2024-05-21',
      status: 'DISPUTED',
      splitType: 'CUSTOM',
      participants: members.slice(0, 2).map(m => m.id),
      disputeReason: 'I did not rent the gear, only John and Mike did.',
    },
  ];
}

// ─── compute per-person balances (what current user owes / is owed) ──────────
function computeBalances(expenses, currentUserId, members) {
  const net = {}; // net[personId] = amount currentUser owes them (positive) or they owe currentUser (negative)
  members.forEach(m => { if (m.id !== currentUserId) net[m.id] = 0; });

  expenses.filter(e => e.status !== 'SETTLED').forEach(exp => {
    const participantCount = exp.participants.length;
    if (participantCount === 0) return;
    const share = Math.round(exp.amount / participantCount);
    const iParticipate = exp.participants.includes(currentUserId);
    const theyPaid = exp.paidById !== currentUserId;

    if (iParticipate && theyPaid) {
      // I owe the payer
      if (net[exp.paidById] !== undefined) net[exp.paidById] += share;
    }
    if (!iParticipate && !theyPaid) {
      // I paid but they don't participate — irrelevant
    }
    if (!theyPaid) {
      // I paid — each participant (except me) owes me their share
      exp.participants.forEach(pid => {
        if (pid !== currentUserId && net[pid] !== undefined) net[pid] -= share;
      });
    }
  });

  let totalOwed = 0;  // sum I owe others
  let totalOwing = 0; // sum others owe me
  const details = [];

  Object.entries(net).forEach(([pid, amount]) => {
    const person = members.find(m => m.id === pid);
    if (!person) return;
    if (amount > 0) {
      totalOwed += amount;
      details.push({ id: pid, name: person.name, amount, direction: 'owe' });
    } else if (amount < 0) {
      totalOwing += Math.abs(amount);
      details.push({ id: pid, name: person.name, amount: Math.abs(amount), direction: 'owed' });
    }
  });

  return { totalOwed, totalOwing, details };
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────
function AddExpenseModal({ members, currentUser, onAdd, onClose }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    paidById: currentUser?.id || '',
    splitType: 'EQUAL',
    participants: members.map(m => m.id),
    date: new Date().toISOString().split('T')[0],
    disputeReason: '',
  });
  const [error, setError] = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const toggleParticipant = (id) => {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(id)
        ? f.participants.filter(p => p !== id)
        : [...f.participants, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Please enter a title.');
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return setError('Enter a valid amount.');
    if (form.participants.length === 0) return setError('Select at least one participant.');

    const payer = members.find(m => m.id === form.paidById);
    onAdd({
      id: `e${Date.now()}`,
      title: form.title.trim(),
      amount: Number(form.amount),
      paidById: form.paidById,
      paidByName: payer?.name || 'Unknown',
      date: form.date,
      status: 'PENDING',
      splitType: form.splitType,
      participants: form.participants,
      disputeReason: '',
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl border border-muted/30 w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-muted/30 bg-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center border border-success/20">
              <Plus className="w-5 h-5 text-success" />
            </div>
            <h2 className="text-xl font-bold text-charcoal">Add Expense</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-bg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Expense Title</label>
            <input
              type="text"
              placeholder="e.g. Hotel stay, Dinner…"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className="w-full px-4 py-3 border border-muted/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-charcoal placeholder:text-muted transition"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-muted/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-charcoal placeholder:text-muted transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full px-4 py-3 border border-muted/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-charcoal transition"
              />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Paid By</label>
            <div className="relative">
              <select
                value={form.paidById}
                onChange={e => set('paidById', e.target.value)}
                className="w-full px-4 py-3 border border-muted/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-charcoal appearance-none transition"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Split Type</label>
            <div className="flex gap-2">
              {SPLIT_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => set('splitType', type)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                    form.splitType === type
                      ? 'bg-teal text-white border-teal shadow-md shadow-teal/20'
                      : 'bg-white text-muted border-muted/30 hover:border-teal/40'
                  }`}
                >
                  {type === 'EQUAL' ? '⚖️ Equal' : '✏️ Custom'}
                </button>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-2">Split Among</label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => {
                const selected = form.participants.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleParticipant(m.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      selected
                        ? 'bg-teal text-white border-teal'
                        : 'bg-bg text-muted border-muted/30 hover:border-teal/40'
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
            {form.participants.length > 0 && form.amount && (
              <p className="text-xs text-muted mt-2">
                ₹{Math.round(Number(form.amount) / form.participants.length).toLocaleString()} per person
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 bg-success hover:bg-green-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add Expense
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Dispute Modal ────────────────────────────────────────────────────────────
function DisputeModal({ expense, onSubmit, onClose }) {
  const [reason, setReason] = useState('');
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl border border-muted/30 w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-golden/10 rounded-xl flex items-center justify-center border border-golden/20">
            <AlertCircle className="w-5 h-5 text-golden" />
          </div>
          <h2 className="text-xl font-bold text-charcoal">Raise Dispute</h2>
        </div>
        <p className="text-sm text-muted">Disputing: <span className="font-bold text-charcoal">{expense.title}</span></p>
        <textarea
          rows={4}
          placeholder="Explain why you're disputing this expense…"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="w-full px-4 py-3 border border-muted/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-golden text-charcoal placeholder:text-muted resize-none transition"
        />
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => { if (reason.trim()) { onSubmit(reason); onClose(); } }}
            className="flex-1 bg-golden hover:bg-yellow-600 text-white"
          >
            Submit Dispute
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Settle Up Modal ──────────────────────────────────────────────────────────
function SettleUpModal({ details, members, onSettle, onClose }) {
  const [selected, setSelected] = useState(details.filter(d => d.direction === 'owe').map(d => d.id));
  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const total = details.filter(d => selected.includes(d.id) && d.direction === 'owe').reduce((s, d) => s + d.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl border border-muted/30 w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center border border-teal/20">
            <Wallet className="w-5 h-5 text-teal" />
          </div>
          <h2 className="text-xl font-bold text-charcoal">Settle Up</h2>
        </div>
        <p className="text-sm text-muted">Select who you want to settle with:</p>
        <div className="space-y-3">
          {details.filter(d => d.direction === 'owe').map(d => (
            <button
              key={d.id}
              onClick={() => toggle(d.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                selected.includes(d.id)
                  ? 'border-teal bg-teal/5'
                  : 'border-muted/30 hover:border-teal/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selected.includes(d.id) ? 'bg-teal border-teal' : 'border-muted/30'
                }`}>
                  {selected.includes(d.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-semibold text-charcoal">{d.name}</span>
              </div>
              <span className="font-bold text-charcoal">₹{d.amount.toLocaleString()}</span>
            </button>
          ))}
        </div>
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-teal/5 rounded-xl border border-teal/20">
            <span className="text-sm font-semibold text-muted">Total to settle</span>
            <span className="font-bold text-teal text-lg">₹{total.toLocaleString()}</span>
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => { if (selected.length) { onSettle(selected); onClose(); } }}
            className="flex-1 bg-teal hover:bg-bright text-white"
            disabled={!selected.length}
          >
            Confirm Settlement
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const FILTER_TABS = ['ALL', 'PENDING', 'DISPUTED', 'SETTLED'];

export default function SplitSmart() {
  const { trip, isTripAdmin } = useTrip();
  const { user } = useAuth();

  const members = Array.isArray(trip?.members) ? trip.members : [];
  const currentUserId = user?.id || '1';

  const [expenses, setExpenses] = useState(() => seed(members));
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);

  // ── balance calculation ──────────────────────────────────────────────────
  const { totalOwed, totalOwing, details: balanceDetails } = useMemo(
    () => computeBalances(expenses, currentUserId, members),
    [expenses, currentUserId, members]
  );

  // ── filtered list ────────────────────────────────────────────────────────
  const filtered = expenses.filter(e => filter === 'ALL' || e.status === filter);

  // ── actions ──────────────────────────────────────────────────────────────
  const updateStatus = (id, status, extra = {}) =>
    setExpenses(es => es.map(e => e.id === id ? { ...e, status, ...extra } : e));

  const deleteExpense = (id) => setExpenses(es => es.filter(e => e.id !== id));

  const addExpense = (exp) => setExpenses(es => [exp, ...es]);

  const settleWithPeople = (personIds) => {
    // Mark as SETTLED all expenses where those people paid and I owe them
    setExpenses(es => es.map(e => {
      if (e.status === 'SETTLED') return e;
      if (personIds.includes(e.paidById) && e.participants.includes(currentUserId)) {
        return { ...e, status: 'SETTLED' };
      }
      return e;
    }));
  };

  if (!trip) return null;

  const currentUserName = members.find(m => m.id === currentUserId)?.name || 'You';

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* ── Header ── */}
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/10 text-success rounded-xl flex items-center justify-center shrink-0 border border-success/20 shadow-inner">
              <BadgeIndianRupee className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-charcoal">SplitSmart</h1>
              <p className="text-muted mt-1">Track shared expenses and settle up effortlessly.</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 shrink-0 bg-success hover:bg-green-600 shadow-lg shadow-green-900/30 text-white"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Balances Sidebar ── */}
        <div className="lg:col-span-1 space-y-4 h-max">
          <Reveal delay={0.1}>
            <Card glass className="p-6 border-muted/30 shadow-sm">
              <h3 className="font-bold text-lg mb-5 text-charcoal tracking-tight">Your Balances</h3>

              <div className="space-y-3 mb-6">
                {/* Owed to you */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative overflow-hidden flex justify-between items-center p-4 bg-teal/10 border border-teal/30 rounded-xl shadow-sm group cursor-pointer"
                >
                  <div className="absolute -right-4 -top-4 text-teal opacity-10 group-hover:scale-110 transition-transform">
                    <ArrowDownLeft className="w-20 h-20" />
                  </div>
                  <div className="relative z-10">
                    <span className="text-xs font-bold text-teal uppercase tracking-widest block mb-0.5">You are owed</span>
                    <span className="font-bold text-2xl text-charcoal tracking-tight">
                      ₹<AnimatedNumber value={totalOwing} delay={0.2} />
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-teal/20 flex items-center justify-center shrink-0 relative z-10">
                    <ArrowDownLeft className="w-4 h-4 text-teal" />
                  </div>
                </motion.div>

                {/* You owe */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative overflow-hidden flex justify-between items-center p-4 bg-golden/10 border border-golden/30 rounded-xl shadow-sm group cursor-pointer"
                >
                  <div className="absolute -right-4 -top-4 text-golden opacity-10 group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="w-20 h-20" />
                  </div>
                  <div className="relative z-10">
                    <span className="text-xs font-bold text-golden uppercase tracking-widest block mb-0.5">You owe</span>
                    <span className="font-bold text-2xl text-charcoal tracking-tight">
                      ₹<AnimatedNumber value={totalOwed} delay={0.3} />
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-golden/20 flex items-center justify-center shrink-0 relative z-10">
                    <ArrowUpRight className="w-4 h-4 text-golden" />
                  </div>
                </motion.div>
              </div>

              {/* Per-person breakdown */}
              {balanceDetails.length > 0 && (
                <div className="space-y-2 mb-5">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Breakdown</p>
                  {balanceDetails.map(d => (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          d.direction === 'owe' ? 'bg-golden/20 text-golden' : 'bg-teal/20 text-teal'
                        }`}>
                          {d.name.charAt(0)}
                        </div>
                        <span className="text-muted">{d.name}</span>
                      </div>
                      <span className={`font-semibold ${d.direction === 'owe' ? 'text-golden' : 'text-teal'}`}>
                        {d.direction === 'owe' ? '−' : '+'}₹{d.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => setShowSettleModal(true)}
                disabled={totalOwed === 0}
                className="w-full bg-teal hover:bg-teal-500 text-base shadow-lg shadow-teal/30 text-white disabled:opacity-50"
              >
                Settle Up Balances
              </Button>
            </Card>
          </Reveal>

          {/* Members */}
          <Reveal delay={0.15}>
            <Card glass className="p-5 border-muted/30 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted" />
                <h3 className="font-bold text-sm text-charcoal uppercase tracking-wider">Trip Members</h3>
              </div>
              <div className="space-y-2">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-bg border border-muted/30 flex items-center justify-center text-sm font-bold text-charcoal">
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal truncate">{m.name}</p>
                      <p className="text-xs text-muted">{m.role === 'TRIP_ADMIN' ? 'Admin' : 'Traveler'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ── Expense List ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Filter Tabs */}
          <Reveal delay={0.15}>
            <div className="flex items-center gap-1 p-1 bg-bg rounded-xl w-full overflow-x-auto">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${
                    filter === tab
                      ? 'bg-white text-charcoal shadow-sm border border-muted/30'
                      : 'text-muted hover:text-charcoal'
                  }`}
                >
                  {tab}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    filter === tab ? 'bg-teal/10 text-teal' : 'bg-muted/50 text-muted'
                  }`}>
                    {expenses.filter(e => tab === 'ALL' || e.status === tab).length}
                  </span>
                </button>
              ))}
            </div>
          </Reveal>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 text-muted"
                >
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-semibold">No {filter.toLowerCase()} expenses</p>
                  {filter === 'ALL' && (
                    <Button onClick={() => setShowAddModal(true)} className="mt-4 bg-success text-white hover:bg-green-600">
                      <Plus className="w-4 h-4 mr-1" /> Add First Expense
                    </Button>
                  )}
                </motion.div>
              )}

              {filtered.map((exp, index) => {
                const myShare = exp.participants.includes(currentUserId)
                  ? Math.round(exp.amount / exp.participants.length)
                  : 0;
                const iPaid = exp.paidById === currentUserId;
                const iParticipate = exp.participants.includes(currentUserId);
                const canApprove = exp.status === 'PENDING' && !iPaid && iParticipate;
                const canDispute = exp.status === 'PENDING' && !iPaid && iParticipate;

                return (
                  <motion.div
                    key={exp.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`p-0 overflow-hidden border-2 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                      exp.status === 'DISPUTED' ? 'border-golden/40' :
                      exp.status === 'PENDING'  ? 'border-blue-400/30' :
                      exp.status === 'SETTLED'  ? 'border-muted/30 opacity-70' :
                      'border-muted/30 bg-white shadow-sm'
                    }`}>
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="w-12 h-12 rounded-xl bg-bg border border-muted/30 flex items-center justify-center shrink-0 shadow-inner"
                          >
                            <Receipt className="w-5 h-5 text-muted" />
                          </motion.div>
                          <div>
                            <h4 className="font-bold text-lg text-charcoal leading-tight">{exp.title}</h4>
                            <p className="text-sm text-muted">
                              Paid by <span className="font-bold text-charcoal">{exp.paidByName}</span>
                              {' · '}{new Date(exp.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-xs font-medium text-muted mt-0.5 uppercase tracking-wider">
                              {exp.splitType} split · {exp.participants.length} people
                              {iParticipate && !iPaid && <span className="ml-2 text-golden">· Your share: ₹{myShare.toLocaleString()}</span>}
                              {iPaid && <span className="ml-2 text-teal">· You paid</span>}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                          <span className="font-bold text-2xl text-charcoal tracking-tight">₹{exp.amount.toLocaleString()}</span>
                          <div className="flex items-center gap-2">
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`text-xs px-2.5 py-1 rounded-md font-bold tracking-wider uppercase border ${STATUS_COLORS[exp.status] || ''}`}
                            >
                              {exp.status}
                            </motion.span>
                            {isTripAdmin && exp.status !== 'SETTLED' && (
                              <button
                                onClick={() => deleteExpense(exp.id)}
                                className="w-7 h-7 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors"
                                title="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Disputed section */}
                      {exp.status === 'DISPUTED' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-golden/5 px-5 py-4 border-t border-golden/20"
                        >
                          <div className="flex items-start gap-3 bg-golden/10 p-4 rounded-xl border border-golden/30">
                            <AlertCircle className="w-5 h-5 text-golden shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-golden mb-1 uppercase tracking-wider">Dispute Active</p>
                              <p className="text-sm text-yellow-700/90 leading-relaxed font-medium">{exp.disputeReason}</p>
                            </div>
                          </div>
                          {isTripAdmin && (
                            <div className="mt-4 flex gap-3 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => updateStatus(exp.id, 'PENDING')}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4 mr-1" /> Reject Dispute
                              </Button>
                              <Button
                                onClick={() => updateStatus(exp.id, 'ACCEPTED')}
                                className="bg-teal hover:bg-bright shadow-md"
                              >
                                <Check className="w-4 h-4 mr-1" /> Force Accept
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Pending actions */}
                      {exp.status === 'PENDING' && (canApprove || canDispute) && (
                        <div className="bg-bg/50 px-5 py-4 border-t border-muted/30 flex gap-3 justify-end">
                          {canDispute && (
                            <Button
                              variant="ghost"
                              onClick={() => setDisputeTarget(exp)}
                              className="text-yellow-600 hover:text-golden hover:bg-golden/10"
                            >
                              Dispute
                            </Button>
                          )}
                          {canApprove && (
                            <Button
                              onClick={() => updateStatus(exp.id, 'ACCEPTED')}
                              className="bg-success hover:bg-green-600 shadow-md text-white"
                            >
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAddModal && (
          <AddExpenseModal
            members={members}
            currentUser={{ id: currentUserId, name: currentUserName }}
            onAdd={addExpense}
            onClose={() => setShowAddModal(false)}
          />
        )}
        {disputeTarget && (
          <DisputeModal
            expense={disputeTarget}
            onSubmit={(reason) => updateStatus(disputeTarget.id, 'DISPUTED', { disputeReason: reason })}
            onClose={() => setDisputeTarget(null)}
          />
        )}
        {showSettleModal && (
          <SettleUpModal
            details={balanceDetails}
            members={members}
            onSettle={settleWithPeople}
            onClose={() => setShowSettleModal(false)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
