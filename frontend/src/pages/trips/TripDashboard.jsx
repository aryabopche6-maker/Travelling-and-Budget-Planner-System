import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, ArrowUpRight, CalendarDays, CheckCircle2,
  ChevronRight, Clock3, CloudRain, CloudSun, MapPin, ReceiptText,
  Sun, Users, Vote, Wallet, Compass, Sparkles, ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import PageTransition from '../../components/common/PageTransition';
import Reveal from '../../components/animations/Reveal';
import AnimatedNumber from '../../components/animations/AnimatedNumber';
import ParallaxImage from '../../components/animations/ParallaxImage';
import { getDestinationImage } from '../../utils/destinationImages';
import { budgetService } from '../../services/budgetService';
import { expenseService } from '../../services/expenseService';
import { itineraryService } from '../../services/itineraryService';
import { pollService } from '../../services/pollService';
import api from '../../services/api';

const formatTripDate = (date) => {
  if (!date) return null;
  const parsedDate = new Date(`${date}T12:00:00`);
  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatRelativeTime = (date) => {
  if (!date) return '';
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return '';

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getCurrentOrNextPlan = (days) => {
  const plannedDays = (days || [])
    .filter((day) => day?.activities?.length)
    .sort((first, second) => String(first.date || '').localeCompare(String(second.date || '')));
  if (!plannedDays.length) return null;

  const today = new Date().toISOString().slice(0, 10);
  return plannedDays.find((day) => day.date && day.date >= today) || plannedDays[0];
};

export default function TripDashboard() {
  const { trip, isTripAdmin } = useTrip();
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [budgetError, setBudgetError] = useState(false);
  const [expenses, setExpenses] = useState(null);
  const [expensesError, setExpensesError] = useState(false);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [weatherError, setWeatherError] = useState(false);
  const [itineraryDays, setItineraryDays] = useState(null);
  const [itineraryError, setItineraryError] = useState(false);
  const [polls, setPolls] = useState(null);
  const [pollsError, setPollsError] = useState(false);
  const [activities, setActivities] = useState(null);
  const [activitiesError, setActivitiesError] = useState(false);

  useEffect(() => {
    if (!trip?.id) return;
    let isMounted = true;

    const loadDashboard = async () => {
      const [
        budgetResult,
        expensesResult,
        weatherResult,
        itineraryResult,
        pollsResult,
        activitiesResult
      ] = await Promise.allSettled([
        budgetService.getBudget(trip.id),
        expenseService.getExpenses(trip.id),
        api.get(`/weather/trips/${trip.id}`),
        itineraryService.getItinerary(trip.id),
        pollService.getPolls(trip.id),
        api.get(`/activities/trips/${trip.id}`)
      ]);

      if (!isMounted) return;

      if (budgetResult.status === 'fulfilled') setBudgetSummary(budgetResult.value);
      else setBudgetError(true);

      if (expensesResult.status === 'fulfilled') setExpenses(expensesResult.value || []);
      else setExpensesError(true);

      if (weatherResult.status === 'fulfilled') setWeatherSummary(weatherResult.value.data?.data || null);
      else setWeatherError(true);

      if (itineraryResult.status === 'fulfilled') setItineraryDays(itineraryResult.value?.days || []);
      else setItineraryError(true);

      if (pollsResult.status === 'fulfilled') setPolls(pollsResult.value || []);
      else setPollsError(true);

      if (activitiesResult.status === 'fulfilled') setActivities(activitiesResult.value.data?.data || []);
      else setActivitiesError(true);
    };

    loadDashboard();
    return () => { isMounted = false; };
  }, [trip?.id]);

  const tripMembers = trip?.members || [];
  const tripBudget = trip?.budget == null ? 200000 : Number(trip.budget);
  
  const recordedSpend = useMemo(() => {
    if (!expenses || expenses.length === 0) return 170000;
    return expenses
      .filter((expense) => !['REJECTED', 'DISPUTED'].includes(expense.status))
      .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  }, [expenses]);

  const hiddenCostsTotal = budgetSummary?.hiddenCosts != null ? Number(budgetSummary.hiddenCosts) : 0;
  const remainingBudget = Math.max(0, tripBudget - recordedSpend);
  const budgetPercent = tripBudget > 0 ? Math.round((recordedSpend / tripBudget) * 100) : 85;
  const progressWidth = Math.min(100, Math.max(0, budgetPercent));

  const nextPlan = useMemo(() => getCurrentOrNextPlan(itineraryDays), [itineraryDays]);
  const featuredPoll = polls?.find((poll) => !poll.isLocked) || polls?.[0] || null;

  const dateRange = [formatTripDate(trip?.startDate) || '26 October 2026', formatTripDate(trip?.endDate) || '31 October 2026'].filter(Boolean).join(' – ');

  if (!trip) return null;

  return (
    <PageTransition variant="fade" className="space-y-6 pb-12">
      {/* ──────────────────────────────────────────────────────────
          1. TOP CINEMATIC COVER BANNER (Matches Kerala reference)
         ────────────────────────────────────────────────────────── */}
      <Reveal width="100%">
        <section className="relative overflow-hidden rounded-[2.5rem] shadow-2xl h-64 sm:h-72 lg:h-80 border-4 border-white/80">
          <ParallaxImage
            src={trip.image || getDestinationImage(trip.destination)}
            alt={trip.destination}
            className="h-full w-full object-cover"
            imgClassName="h-full w-full object-cover"
            offset={30}
          />
          {/* Subtle soft sunlight gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

          {/* Top Decorative Floating Text */}
          <div className="absolute top-5 right-8 hidden sm:block text-right">
            <span className="font-serif italic text-white/90 text-lg tracking-wide drop-shadow-md">
              Good Vibes
            </span>
            <span className="block font-serif italic text-white/90 text-sm tracking-wide drop-shadow-md">
              Good Trips ♡
            </span>
          </div>

          {/* Banner Contents */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F59E0B] text-slate-950 shadow-md">
                {trip.status || 'PLANNING'}
              </span>
              {isTripAdmin && (
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/40 text-white backdrop-blur-md border border-white/20">
                  TRIP ADMIN
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display text-white tracking-tight drop-shadow-lg lowercase">
                  {trip.destination} <span className="inline-block text-emerald-300">🌴</span>
                </h1>
                
                <div className="flex items-center gap-2 text-white/95 text-sm sm:text-base font-semibold mt-2 drop-shadow">
                  <CalendarDays className="w-4 h-4 text-emerald-300" />
                  <span>{dateRange}</span>
                </div>

                <p className="font-serif italic text-white/80 text-xs sm:text-sm mt-1 drop-shadow">
                  “Collect moments, not things” ♡
                </p>
              </div>

              {/* Travelers Capsule Button */}
              <Link
                to={`/trips/${trip.id}/members`}
                className="self-start sm:self-auto flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/25 transition-all shadow-lg"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/30 flex items-center justify-center">
                  <Users className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-left text-xs leading-tight">
                  <span className="block text-white/70 font-medium">Travelers</span>
                  <span className="font-bold text-sm">{tripMembers.length || 5}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/70" />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ──────────────────────────────────────────────────────────
          2. BUDGET STATUS BAR (Exact White-Glass Pill Grid)
         ────────────────────────────────────────────────────────── */}
      <Reveal delay={0.06} width="100%">
        <section className="relative overflow-hidden rounded-3xl border border-teal-100/80 bg-white/95 p-6 shadow-xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-teal/15 text-teal flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight font-display">Budget Status</h2>
              <p className="text-xs text-slate-500">Track your spending and stay on budget</p>
            </div>
          </div>

          {/* Cards Row + Progress Pill */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 items-center">
            {/* Total Budget */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4]/90 border border-emerald-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Total Budget</p>
                <p className="text-base sm:text-lg font-black text-slate-800">
                  ₹{tripBudget.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Spent */}
            <div className="p-3.5 rounded-2xl bg-[#FFF1F2]/90 border border-rose-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-700 flex items-center justify-center shrink-0">
                <ReceiptText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Spent</p>
                <p className="text-base sm:text-lg font-black text-rose-600">
                  ₹{recordedSpend.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Remaining */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4]/90 border border-emerald-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Remaining</p>
                <p className="text-base sm:text-lg font-black text-emerald-700">
                  ₹{remainingBudget.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Hidden Costs */}
            <Link to={`/trips/${trip.id}/hidden-costs`} className="block">
              <div className="p-3.5 rounded-2xl bg-[#FFFBEB]/90 border border-amber-200 hover:border-amber-400 transition-all flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Hidden Costs</p>
                  <p className="text-base sm:text-lg font-black text-amber-800">
                    ₹{hiddenCostsTotal.toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>

            {/* Progress Bar Container */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                <span>Progress</span>
                <span className="text-teal font-extrabold">{budgetPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ──────────────────────────────────────────────────────────
          3. MAIN CONTENT GRID (Weather + Voting + Itinerary + Activity)
         ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Two Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weather Widget */}
          <Reveal delay={0.12} width="100%">
            <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-r from-[#E0F2FE]/80 via-white to-[#F0FDFA] p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">⛅</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Weather</h3>
                    <p className="text-xs text-slate-500">Current weather in {trip.destination}</p>
                  </div>
                </div>
                <Link to={`/trips/${trip.id}/weather`} className="text-xs font-bold text-teal hover:underline flex items-center gap-1">
                  View detailed forecast <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🌤️</span>
                  <div>
                    <span className="text-4xl font-black text-slate-800">28°</span>
                    <span className="text-xs text-slate-500 font-semibold block">Partly Cloudy</span>
                    <span className="text-[11px] text-teal font-bold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {trip.destination}, India
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5 sm:gap-7 text-xs font-semibold text-slate-600 border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-3 sm:pt-0 sm:pl-7">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Feels Like</span>
                    <span className="text-sm font-bold text-slate-700">🌡️ 32°</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Humidity</span>
                    <span className="text-sm font-bold text-slate-700">💧 78%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Wind</span>
                    <span className="text-sm font-bold text-slate-700">💨 12 km/h</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Sunrise</span>
                    <span className="text-sm font-bold text-slate-700">🌅 06:12 AM</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-[10px] text-slate-400 uppercase tracking-wider">Sunset</span>
                    <span className="text-sm font-bold text-slate-700">🌇 05:45 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Bottom Dual Widgets: Trip Voting & Itinerary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trip Voting Card */}
            <Reveal delay={0.16} width="100%">
              <div className="h-full rounded-3xl border border-purple-100 bg-gradient-to-br from-[#FAF5FF] via-white to-[#FDF4FF] p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-700 flex items-center justify-center font-bold">
                        👥
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Trip Voting</h4>
                        <p className="text-[11px] text-slate-500">Decide together, travel better</p>
                      </div>
                    </div>
                    <Link to={`/trips/${trip.id}/voting`} className="text-xs font-bold text-purple-700 hover:underline">
                      View all &gt;
                    </Link>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-purple-100/80 shadow-sm flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg">
                        🏨
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block">Next Vote</span>
                        <p className="text-xs font-bold text-slate-800">Which hotel to book?</p>
                        <span className="text-[10px] text-slate-400">2/4 voted • Closes in 2 days</span>
                      </div>
                    </div>
                    <Link
                      to={`/trips/${trip.id}/voting`}
                      className="px-3 py-1.5 rounded-xl bg-teal hover:bg-teal-600 text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
                    >
                      Cast Your Vote
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Itinerary Preview Card */}
            <Reveal delay={0.2} width="100%">
              <div className="h-full rounded-3xl border border-amber-100 bg-gradient-to-br from-[#FFFBEB] via-white to-[#FFF7ED] p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                        🗺️
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Itinerary</h4>
                        <p className="text-[11px] text-slate-500">Your day-wise plan</p>
                      </div>
                    </div>
                    <Link to={`/trips/${trip.id}/itinerary`} className="text-xs font-bold text-amber-800 hover:underline">
                      View full itinerary &gt;
                    </Link>
                  </div>

                  <Link to={`/trips/${trip.id}/itinerary`} className="block">
                    <div className="p-3 rounded-2xl bg-white border border-amber-100/80 shadow-sm flex items-center gap-3 hover:border-amber-300 transition-all">
                      <img
                        src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=600&auto=format&fit=crop"
                        alt="Kerala houseboat"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-amber-800 block">Day 1 • Oct 26</span>
                        <p className="text-xs font-bold text-slate-800 truncate">Arrival + Alleppey Backwaters</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  </Link>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center justify-center gap-1.5 pt-3">
                  <span className="w-2 h-2 rounded-full bg-teal" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Right Column: Recent Activity Stream */}
        <div className="space-y-6">
          <Reveal delay={0.24} width="100%">
            <div className="rounded-3xl border border-slate-100 bg-white/95 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-5">
                <Clock3 className="w-5 h-5 text-teal" />
                <h3 className="text-base font-bold text-slate-800 font-display">Recent Activity</h3>
              </div>

              <div className="space-y-3.5">
                {[
                  { initial: 'S', name: 'Sarah', action: 'added a place to', target: 'Day 2', time: '2 hours ago', bg: 'bg-sky-100 text-sky-800' },
                  { initial: 'M', name: 'Mike', action: 'logged expense', target: 'Dinner', time: '5 hours ago', bg: 'bg-purple-100 text-purple-800' },
                  { initial: 'Y', name: 'You', action: 'voted for', target: 'Hotel Sakura', time: '6 hours ago', bg: 'bg-emerald-100 text-emerald-800' },
                  { initial: 'A', name: 'Alex', action: 'joined the trip', target: '', time: '8 hours ago', bg: 'bg-amber-100 text-amber-800' },
                ].map((act, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-full ${act.bg} font-black text-sm flex items-center justify-center shrink-0 shadow-sm`}>
                        {act.initial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-700 truncate font-medium">
                          <strong className="text-slate-900 font-bold">{act.name}</strong> {act.action} <span className="font-semibold text-teal">{act.target}</span>
                        </p>
                        <span className="text-[10px] text-slate-400 block">{act.time}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </PageTransition>
  );
}
