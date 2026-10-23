import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { motion } from 'framer-motion';
import { 
  Wallet, ShieldAlert, RefreshCw, Plane, Hotel, Utensils, 
  Ticket, AlertTriangle, TrendingUp, Users,
  Lightbulb, Edit3, FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import AnimatedNumber from '../../components/animations/AnimatedNumber';
import { budgetService } from '../../services/budgetService';

// Exact color palette matching the UI design reference
const CATEGORY_CONFIG = {
  Transport: {
    color: '#2563eb', // vivid royal blue
    icon: Plane,
    defaultAmount: 45000,
    pct: 36,
  },
  Hotel: {
    color: '#0d9488', // rich teal/cyan
    icon: Hotel,
    defaultAmount: 35000,
    pct: 28,
  },
  Food: {
    color: '#f59e0b', // amber yellow
    icon: Utensils,
    defaultAmount: 20000,
    pct: 16,
  },
  Activities: {
    color: '#8b5cf6', // purple
    icon: Ticket,
    defaultAmount: 15000,
    pct: 12,
  },
  'Hidden Costs': {
    color: '#f43f5e', // coral pink/rose
    icon: ShieldAlert,
    defaultAmount: 11700,
    pct: 9,
  },
};

export default function BudgetAffordability() {
  const { trip } = useTrip();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [budgetData, setBudgetData] = useState(null);

  const fetchBudgetDetails = async () => {
    if (!trip?.id) return;
    try {
      setLoading(true);
      const data = await budgetService.getBudget(trip.id);
      if (data) {
        setBudgetData(data);
      }
    } catch (err) {
      console.error('Failed to load budget details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetDetails();
  }, [trip?.id]);

  const tripBudget = budgetData?.totalBudget ?? (trip?.budget || trip?.totalBudget || 70000);

  // Real hidden cost total from backend
  const calculatedHiddenCost = budgetData?.hiddenCosts !== undefined && budgetData?.hiddenCosts !== null
    ? Math.round(budgetData.hiddenCosts)
    : 11700;

  // Breakdown items with amounts
  const rawBreakdown = [
    { name: 'Transport', value: Math.round(budgetData?.transport ?? 45000) },
    { name: 'Hotel', value: Math.round(budgetData?.hotel ?? 35000) },
    { name: 'Food', value: Math.round(budgetData?.food ?? 20000) },
    { name: 'Activities', value: Math.round(budgetData?.activities ?? 15000) },
    { name: 'Hidden Costs', value: calculatedHiddenCost },
  ];

  const currentTotal = budgetData?.spent ?? rawBreakdown.reduce((acc, curr) => acc + curr.value, 0);
  const remaining = budgetData?.remainingBudget ?? (tripBudget - currentTotal);
  const travelers = Array.isArray(trip?.members) ? trip.members.length : (trip?.members || 2);
  const perPersonCost = Math.round(currentTotal / Math.max(1, travelers));
  const budgetUsagePct = tripBudget > 0 ? (currentTotal / tripBudget) * 100 : 0;
  const visibleBudgetUsagePct = Math.min(100, Math.max(0, budgetUsagePct));
  const budgetStatus = remaining < 0
    ? 'Over budget'
    : budgetUsagePct >= 85
      ? 'Budget getting tight'
      : 'Within budget';
  const budgetStatusStyles = remaining < 0
    ? 'bg-rose-100 text-rose-800 border-rose-200'
    : budgetUsagePct >= 85
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  const destinationName = trip?.destination || 'Mumbai';

  // Extract individual hidden costs items from backend
  const hiddenCostItems = budgetData?.hiddenCostItems && budgetData.hiddenCostItems.length > 0
    ? budgetData.hiddenCostItems
    : [
        { id: '1', description: 'Airport Transfer (Round Trip)', category: 'Transportation', estimatedCost: 3500 },
        { id: '2', description: 'City Tax / Resort Fee', category: 'Accommodation', estimatedCost: 1500 },
        { id: '3', description: 'Local Transport Buffer', category: 'Transportation', estimatedCost: 2000 },
        { id: '4', description: 'Tipping & Emergency Buffer', category: 'Emergency', estimatedCost: 4700 },
      ];

  // Pie chart with exact percentages and customized labels
  const pieData = rawBreakdown.map(item => {
    const pct = Math.round((item.value / Math.max(1, currentTotal)) * 100);
    return {
      ...item,
      percentage: pct,
      color: CATEGORY_CONFIG[item.name]?.color || '#0d9488'
    };
  });

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#ffffff" 
        textAnchor="middle" 
        dominantBaseline="central" 
        className="text-[11px] font-bold drop-shadow-sm select-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <PageTransition variant="fadeIn" className="max-w-[1300px] mx-auto text-charcoal pb-12 font-sans space-y-7">
      <motion.header
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-[2rem] border border-[#174D53] bg-gradient-to-br from-[#102F43] via-[#14534F] to-[#347B69] p-6 text-white shadow-travel-lg md:p-9"
      >
        <motion.div
          animate={{ x: [0, 14, 0], y: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-200/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -12, 0], y: [0, -8, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute right-1/3 -bottom-28 h-56 w-56 rounded-full bg-amber-200/15 blur-3xl"
        />
        <div className="relative flex flex-col gap-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-emerald-100 shadow-inner sm:flex">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                    Budget <span className="text-emerald-200">Overview</span>
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${budgetStatusStyles}`}>
                    {remaining < 0 && <AlertTriangle className="h-3.5 w-3.5" />}
                    {budgetStatus}
                  </span>
                </div>
                <p className="text-sm text-white/75">
                  Your trip spending at a glance for <span className="font-semibold text-white">{destinationName}</span>.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBudgetDetails}
              disabled={loading}
              className="gap-2 self-start rounded-xl border-white/25 bg-white/10 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-5 rounded-2xl border border-white/60 bg-white/[0.96] p-5 text-charcoal shadow-xl shadow-[#082B35]/20 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-charcoal">Budget utilization</p>
                  <p className="mt-0.5 text-xs text-muted">Planned spend against your trip limit</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${remaining < 0 ? 'bg-rose-100 text-rose-800' : budgetUsagePct >= 85 ? 'bg-amber-100 text-amber-900' : 'bg-teal-100 text-teal-900'}`}>
                  {budgetUsagePct.toFixed(0)}%
                </span>
              </div>
              <div
                className="h-3.5 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-label="Trip budget used"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={visibleBudgetUsagePct}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${visibleBudgetUsagePct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${remaining < 0 ? 'bg-gradient-to-r from-rose-500 to-pink-400' : budgetUsagePct >= 85 ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-teal-700 via-teal-500 to-emerald-400'}`}
                />
              </div>
              <p className="mt-2.5 text-xs text-muted">
                <span className="font-semibold text-charcoal">₹{currentTotal.toLocaleString()}</span>
                {' '}planned out of{' '}
                <span className="font-semibold text-charcoal">₹{tripBudget.toLocaleString()}</span>
              </p>
            </div>
            <div className="hidden h-16 w-px bg-slate-200 md:block" />
            <div className="min-w-32 md:text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Available balance</p>
              <p className={`mt-1 text-2xl font-extrabold tracking-tight ${remaining < 0 ? 'text-rose-700' : 'text-teal-800'}`}>
                {remaining < 0 ? '−' : ''}₹{Math.abs(remaining).toLocaleString()}
              </p>
            </div>
          </div>

          <nav aria-label="Budget quick actions" className="flex flex-wrap gap-2">
            {[
              { label: 'What-if simulator', path: `/trips/${trip.id}/simulator`, icon: Edit3, color: 'text-slate-800 bg-white/95 border-white/70 hover:bg-slate-100' },
              { label: 'Expenses', path: `/trips/${trip.id}/expenses`, icon: FileText, color: 'text-teal-950 bg-white/95 border-white/70 hover:bg-teal-50' },
              { label: 'Hidden costs', path: `/trips/${trip.id}/hidden-costs`, icon: ShieldAlert, color: 'text-amber-950 bg-white/95 border-white/70 hover:bg-amber-50' },
              { label: 'Smart alternatives', path: `/trips/${trip.id}/alternatives`, icon: Lightbulb, color: 'text-emerald-950 bg-white/95 border-white/70 hover:bg-emerald-50' }
            ].map(({ label, path, icon: Icon, color }, index) => (
              <motion.button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.06, duration: 0.25 }}
                whileHover={{ y: -3, scale: 1.025 }}
                whileTap={{ scale: 0.98 }}
                className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-sm transition-colors ${color}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.header>

      <motion.section
        aria-label="Budget summary"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09 } } }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        
        {/* Total Budget Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: 'easeOut' }}
          whileHover={{ y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
          className="group relative overflow-hidden rounded-2xl border border-slate-300 p-5 shadow-sm transition-shadow hover:shadow-travel-lg xl:col-span-2"
          style={{
            background: 'linear-gradient(125deg, #E4EDF3 0%, #CCDFE8 48%, #B6D2DD 100%)'
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-900 via-sky-600 to-cyan-400" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/80 bg-white/85 text-sky-900 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="rounded-full border border-white/70 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-900">Trip limit</span>
          </div>
          <span className="relative z-10 text-[11px] font-bold uppercase tracking-wider text-sky-950/65">Total budget</span>
          <p className="relative z-10 mt-1 text-3xl font-extrabold tracking-tight text-charcoal lg:text-4xl">
            ₹<AnimatedNumber value={tripBudget} />
          </p>
          <p className="relative z-10 mt-1 text-xs text-sky-950/65">Your planned spending limit</p>
        </motion.div>

        {/* Total Estimated Spent Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.14, ease: 'easeOut' }}
          whileHover={{ y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
          className="group relative overflow-hidden rounded-2xl border border-teal-300 p-5 shadow-sm transition-shadow hover:shadow-travel-lg"
          style={{
            background: 'linear-gradient(135deg, #DCEFE6 0%, #C3E3D4 55%, #A9D4C2 100%)'
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-900 via-teal-600 to-emerald-400" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/85 text-teal-900 flex items-center justify-center border border-white/80 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="w-6 h-6 rounded-full bg-white/70 flex items-center justify-center text-teal-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900/60">Estimated total</span>
          <p className="text-2xl lg:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            ₹<AnimatedNumber value={currentTotal} />
          </p>
          <p className="text-xs text-teal-900/60 mt-1">{budgetUsagePct.toFixed(0)}% of your budget</p>
        </motion.div>

        {/* Remaining Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.23, ease: 'easeOut' }}
          whileHover={{ y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
          className={`group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-travel-lg ${remaining < 0 ? 'border-rose-300' : 'border-emerald-300'}`}
          style={{
            background: remaining < 0
              ? 'linear-gradient(135deg, #F9DDD9 0%, #F2C9C5 55%, #EFBAB8 100%)'
              : 'linear-gradient(135deg, #DCEFE0 0%, #C6E3CE 55%, #B0D9BE 100%)'
          }}
        >
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${remaining < 0 ? 'from-rose-800 via-rose-600 to-pink-400' : 'from-emerald-900 via-emerald-600 to-lime-400'}`} />
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center border shadow-sm ${remaining < 0 ? 'text-rose-700 border-rose-200' : 'text-emerald-700 border-emerald-200'}`}>
              <Wallet className="w-5 h-5" />
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${remaining < 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
              {remaining < 0 ? 'Attention' : 'Available'}
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/60">{remaining < 0 ? 'Over budget by' : 'Remaining balance'}</span>
          <div className="flex items-baseline gap-1 mt-1">
            <p className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${remaining < 0 ? 'text-rose-700' : 'text-emerald-800'}`}>
              ₹<AnimatedNumber value={Math.abs(remaining)} />
            </p>
          </div>
          <p className="text-xs text-charcoal/60 mt-1">{remaining < 0 ? 'Consider reviewing your planned costs' : 'Available for the rest of your trip'}</p>
        </motion.div>

        {/* Per Person Cost Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.32, ease: 'easeOut' }}
          whileHover={{ y: -4, scale: 1.015, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
          className="group relative overflow-hidden rounded-2xl border border-violet-200 p-5 shadow-sm transition-shadow hover:shadow-travel-lg"
          style={{
            background: 'linear-gradient(135deg, #EAE7F2 0%, #D9D7EA 55%, #CACDE3 100%)'
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-900 via-violet-700 to-fuchsia-400" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/85 text-violet-800 flex items-center justify-center border border-white/80 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Users className="w-5 h-5" />
            </div>
            <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-slate-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Per person estimate</span>
          <p className="text-2xl lg:text-3xl font-extrabold text-charcoal tracking-tight mt-1">
            ₹<AnimatedNumber value={perPersonCost} />
          </p>
          <p className="text-xs text-slate-600 mt-1">Split across {travelers} travelers</p>
        </motion.div>

      </motion.section>

      {/* Spending distribution and category details */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
        className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12"
      >
        
        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="lg:col-span-5 rounded-2xl p-5 border border-[#D8C8CE] bg-gradient-to-br from-[#E1ECE8] via-[#D9E1DC] to-[#E8D4D9] shadow-travel transition-shadow hover:shadow-travel-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-lg text-charcoal">Spending distribution</h3>
            </div>
            <p className="text-xs text-muted mb-4 ml-10">See how your planned trip costs are divided.</p>

            {/* Donut Chart */}
            <div className="h-[210px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      borderColor: '#dbe7e1',
                      borderRadius: '10px', 
                      color: '#172B2F',
                      boxShadow: '0 8px 24px rgba(23,43,47,0.12)'
                    }}
                    itemStyle={{ color: '#172B2F', fontWeight: 600 }}
                    formatter={(val) => `₹${Number(val).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-muted uppercase font-semibold">Total estimate</span>
                <span className="text-base font-extrabold text-charcoal">
                  ₹{currentTotal.toLocaleString()}
                </span>
                <span className={`text-[10px] font-semibold ${remaining < 0 ? 'text-rose-700' : 'text-teal-800'}`}>
                  {budgetUsagePct.toFixed(0)}% of budget
                </span>
              </div>
            </div>

            {/* Compact Legend Table */}
            <div className="space-y-1.5 mt-2">
              {pieData.map((item) => (
                <motion.div key={item.name} whileHover={{ x: 3 }} className="flex items-center justify-between text-xs py-2 px-2 rounded-lg transition-colors hover:bg-white/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-charcoal font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted text-[11px]">{item.percentage}%</span>
                    <span className="text-charcoal font-semibold text-right min-w-[55px]">
                      ₹{item.value.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom Pro Tip Box */}
          <div className="mt-5 p-3 rounded-xl bg-[#F5E9EC] border border-[#E7CBD2] flex items-start gap-2.5 text-xs text-[#704B57]">
            <Lightbulb className="w-4 h-4 text-[#A35F75] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> Keep a small buffer for unexpected costs, and compare your largest categories before booking.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="lg:col-span-7 rounded-2xl p-5 border border-[#D9C6CF] bg-gradient-to-br from-[#DCEDE5] via-[#D3E1DA] to-[#E6D1D9] shadow-travel transition-shadow hover:shadow-travel-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-lg text-charcoal">Category breakdown</h3>
              </div>
              <span className="text-[11px] font-semibold text-teal-900 bg-white/80 px-2.5 py-1 rounded-full border border-teal-100">
                {pieData.length} categories
              </span>
            </div>
            <p className="text-xs text-muted mb-5 ml-10">Amount, share of spending, and estimated cost per person.</p>

            {/* List with Progress Bars */}
            <div className="space-y-4">
              {pieData.map((item) => {
                const IconComponent = CATEGORY_CONFIG[item.name]?.icon || Wallet;
                const color = item.color;
                const perPerson = Math.round(item.value / Math.max(1, travelers));

                return (
                  <motion.div key={item.name} whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.55)' }} className="space-y-1.5 rounded-xl p-2 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: `${color}25`, color: color }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-charcoal leading-tight">{item.name}</h4>
                          <span className="text-[11px] text-muted">{item.percentage}% of planned total</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-charcoal">₹{item.value.toLocaleString()}</span>
                        <p className="text-[10px] text-muted font-medium">≈ ₹{perPerson.toLocaleString()} / person</p>
                      </div>
                    </div>

                    {/* Progress Bar with glowing accent */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden ml-12" style={{ maxWidth: 'calc(100% - 48px)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.65, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: color,
                          boxShadow: `0 2px 8px ${color}55`
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Applied Hidden & Peripheral Costs Details */}
      <motion.section
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="rounded-2xl p-5 border border-[#876A70] bg-gradient-to-br from-[#72552F] via-[#866348] to-[#916474] text-white shadow-travel transition-shadow hover:shadow-travel-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-amber-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Hidden cost buffers</h3>
              <p className="text-xs text-white/75">
                These unexpected expense buffers have been applied directly from your Hidden Costs scanner.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-amber-100/80 uppercase font-semibold">Total hidden cost buffer</span>
              <p className="text-lg font-bold text-white">₹{calculatedHiddenCost.toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/trips/${trip.id}/hidden-costs`)}
              className="bg-white/95 hover:bg-amber-50 text-amber-900 border-white/70 text-xs px-3 py-1.5 rounded-xl ml-2 transition-all hover:-translate-y-0.5"
            >
              Modify Buffers
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {hiddenCostItems.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              whileHover={{ y: -3, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="p-3 rounded-xl bg-white/80 border border-amber-100 flex items-center justify-between shadow-sm hover:shadow-md"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-muted block tracking-wider">
                  {item.category || 'Buffer'}
                </span>
                <p className="text-xs font-semibold text-charcoal mt-0.5">{item.description || item.name}</p>
              </div>
              <span className="text-xs font-bold text-amber-900">
                ₹{Number(item.estimatedCost || item.amount || 0).toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Applied Smart Alternatives Details */}
      <motion.section
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="rounded-2xl p-5 border border-[#765468] bg-gradient-to-br from-[#123F49] via-[#18584F] to-[#765468] text-white shadow-travel transition-shadow hover:shadow-travel-md"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 text-emerald-100 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Smart alternatives</h3>
              <p className="text-xs text-white/75">
                Cost-effective choices swapped into your trip itinerary to trim expenditures.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/trips/${trip.id}/alternatives`)}
              className="bg-white/95 hover:bg-teal-50 text-teal-900 border-white/70 text-xs px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Explore More Alternatives
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-3.5 rounded-xl bg-white/95 border border-white/70 flex items-center justify-between text-charcoal shadow-sm hover:shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Stay Alternative
                </span>
                <span className="text-xs text-muted">Sunset Sands Boutique Stay</span>
              </div>
              <p className="text-xs text-charcoal/70">Swapped from Oceanview Resort • Same beach vicinity</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-teal-800">+₹8,500 Saved</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -3, scale: 1.01 }} className="p-3.5 rounded-xl bg-white/95 border border-white/70 flex items-center justify-between text-charcoal shadow-sm hover:shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                  Tour Alternative
                </span>
                <span className="text-xs text-muted">Heritage Catamaran Island Tour</span>
              </div>
              <p className="text-xs text-charcoal/70">Swapped from Private Yacht Cruise • Certified guides included</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-teal-800">+₹8,800 Saved</span>
            </div>
          </motion.div>
        </div>
        </motion.section>
    </PageTransition>
  );
}
