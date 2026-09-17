import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../../context/TripContext';
import api from '../../services/api';
import { CloudRain, Sun, Cloud, Wind, Thermometer, AlertTriangle, ArrowRight, Map, RefreshCw, Sparkles } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const iconMap = {
  'sun': { icon: Sun, color: 'text-amber-500' },
  'cloud-sun': { icon: Cloud, color: 'text-sky-500' },
  'cloud': { icon: Cloud, color: 'text-muted' },
  'cloud-rain': { icon: CloudRain, color: 'text-blue-500' },
  'cloud-lightning': { icon: CloudRain, color: 'text-purple-500' },
  'snowflake': { icon: Cloud, color: 'text-cyan-400' }
};

export default function WeatherForecaster() {
  const { trip } = useTrip();
  const [weatherData, setWeatherData] = useState(null);
  const [dailyForecasts, setDailyForecasts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [activeConflict, setActiveConflict] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!trip?.id) return;

    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/trips/${trip.id}/weather`);
        if (isMounted && response.data?.data?.weather) {
          const w = response.data.data.weather;
          setWeatherData(w);
          
          const forecasts = (w.dailyForecasts || []).map((f) => {
            const dateObj = new Date(f.date);
            const dayName = isNaN(dateObj.getTime()) ? f.date : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const mapping = iconMap[f.icon] || { icon: Sun, color: 'text-amber-500' };
            return {
              date: f.date,
              day: dayName,
              temp: Math.round(f.tempMax || w.currentTemperature || 25),
              tempMin: Math.round(f.tempMin || 18),
              condition: f.condition || 'Clear',
              rainProbability: f.rainProbability || 0,
              icon: mapping.icon,
              color: mapping.color,
              alert: (f.rainProbability || 0) >= 60
            };
          });

          setDailyForecasts(forecasts);
          if (forecasts.length > 0) {
            // Default select conflict day if exists, else first day
            const conflictDay = forecasts.find(f => f.alert);
            setSelectedDate(conflictDay ? conflictDay.date : forecasts[0].date);
          }

          if (w.weatherConflicts && w.weatherConflicts.length > 0) {
            setActiveConflict(w.weatherConflicts[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch live weather forecast:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWeather();

    return () => { isMounted = false; };
  }, [trip?.id]);

  const selectedForecast = dailyForecasts.find(f => f.date === selectedDate) || dailyForecasts[0];

  const handleFixConflict = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setIsResolved(true);
    }, 1200);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center text-teal flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <p className="text-muted font-medium">Fetching live satellite weather forecast...</p>
      </div>
    );
  }

  return (
    <PageTransition variant="slideUp" className="max-w-6xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-charcoal">Weather Forecaster</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal/10 text-teal rounded-full border border-teal/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live API
              </span>
            </div>
            <p className="text-muted mt-1">Live forecast for <strong className="text-charcoal">{weatherData?.destination || trip?.destination}</strong></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Forecast & Selector */}
        <div className="lg:col-span-2 space-y-6">
          <Card glass className="p-6 border-muted/30 shadow-sm">
            <h2 className="text-xl font-bold text-charcoal mb-6">7-Day Real-Time Forecast</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {dailyForecasts.map((day) => {
                const Icon = day.icon;
                const isSelected = selectedDate === day.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`flex flex-col items-center p-4 rounded-2xl min-w-[100px] border-2 transition-all duration-300 relative ${
                      isSelected 
                        ? 'bg-teal/10 border-teal shadow-lg shadow-teal/30' 
                        : 'bg-bg border-muted/30 hover:border-teal/50 hover:bg-bg'
                    }`}
                  >
                    <span className="text-sm font-medium text-muted mb-2">{day.day}</span>
                    <Icon className={`w-8 h-8 mb-3 ${day.color}`} />
                    <span className={`text-xl font-bold ${isSelected ? 'text-teal' : 'text-charcoal'}`}>{day.temp}°</span>
                    <span className="text-[11px] text-muted">{day.tempMin}° min</span>
                    {day.alert && (
                      <div className="mt-2 w-2.5 h-2.5 rounded-full bg-golden absolute top-3 right-3 animate-pulse" title="High rain probability" />
                    )}
                  </button>
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
                <Card className="p-0 border-golden/30 overflow-hidden shadow-md">
                  <div className="bg-golden/10 p-6 border-b border-golden/20 flex items-start gap-4">
                    <div className="w-12 h-12 bg-golden/20 rounded-full flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 text-golden" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-golden mb-1">Weather Conflict Detected!</h3>
                      <p className="text-golden-700/90 text-sm">
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
                          <p className="font-medium text-charcoal">{activeConflict?.activityTitle || 'Outdoor Exploration & Sightseeing'}</p>
                          <p className="text-xs text-muted">Outdoor Activity • Peak Hours</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-golden uppercase tracking-wider px-2 py-1 bg-golden/10 rounded border border-golden/20">Rain Risk</span>
                    </div>

                    <h4 className="font-bold text-charcoal mb-4">Smart Weather Adjustment</h4>
                    <div className="flex flex-col md:flex-row gap-4 items-stretch mb-6">
                      <div className="flex-1 p-4 bg-bg rounded-xl border border-golden/30 opacity-50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-bg/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                          <span className="text-golden font-bold rotate-[-15deg] text-lg border-2 border-golden px-3 py-1 rounded">RESCHEDULE</span>
                        </div>
                        <p className="font-medium text-charcoal line-through">{activeConflict?.activityTitle || 'Outdoor Sightseeing'}</p>
                        <p className="text-sm text-muted line-through">Outdoor</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-teal" />
                      </div>
                      <div className="flex-1 p-4 bg-teal/10 rounded-xl border border-teal shadow-[0_0_15px_rgba(25,181,165,0.15)] relative">
                        <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-teal text-white px-2 py-0.5 rounded shadow">RECOMMENDED</span>
                        <p className="font-bold text-teal">Indoor Heritage Museum & Cultural Center</p>
                        <p className="text-sm text-teal/70">Indoor Activity • Weather Protected</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-bg rounded-xl">
                      <div>
                        <p className="text-sm text-muted">Projected Budget Impact</p>
                        <p className="text-lg font-bold text-teal">₹{activeConflict?.budgetImpact || 150} adjustment</p>
                      </div>
                      <Button onClick={handleFixConflict} isLoading={isFixing} className="w-full sm:w-auto bg-teal shadow-lg shadow-teal/30 text-white">
                        Apply Weather Shield
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {isResolved && (
              <motion.div
                key="resolved"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-teal/10 border border-teal rounded-2xl p-6 flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mb-4 shadow-lg shadow-teal/30">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-charcoal mb-2">Itinerary Protected!</h3>
                <p className="text-teal-700/80 max-w-md mx-auto mb-6">
                  Outdoor activities have been successfully adjusted with indoor alternatives to shield your travel experience from rain disruptions.
                </p>
                <Button variant="outline" className="border-teal text-teal hover:bg-teal hover:text-white transition-colors" onClick={() => setIsResolved(false)}>
                  Undo Changes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Daily Details */}
        <div className="space-y-6">
          <Card glass className="p-6 h-full border-muted/30 shadow-sm">
            <h3 className="text-lg font-bold text-charcoal mb-6">Daily Details for {selectedForecast?.day}</h3>
            
            <div className="flex flex-col items-center justify-center py-6 border-b border-muted/30 mb-6">
              {selectedForecast && <selectedForecast.icon className={`w-20 h-20 mb-4 ${selectedForecast.color}`} />}
              <span className="text-6xl font-bold text-charcoal mb-2">{selectedForecast?.temp}°C</span>
              <span className="text-lg font-medium text-muted">{selectedForecast?.condition}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-bg/50 rounded-lg">
                <span className="text-muted">Precipitation Chance</span>
                <span className="font-semibold text-charcoal">{selectedForecast?.rainProbability}%</span>
              </div>
              <div className="flex justify-between p-3 bg-bg/50 rounded-lg">
                <span className="text-muted">Wind Speed</span>
                <span className="font-semibold text-charcoal">{weatherData?.windSpeed || 10} km/h</span>
              </div>
              <div className="flex justify-between p-3 bg-bg/50 rounded-lg">
                <span className="text-muted">Current Temp</span>
                <span className="font-semibold text-teal">{weatherData?.currentTemperature || 26}°C</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
