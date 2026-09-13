import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { motion } from 'framer-motion';
import { Wallet, AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';
import AnimatedNumber from '../../components/animations/AnimatedNumber';
import BudgetRescueWarning from '../../components/modules/budget/BudgetRescueWarning';

const COLORS = ['#19B5A5', '#FF8066', '#3b82f6', '#8b5cf6', '#eab308'];

const mockExpenseBreakdown = [
  { name: 'Transport', value: 45000 },
  { name: 'Hotel', value: 35000 },
  { name: 'Food', value: 20000 },
  { name: 'Activities', value: 15000 },
  { name: 'Hidden/Other', value: 5000 }
];

const mockHiddenCosts = [
  { name: 'Airport Transfer (est.)', amount: 2500, type: 'Estimated' },
  { name: 'City Tax / Resort Fee', amount: 1200, type: 'Known' },
  { name: 'Local Transport Buffer', amount: 3000, type: 'Estimated' },
  { name: 'Emergency Buffer', amount: 5000, type: 'Unavailable' }
];

export default function BudgetAffordability() {
  const { trip } = useTrip();
  
  const tripBudget = trip.budget || trip.totalBudget || 0;
  const currentTotal = mockExpenseBreakdown.reduce((acc, curr) => acc + curr.value, 0);
  const remaining = tripBudget - currentTotal;
  
  // Forcing "Over Budget" for demo of Budget Rescue
  const status = 'Over Budget'; // remaining > 15000 ? 'Within Budget' : remaining > 0 ? 'Budget Tight' : 'Over Budget';
  
  const statusColor = status === 'Within Budget' ? 'text-teal' 
                    : status === 'Budget Tight' ? 'text-golden' 
                    : 'text-coral';

  return (
    <PageTransition variant="slideUp" className="max-w-6xl mx-auto space-y-8 pb-12">
      {status === 'Over Budget' && (
        <Reveal>
          <BudgetRescueWarning predictedOverage={Math.abs(remaining) + 6000} onRescue={() => alert("Initiating rescue...")} />
        </Reveal>
      )}
      
      <Reveal delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-charcoal">Budget Affordability</h1>
              <p className="text-muted mt-1">Track estimates, hidden costs, and find smart alternatives.</p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Reveal delay={0.15}>
          <Card glass className="p-6 flex flex-col border-muted/30 shadow-sm h-full">
            <h3 className="text-xl font-bold mb-6 text-charcoal tracking-tight">Expense Breakdown</h3>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockExpenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {mockExpenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'var(--color-muted)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: 'var(--color-primary)', fontWeight: 500 }}
                    formatter={(value) => `₹${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm text-muted font-medium">Total Est.</span>
                <span className="text-2xl font-bold text-charcoal tracking-tight">
                  ₹<AnimatedNumber value={currentTotal} delay={0.3} />
                </span>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 gap-4">
              {mockExpenseBreakdown.map((item, i) => (
                <motion.div 
                  key={item.name} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.3 }}
                  className="flex items-center gap-2 text-sm bg-bg p-2 rounded-lg border border-muted/30"
                >
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-muted font-medium">{item.name}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </Reveal>

        {/* Budget Status & Alternatives */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Reveal delay={0.2}>
            <Card glass className="p-6 border-muted/30 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-1 text-charcoal">Status: <span className={statusColor}>{status}</span></h3>
                  <p className="text-muted text-sm">Based on your selections and estimates</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted font-medium mb-1">Remaining Budget</p>
                  <p className={`text-3xl font-bold tracking-tight ${statusColor}`}>
                    ₹<AnimatedNumber value={remaining} delay={0.4} />
                  </p>
                </div>
              </div>

              {/* Smart Alternatives Trigger */}
              {status !== 'Within Budget' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-golden/10 border border-golden/30 rounded-2xl p-5 mb-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Sparkles className="w-32 h-32 text-golden" />
                  </div>
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-golden/20 text-golden flex items-center justify-center shrink-0 border border-golden/20">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-golden mb-1">Smart Alternative Available</h4>
                      <p className="text-sm text-yellow-700/90 mb-5 max-w-lg">You are approaching your budget limit. We found a highly-rated alternative hotel that saves you ₹8,500.</p>
                      
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">Current Choice</p>
                          <p className="font-bold text-golden">Oceanview Resort (₹35,000)</p>
                        </div>
                        <motion.div 
                          animate={{ x: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          className="w-10 h-10 rounded-full bg-bg flex items-center justify-center border border-muted/30 hidden sm:flex shrink-0"
                        >
                          <ArrowRight className="w-5 h-5 text-muted" />
                        </motion.div>
                        <div className="flex-1 text-center sm:text-left">
                          <p className="text-xs text-muted font-medium mb-1 uppercase tracking-wider">Alternative</p>
                          <p className="font-bold text-teal">Sunset Sands Hotel (₹26,500)</p>
                        </div>
                        <Button className="w-full sm:w-auto shrink-0 bg-golden text-charcoal hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 font-bold">
                          Use Alternative
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
          </Reveal>

          {/* Hidden Costs */}
          <Reveal delay={0.3}>
            <Card glass className="p-6 flex-1 border-muted/30 shadow-sm">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-charcoal">
                <ShieldAlert className="w-6 h-6 text-muted" /> Hidden & Forgotten Costs
              </h3>
              <p className="text-sm text-muted mb-6">These are estimated peripheral costs often forgotten during planning.</p>
              
              <div className="space-y-3">
                {mockHiddenCosts.map((cost, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-bg/50 rounded-xl border border-muted/50 hover:bg-bg transition-colors gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                        cost.type === 'Known' ? 'bg-teal/20 text-teal border border-teal/20' :
                        cost.type === 'Estimated' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' :
                        'bg-golden/20 text-golden border border-golden/20'
                      }`}>
                        {cost.type}
                      </span>
                      <span className="font-medium text-sm text-muted">{cost.name}</span>
                    </div>
                    <span className="font-bold text-charcoal tracking-tight">₹{cost.amount.toLocaleString()}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-5 border-t border-muted/30 flex justify-between items-center text-sm">
                <span className="text-muted font-medium">Total Hidden Buffers</span>
                <span className="font-bold text-lg text-golden tracking-tight">
                  ₹<AnimatedNumber value={11700} delay={0.6} />
                </span>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}
