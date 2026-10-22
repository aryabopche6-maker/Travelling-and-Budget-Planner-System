import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { motion } from 'framer-motion';
import { 
  Wallet, ShieldAlert, RefreshCw, Plane, Hotel, Utensils, 
  Ticket, AlertTriangle, TrendingUp, Users, Info, MoreHorizontal,
  Lightbulb, Edit3, FileText, Download, MapPin, Heart
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
    <PageTransition variant="fadeIn" className="max-w-[1300px] mx-auto text-slate-100 pb-12 font-sans">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Trip Budget <span className="text-[#38bdf8]">Overview</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Exceeding Target
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Complete financial distribution, active expenditures, and cost breakdown for your trip to {destinationName}.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBudgetDetails}
          disabled={loading}
          className="bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 border-slate-700/60 gap-2 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* 4 Glowing Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Budget Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="relative rounded-2xl p-5 overflow-hidden backdrop-blur-xl border border-sky-500/20 shadow-lg shadow-sky-950/20"
          style={{
            background: 'linear-gradient(135deg, rgba(14, 38, 77, 0.75) 0%, rgba(10, 25, 53, 0.85) 100%)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/20 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TOTAL BUDGET</span>
          <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            ₹<AnimatedNumber value={tripBudget} />
          </p>
          <p className="text-xs text-slate-400 mt-1">Planned allocation limit</p>
        </motion.div>

        {/* Total Estimated Spent Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="relative rounded-2xl p-5 overflow-hidden backdrop-blur-xl border border-teal-500/20 shadow-lg shadow-teal-950/20"
          style={{
            background: 'linear-gradient(135deg, rgba(8, 47, 54, 0.75) 0%, rgba(6, 32, 38, 0.85) 100%)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/20 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="w-6 h-6 rounded-full bg-teal-400/10 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TOTAL ESTIMATED SPENT</span>
          <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            ₹<AnimatedNumber value={currentTotal} />
          </p>
          <p className="text-xs text-slate-400 mt-1">100% of total allocated</p>
        </motion.div>

        {/* Remaining Balance Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="relative rounded-2xl p-5 overflow-hidden backdrop-blur-xl border border-rose-500/20 shadow-lg shadow-rose-950/20"
          style={{
            background: 'linear-gradient(135deg, rgba(60, 20, 36, 0.75) 0%, rgba(40, 14, 25, 0.85) 100%)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-400/20 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <Info className="w-4 h-4" />
            </button>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">REMAINING BALANCE</span>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl lg:text-3xl font-extrabold text-rose-400 tracking-tight">
              ₹<AnimatedNumber value={Math.abs(remaining)} />
            </p>
            {remaining < 0 && <span className="text-xs font-semibold text-rose-300">(Over)</span>}
          </div>
          <p className="text-xs text-slate-400 mt-1">Available buffer</p>
        </motion.div>

        {/* Per Person Cost Card */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="relative rounded-2xl p-5 overflow-hidden backdrop-blur-xl border border-purple-500/20 shadow-lg shadow-purple-950/20"
          style={{
            background: 'linear-gradient(135deg, rgba(46, 26, 71, 0.75) 0%, rgba(30, 16, 48, 0.85) 100%)'
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/20 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div className="w-7 h-7 rounded-full bg-purple-400/10 flex items-center justify-center text-purple-300">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PER PERSON COST</span>
          <p className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            ₹<AnimatedNumber value={perPersonCost} />
          </p>
          <p className="text-xs text-slate-400 mt-1">Split across {travelers} travelers</p>
        </motion.div>

      </div>

      {/* Main 3-Column Glass Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Column 1: Expenditure Distribution Chart (Span 4) */}
        <div 
          className="lg:col-span-4 rounded-2xl p-5 border border-slate-700/40 backdrop-blur-xl flex flex-col justify-between"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(11, 17, 32, 0.85) 100%)'
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <span className="font-bold text-xs">📊</span>
              </div>
              <h3 className="font-bold text-base text-white">Expenditure Distribution</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 ml-9">Interactive segment breakdown by category</p>

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
                      backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                      borderColor: 'rgba(51, 65, 85, 0.8)', 
                      borderRadius: '10px', 
                      color: '#ffffff'
                    }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                    formatter={(val) => `₹${Number(val).toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">TOTAL EST.</span>
                <span className="text-base font-extrabold text-white">
                  ₹{currentTotal.toLocaleString()}
                </span>
                <span className="text-[10px] text-teal-400 font-semibold">100% Budgeted</span>
              </div>
            </div>

            {/* Compact Legend Table */}
            <div className="space-y-1.5 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs py-1 px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">{item.percentage}%</span>
                    <span className="text-slate-200 font-semibold text-right min-w-[55px]">
                      ₹{item.value.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Pro Tip Box */}
          <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Tip:</strong> Try to keep transport & hotel within 60% of your total budget for a balanced trip!
            </p>
          </div>
        </div>

        {/* Column 2: Category Breakdown (Span 5) */}
        <div 
          className="lg:col-span-5 rounded-2xl p-5 border border-slate-700/40 backdrop-blur-xl flex flex-col justify-between"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(11, 17, 32, 0.85) 100%)'
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-400 flex items-center justify-center">
                  <span className="font-bold text-xs">📑</span>
                </div>
                <h3 className="font-bold text-base text-white">Category Breakdown</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/50">
                5 Categories
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5 ml-9">Detailed allocations with percentage shares</p>

            {/* List with Progress Bars */}
            <div className="space-y-4">
              {pieData.map((item) => {
                const IconComponent = CATEGORY_CONFIG[item.name]?.icon || Wallet;
                const color = item.color;
                const perPerson = Math.round(item.value / Math.max(1, travelers));

                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                          style={{ backgroundColor: `${color}25`, color: color }}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white leading-tight">{item.name}</h4>
                          <span className="text-[11px] text-slate-400">{item.percentage}% of total spending</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">₹{item.value.toLocaleString()}</span>
                        <p className="text-[10px] text-slate-400 font-medium">≈ ₹{perPerson.toLocaleString()} / person</p>
                      </div>
                    </div>

                    {/* Progress Bar with glowing accent */}
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden ml-12" style={{ maxWidth: 'calc(100% - 48px)' }}>
                      <div 
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: color,
                          boxShadow: `0 0 8px ${color}80`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Destination Polaroid & Quick Actions (Span 3) */}
        <div 
          className="lg:col-span-3 rounded-2xl p-5 border border-slate-700/40 backdrop-blur-xl flex flex-col justify-between relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(11, 17, 32, 0.85) 100%)'
          }}
        >
          {/* Polaroid Photo Frame */}
          <div className="relative mx-auto w-full max-w-[240px] pt-1">
            <div className="bg-white p-2.5 pb-3 rounded-lg shadow-xl shadow-black/40 rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="w-full h-32 rounded bg-slate-900 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80" 
                  alt={destinationName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-slate-800 font-bold text-sm">
                <span>{destinationName}</span>
                <MapPin className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              </div>
            </div>
          </div>

          {/* Quick Actions List */}
          <div className="mt-5 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              QUICK ACTIONS
            </span>

            <button 
              onClick={() => navigate(`/trips/${trip.id}/simulator`)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/50 transition-all text-left"
            >
              <Edit3 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Edit Budget</span>
            </button>

            <button 
              onClick={() => navigate(`/trips/${trip.id}/expenses`)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/50 transition-all text-left"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>View Expense Report</span>
            </button>

            <button 
              onClick={() => alert("Downloading budget summary PDF...")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/50 transition-all text-left"
            >
              <Download className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Handwritten Quote Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 italic font-serif flex items-center justify-center gap-1">
              Same dreams, bigger plans <Heart className="w-3 h-3 text-rose-400 inline fill-rose-400" />
            </p>
          </div>

        </div>

      </div>

      {/* Applied Hidden & Peripheral Costs Details */}
      <div 
        className="mt-6 rounded-2xl p-5 border border-slate-700/40 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(11, 17, 32, 0.85) 100%)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Applied Hidden & Peripheral Buffers</h3>
              <p className="text-xs text-slate-400">
                These unexpected expense buffers have been applied directly from your Hidden Costs scanner.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Hidden Cost Buffer</span>
              <p className="text-lg font-bold text-rose-400">₹{calculatedHiddenCost.toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/trips/${trip.id}/hidden-costs`)}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/60 text-xs px-3 py-1.5 rounded-xl ml-2"
            >
              Modify Buffers
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {hiddenCostItems.map((item, idx) => (
            <div 
              key={item.id || idx}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {item.category || 'Buffer'}
                </span>
                <p className="text-xs font-semibold text-white mt-0.5">{item.description || item.name}</p>
              </div>
              <span className="text-xs font-bold text-rose-400">
                ₹{Number(item.estimatedCost || item.amount || 0).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Applied Smart Alternatives Details */}
      <div 
        className="mt-6 rounded-2xl p-5 border border-slate-700/40 backdrop-blur-xl"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(11, 17, 32, 0.85) 100%)'
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Applied Smart Alternatives & Optimizations</h3>
              <p className="text-xs text-slate-400">
                Cost-effective choices swapped into your trip itinerary to trim expenditures.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/trips/${trip.id}/alternatives`)}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/60 text-xs px-3 py-1.5 rounded-xl"
            >
              Explore More Alternatives
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-teal-500/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded">
                  Stay Alternative
                </span>
                <span className="text-xs text-slate-400">Sunset Sands Boutique Stay</span>
              </div>
              <p className="text-xs text-slate-300">Swapped from Oceanview Resort • Same beach vicinity</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-teal-400">+₹8,500 Saved</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-teal-500/30 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-500/15 px-2 py-0.5 rounded">
                  Tour Alternative
                </span>
                <span className="text-xs text-slate-400">Heritage Catamaran Island Tour</span>
              </div>
              <p className="text-xs text-slate-300">Swapped from Private Yacht Cruise • Certified guides included</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-teal-400">+₹8,800 Saved</span>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
