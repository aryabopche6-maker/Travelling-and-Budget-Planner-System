import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../../context/TripContext';
import { CloudRain, Sun, Cloud, Wind, Thermometer, AlertTriangle, ArrowRight, Map, RefreshCw } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const mockForecast = [
  { date: '2024-04-10', day: 'Wed', temp: 28, condition: 'Sunny', icon: Sun, color: 'text-golden' },
  { date: '2024-04-11', day: 'Thu', temp: 26, condition: 'Partly Cloudy', icon: Cloud, color: 'text-muted' },
  { date: '2024-04-12', day: 'Fri', temp: 22, condition: 'Heavy Rain', icon: CloudRain, color: 'text-blue-400', alert: true },
  { date: '2024-04-13', day: 'Sat', temp: 24, condition: 'Windy', icon: Wind, color: 'text-teal' },
  { date: '2024-04-14', day: 'Sun', temp: 27, condition: 'Sunny', icon: Sun, color: 'text-golden' },
];

export default function WeatherForecaster() {
  const { trip } = useTrip();
  const [selectedDate, setSelectedDate] = useState('2024-04-12'); // Select the rainy day by default to show conflict flow
  const [isFixing, setIsFixing] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  const selectedForecast = mockForecast.find(f => f.date === selectedDate);

  const handleFixConflict = () => {
    setIsFixing(true);
    setTimeout(() => {
      setIsFixing(false);
      setIsResolved(true);
    }, 1500);
  };

  return (
    <PageTransition variant="slideUp" className="max-w-6xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
            <Thermometer className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Weather Forecaster</h1>
            <p className="text-muted mt-1">Forecast for {trip?.destination} during your stay.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Forecast & Selector */}
        <div className="lg:col-span-2 space-y-6">
          <Card glass className="p-6 border-muted/30 shadow-sm">
            <h2 className="text-xl font-bold text-charcoal mb-6">7-Day Forecast</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {mockForecast.map((day) => {
                const Icon = day.icon;
                const isSelected = selectedDate === day.date;
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`flex flex-col items-center p-4 rounded-2xl min-w-[100px] border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-teal/10 border-teal shadow-lg shadow-teal/30' 
                        : 'bg-bg border-muted/30 hover:border-teal/50 hover:bg-bg'
                    }`}
                  >
                    <span className="text-sm font-medium text-muted mb-2">{day.day}</span>
                    <Icon className={`w-8 h-8 mb-3 ${day.color}`} />
                    <span className={`text-xl font-bold ${isSelected ? 'text-teal' : 'text-charcoal'}`}>{day.temp}°</span>
                    {day.alert && (
                      <div className="mt-2 w-2 h-2 rounded-full bg-golden absolute top-3 right-3" />
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
                      <p className="text-golden-700/90 text-sm">Heavy rain is forecasted on {selectedForecast.day}, {selectedForecast.date}. This conflicts with your planned outdoor activity.</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white">
                    <h4 className="font-bold text-charcoal mb-4">Affected Itinerary Item</h4>
                    <div className="flex items-center justify-between p-4 bg-bg rounded-xl border border-muted/30 mb-6">
                      <div className="flex items-center gap-3">
                        <Map className="w-5 h-5 text-muted" />
                        <div>
                          <p className="font-medium text-charcoal">Uluwatu Temple Cliff Walk</p>
                          <p className="text-xs text-muted">Outdoor Activity • 2:00 PM</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-golden uppercase tracking-wider px-2 py-1 bg-golden/10 rounded border border-golden/20">At Risk</span>
                    </div>

                    <h4 className="font-bold text-charcoal mb-4">Smart Alternative Suggestion</h4>
                    <div className="flex flex-col md:flex-row gap-4 items-stretch mb-6">
                      <div className="flex-1 p-4 bg-bg rounded-xl border border-golden/30 opacity-50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-bg/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                          <span className="text-golden font-bold rotate-[-15deg] text-lg border-2 border-golden px-3 py-1 rounded">CANCELLED</span>
                        </div>
                        <p className="font-medium text-charcoal line-through">Uluwatu Temple</p>
                        <p className="text-sm text-muted line-through">Outdoor</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-6 h-6 text-teal" />
                      </div>
                      <div className="flex-1 p-4 bg-teal/10 rounded-xl border border-teal shadow-[0_0_15px_rgba(25,181,165,0.15)] relative">
                        <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-teal text-white px-2 py-0.5 rounded shadow">SUGGESTION</span>
                        <p className="font-bold text-teal">Agung Rai Museum of Art</p>
                        <p className="text-sm text-teal/70">Indoor Activity • Cultural</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-bg rounded-xl">
                      <div>
                        <p className="text-sm text-muted">Budget Impact</p>
                        <p className="text-lg font-bold text-teal">- ₹500 savings</p>
                      </div>
                      <Button onClick={handleFixConflict} isLoading={isFixing} className="w-full sm:w-auto bg-teal shadow-lg shadow-teal/30 text-white">
                        Confirm Change
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
                <h3 className="text-2xl font-bold text-charcoal mb-2">Itinerary Updated!</h3>
                <p className="text-teal-700/80 max-w-md mx-auto mb-6">
                  The Agung Rai Museum has been successfully added to your itinerary in place of Uluwatu Temple, and your budget has been adjusted automatically.
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
              <span className="text-6xl font-bold text-charcoal mb-2">{selectedForecast?.temp}°</span>
              <span className="text-lg font-medium text-muted">{selectedForecast?.condition}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-3 bg-bg/50 rounded-lg">
                <span className="text-muted">Precipitation</span>
                <span className="font-medium text-charcoal">{selectedForecast?.alert ? '85%' : '10%'}</span>
              </div>
              <div className="flex justify-between p-3 bg-bg/50 rounded-lg">
                <span className="text-muted">Humidity</span>
                <span className="font-medium text-charcoal">72%</span>
              </div>
              <div className="flex justify-between p-3 bg-bg/50 rounded-lg">
                <span className="text-muted">Wind</span>
                <span className="font-medium text-charcoal">12 km/h</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
