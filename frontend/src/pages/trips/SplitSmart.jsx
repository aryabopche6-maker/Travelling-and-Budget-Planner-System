import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeIndianRupee, Receipt, Plus, AlertCircle, Check, X,
  ArrowUpRight, ArrowDownLeft, Users, Wallet, Filter, Trash2,
  ChevronDown, IndianRupee, Upload, FileImage, Eye, Loader2,
  History, Bell, BarChart3, Download, PieChart as PieChartIcon,
  Sparkles, CheckCircle2, XCircle, Search, TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';
import AnimatedNumber from '../../components/animations/AnimatedNumber';
import { expenseService } from '../../services/expenseService';

// ─── helpers & theme palette ────────────────────────────────────────────────
const STATUS_COLORS = {
  ACCEPTED:  'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-emerald-500/10',
  PENDING:   'bg-sky-50 text-sky-700 border-sky-200/80 shadow-sky-500/10',
  DISPUTED:  'bg-amber-50 text-amber-700 border-amber-200/80 shadow-amber-500/10',
  SETTLED:   'bg-slate-100 text-slate-600 border-slate-200/80 shadow-slate-500/10',
};

const CATEGORY_THEME = {
  Food: {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200/80',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100/80 text-emerald-600',
    glow: 'from-emerald-50/40 to-teal-50/20',
    emoji: '🍽️'
  },
  Transport: {
    bg: 'bg-sky-50/80',
    border: 'border-sky-200/80',
    text: 'text-sky-700',
    iconBg: 'bg-sky-100/80 text-sky-600',
    glow: 'from-sky-50/40 to-blue-50/20',
    emoji: '🚕'
  },
  Stay: {
    bg: 'bg-indigo-50/80',
    border: 'border-indigo-200/80',
    text: 'text-indigo-700',
    iconBg: 'bg-indigo-100/80 text-indigo-600',
    glow: 'from-indigo-50/40 to-violet-50/20',
    emoji: '🏨'
  },
  Activities: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200/80',
    text: 'text-amber-800',
    iconBg: 'bg-amber-100/80 text-amber-700',
    glow: 'from-amber-50/40 to-orange-50/20',
    emoji: '🏄'
  },
  Shopping: {
    bg: 'bg-rose-50/80',
    border: 'border-rose-200/80',
    text: 'text-rose-700',
    iconBg: 'bg-rose-100/80 text-rose-600',
    glow: 'from-rose-50/40 to-pink-50/20',
    emoji: '🛍️'
  },
  Misc: {
    bg: 'bg-teal-50/80',
    border: 'border-teal-200/80',
    text: 'text-teal-700',
    iconBg: 'bg-teal-100/80 text-teal-600',
    glow: 'from-teal-50/40 to-cyan-50/20',
    emoji: '✨'
  }
};

// ─── Smart Settle Up: Min Cash Flow Algorithm ────────────────────────────────
function computeMinTransactions(expenses, members) {
  // 1. Calculate overall net balance for each member across unsettled expenses
  const netBalances = {};
  members.forEach(m => { netBalances[String(m.id || m.userId)] = 0; });

  expenses.filter(e => e.status !== 'SETTLED').forEach(exp => {
    const payerId = String(exp.paidById);
    const amount = Number(exp.amount) || 0;
    if (netBalances[payerId] === undefined) netBalances[payerId] = 0;

    // Handle custom splits if present, else equal split across participants
    if (exp.splits && exp.splits.length > 0) {
      exp.splits.forEach(s => {
        const uid = String(s.userId || s.id);
        const sAmount = Number(s.amount) || 0;
        if (netBalances[uid] === undefined) netBalances[uid] = 0;
        netBalances[uid] -= sAmount;
        netBalances[payerId] += sAmount;
      });
    } else {
      const parts = exp.participants || [];
      if (parts.length > 0) {
        const share = Math.round(amount / parts.length);
        parts.forEach(pid => {
          const sPid = String(pid);
          if (netBalances[sPid] === undefined) netBalances[sPid] = 0;
          netBalances[sPid] -= share;
          netBalances[payerId] += share;
        });
      }
    }
  });

  // 2. Separate into debtors (negative) and creditors (positive)
  const debtors = [];
  const creditors = [];

  Object.entries(netBalances).forEach(([userId, bal]) => {
    const rounded = Math.round(bal);
    const person = members.find(m => String(m.id || m.userId) === userId);
    const name = person?.name || 'Member';
    if (rounded < -0.01) {
      debtors.push({ userId, name, amount: Math.abs(rounded) });
    } else if (rounded > 0.01) {
      creditors.push({ userId, name, amount: rounded });
    }
  });

  // 3. Min-Cash-Flow Greedy Matching
  const settlements = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settledAmount = Math.min(debtor.amount, creditor.amount);

    if (settledAmount > 0) {
      settlements.push({
        fromId: debtor.userId,
        fromName: debtor.name,
        toId: creditor.userId,
        toName: creditor.name,
        amount: Math.round(settledAmount),
      });
    }

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return settlements;
}

// ─── compute per-person balances (what current user owes / is owed) ──────────
function computeBalances(expenses, currentUserId, members) {
  const sCurrentUserId = String(currentUserId);
  const net = {}; // net[personId] = amount currentUser owes them (>0) or they owe currentUser (<0)
  members.forEach(m => {
    const mId = String(m.id || m.userId);
    if (mId !== sCurrentUserId) net[mId] = 0;
  });

  expenses.filter(e => e.status !== 'SETTLED').forEach(exp => {
    const payerId = String(exp.paidById);
    const amount = Number(exp.amount) || 0;
    const iPaid = payerId === sCurrentUserId;

    // Check if custom splits exist
    if (exp.splits && exp.splits.length > 0) {
      exp.splits.forEach(s => {
        const splitUserId = String(s.userId || s.id);
        const splitAmount = Number(s.amount) || 0;

        if (splitUserId === sCurrentUserId && !iPaid) {
          // I owe the payer
          if (net[payerId] !== undefined) net[payerId] += splitAmount;
        } else if (iPaid && splitUserId !== sCurrentUserId) {
          // Participant owes me
          if (net[splitUserId] !== undefined) net[splitUserId] -= splitAmount;
        }
      });
    } else {
      const parts = exp.participants || [];
      if (parts.length === 0) return;
      const share = Math.round(amount / parts.length);
      const iParticipate = parts.some(p => String(p) === sCurrentUserId);

      if (iParticipate && !iPaid) {
        if (net[payerId] !== undefined) net[payerId] += share;
      } else if (iPaid) {
        parts.forEach(pid => {
          const sPid = String(pid);
          if (sPid !== sCurrentUserId && net[sPid] !== undefined) {
            net[sPid] -= share;
          }
        });
      }
    }
  });

  let totalOwed = 0;  // sum I owe others
  let totalOwing = 0; // sum others owe me
  const details = [];

  Object.entries(net).forEach(([pid, amount]) => {
    const person = members.find(m => String(m.id || m.userId) === pid);
    if (!person) return;
    const rounded = Math.round(amount);
    if (rounded > 0) {
      totalOwed += rounded;
      details.push({ id: pid, name: person.name, amount: rounded, direction: 'owe' });
    } else if (rounded < 0) {
      totalOwing += Math.abs(rounded);
      details.push({ id: pid, name: person.name, amount: Math.abs(rounded), direction: 'owed' });
    }
  });

  return { totalOwed, totalOwing, details };
}

// ─── Add Expense Modal ────────────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 5;

const CATEGORIES = ['Food', 'Transport', 'Stay', 'Activities', 'Shopping', 'Misc'];

