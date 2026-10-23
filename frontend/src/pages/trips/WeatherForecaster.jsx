import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../../context/TripContext';
import api from '../../services/api';
import { CloudRain, Sun, Cloud, CloudSun, CloudLightning, Snowflake, Wind, Thermometer, AlertTriangle, ArrowRight, Map, RefreshCw, Sparkles, Check, CalendarDays } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { itineraryService } from '../../services/itineraryService';

const iconMap = {
  'sun': { icon: Sun, color: 'text-amber-500' },
  'cloud-sun': { icon: CloudSun, color: 'text-sky-500' },
  'cloud': { icon: Cloud, color: 'text-muted' },
  'cloud-rain': { icon: CloudRain, color: 'text-blue-500' },
  'cloud-lightning': { icon: CloudLightning, color: 'text-purple-500' },
  'snowflake': { icon: Snowflake, color: 'text-cyan-500' }
};

export default function WeatherForecaster() {
  const { trip } = useTrip();
  const [weatherData, setWeatherData] = useState(null);
  const [dailyForecasts, setDailyForecasts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [weatherError, setWeatherError] = useState('');
  const [actionError, setActionError] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);
  const [weatherBackup, setWeatherBackup] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!trip?.id) {
      setWeatherError('Select a trip to view its weather forecast.');
      setIsLoading(false);
      return () => { isMounted = false; };
    }

    const fetchWeather = async () => {
      setIsLoading(true);
      setWeatherError('');
      setWeatherData(null);
      setDailyForecasts([]);
      try {
        const response = await api.get(`/trips/${trip.id}/weather`);
        if (!response.data?.data?.weather) {
          throw new Error('The weather service returned an empty forecast.');
        }
        if (isMounted) {
          const w = response.data.data.weather;
          setWeatherData(w);
          
          const forecasts = (w.dailyForecasts || []).map((f) => {
            const [year, month, dayOfMonth] = f.date.split('-').map(Number);
            const dateObj = new Date(year, month - 1, dayOfMonth);
            const dayName = isNaN(dateObj.getTime()) ? f.date : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const mapping = iconMap[f.icon] || { icon: Sun, color: 'text-amber-500' };
            return {
              date: f.date,
              day: dayName,
              temp: Math.round(f.tempMax ?? w.currentTemperature),
              tempMin: Math.round(f.tempMin ?? w.currentTemperature),
              condition: f.condition || 'Clear',
              rainProbability: f.rainProbability ?? 0,
              icon: mapping.icon,
              color: mapping.color,
              alert: (f.rainProbability || 0) >= 60
            };
          });

          setDailyForecasts(forecasts);
          if (forecasts.length > 0) {
            const selected = forecasts.find(f => f.alert) || forecasts[0];
            setSelectedDate(selected.date);
            setIsResolved(weatherBackup?.tripId === trip.id && weatherBackup.date === selected.date);
          } else {
            setSelectedDate(null);
            setIsResolved(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch live weather forecast:', error);
        if (isMounted) {
          setWeatherError(error.response?.data?.message || error.message || 'Could not load the live weather forecast.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWeather();

    return () => { isMounted = false; };
  }, [trip?.id, refreshToken]);

  const selectedForecast = dailyForecasts.find(f => f.date === selectedDate) || dailyForecasts[0];
  const selectedConflict = weatherData?.weatherConflicts?.find(conflict => conflict.date === selectedForecast?.date) || null;

  const handleFixConflict = async () => {
    setIsFixing(true);
    setActionError('');
    try {
      if (weatherBackup?.tripId === trip.id && weatherBackup.date === selectedForecast?.date) {
        setIsResolved(true);
        return;
      }
      if (!selectedConflict?.itineraryDayId) {
        throw new Error('Add an itinerary day for this date before saving an indoor backup.');
      }
      const savedActivity = await itineraryService.addActivity(trip.id, {
        dayId: selectedConflict.itineraryDayId,
        time: '11:00 AM',
        title: 'Indoor weather backup: Cultural Museum',
        category: 'Indoor Activity',
        location: weatherData?.destination || trip.destination,
        estimatedCost: selectedConflict?.budgetImpact ?? 0,
        duration: '2 hrs',
        isOutdoor: false
      });
      if (!savedActivity?.id) {
        throw new Error('The indoor backup may not have been saved. Refresh your itinerary before trying again.');
      }
      setWeatherBackup({ tripId: trip.id, date: selectedForecast.date, activityId: savedActivity.id });
      setIsResolved(true);
    } catch (error) {
      console.error('Failed to add an indoor weather backup:', error);
      setActionError(error.response?.data?.message || error.message || 'Could not add the indoor backup to your itinerary.');
    } finally {
      setIsFixing(false);
    }
  };

  const handleUndoWeatherBackup = async () => {
    if (!weatherBackup?.activityId || weatherBackup.tripId !== trip.id) {
      setIsResolved(false);
      return;
    }
    setIsFixing(true);
    setActionError('');
    try {
      await itineraryService.deleteActivity(trip.id, weatherBackup.activityId);
      setWeatherBackup(null);
      setIsResolved(false);
    } catch (error) {
      console.error('Failed to remove the indoor weather backup:', error);
      setActionError(error.response?.data?.message || error.message || 'Could not remove the indoor backup from your itinerary.');
    } finally {
      setIsFixing(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto py-16 text-center text-teal flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <p className="text-muted font-medium">Fetching live weather for your trip destination...</p>
      </motion.div>
    );
  }

  return (
    <PageTransition variant="slideUp" className="max-w-6xl mx-auto space-y-8 pb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123F52] via-[#17645F] to-[#477E72] p-6 text-white shadow-travel-md md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-cyan-100/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-emerald-200/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/15 text-emerald-100 rounded-xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-white">Weather Forecaster</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/15 text-emerald-100 rounded-full border border-white/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {weatherData?.forecastSource || 'Live forecast'}
              </span>
            </div>
            <p className="text-white/75 mt-1">Forecast for <strong className="text-white">{weatherData?.destination || trip?.destination}</strong></p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshToken(value => value + 1)}
          className="gap-2 rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4" /> Refresh forecast
        </Button>
        </div>
      </div>

      {weatherError && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-5 text-rose-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">{weatherError}</p>
          <Button variant="outline" size="sm" onClick={() => setRefreshToken(value => value + 1)} className="gap-2 border-rose-200 bg-white text-rose-800 hover:bg-rose-100">
            <RefreshCw className="w-4 h-4" /> Try again
          </Button>
        </motion.div>
      )}

      {weatherData?.forecastNote && (
        <p className="flex items-center gap-2 rounded-xl border border-sky-100 bg-gradient-to-r from-sky-50 to-teal-50 px-4 py-3 text-sm text-slate-700">
          <CalendarDays className="h-4 w-4 shrink-0 text-teal-700" />
          {weatherData.forecastNote}
        </p>
      )}

      {!weatherError && dailyForecasts.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-700">
          There are no forecast days available for this trip yet.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Forecast & Selector */}
        <div className="lg:col-span-2 space-y-6">
          <Card glass hoverLift className="p-6 border-slate-200 bg-gradient-to-br from-[#F2F7F8] via-[#E9F2F0] to-[#F5EDF0] shadow-travel transition-shadow hover:shadow-travel-md">
            <h2 className="text-xl font-bold text-charcoal mb-6">Trip Weather Forecast</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {dailyForecasts.map((day) => {
                const Icon = day.icon;
                const isSelected = selectedDate === day.date;
                return (
                  <motion.button
                    key={day.date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(day.date);
                      setIsResolved(weatherBackup?.tripId === trip.id && weatherBackup.date === day.date);
                      setActionError('');
                    }}
                    whileHover={{ y: -5, scale: 1.025 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex flex-col items-center p-4 rounded-2xl min-w-[100px] border transition-all duration-300 relative ${
                      isSelected 
                        ? 'bg-gradient-to-br from-[#174D59] to-[#248274] border-teal-700 text-white shadow-lg shadow-teal-900/20'
                        : 'bg-gradient-to-br from-white to-[#EEF4F2] border-slate-200 hover:border-teal-400 hover:shadow-md'
                    }`}
                  >
                    <span className={`text-sm font-medium mb-2 ${isSelected ? 'text-white/75' : 'text-muted'}`}>{day.day}</span>
                    <Icon className={`w-8 h-8 mb-3 ${isSelected ? 'text-emerald-100' : day.color}`} />
                    <span className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-charcoal'}`}>{day.temp}°</span>
                    <span className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-muted'}`}>{day.tempMin}° min</span>
                    {day.alert && (
                      <div className="mt-2 w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-3 right-3 animate-pulse" title="High rain probability" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>

          {/* Conflict Detection UI */}
          <AnimatePresence mode="wait">
            {selectedForecast?.alert && !isResolved && (
              <motion.div
                key="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="p-0 border-amber-200 overflow-hidden bg-gradient-to-br from-[#FFF7ED] via-white to-[#FCE8ED] shadow-travel-md">
                  <div className="bg-gradient-to-r from-amber-100/80 to-rose-100/70 p-6 border-b border-amber-200/70 flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      <AlertTriangle className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-900 mb-1">Weather Conflict Detected</h3>
                      <p className="text-amber-900/80 text-sm">
                        High rain probability ({selectedForecast.rainProbability}%) predicted on {selectedForecast.day}, {selectedForecast.date}.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white">
                    <h4 className="font-bold text-charcoal mb-4">Affected Schedule</h4>
                    <div className="flex items-center justify-between p-4 bg-bg rounded-xl border border-muted/30 mb-6">
                      <div className="flex items-center gap-3">
                        <Map className="w-5 h-5 text-muted" />
                        <div>
                          <p className="font-medium text-charcoal">{selectedConflict?.activityTitle || 'Outdoor Exploration & Sightseeing'}</p>
                          <p className="text-xs text-muted">Outdoor Activity • Peak Hours</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wider px-2 py-1 bg-amber-100 rounded border border-amber-200">Rain Risk</span>
                    </div>

                    <h4 className="font-bold text-charcoal mb-4">Smart Weather Adjustment</h4>
                    <div className="flex flex-col md:flex-row gap-4 items-stretch mb-6">
                      <div className="flex-1 p-4 bg-white/70 rounded-xl border border-amber-200 opacity-70 relative overflow-hidden">
                        <div className="absolute inset-0 bg-bg/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                          <span className="text-golden font-bold rotate-[-15deg] text-lg border-2 border-golden px-3 py-1 rounded">RESCHEDULE</span>
                        </div>
                        <p className="font-medium text-charcoal line-through">{selectedConflict?.activityTitle || 'Outdoor Sightseeing'}</p>
                        <p className="text-sm text-muted line-through">Outdoor</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-teal" />
                      </div>
                      <div className="flex-1 p-4 bg-gradient-to-br from-teal-50 to-emerald-100 rounded-xl border border-teal-300 shadow-sm relative">
                        <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-teal-800 text-white px-2 py-0.5 rounded shadow">INDOOR BACKUP</span>
                        <p className="font-bold text-teal-900">Cultural Museum & Indoor Heritage Center</p>
                        <p className="text-sm text-teal-800/75">Added to itinerary as an optional backup</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-bg rounded-xl">
                      <div>
                        <p className="text-sm text-muted">Indoor Backup Cost</p>
                        <p className="text-lg font-bold text-teal">{selectedConflict?.budgetImpact ? `₹${selectedConflict.budgetImpact} estimated cost` : 'No cost estimate yet'}</p>
                      </div>
                      <Button onClick={handleFixConflict} isLoading={isFixing} disabled={!selectedConflict?.itineraryDayId || (weatherBackup?.tripId === trip.id && weatherBackup.date === selectedForecast.date)} className="w-full sm:w-auto bg-gradient-to-r from-[#145B55] to-[#248274] shadow-lg shadow-teal/20 text-white hover:shadow-teal/40">
                        {weatherBackup?.tripId === trip.id && weatherBackup.date === selectedForecast.date ? 'Backup added' : 'Add indoor backup'}
                      </Button>
                    </div>
                    {!selectedConflict?.itineraryDayId && <p className="mt-3 text-sm text-amber-900/80">Create an itinerary for this date to save an indoor backup.</p>}
                    {actionError && <p role="alert" className="mt-3 text-sm font-medium text-rose-700">{actionError}</p>}
                  </div>
                </Card>
              </motion.div>
            )}

            {isResolved && (
              <motion.div
                key="resolved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-[#E4F2ED] via-[#D5EBE2] to-[#F1E2E8] border border-teal/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center py-12 shadow-travel"
              >
                <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mb-4 shadow-lg shadow-teal/30">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal mb-2">Indoor Backup Added</h3>
                <p className="text-teal-700/80 max-w-md mx-auto mb-6">
                  An indoor weather backup was saved to your itinerary. Your original outdoor activity is unchanged.
                </p>
                {actionError && <p role="alert" className="mb-4 text-sm font-medium text-rose-700">{actionError}</p>}
                <Button variant="outline" isLoading={isFixing} className="border-teal text-teal hover:bg-teal hover:text-white transition-colors" onClick={handleUndoWeatherBackup}>
                  Undo Backup
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Daily Details */}
        <div className="space-y-6">
          <Card glass hoverLift className="p-6 h-full border-slate-200 bg-gradient-to-br from-[#F2F7F8] via-[#EEF4F1] to-[#F4EAF0] shadow-travel">
            <h3 className="text-lg font-bold text-charcoal mb-6">Daily Details for {selectedForecast?.day}</h3>
            
            <div className="flex flex-col items-center justify-center py-6 border-b border-muted/30 mb-6">
              {selectedForecast && <selectedForecast.icon className={`w-20 h-20 mb-4 ${selectedForecast.color}`} />}
              <span className="text-6xl font-bold text-charcoal mb-2">{selectedForecast?.temp}°C</span>
              <span className="text-lg font-medium text-muted">{selectedForecast?.condition}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-white/70 rounded-lg">
                <span className="text-muted">Precipitation Chance</span>
                <span className="font-semibold text-charcoal">{selectedForecast?.rainProbability}%</span>
              </div>
              <div className="flex justify-between p-3 bg-white/70 rounded-lg">
                <span className="text-muted">Current Wind Speed</span>
                <span className="font-semibold text-charcoal">{weatherData?.windSpeed ?? '—'} km/h</span>
              </div>
              <div className="flex justify-between p-3 bg-white/70 rounded-lg">
                <span className="text-muted">Current Temp</span>
                <span className="font-semibold text-teal">{weatherData?.currentTemperature ?? '—'}°C</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <p className="text-center text-xs text-muted">
        Weather data by{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="font-medium text-teal hover:underline">
          Open-Meteo
        </a>
        {' · Location data © '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="font-medium text-teal hover:underline">
          OpenStreetMap contributors
        </a>
      </p>
    </PageTransition>
  );
}
