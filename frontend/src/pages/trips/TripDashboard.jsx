import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, ArrowUpRight, CalendarDays, CheckCircle2,
  ChevronRight, Clock3, CloudRain, CloudSun, MapPin, ReceiptText,
  Sun, Users, Vote, Wallet
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
    : parsedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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

function SectionHeading({ icon: Icon, title, subtitle, link, linkLabel }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100/80 text-teal-800">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {link && (
        <Link to={link} className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900">
          {linkLabel || 'View details'} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function EmptyPanel({ children, link, linkLabel }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-6 text-center">
      <p className="text-sm text-slate-600">{children}</p>
      {link && (
        <Link to={link} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900">
          {linkLabel} <ArrowUpRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

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
    if (!trip?.id) return undefined;
    let isMounted = true;

    setBudgetSummary(null);
    setBudgetError(false);
    setExpenses(null);
    setExpensesError(false);
    setWeatherSummary(null);
    setWeatherError(false);
    setItineraryDays(null);
    setItineraryError(false);
    setPolls(null);
    setPollsError(false);
    setActivities(null);
    setActivitiesError(false);

    const loadDashboard = async () => {
      const results = await Promise.allSettled([
        budgetService.getBudget(trip.id),
        expenseService.getExpenses(trip.id),
        api.get(`/trips/${trip.id}/weather`),
        itineraryService.getItinerary(trip.id),
        pollService.getTripPolls(trip.id),
        api.get(`/trips/${trip.id}/activities`)
      ]);
      if (!isMounted) return;

      const [budgetResult, expensesResult, weatherResult, itineraryResult, pollsResult, activitiesResult] = results;
      if (budgetResult.status === 'fulfilled') setBudgetSummary(budgetResult.value || null);
      else {
        console.error('Dashboard: error loading budget summary', budgetResult.reason);
        setBudgetError(true);
      }
      if (expensesResult.status === 'fulfilled') setExpenses(expensesResult.value || []);
      else {
        console.error('Dashboard: error loading trip expenses', expensesResult.reason);
        setExpensesError(true);
      }
      if (weatherResult.status === 'fulfilled') {
        const summary = weatherResult.value.data?.data?.weather || null;
        setWeatherSummary(summary);
        if (summary?.currentTemperature == null || !Number.isFinite(Number(summary.currentTemperature))) {
          setWeatherError(true);
        }
      } else {
        console.error('Dashboard: error loading weather forecast', weatherResult.reason);
        setWeatherError(true);
      }
      if (itineraryResult.status === 'fulfilled') setItineraryDays(itineraryResult.value?.days || []);
      else {
        console.error('Dashboard: error loading itinerary', itineraryResult.reason);
        setItineraryError(true);
      }
      if (pollsResult.status === 'fulfilled') setPolls(pollsResult.value || []);
      else {
        console.error('Dashboard: error loading trip polls', pollsResult.reason);
        setPollsError(true);
      }
      if (activitiesResult.status === 'fulfilled') setActivities(activitiesResult.value.data?.data || []);
      else {
        console.error('Dashboard: error loading recent trip activity', activitiesResult.reason);
        setActivitiesError(true);
      }
    };

    loadDashboard();
    return () => { isMounted = false; };
  }, [trip?.id]);

  const tripMembers = trip?.members || [];
  const tripBudget = trip?.budget == null ? null : Number(trip.budget);
  const recordedSpend = useMemo(() => {
    if (!expenses) return null;
    return expenses
      .filter((expense) => !['REJECTED', 'DISPUTED'].includes(expense.status))
      .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  }, [expenses]);
  const remainingBudget = tripBudget != null && recordedSpend != null ? tripBudget - recordedSpend : null;
  const budgetPercent = tripBudget > 0 && recordedSpend != null ? (recordedSpend / tripBudget) * 100 : null;
  const progressWidth = Math.min(100, Math.max(0, budgetPercent || 0));
  const budgetIsTight = budgetPercent != null && budgetPercent >= 85;
  const nextPlan = useMemo(() => getCurrentOrNextPlan(itineraryDays), [itineraryDays]);
  const featuredPoll = polls?.find((poll) => !poll.isLocked) || polls?.[0] || null;
  const leadingOptions = featuredPoll?.options
    ? [...featuredPoll.options].sort((first, second) => (second.votesCount || 0) - (first.votesCount || 0)).slice(0, 2)
    : [];
  const dateRange = [formatTripDate(trip?.startDate), formatTripDate(trip?.endDate)].filter(Boolean).join(' — ');
  const hasCurrentWeather = weatherSummary?.currentTemperature != null
    && Number.isFinite(Number(weatherSummary.currentTemperature));

  if (!trip) return null;

  return (
    <PageTransition variant="fade" className="space-y-5 pb-8">
      <Reveal width="100%">
        <section className="group relative h-56 overflow-hidden rounded-3xl shadow-xl sm:h-60 lg:h-64">
          <ParallaxImage
            src={trip.image || getDestinationImage(trip.destination)}
            alt={trip.destination}
            className="h-full w-full"
            imgClassName="h-full w-full"
            offset={35}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/45 to-slate-900/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-end md:p-8">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-amber-200/40 bg-amber-300/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900">
                  {trip.status || 'Trip'}
                </span>
                {isTripAdmin && (
                  <span className="rounded-full border border-white/25 bg-slate-950/35 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    Trip admin
                  </span>
                )}
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-md sm:text-5xl lg:text-6xl"
              >
                {trip.destination}
              </motion.h1>
              {dateRange && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/95 px-4 py-2 text-sm font-bold text-teal-950 shadow-lg shadow-slate-950/15">
                  <CalendarDays className="h-4 w-4 shrink-0 text-teal-700" />
                  <span>{dateRange}</span>
                </p>
              )}
            </div>
            <Link
              to={`/trips/${trip.id}/members`}
              className="flex items-center gap-3 self-start rounded-2xl border border-white/25 bg-slate-950/35 px-4 py-3 text-white backdrop-blur-md transition-colors hover:bg-slate-950/55 sm:self-auto"
            >
              <Users className="h-5 w-5 text-teal-200" />
              <span>
                <span className="block text-xs text-white/70">Travelers</span>
                <span className="font-bold">{tripMembers.length}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-white/70" />
            </Link>
          </div>
        </section>
      </Reveal>

      {isTripAdmin && budgetIsTight && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700" />
          <p className="flex-1 text-sm">
            Recorded expenses have reached {Math.round(budgetPercent)}% of the trip budget.
          </p>
          <Link to={`/trips/${trip.id}/alternatives`} className="text-sm font-bold underline underline-offset-4">
            Explore alternatives
          </Link>
        </motion.div>
      )}

      <Reveal delay={0.08} width="100%">
        <section className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/80 to-emerald-50/80 p-5 shadow-sm md:p-6">
          <SectionHeading
            icon={Wallet}
            title="Budget status"
            subtitle="Trip budget and expenses recorded by your group"
            link={`/trips/${trip.id}/budget`}
            linkLabel="Budget details"
          />
          {budgetError || expensesError ? (
            <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Some budget figures could not be loaded. Please refresh or open the budget page.
            </p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { title: 'Total budget', value: tripBudget, icon: Wallet, tone: 'teal' },
              { title: 'Recorded spend', value: recordedSpend, icon: ReceiptText, tone: 'rose' },
              { title: 'Remaining', value: remainingBudget, icon: CheckCircle2, tone: remainingBudget != null && remainingBudget < 0 ? 'rose' : 'green' },
              { title: 'Saved hidden costs', value: budgetSummary?.hiddenCosts ?? null, icon: AlertTriangle, tone: 'amber' },
              { title: 'Budget used', value: null, icon: null, tone: budgetIsTight ? 'amber' : 'teal' }
            ].map(({ title, value, icon: Icon, tone }, index) => {
              const tones = {
                teal: 'border-teal-100 bg-teal-50 text-teal-800',
                rose: 'border-rose-100 bg-rose-50 text-rose-800',
                green: 'border-emerald-100 bg-emerald-50 text-emerald-800',
                amber: 'border-amber-100 bg-amber-50 text-amber-800'
              };
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + index * 0.06 }}
                  whileHover={{ y: -3 }}
                  className={`rounded-2xl border p-3 transition-shadow hover:shadow-md ${tones[tone]}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium opacity-75">{title}</span>
                    {Icon && <Icon className="h-5 w-5 shrink-0 opacity-80" />}
                  </div>
                  {title === 'Budget used' ? (
                    <>
                      <p className="mb-2 text-xl font-bold tracking-tight">
                        {budgetPercent == null ? '—' : `${Math.round(budgetPercent)}%`}
                      </p>
                      <div className="h-2 overflow-hidden rounded-full bg-white/80">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressWidth}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${budgetIsTight ? 'bg-gradient-to-r from-amber-400 to-rose-500' : 'bg-gradient-to-r from-teal-600 to-emerald-400'}`}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-xl font-bold tracking-tight">
                      {value == null ? '—' : (
                      <AnimatedNumber
                        value={Math.abs(Number(value))}
                        prefix={title === 'Remaining' && Number(value) < 0 ? '−₹' : '₹'}
                        delay={0.2 + index * 0.08}
                      />
                      )}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Reveal delay={0.14} width="100%">
            <Link to={`/trips/${trip.id}/weather`} className="group block">
              <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-teal-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:p-6">
                <div className="pointer-events-none absolute -bottom-12 -right-6 text-sky-200/50 transition-transform duration-500 group-hover:scale-110">
                  <Sun className="h-40 w-40" />
                </div>
                <div className="relative z-10">
                  <SectionHeading
                    icon={CloudSun}
                    title="Weather"
                    subtitle={weatherSummary ? `Current weather in ${weatherSummary.destination}` : `Live forecast for ${trip.destination}`}
                    link={`/trips/${trip.id}/weather`}
                    linkLabel="Detailed forecast"
                  />
                  {hasCurrentWeather ? (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <div className="flex items-center gap-3">
                        <CloudSun className="h-12 w-12 text-amber-500" />
                        <span className="text-5xl font-bold tracking-tight text-slate-800">
                          {Math.round(weatherSummary.currentTemperature)}°
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">{weatherSummary.currentCondition}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" /> {weatherSummary.destination}
                        </p>
                      </div>
                      {weatherSummary.currentFeelsLike != null && (
                        <p className="text-sm text-slate-600">Feels like {Math.round(weatherSummary.currentFeelsLike)}°</p>
                      )}
                      {weatherSummary.humidity != null && (
                        <p className="text-sm text-slate-600">Humidity {Math.round(weatherSummary.humidity)}%</p>
                      )}
                    </div>
                  ) : (
                    <p className={`rounded-xl px-4 py-3 text-sm ${weatherError ? 'bg-amber-50 text-amber-800' : 'bg-white/70 text-slate-600'}`}>
                      {weatherError ? 'Live forecast is unavailable right now. Open Weather to retry.' : 'Loading live weather data…'}
                    </p>
                  )}
                  {weatherSummary?.forecastNote && (
                    <p className="mt-3 text-xs text-slate-500">{weatherSummary.forecastNote}</p>
                  )}
                </div>
              </section>
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Reveal delay={0.2} width="100%">
              <section className="h-full rounded-3xl border border-violet-100 bg-gradient-to-br from-white via-violet-50 to-fuchsia-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <SectionHeading
                  icon={Vote}
                  title="Group voting"
                  subtitle="Decide together, travel better"
                  link={`/trips/${trip.id}/voting`}
                  linkLabel="View all"
                />
                {pollsError ? (
                  <EmptyPanel link={`/trips/${trip.id}/voting`} linkLabel="Open voting">
                    Poll information could not be loaded.
                  </EmptyPanel>
                ) : featuredPoll ? (
                  <div className="rounded-2xl border border-violet-100 bg-white/80 p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-800">{featuredPoll.title}</p>
                      <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-800">
                        {featuredPoll.isLocked ? 'Closed' : 'Open'}
                      </span>
                    </div>
                    <p className="mb-3 text-xs text-slate-500">
                      {Number(featuredPoll.totalVotes) || 0} {Number(featuredPoll.totalVotes) === 1 ? 'vote' : 'votes'} recorded
                    </p>
                    <div className="space-y-2">
                      {leadingOptions.map((option) => (
                        <div key={option.id} className="flex items-center justify-between gap-3 rounded-xl bg-violet-50/70 px-3 py-2 text-sm">
                          <span className="truncate font-medium text-slate-700">{option.text}</span>
                          <span className="shrink-0 text-xs font-bold text-violet-800">{option.votesCount || 0}</span>
                        </div>
                      ))}
                    </div>
                    <Link to={`/trips/${trip.id}/voting`} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 to-fuchsia-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                      {featuredPoll.hasVoted ? 'View poll results' : featuredPoll.isLocked ? 'View poll' : 'Cast your vote'}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <EmptyPanel link={`/trips/${trip.id}/voting`} linkLabel="Create or view polls">
                    {polls ? 'No polls have been created for this trip yet.' : 'Loading saved polls…'}
                  </EmptyPanel>
                )}
              </section>
            </Reveal>

            <Reveal delay={0.26} width="100%">
              <section className="h-full rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-orange-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <SectionHeading
                  icon={CalendarDays}
                  title="Itinerary"
                  subtitle="Your saved trip plan"
                  link={`/trips/${trip.id}/itinerary`}
                  linkLabel="Full itinerary"
                />
                {itineraryError ? (
                  <EmptyPanel link={`/trips/${trip.id}/itinerary`} linkLabel="Open itinerary">
                    The saved itinerary could not be loaded.
                  </EmptyPanel>
                ) : nextPlan ? (
                  <div className="rounded-2xl border border-amber-100 bg-white/80 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-800">
                      Day {nextPlan.dayNumber ?? '—'}{formatTripDate(nextPlan.date) ? ` · ${formatTripDate(nextPlan.date)}` : ''}
                    </p>
                    <div className="space-y-2">
                      {nextPlan.activities.slice(0, 2).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 rounded-xl bg-amber-50/70 p-3">
                          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">{activity.title}</p>
                            <p className="text-xs text-slate-500">
                              {[activity.time, activity.location].filter(Boolean).join(' · ') || activity.category || 'Planned activity'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyPanel link={`/trips/${trip.id}/itinerary`} linkLabel="Plan your itinerary">
                    {itineraryDays ? 'No activities have been added to this trip yet.' : 'Loading saved itinerary…'}
                  </EmptyPanel>
                )}
              </section>
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.22} direction="right" width="100%">
          <section className="h-full overflow-hidden rounded-3xl border border-teal-100 bg-white/90 shadow-sm">
            <SectionHeading
              icon={Activity}
              title="Recent activity"
              subtitle="Updates recorded for this trip"
            />
            {activitiesError ? (
              <div className="px-5 pb-5">
                <EmptyPanel>Recent trip activity could not be loaded.</EmptyPanel>
              </div>
            ) : activities?.length ? (
              <div className="divide-y divide-slate-100 px-5">
                {activities.slice(0, 6).map((activity, index) => (
                  <motion.article
                    key={activity.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    className="flex gap-3 py-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-sky-100 text-sm font-bold text-teal-900">
                      {(activity.userName || '?').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-slate-700">
                        {activity.description || `${activity.userName || 'A trip member'} ${String(activity.action || 'updated').toLowerCase().replaceAll('_', ' ')}`}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">{formatRelativeTime(activity.createdAt)}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="px-5 pb-5">
                <EmptyPanel>
                  {activities ? 'No trip activity has been recorded yet.' : 'Loading saved activity…'}
                </EmptyPanel>
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </PageTransition>
  );
}