function AddExpenseModal({ members, currentUser, tripId, onAdd, onClose }) {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    paidById: currentUser?.id == null ? '' : String(currentUser.id),
    splitType: 'EQUAL',
    participants: members.map(m => String(m.id)),
    customSplits: {}, // { [memberId]: amount or percentage }
    date: new Date().toISOString().split('T')[0],
    disputeReason: '',
  });
  const [error, setError] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedProofIdentifier, setUploadedProofIdentifier] = useState(null);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleUpload = async () => {
    if (!proofFile) return;
    try {
      setIsUploading(true);
      setError('');
      const identifier = await expenseService.uploadProof(tripId, proofFile);
      setUploadedProofIdentifier(identifier);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleParticipant = (id) => {
    setForm(f => ({
      ...f,
      participants: f.participants.includes(id)
        ? f.participants.filter(p => p !== id)
        : [...f.participants, id],
    }));
  };

  const handleCustomSplitChange = (memberId, val) => {
    setForm(f => ({
      ...f,
      customSplits: {
        ...f.customSplits,
        [memberId]: val
      }
    }));
  };

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only image files (JPG, PNG, GIF, WEBP) or PDF are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    setError('');
    setProofFile(file);
    if (file.type.startsWith('image/')) {
      setProofPreviewUrl(URL.createObjectURL(file));
    } else {
      setProofPreviewUrl(null);
    }
    setUploadedProofIdentifier(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Please enter a title.');
    const totalAmount = Number(form.amount);
    if (!form.amount || isNaN(totalAmount) || totalAmount <= 0) return setError('Enter a valid amount.');
    if (form.participants.length === 0) return setError('Select at least one participant.');

    // The API accepts only EQUAL and CUSTOM. Convert the UI's custom methods
    // to exact cent amounts so server-side reconciliation succeeds.
    let splits = [];
    if (form.splitType === 'EQUAL' || form.splitType === 'SELECTED') {
      const totalCents = Math.round(totalAmount * 100);
      const shareCents = Math.floor(totalCents / form.participants.length);
      let allocatedCents = 0;
      splits = form.participants.map((pid, index) => {
        const m = members.find(x => x.id === pid);
        const cents = index === form.participants.length - 1
          ? totalCents - allocatedCents
          : shareCents;
        allocatedCents += cents;
        return { userId: pid, userName: m?.name || 'Member', amount: cents / 100 };
      });
    } else if (form.splitType === 'EXACT') {
      if (form.participants.some((pid) => {
        const share = Number(form.customSplits[pid]);
        return !Number.isFinite(share) || share < 0;
      })) {
        return setError('Custom split amounts must be non-negative numbers.');
      }
      let sumCents = 0;
      splits = form.participants.map(pid => {
        const m = members.find(x => x.id === pid);
        const share = Number(form.customSplits[pid]);
        const cents = Math.round(share * 100);
        sumCents += cents;
        return { userId: pid, userName: m?.name || 'Member', amount: cents / 100 };
      });
      if (sumCents !== Math.round(totalAmount * 100)) {
        return setError('Exact split amounts must add up to the expense amount to the nearest paise.');
      }
    } else if (form.splitType === 'PERCENTAGE') {
      if (form.participants.some((pid) => {
        const percentage = Number(form.customSplits[pid]);
        return !Number.isFinite(percentage) || percentage < 0;
      })) {
        return setError('Percentages must be non-negative numbers.');
      }
      let pctSum = 0;
      let allocatedCents = 0;
      splits = form.participants.map((pid, index) => {
        const m = members.find(x => x.id === pid);
        const pct = Number(form.customSplits[pid]);
        pctSum += pct;
        const totalCents = Math.round(totalAmount * 100);
        const cents = index === form.participants.length - 1
          ? totalCents - allocatedCents
          : Math.floor((totalCents * pct) / 100);
        allocatedCents += cents;
        return { userId: pid, userName: m?.name || 'Member', amount: cents / 100 };
      });
      if (Math.abs(pctSum - 100) > 0.01) {
        return setError(`Percentages must add up to 100% (currently ${pctSum}%).`);
      }
    }

    let proofIdentifier = uploadedProofIdentifier;
    if (proofFile && !proofIdentifier) {
      try {
        setIsUploading(true);
        setError('');
        proofIdentifier = await expenseService.uploadProof(tripId, proofFile);
        setUploadedProofIdentifier(proofIdentifier);
      } catch (err) {
        setError(err.response?.data?.message || 'Upload failed. Please try again.');
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const payer = members.find(m => String(m.id) === String(form.paidById));
    try {
      await onAdd({
      id: `e${Date.now()}`,
      title: form.title.trim(),
      amount: totalAmount,
      category: form.category || 'Food',
      paidById: form.paidById,
      paidByName: payer?.name || 'Unknown',
      date: form.date,
      status: 'PENDING',
      splitType: form.splitType,
      participants: form.participants,
      splits: splits,
      disputeReason: '',
      proofUrl: proofIdentifier || null,
      history: [
        { action: 'CREATED', actorName: currentUser?.name || 'You', timestamp: new Date().toISOString() }
      ]
      });
      onClose();
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Could not save the expense. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal/60 backdrop-blur-md overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', stiffness: 320, damping: 25 }}
        className="bg-white rounded-3xl shadow-2xl border border-teal-100 w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header with Fresh Teal-Mint Gradient & Step Indicator */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-teal-100/80 bg-gradient-to-r from-teal-50/90 via-emerald-50/50 to-sky-50/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ rotate: 90, scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-11 h-11 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-teal-500/20"
            >
              <Plus className="w-5 h-5 stroke-[2.8]" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-charcoal tracking-tight">Add Trip Expense</h2>
                <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-teal-100/90 text-teal-800 border border-teal-200 shadow-2xs">
                  SplitSmart
                </span>
              </div>
              <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                <span>Record payment</span>
                <span className="w-1 h-1 rounded-full bg-muted/60" />
                <span>Distribute balances</span>
                <span className="w-1 h-1 rounded-full bg-muted/60" />
                <span>Attach receipt</span>
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-teal-100 hover:border-teal-300 flex items-center justify-center transition-all text-muted hover:text-charcoal shadow-2xs"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Scrollable Landscape Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/30">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex items-center gap-2.5 p-3.5 bg-red-50/90 border border-red-200/90 rounded-2xl text-red-700 text-sm font-semibold shadow-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Landscape 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ── Left Column: Expense Essentials (7 Cols) ── */}
            <div className="lg:col-span-7 space-y-4">
              {/* Section 1: Details Card */}
              <div className="p-4.5 rounded-3xl bg-white border border-slate-200/70 shadow-xs hover:border-teal-200/80 transition-all space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-xs font-black text-charcoal uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-teal-100 text-teal-800 text-[11px] font-black flex items-center justify-center">1</span>
                    Expense Details
                  </span>
                  <span className="text-[11px] text-muted font-medium">Basic information</span>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Title <span className="text-teal">*</span></span>
                    <span className="text-[10px] text-muted font-normal">What was purchased?</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Seaside Dinner, Cab to Hotel, Museum Pass…"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/40 hover:bg-white focus:bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 text-charcoal placeholder:text-muted/70 transition text-sm font-semibold shadow-2xs"
                  />
                </div>

                {/* Category Pills Selector */}
                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Category</span>
                    <span className="text-[10px] text-muted font-normal">Select tag</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {CATEGORIES.map(cat => {
                      const theme = CATEGORY_THEME[cat] || CATEGORY_THEME.Misc;
                      const isSelected = form.category === cat;
                      return (
                        <motion.button
                          key={cat}
                          type="button"
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => set('category', cat)}
                          className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                            isSelected
                              ? `${theme.bg} ${theme.text} ${theme.border} ring-2 ring-current font-black shadow-2xs`
                              : 'bg-slate-50/60 text-muted border-slate-200/70 hover:bg-white hover:text-charcoal'
                          }`}
                        >
                          <span className="text-base">{theme.emoji}</span>
                          <span className="text-[11px] truncate w-full text-center">{cat}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount with Quick Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
                      <span>Total Amount (₹) <span className="text-teal">*</span></span>
                    </label>
                    {/* Quick amount chips */}
                    <div className="flex items-center gap-1">
                      {[250, 500, 1000, 2500].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => set('amount', String(amt))}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60 transition"
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                      ₹
                    </div>
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={form.amount}
                      onChange={e => set('amount', e.target.value)}
                      className="w-full pl-13 pr-4 py-2.5 border border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-white hover:bg-white focus:bg-white rounded-2xl focus:border-teal focus:ring-2 focus:ring-teal/20 text-charcoal font-black text-xl transition shadow-2xs"
                    />
                  </div>
                </div>

                {/* Date & Payer side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Date</span>
                      <span className="text-[10px] text-muted font-normal">When</span>
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => set('date', e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/40 hover:bg-white focus:border-teal focus:ring-2 focus:ring-teal/20 text-charcoal transition text-xs font-bold shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Who Paid?</span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">Payer</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black shadow-2xs">
                        {members.find(m => m.id === form.paidById)?.name?.charAt(0) || '👤'}
                      </div>
                      <select
                        value={form.paidById}
                        onChange={e => set('paidById', e.target.value)}
                        className="w-full pl-11 pr-8 py-2.5 border border-amber-200/80 rounded-xl bg-gradient-to-r from-amber-50/30 to-white hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-charcoal appearance-none transition text-xs font-bold shadow-2xs"
                      >
                        {members.map(m => (
                          <option key={m.id} value={m.id} className="bg-white">
                            {m.name} {m.id === currentUser?.id ? '(You)' : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Split Type Selector */}
              <div className="p-4.5 rounded-3xl bg-white border border-slate-200/70 shadow-xs hover:border-teal-200/80 transition-all space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black text-charcoal uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-800 text-[11px] font-black flex items-center justify-center">2</span>
                    Split Method
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                    {form.splitType}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'EQUAL', label: 'Equal', icon: '⚖️', desc: '1 / N split', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-500/30' },
                    { id: 'EXACT', label: 'Exact ₹', icon: '🔢', desc: 'Custom ₹', bg: 'bg-sky-50 text-sky-800 border-sky-300 ring-sky-500/30' },
                    { id: 'PERCENTAGE', label: 'Percent %', icon: '📊', desc: 'Custom %', bg: 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-indigo-500/30' },
                    { id: 'SELECTED', label: 'Selected', icon: '👥', desc: 'Subset split', bg: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-500/30' },
                  ].map(item => {
                    const isActive = form.splitType === item.id;
                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        whileHover={{ scale: 1.04, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => set('splitType', item.id)}
                        className={`p-2.5 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                          isActive
                            ? `${item.bg} shadow-sm ring-2 font-black`
                            : 'bg-slate-50/60 text-muted border-slate-200/70 hover:border-teal/40 hover:text-charcoal hover:bg-white'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="leading-tight">{item.label}</span>
                        <span className={`text-[10px] font-normal ${isActive ? 'opacity-85' : 'text-muted'}`}>{item.desc}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Right Column: Members Breakdown & Proof Dropzone (5 Cols) ── */}
            <div className="lg:col-span-5 space-y-4">
              {/* Section 3: Participants & Dynamic Share Card */}
              <div className="p-4.5 rounded-3xl bg-gradient-to-br from-teal-50/40 via-sky-50/30 to-indigo-50/20 border border-teal-100 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-teal-100/80 pb-2">
                  <span className="text-xs font-black text-charcoal uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-teal-600 text-white text-[11px] font-black flex items-center justify-center shadow-2xs">3</span>
                    Participants & Shares
                  </span>
                  <button
                    type="button"
                    onClick={() => set('participants', members.map(m => m.id))}
                    className="text-xs text-teal hover:text-teal-700 font-bold hover:underline"
                  >
                    Select All ({members.length})
                  </button>
                </div>

                {/* Member selection chips */}
                <div className="grid grid-cols-2 gap-2">
                  {members.map((m, idx) => {
                    const selected = form.participants.includes(m.id);
                    const pastelStyles = [
                      'from-teal-100 to-emerald-100 text-teal-900 border-teal-300 ring-teal-400/40',
                      'from-sky-100 to-blue-100 text-sky-900 border-sky-300 ring-sky-400/40',
                      'from-indigo-100 to-purple-100 text-indigo-900 border-indigo-300 ring-indigo-400/40',
                      'from-amber-100 to-yellow-100 text-amber-900 border-amber-300 ring-amber-400/40',
                      'from-rose-100 to-pink-100 text-rose-900 border-rose-300 ring-rose-400/40',
                    ][idx % 5];

                    return (
                      <motion.button
                        key={m.id}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleParticipant(m.id)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between gap-1.5 shadow-2xs ${
                          selected
                            ? `bg-gradient-to-r ${pastelStyles} shadow-xs ring-2 font-black`
                            : 'bg-white/80 text-muted border-slate-200/80 hover:border-teal/40 hover:bg-white hover:text-charcoal'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            selected ? 'bg-white/90 text-charcoal shadow-2xs' : 'bg-muted/20 text-muted'
                          }`}>
                            {m.name.charAt(0)}
                          </div>
                          <span className="truncate">{m.name}</span>
                        </div>
                        {selected ? (
                          <div className="w-4 h-4 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Per person share preview badge */}
                {(form.splitType === 'EQUAL' || form.splitType === 'SELECTED') && form.participants.length > 0 && form.amount && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 rounded-2xl bg-gradient-to-r from-emerald-100/80 via-teal-100/70 to-emerald-50 border border-emerald-300 flex items-center justify-between text-xs text-emerald-900 font-bold shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <span>Equal Share ({form.participants.length} people):</span>
                    </span>
                    <span className="text-sm font-black text-emerald-900 bg-white/90 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                      ₹{Math.round(Number(form.amount) / form.participants.length).toLocaleString()}
                    </span>
                  </motion.div>
                )}

                {/* If EXACT split: show custom amount inputs */}
                {form.splitType === 'EXACT' && (
                  <div className="space-y-2 p-3 bg-white/95 rounded-2xl border border-sky-200 max-h-40 overflow-y-auto shadow-2xs">
                    <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                      Assign Exact Share (₹)
                    </span>
                    {form.participants.map(pid => {
                      const m = members.find(x => x.id === pid);
                      return (
                        <div key={pid} className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-charcoal">{m?.name}</span>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sky-700 font-bold">₹</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={form.customSplits[pid] || ''}
                              onChange={e => handleCustomSplitChange(pid, e.target.value)}
                              className="w-full pl-6 pr-2 py-1 border border-sky-200 rounded-lg text-xs bg-sky-50/40 focus:bg-white text-charcoal font-bold text-right focus:border-sky-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* If PERCENTAGE split: show percentage inputs */}
                {form.splitType === 'PERCENTAGE' && (
                  <div className="space-y-2 p-3 bg-white/95 rounded-2xl border border-indigo-200 max-h-40 overflow-y-auto shadow-2xs">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                      Assign Percentage (%)
                    </span>
                    {form.participants.map(pid => {
                      const m = members.find(x => x.id === pid);
                      return (
                        <div key={pid} className="flex items-center justify-between gap-3 text-xs">
                          <span className="font-bold text-charcoal">{m?.name}</span>
                          <div className="relative w-24">
                            <input
                              type="number"
                              placeholder="0"
                              max="100"
                              value={form.customSplits[pid] || ''}
                              onChange={e => handleCustomSplitChange(pid, e.target.value)}
                              className="w-full pr-5 pl-2 py-1 border border-indigo-200 rounded-lg text-xs bg-indigo-50/40 focus:bg-white text-charcoal font-bold text-right focus:border-indigo-500"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-700 font-bold">%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Section 4: Receipt / Proof Upload Box */}
              <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-charcoal uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-teal-100 text-teal-800 text-[11px] font-black flex items-center justify-center">4</span>
                    Receipt / Proof
                  </span>
                  <span className="text-[10px] text-muted bg-slate-100 px-1.5 py-0.5 rounded font-medium">Optional · Max 5MB</span>
                </div>

                <motion.div
                  whileHover={{ borderColor: 'rgba(13,148,136,0.8)', backgroundColor: '#ffffff', scale: 1.01 }}
                  className="border-2 border-dashed border-teal-300/80 bg-slate-50/40 rounded-2xl p-3 text-center transition-all cursor-pointer relative shadow-2xs"
                >
                  <input
                    id="proof-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {proofPreviewUrl ? (
                    <img src={proofPreviewUrl} alt="Proof preview" className="max-h-24 mx-auto rounded-xl object-contain shadow-sm border border-teal-100" />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 py-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-100 to-sky-100 text-teal-700 rounded-full flex items-center justify-center shadow-2xs border border-teal-200">
                        <FileImage className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted">
                        {proofFile ? (
                          <span className="text-teal font-bold">{proofFile.name}</span>
                        ) : (
                          <>Drag or click to attach <span className="font-bold text-teal">receipt image / PDF</span></>
                        )}
                      </p>
                    </div>
                  )}
                </motion.div>

                {proofFile && !uploadedProofIdentifier && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUpload}
                    isLoading={isUploading}
                    className="w-full border-teal-300 text-teal-700 hover:bg-teal-50 text-xs py-1.5 gap-2 font-bold"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? 'Uploading...' : 'Upload Proof Now'}
                  </Button>
                )}
                {uploadedProofIdentifier && (
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Proof uploaded and attached!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Submit Bar with Financial Summary Preview */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 bg-white -mx-6 -mb-6 px-6 py-4 rounded-b-3xl">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="font-bold text-charcoal">Summary:</span>
              <span>₹{form.amount || 0} total</span>
              <span>•</span>
              <span>{form.participants.length} travelers</span>
              <span>•</span>
              <span className="capitalize">{form.category}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-none font-semibold px-5">
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isUploading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-900/20 text-white font-bold px-7 py-2.5"
              >
                <Plus className="w-4 h-4 mr-1.5 stroke-[2.8]" /> Add Expense
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DisputeModal({ expense, onSubmit, onClose }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const saved = await onSubmit({ disputeReason: reason.trim() });
    setIsSubmitting(false);
    if (saved) onClose();
  };

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
        className="bg-white rounded-3xl shadow-2xl border border-muted/30 w-full max-w-lg p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-golden/10 rounded-xl flex items-center justify-center border border-golden/20">
              <AlertCircle className="w-5 h-5 text-golden" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal">Raise Dispute</h2>
              <p className="text-xs text-muted">Disputing: <span className="font-bold text-charcoal">{expense.title}</span> (₹{Number(expense.amount).toLocaleString()})</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-bg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1.5">Dispute reason</label>
            <textarea
              rows={3}
              placeholder="Explain clearly why this expense or split is incorrect…"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="w-full px-4 py-3 border border-muted/30 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-golden text-charcoal placeholder:text-muted resize-none transition text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              type="submit"
              disabled={!reason.trim() || isSubmitting}
              className="flex-1 bg-golden hover:bg-yellow-600 text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Dispute'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Settle Up Modal with Smart Settle Up ─────────────────────────────────────
function SettleUpModal({ details, members, expenses, onSettle, onClose }) {
  const [activeTab, setActiveTab] = useState('DIRECT'); // 'DIRECT' or 'OPTIMAL'
  const [selected, setSelected] = useState(details.filter(d => d.direction === 'owe').map(d => d.id));
  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const total = details.filter(d => selected.includes(d.id) && d.direction === 'owe').reduce((s, d) => s + d.amount, 0);

  // Compute minimum transactions for the entire group
  const optimalTransactions = useMemo(() => computeMinTransactions(expenses, members), [expenses, members]);

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
        className="bg-white rounded-3xl shadow-2xl border border-muted/30 w-full max-w-lg p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center border border-teal/20">
              <Wallet className="w-5 h-5 text-teal" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal">Settle Up Balances</h2>
              <p className="text-xs text-muted">Clear debts with single or group-optimized payments</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-bg flex items-center justify-center">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-2 p-1 bg-bg rounded-xl border border-muted/30">
          <button
            type="button"
            onClick={() => setActiveTab('DIRECT')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'DIRECT' ? 'bg-white text-teal shadow-sm' : 'text-muted hover:text-charcoal'
            }`}
          >
            Your Pending Debts ({details.filter(d => d.direction === 'owe').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OPTIMAL')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'OPTIMAL' ? 'bg-white text-teal shadow-sm' : 'text-muted hover:text-charcoal'
            }`}
          >
            ⚡ Smart Group Path ({optimalTransactions.length} Min Txns)
          </button>
        </div>

        {activeTab === 'DIRECT' ? (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {details.filter(d => d.direction === 'owe').length === 0 ? (
              <div className="text-center py-6 text-muted">
                <Check className="w-8 h-8 mx-auto text-teal mb-2" />
                <p className="text-sm font-semibold text-charcoal">You are all settled up!</p>
                <p className="text-xs text-muted">You do not owe anyone in this trip.</p>
              </div>
            ) : (
              details.filter(d => d.direction === 'owe').map(d => (
                <button
                  key={d.id}
                  onClick={() => toggle(d.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
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
                    <span className="font-semibold text-charcoal text-sm">{d.name}</span>
                  </div>
                  <span className="font-bold text-charcoal text-sm">₹{d.amount.toLocaleString()}</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            <p className="text-xs text-muted leading-relaxed">
              Min-Cash-Flow algorithm reduces overall payments across all members into the fewest possible transfers:
            </p>
            {optimalTransactions.length === 0 ? (
              <div className="text-center py-6 text-muted">
                <p className="text-sm font-semibold text-charcoal">No outstanding balances!</p>
              </div>
            ) : (
              optimalTransactions.map((tx, idx) => (
                <div key={idx} className="p-3 bg-teal/5 border border-teal/20 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal">{tx.fromName}</span>
                    <span className="text-muted">pays</span>
                    <span className="font-bold text-teal">{tx.toName}</span>
                  </div>
                  <span className="font-extrabold text-charcoal text-sm">₹{tx.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        )}

        {total > 0 && activeTab === 'DIRECT' && (
          <div className="flex items-center justify-between px-4 py-3 bg-teal/5 rounded-xl border border-teal/20">
            <span className="text-sm font-semibold text-muted">Selected total to settle</span>
            <span className="font-bold text-teal text-lg">₹{total.toLocaleString()}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => { 
              if (activeTab === 'DIRECT') {
                if (selected.length) { onSettle(selected); onClose(); }
              } else {
                // Settle all pending
                const allOwedIds = details.filter(d => d.direction === 'owe').map(d => d.id);
                onSettle(allOwedIds);
                onClose();
              }
            }}
            className="flex-1 bg-teal hover:bg-bright text-white"
            disabled={activeTab === 'DIRECT' && !selected.length}
          >
            {activeTab === 'DIRECT' ? 'Confirm Settlement' : 'Settle All Balances'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Proof Preview Modal ──────────────────────────────────────────────────────
function ProofPreviewModal({ tripId, expense, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  React.useEffect(() => {
    let objectUrl;
    expenseService.getProofBlobUrl(tripId, expense.id)
      .then(url => { objectUrl = url; setBlobUrl(url); })
      .catch(() => setErr('Could not load proof. You may not be authorized, or the file was removed.'))
      .finally(() => setLoading(false));
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [tripId, expense.id]);

  const isPdf = expense.proofUrl?.toLowerCase().endsWith('.pdf');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl border border-muted/30 w-full max-w-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-muted/20 bg-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal/10 rounded-xl flex items-center justify-center border border-teal/20">
              <Eye className="w-4 h-4 text-teal" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal">Payment Proof</h3>
              <p className="text-xs text-muted">{expense.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-bg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>
        <div className="p-6 min-h-[200px] flex items-center justify-center">
          {loading && <Loader2 className="w-8 h-8 animate-spin text-teal" />}
          {err && <p className="text-red-400 text-sm text-center">{err}</p>}
          {blobUrl && !loading && (
            isPdf ? (
              <iframe src={blobUrl} title="Proof PDF" className="w-full h-96 rounded-xl border border-muted/20" />
            ) : (
              <img src={blobUrl} alt="Payment proof" className="max-h-96 max-w-full rounded-xl object-contain shadow-lg" />
            )
          )}
        </div>
        {blobUrl && (
          <div className="px-6 pb-5 flex justify-end">
            <a href={blobUrl} download={`proof-${expense.id}`}
               className="text-sm font-semibold text-teal hover:underline">⬇ Download Proof</a>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Expense History & Audit Modal ───────────────────────────────────────────
function ExpenseHistoryModal({ expense, onClose }) {
  const historyList = expense.history && expense.history.length > 0
    ? expense.history
    : [
        {
          action: 'CREATED',
          actorName: expense.paidByName || 'Member',
          timestamp: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
          details: 'Expense originally logged'
        }
      ];

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATED':
        return { label: 'Created', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Plus };
      case 'ACCEPTED':
      case 'APPROVED':
        return { label: 'Approved', color: 'bg-teal/10 text-teal border-teal/20', icon: CheckCircle2 };
      case 'DISPUTED':
        return { label: 'Disputed', color: 'bg-golden/10 text-golden border-golden/20', icon: AlertCircle };
      case 'SETTLED':
        return { label: 'Settled', color: 'bg-gray-500/10 text-gray-400 border-gray-400/20', icon: Wallet };
      case 'EDITED':
        return { label: 'Updated', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Sparkles };
      default:
        return { label: action, color: 'bg-bg text-muted border-muted/30', icon: History };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl border border-muted/30 w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-muted/20 bg-bg/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <History className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal">Expense Record</h3>
              <p className="text-xs text-muted truncate max-w-[200px]">{expense.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-bg flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        <div className="p-6 max-h-80 overflow-y-auto space-y-4">
          {historyList.map((item, idx) => {
            const badge = getActionBadge(item.action);
            const Icon = badge.icon;
            return (
              <div key={idx} className="relative flex items-start gap-3 text-sm">
                {idx !== historyList.length - 1 && (
                  <span className="absolute left-4 top-8 bottom-0 w-0.5 bg-muted/20 -translate-x-1/2" />
                )}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${badge.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-charcoal">{item.actorName || 'Member'}</span>
                    <span className="text-[11px] text-muted font-medium">
                      {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{item.details || `Marked as ${item.action}`}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-muted/20 bg-bg/30 flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-sm">Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const FILTER_TABS = ['ALL', 'PENDING', 'DISPUTED', 'SETTLED'];

const mapExpense = (expense) => ({
  id: String(expense.id),
  title: expense.title,
  amount: Number(expense.amount) || 0,
  category: expense.category || 'Misc',
  paidById: String(expense.paidBy),
  paidByName: expense.paidByName || 'Trip member',
  date: expense.date || expense.createdAt?.slice(0, 10) || '',
  status: expense.status || 'PENDING',
  splitType: expense.splitType || 'EQUAL',
  participants: (expense.splits || []).map((split) => String(split.userId)),
  splits: (expense.splits || []).map((split) => ({
    ...split,
    userId: String(split.userId),
    isPaid: Boolean(split.isPaid)
  })),
  disputeReason: expense.disputeReason || '',
  proofUrl: expense.proofUrl || null,
  history: expense.createdAt
    ? [{ action: 'CREATED', actorName: expense.paidByName || 'Trip member', timestamp: expense.createdAt }]
    : [],
});

export default function SplitSmart() {
  const { trip, isTripAdmin } = useTrip();
  const { user } = useAuth();

  const members = Array.isArray(trip?.members)
    ? trip.members.map((member) => ({ ...member, id: String(member.userId ?? member.id) }))
    : [];
  const currentUserId = user?.id == null ? '' : String(user.id);

  const [expenses, setExpenses] = useState([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [expenseError, setExpenseError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [proofViewTarget, setProofViewTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [reminderToast, setReminderToast] = useState(null);
  const [sendingReminderTo, setSendingReminderTo] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!trip?.id) {
      setIsLoadingExpenses(false);
      return () => { isMounted = false; };
    }
    setIsLoadingExpenses(true);
    expenseService.getExpenses(trip.id)
      .then((data) => {
        if (isMounted) setExpenses(data.map(mapExpense));
      })
      .catch((error) => {
        console.error('Failed to load trip expenses:', error);
        if (isMounted) setExpenseError(error.response?.data?.message || 'Could not load trip expenses.');
      })
      .finally(() => {
        if (isMounted) setIsLoadingExpenses(false);
      });
    return () => { isMounted = false; };
  }, [trip?.id]);

  // ── balance calculation ──────────────────────────────────────────────────
  const { totalOwed, totalOwing, details: balanceDetails } = useMemo(
    () => computeBalances(expenses, currentUserId, members),
    [expenses, currentUserId, members]
  );

  // ── analytics data ───────────────────────────────────────────────────────
  const analyticsData = useMemo(() => {
    const categoryTotals = {};
    const memberPaidTotals = {};
    const memberShareTotals = {};

    members.forEach(m => {
      memberPaidTotals[m.name] = 0;
      memberShareTotals[m.name] = 0;
    });

    expenses.forEach(e => {
      const cat = e.category || 'Misc';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(e.amount) || 0);

      const payerName = e.paidByName || 'Member';
      memberPaidTotals[payerName] = (memberPaidTotals[payerName] || 0) + (Number(e.amount) || 0);

      if (e.splits && e.splits.length > 0) {
        e.splits.forEach(s => {
          const m = members.find(x => String(x.id || x.userId) === String(s.userId || s.id));
          const name = m?.name || s.userName || 'Member';
          memberShareTotals[name] = (memberShareTotals[name] || 0) + (Number(s.amount) || 0);
        });
      } else {
        const parts = e.participants || [];
        if (parts.length > 0) {
          const share = Math.round((Number(e.amount) || 0) / parts.length);
          parts.forEach(pid => {
            const m = members.find(x => String(x.id || x.userId) === String(pid));
            const name = m?.name || 'Member';
            memberShareTotals[name] = (memberShareTotals[name] || 0) + share;
          });
        }
      }
    });

    const categoryChartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
    const memberChartData = Object.keys({ ...memberPaidTotals, ...memberShareTotals }).map(name => ({
      name,
      paid: memberPaidTotals[name] || 0,
      share: memberShareTotals[name] || 0,
    }));

    return { categoryChartData, memberChartData };
  }, [expenses, members]);

  // ── CSV and Print Export ─────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ['Expense ID', 'Title', 'Category', 'Amount (INR)', 'Paid By', 'Date', 'Status', 'Split Type', 'Participants Count'];
    const rows = expenses.map(e => [
      `"${e.id}"`,
      `"${(e.title || '').replace(/"/g, '""')}"`,
      `"${e.category || 'Misc'}"`,
      e.amount,
      `"${(e.paidByName || '').replace(/"/g, '""')}"`,
      e.date,
      e.status,
      e.splitType,
      (e.participants || []).length
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Trip_Expenses_${trip?.name?.replace(/\s+/g, '_') || 'Summary'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // ── Payment Reminder ─────────────────────────────────────────────────────
  const sendReminder = async (member) => {
    if (!trip?.id || sendingReminderTo) return;
    try {
      setExpenseError('');
      setSendingReminderTo(member.id);
      const amount = await expenseService.sendPaymentReminder(trip.id, member.id);
      setReminderToast(
        `Reminder saved to ${member.name}'s in-app notifications for ₹${Number(amount).toLocaleString()}.`
      );
      setTimeout(() => setReminderToast(null), 4500);
    } catch (error) {
      setExpenseError(error.response?.data?.message || 'Could not save the payment reminder.');
    } finally {
      setSendingReminderTo(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // ── group spending summary ────────────────────────────────────────────────
  const totalGroupSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  // ── filtered list ────────────────────────────────────────────────────────
  const filtered = expenses.filter(e => {
    const matchesTab = filter === 'ALL' || e.status === filter;
    const matchesCat = categoryFilter === 'ALL' || (e.category || 'Misc') === categoryFilter;
    const matchesSearch = !searchQuery.trim() ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.paidByName && e.paidByName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesCat && matchesSearch;
  });

  // ── actions ──────────────────────────────────────────────────────────────
  const updateStatus = async (id, status, extra = {}) => {
    if (!trip?.id) return;
    try {
      setExpenseError('');
      let savedExpense;
      if (status === 'ACCEPTED') {
        savedExpense = await expenseService.approveExpense(trip.id, id);
      } else if (status === 'DISPUTED') {
        savedExpense = await expenseService.disputeExpense(trip.id, id, extra.disputeReason);
      } else if (status === 'REJECTED') {
        savedExpense = await expenseService.rejectExpense(trip.id, id);
      } else if (status === 'SETTLED') {
        savedExpense = await expenseService.settleExpense(trip.id, id);
      } else {
        throw new Error(`Unsupported expense status: ${status}`);
      }
      const mappedExpense = mapExpense(savedExpense);
      setExpenses((previous) => previous.map((expense) => expense.id === mappedExpense.id ? mappedExpense : expense));
      return true;
    } catch (error) {
      console.error('Failed to update expense status:', error);
      setExpenseError(error.response?.data?.message || error.message || 'Could not update this expense.');
      return false;
    }
  };

  const deleteExpense = async (id) => {
    if (!trip?.id) return;
    try {
      setExpenseError('');
      await expenseService.deleteExpense(trip.id, id);
      setExpenses((previous) => previous.filter((expense) => expense.id !== String(id)));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      setExpenseError(error.response?.data?.message || 'Could not delete this expense.');
    }
  };

  const addExpense = async (expense) => {
    const savedExpense = await expenseService.addExpense(trip.id, {
      title: expense.title,
      amount: expense.amount,
      paidBy: Number(expense.paidById),
      date: expense.date,
      category: expense.category,
      splitType: expense.splitType === 'EQUAL' ? 'EQUAL' : 'CUSTOM',
      proofUrl: expense.proofUrl,
      splits: expense.splits.map((split) => ({
        userId: Number(split.userId),
        userName: split.userName,
        amount: split.amount
      }))
    });
    setExpenses((previous) => [mapExpense(savedExpense), ...previous]);
  };

  const settleWithPeople = async (personIds) => {
    if (!trip?.id) return;
    const targetExpenses = expenses.filter((expense) =>
      expense.status !== 'SETTLED'
      && personIds.map(String).includes(String(expense.paidById))
      && expense.participants.includes(currentUserId)
    );
    try {
      setExpenseError('');
      const settledExpenses = await Promise.all(targetExpenses.map((expense) =>
        expenseService.settleExpense(trip.id, expense.id)
      ));
      const mappedExpenses = new Map(settledExpenses.map((expense) => {
        const mapped = mapExpense(expense);
        return [mapped.id, mapped];
      }));
      setExpenses((previous) => previous.map((expense) => mappedExpenses.get(expense.id) || expense));
    } catch (error) {
      console.error('Failed to settle expenses:', error);
      setExpenseError(error.response?.data?.message || 'Could not settle selected expenses.');
    }
  };

  if (!trip) return null;

  const currentUserName = members.find(m => m.id === currentUserId)?.name || 'You';

  return (
    <PageTransition variant="slideUp" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-16">
      {/* ── Reminder Notification Toast ── */}
      <AnimatePresence>
        {reminderToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            role="status"
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-charcoal text-white rounded-2xl shadow-2xl border border-muted/20 text-sm font-medium"
          >
            <Bell className="w-5 h-5 text-teal shrink-0 animate-bounce" />
            <span>{reminderToast}</span>
            <button onClick={() => setReminderToast(null)} className="ml-2 text-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {expenseError && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {expenseError}
        </p>
      )}
      {isLoadingExpenses && (
        <p role="status" className="py-4 text-center text-sm text-muted">Loading trip expenses...</p>
      )}

      {/* ── Modern Premium Page Header ── */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-7 text-white shadow-xl shadow-teal-950/10 border border-teal-700/30">
          {/* Ambient header glows */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-20 w-56 h-56 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4.5">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-teal-950 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/25 font-black"
              >
                <BadgeIndianRupee className="w-7 h-7 stroke-[2.4]" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">SplitSmart</h1>
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                    ⚡ Live Ledger
                  </span>
                </div>
                <p className="text-teal-100/80 text-sm mt-1 max-w-xl">
                  Intelligent group expense tracker with automated settlement optimization, dispute handling, and instant receipt verification.
                </p>
              </div>
            </div>

            {/* Header Action Toolbar */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Analytics Toggle */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAnalytics(s => !s)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all backdrop-blur-md border ${
                  showAnalytics
                    ? 'bg-emerald-400 text-teal-950 border-emerald-300 shadow-md shadow-emerald-400/20'
                    : 'bg-white/10 text-white hover:bg-white/20 border-white/15'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{showAnalytics ? 'Hide Analytics' : 'Visual Analytics'}</span>
              </motion.button>

              {/* Export Toolbar */}
              <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-1 shadow-sm">
                <button
                  onClick={exportCSV}
                  title="Download CSV Summary"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-100 hover:text-white hover:bg-white/15 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-300" />
                  CSV
                </button>
                <div className="w-[1px] h-4 bg-white/20 my-auto" />
                <button
                  onClick={handlePrint}
                  title="Print or Save as PDF"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-100 hover:text-white hover:bg-white/15 transition"
                >
                  <Receipt className="w-3.5 h-3.5 text-amber-300" />
                  PDF
                </button>
              </div>

              {/* Add Expense Primary Button */}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-teal-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-400/25 hover:shadow-emerald-400/35 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Add Expense
              </motion.button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Collapsible Expense Analytics Section ── */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card glass className="p-6 border-slate-200/80 shadow-lg bg-gradient-to-br from-white via-slate-50/50 to-teal-50/20 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                    <PieChartIcon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-charcoal">Group Expense Analytics</h3>
                    <p className="text-xs text-muted">Real-time breakdown of trip spending patterns and fair-share distribution</p>
                  </div>
                </div>
                <button onClick={() => setShowAnalytics(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-muted hover:text-charcoal flex items-center justify-center transition">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category Pie Chart */}
                <div className="flex flex-col items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 self-start flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Spending by Category
                  </h4>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {analyticsData.categoryChartData.map((entry, index) => {
                            const colors = ['#0d9488', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total']} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Member Spending Bar Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Member Paid vs Member Share
                  </h4>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.memberChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, '']} />
                        <Legend />
                        <Bar dataKey="paid" name="Amount Paid" fill="#0d9488" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="share" name="Actual Share" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Metric Highlights Banner ── */}
      <Reveal delay={0.05}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Trip Spending */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="p-5.5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 relative overflow-hidden group cursor-pointer transition-all"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-200/30 rounded-full blur-2xl group-hover:scale-150 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Total Group Spend</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:rotate-12 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs border border-emerald-200/60">
                <Receipt className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight group-hover:text-emerald-700 transition-colors relative z-10">
              ₹<AnimatedNumber value={totalGroupSpent} delay={0.1} />
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium relative z-10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {expenses.length} recorded items
            </p>
          </motion.div>

          {/* Pending Action */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="p-5.5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-sky-900/5 relative overflow-hidden group cursor-pointer transition-all"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-sky-200/30 rounded-full blur-2xl group-hover:scale-150 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">Pending Actions</span>
              <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:rotate-12 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-2xs border border-sky-200/60">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-charcoal tracking-tight group-hover:text-sky-700 transition-colors relative z-10">
              {expenses.filter(e => e.status === 'PENDING').length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium relative z-10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              Awaiting approvals
            </p>
          </motion.div>

          {/* You are Owed */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="p-5.5 rounded-3xl bg-gradient-to-br from-teal-50/90 via-emerald-50/40 to-white backdrop-blur-md border border-teal-200/80 shadow-sm hover:shadow-xl hover:shadow-teal-900/10 relative overflow-hidden group cursor-pointer transition-all"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-teal-200/40 rounded-full blur-2xl group-hover:scale-150 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-800">You Get Back</span>
              <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center group-hover:-rotate-12 group-hover:bg-teal-700 group-hover:text-white transition-all shadow-2xs border border-teal-300/70">
                <ArrowDownLeft className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-teal-900 tracking-tight relative z-10">
              ₹<AnimatedNumber value={totalOwing} delay={0.2} />
            </p>
            <p className="text-[11px] text-teal-700 font-semibold mt-1.5 relative z-10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
              Owed by companions
            </p>
          </motion.div>

          {/* You Owe */}
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="p-5.5 rounded-3xl bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white backdrop-blur-md border border-amber-200/80 shadow-sm hover:shadow-xl hover:shadow-amber-900/10 relative overflow-hidden group cursor-pointer transition-all"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl group-hover:scale-150 transition-all pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">You Must Pay</span>
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:rotate-12 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-2xs border border-amber-300/70">
                <ArrowUpRight className="w-4.5 h-4.5 stroke-[2.5]" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-900 tracking-tight relative z-10">
              ₹<AnimatedNumber value={totalOwed} delay={0.3} />
            </p>
            <p className="text-[11px] text-amber-700 font-semibold mt-1.5 relative z-10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              Your pending debt
            </p>
          </motion.div>
        </div>
      </Reveal>


      {/* ── Full-Width: Search + Filters + Ledger ── */}
      <div className="space-y-5">

          {/* ── Full-Width Search + Category + Status Tabs Block ── */}
          <Reveal delay={0.12} width="100%">
            <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">

              {/* Search Row */}
              <div className="relative flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                {/* Left Icon */}
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
                  <Search className="w-5 h-5 text-white stroke-[2.5]" />
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder="Search expenses by title, payer, or category…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-2.5 text-sm font-semibold bg-transparent text-charcoal placeholder:text-slate-400 focus:outline-none"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSearchQuery('')}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}

                {/* Expense count badge */}
                <span className="text-[11px] font-black px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  {filtered.length} results
                </span>
              </div>

              {/* Category Pills Row */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setCategoryFilter('ALL')}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border shrink-0 ${
                    categoryFilter === 'ALL'
                      ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                      : 'bg-slate-50 text-muted border-slate-200 hover:text-charcoal hover:bg-slate-100'
                  }`}
                >
                  ✦ All Items
                </motion.button>
                {CATEGORIES.map(cat => {
                  const theme = CATEGORY_THEME[cat] || CATEGORY_THEME.Misc;
                  const isSelected = categoryFilter === cat;
                  return (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setCategoryFilter(cat)}
                      className={`text-xs px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? `${theme.bg} ${theme.text} ${theme.border} shadow-sm ring-1 ring-current`
                          : `bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100`
                      }`}
                    >
                      <span>{theme.emoji}</span>
                      <span>{cat}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Status Filter Tabs Row */}
              <div className="flex items-center gap-1 px-4 py-2.5 overflow-x-auto no-scrollbar">
                {FILTER_TABS.map(tab => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFilter(tab)}
                    className={`flex-1 min-w-fit py-2 px-4 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
                      filter === tab
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20'
                        : 'text-slate-500 hover:text-charcoal hover:bg-slate-100'
                    }`}
                  >
                    <span>{tab}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      filter === tab ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {expenses.filter(e => tab === 'ALL' || e.status === tab).length}
                    </span>
                  </motion.button>
                ))}
              </div>

            </div>
          </Reveal>

          {/* Master Expenses Card List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 text-muted shadow-sm"
                >
                  <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30 text-teal-600" />
                  <p className="font-bold text-charcoal">No {filter.toLowerCase()} expenses found</p>
                  <p className="text-xs text-muted mt-1">Try switching categories or add a new transaction.</p>
                  {filter === 'ALL' && (
                    <Button onClick={() => setShowAddModal(true)} className="mt-4 bg-teal-600 text-white hover:bg-teal-700">
                      <Plus className="w-4 h-4 mr-1" /> Add Expense
                    </Button>
                  )}
                </motion.div>
              )}

              {filtered.map((exp, index) => {
                const mySplit = exp.splits?.find((split) => String(split.userId) === currentUserId);
                const myShare = mySplit
                  ? Number(mySplit.amount) || 0
                  : exp.participants.includes(currentUserId) && exp.participants.length > 0
                    ? exp.amount / exp.participants.length
                    : 0;
                const iPaid = exp.paidById === currentUserId;
                const iParticipate = exp.participants.includes(currentUserId);
                const canApprove = exp.status === 'PENDING' && !iPaid && iParticipate;
                const canDispute = exp.status === 'PENDING' && !iPaid && iParticipate;
                const catTheme = CATEGORY_THEME[exp.category] || CATEGORY_THEME.Misc;

                return (
                  <motion.div
                    key={exp.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -3, scale: 1.008 }}
                    className="group"
                  >
                    <div className={`overflow-hidden rounded-3xl border transition-all duration-300 group-hover:shadow-xl relative bg-white ${
                      exp.status === 'DISPUTED' ? 'border-amber-300/80 group-hover:border-amber-400 shadow-amber-500/5' :
                      exp.status === 'PENDING'  ? 'border-sky-300/80 group-hover:border-sky-400 shadow-sky-500/5' :
                      exp.status === 'SETTLED'  ? 'border-slate-200/60 opacity-85 group-hover:opacity-100 bg-slate-50/50' :
                      'border-slate-200/90 group-hover:border-teal-300 shadow-sm hover:shadow-teal-900/5'
                    }`}>
                      {/* Subtle category corner ambient halo */}
                      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${catTheme.glow} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ rotate: 12, scale: 1.12 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                            className={`w-12 h-12 rounded-2xl ${catTheme.iconBg} border ${catTheme.border} flex items-center justify-center shrink-0 shadow-2xs group-hover:shadow-md transition-all text-xl`}
                          >
                            <span>{catTheme.emoji}</span>
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <h4 className="font-black text-base text-charcoal leading-tight group-hover:text-teal-700 transition-colors">
                                {exp.title}
                              </h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase border ${catTheme.bg} ${catTheme.text} ${catTheme.border} shadow-2xs`}>
                                {catTheme.emoji} {exp.category || 'Expense'}
                              </span>
                            </div>
                            <p className="text-xs text-muted mt-0.5">
                              Paid by <span className="font-bold text-charcoal">{exp.paidByName}</span>
                              {' · '}{new Date(exp.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider flex-wrap">
                              <span>{exp.splitType} split ({exp.participants.length} people)</span>
                              {iParticipate && !iPaid && <span className="text-amber-700 font-black">• Your share: ₹{myShare.toLocaleString()}</span>}
                              {iPaid && <span className="text-emerald-700 font-black">• You paid bill</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2">
                          <span className="font-black text-2xl text-charcoal tracking-tight group-hover:scale-105 origin-right transition-transform">
                            ₹{exp.amount.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.05 }}
                              className={`text-[10px] px-2.5 py-1 rounded-xl font-black tracking-wider uppercase border shadow-2xs ${STATUS_COLORS[exp.status] || ''}`}
                            >
                              {exp.status}
                            </motion.span>
                            {/* History Log Button */}
                            <motion.button
                              whileHover={{ scale: 1.15, rotate: 15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setHistoryTarget(exp)}
                              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-teal-50 border border-slate-200 flex items-center justify-center transition-colors text-muted hover:text-teal-700 shadow-2xs"
                              title="View Expense Record"
                            >
                              <History className="w-3.5 h-3.5" />
                            </motion.button>
                            {isTripAdmin && exp.status !== 'SETTLED' && (
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteExpense(exp.id)}
                                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 border border-slate-200 flex items-center justify-center transition-colors text-red-400 hover:text-red-600 shadow-2xs"
                                title="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dispute details and available actions */}
                      {exp.status === 'DISPUTED' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-amber-50/50 px-5 py-4 border-t border-amber-200/80 space-y-3"
                        >
                          <div className="flex items-start gap-3 bg-amber-100/60 p-3.5 rounded-2xl border border-amber-200">
                            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                            <div className="space-y-1 flex-1">
                              <p className="text-xs font-black text-amber-900 uppercase tracking-wider">
                                Active Dispute
                              </p>
                              <p className="text-xs text-amber-950 font-medium">{exp.disputeReason}</p>
                            </div>
                          </div>

                          <p className="text-xs text-amber-900 bg-white/80 border border-amber-200 rounded-xl p-3">
                            Dispute replies are unavailable because replies cannot currently be saved or shared.
                          </p>

                          {isTripAdmin && (
                            <div className="pt-2 flex gap-3 justify-end border-t border-amber-200/80">
                              <Button
                                variant="outline"
                                onClick={() => updateStatus(exp.id, 'REJECTED')}
                                className="border-red-300 text-red-600 hover:bg-red-50 text-xs py-1.5 font-bold"
                              >
                                <X className="w-3.5 h-3.5 mr-1" /> Reject Dispute
                              </Button>
                              <Button
                                onClick={() => updateStatus(exp.id, 'ACCEPTED')}
                                className="bg-teal-600 hover:bg-teal-700 text-white text-xs py-1.5 font-bold shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Force Accept
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Pending approval actions */}
                      {exp.status === 'PENDING' && (canApprove || canDispute || exp.proofUrl) && (
                        <div className="bg-slate-50/70 px-5 py-3 border-t border-slate-100 flex flex-wrap gap-2 justify-end items-center">
                          {exp.proofUrl && (
                            <Button
                              variant="ghost"
                              onClick={() => setProofViewTarget(exp)}
                              className="text-teal-700 hover:bg-teal-50 text-xs gap-1.5 py-1.5 font-bold"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Receipt
                            </Button>
                          )}
                          {canDispute && (
                            <Button
                              variant="ghost"
                              onClick={() => setDisputeTarget(exp)}
                              className="text-amber-700 hover:bg-amber-50 text-xs py-1.5 font-bold"
                            >
                              Dispute
                            </Button>
                          )}
                          {canApprove && (
                            <Button
                              onClick={() => updateStatus(exp.id, 'ACCEPTED')}
                              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white text-xs py-1.5 font-bold"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Approve Share
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Receipt button for accepted/settled */}
                      {(exp.status === 'ACCEPTED' || exp.status === 'SETTLED') && exp.proofUrl && (
                        <div className="bg-slate-50/40 px-5 py-2.5 border-t border-slate-100 flex justify-end">
                          <Button
                            variant="ghost"
                            onClick={() => setProofViewTarget(exp)}
                            className="text-teal-700 hover:bg-teal-50 text-xs gap-1.5 py-1 font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Receipt
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

      {/* ── 3-Column Info Row: You Must Pay | Your Net Position | Trip Members (Placed at End) ── */}
      <Reveal delay={0.08}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* ── Col 1: You Must Pay ── */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded-3xl bg-gradient-to-br from-amber-50/90 via-yellow-50/40 to-white border border-amber-200/80 shadow-sm hover:shadow-xl hover:shadow-amber-900/8 p-5 space-y-4 relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-200/40 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-sm border border-amber-200/80">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-amber-900 uppercase tracking-wide">You Must Pay</h3>
                  <p className="text-[10px] text-amber-700/80">Pending dues to companions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-amber-900">₹{totalOwed.toLocaleString()}</p>
                <p className="text-[10px] text-amber-600 font-semibold">outstanding</p>
              </div>
            </div>
            <div className="space-y-1.5 relative z-10">
              {balanceDetails.filter(d => d.direction === 'owe').length > 0 ? (
                balanceDetails.filter(d => d.direction === 'owe').map(d => (
                  <motion.div key={d.id} whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-white/80 hover:bg-white border border-amber-200/60 hover:border-amber-300 transition-all text-xs shadow-2xs hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-black text-[10px]">{d.name.charAt(0)}</div>
                      <span className="font-bold text-charcoal">{d.name}</span>
                    </div>
                    <span className="font-black text-amber-800">−₹{d.amount.toLocaleString()}</span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-emerald-700">All clear! No pending dues 🎉</p>
                </div>
              )}
            </div>
            {totalOwed > 0 && (
              <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowSettleModal(true)}
                className="relative z-10 w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 transition-all flex items-center justify-center gap-2"
              >
                <Wallet className="w-4 h-4" /> Settle Up Now
              </motion.button>
            )}
          </motion.div>

          {/* ── Col 2: Your Net Position ── */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 p-5 space-y-4 relative overflow-hidden group"
          >
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-teal-100/40 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shadow-sm border border-teal-200/80">
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-charcoal uppercase tracking-wide">Your Net Position</h3>
                  <p className="text-[10px] text-muted">Summary with all members</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Live</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 relative z-10">
              <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200/80">
                <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block mb-0.5">You Are Owed</span>
                <p className="text-lg font-black text-teal-900">₹{totalOwing.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block mb-0.5">You Owe</span>
                <p className="text-lg font-black text-amber-900">₹{totalOwed.toLocaleString()}</p>
              </div>
            </div>
            {balanceDetails.length > 0 ? (
              <div className="space-y-1.5 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Member Breakdown</p>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-0.5">
                  {balanceDetails.map(d => (
                    <motion.div key={d.id} whileHover={{ x: 3 }}
                      className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/60 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${
                          d.direction === 'owe' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-teal-100 text-teal-800 border border-teal-200'
                        }`}>{d.name.charAt(0)}</div>
                        <span className="text-charcoal font-bold">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black ${d.direction === 'owe' ? 'text-amber-800' : 'text-teal-700'}`}>
                          {d.direction === 'owe' ? '−' : '+'}₹{d.amount.toLocaleString()}
                        </span>
                        {d.direction === 'owed' && (
                          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                            onClick={() => sendReminder(d)}
                            disabled={sendingReminderTo !== null}
                            title={`Send an in-app payment reminder to ${d.name}`}
                            aria-label={`Send an in-app payment reminder to ${d.name}`}
                            className="p-1 rounded-lg bg-teal-100 hover:bg-teal-600 hover:text-white text-teal-800 transition"
                          ><Bell className="w-3 h-3" /></motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-3 relative z-10">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <span className="text-xs text-muted">No outstanding balances</span>
              </div>
            )}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="relative z-10">
              <Button onClick={() => setShowSettleModal(true)} disabled={totalOwed === 0}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-sm font-bold shadow-md shadow-teal-900/15 text-white disabled:opacity-40 transition-all py-2.5 rounded-2xl"
              ><Wallet className="w-4 h-4 mr-2" />Settle Up Balances</Button>
            </motion.div>
          </motion.div>

          {/* ── Col 3: Trip Members ── */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 p-5 space-y-3 relative overflow-hidden group"
          >
            <div className="absolute -top-10 -left-10 w-36 h-36 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-sm border border-indigo-200/80">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-charcoal uppercase tracking-wide">Trip Members</h3>
                  <p className="text-[10px] text-muted">{members.length} traveler{members.length !== 1 ? 's' : ''} on this trip</p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-indigo-50 text-indigo-700 border border-indigo-200">{members.length} total</span>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5 relative z-10">
              {members.map((m, i) => (
                <motion.div key={m.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 p-2.5 rounded-2xl transition-all cursor-default border border-transparent hover:border-slate-200/80 hover:bg-slate-50/80 hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border border-indigo-200 text-indigo-800 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-charcoal truncate">{m.name}</p>
                    <p className="text-[10px] text-muted">{m.role === 'TRIP_ADMIN' ? '👑 Trip Admin' : '✈️ Traveler'}</p>
                  </div>
                  {m.id === currentUserId && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-black border border-emerald-200 shrink-0">You</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </Reveal>


      {/* ── Modals ── */}
      <AnimatePresence>
        {showAddModal && (
          <AddExpenseModal
            members={members}
            tripId={trip?.id}
            currentUser={{ id: currentUserId, name: currentUserName }}
            onAdd={addExpense}
            onClose={() => setShowAddModal(false)}
          />
        )}
        {disputeTarget && (
          <DisputeModal
            expense={disputeTarget}
            onSubmit={(disputeData) => updateStatus(disputeTarget.id, 'DISPUTED', disputeData)}
            onClose={() => setDisputeTarget(null)}
          />
        )}
        {showSettleModal && (
          <SettleUpModal
            details={balanceDetails}
            members={members}
            expenses={expenses}
            onSettle={settleWithPeople}
            onClose={() => setShowSettleModal(false)}
          />
        )}
        {proofViewTarget && (
          <ProofPreviewModal
            tripId={trip?.id}
            expense={proofViewTarget}
            onClose={() => setProofViewTarget(null)}
          />
        )}
        {historyTarget && (
          <ExpenseHistoryModal
            expense={historyTarget}
            onClose={() => setHistoryTarget(null)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
