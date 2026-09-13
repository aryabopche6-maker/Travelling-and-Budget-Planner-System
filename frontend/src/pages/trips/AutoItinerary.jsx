import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTrip } from '../../context/TripContext';
import { Calendar, Clock, CloudRain, Sun, MapPin, GripVertical, Plus, Route } from 'lucide-react';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';

// Mock data
const mockDays = [
  {
    date: '2024-06-01',
    weather: { type: 'sunny', temp: '28°C', risk: false },
    activities: [
      { id: 'a1', time: '09:00', title: 'Arrival & Check-in', type: 'logistics' },
      { id: 'a2', time: '12:30', title: 'Lunch at Seaside Cafe', type: 'food' },
      { id: 'a3', time: '15:00', title: 'Uluwatu Temple Visit', type: 'attraction' },
    ]
  },
  {
    date: '2024-06-02',
    weather: { type: 'rain', temp: '24°C', risk: true },
    activities: [
      { id: 'a4', time: '10:00', title: 'Jungle Trekking', type: 'attraction', conflict: true },
      { id: 'a5', time: '14:00', title: 'Spa Treatment', type: 'relax' },
    ]
  }
];

const timelineItem = {
  hidden: { opacity: 0, x: -20 },
  show: (i) => ({
    opacity: 1, 
    x: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  })
};

export default function AutoItinerary() {
  const { trip } = useTrip();
  const [days, setDays] = useState(mockDays);

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-12">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
              <Route className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-charcoal">Smart Itinerary</h1>
              <p className="text-muted mt-1">Plan your days. We'll watch the weather for you.</p>
            </div>
          </div>
          <Button className="gap-2 bg-teal hover:bg-teal-500 shadow-lg shadow-teal/30 text-white">
            <Plus className="w-4 h-4" /> Add Activity
          </Button>
        </div>
      </Reveal>

      <div className="space-y-8">
        {days.map((day, dayIdx) => (
          <Reveal key={day.date} delay={dayIdx * 0.15}>
            <div className="relative">
              {/* Day Header */}
              <div className="sticky top-0 z-10 bg-bg/95 backdrop-blur-md py-4 flex items-center justify-between border-b border-muted/30 mb-6 shadow-sm">
                <h3 className="text-xl font-bold text-charcoal flex items-center gap-3">
                  Day {dayIdx + 1} 
                  <span className="text-muted font-medium text-sm tracking-wide bg-white px-3 py-1 rounded-full border border-muted/30">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </h3>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + dayIdx * 0.15 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border shadow-sm ${
                    day.weather.risk ? 'bg-golden/10 border-golden/30 text-golden' : 'bg-teal/10 border-teal/30 text-teal'
                  }`}
                >
                  {day.weather.type === 'rain' ? <CloudRain className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {day.weather.temp}
                </motion.div>
              </div>

              {/* Timeline */}
              <div className="pl-4 border-l-2 border-muted/30 ml-4 space-y-6">
                {day.activities.map((act, actIdx) => {
                  const globalIdx = dayIdx * 3 + actIdx;
                  return (
                    <motion.div 
                      key={act.id}
                      custom={globalIdx}
                      variants={timelineItem}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, margin: "-30px" }}
                      className="relative group"
                    >
                      {/* Timeline dot */}
                      <motion.div 
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: globalIdx * 0.12 + 0.1, type: "spring", stiffness: 300 }}
                        className="absolute -left-[23px] top-5 w-4 h-4 rounded-full bg-teal border-4 border-sand shadow-sm group-hover:scale-125 transition-transform" 
                      />
                      
                      <Card className={`p-5 transition-all duration-300 ${
                        act.conflict ? 'border-golden/50 bg-golden/5 shadow-lg shadow-yellow-500/10' : 'border-muted/30 bg-white hover:border-teal/50 hover:shadow-md'
                      }`}>
                        <div className="flex gap-4 items-start">
                          <div className="cursor-grab active:cursor-grabbing p-1 text-muted hover:text-charcoal mt-1 hidden sm:block">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h4 className="font-bold text-lg text-charcoal group-hover:text-teal transition-colors">{act.title}</h4>
                              <span className="flex items-center gap-1.5 text-sm font-bold text-teal bg-teal/10 px-3 py-1.5 rounded-lg border border-teal/20 w-max shadow-sm">
                                <Clock className="w-4 h-4" /> {act.time}
                              </span>
                            </div>
                            
                            {/* Weather Conflict Warning */}
                            {act.conflict && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                className="mt-5 bg-golden/10 border border-golden/30 p-4 rounded-xl flex items-start gap-4 shadow-inner"
                              >
                                <div className="w-10 h-10 bg-golden/20 rounded-full flex items-center justify-center shrink-0">
                                  <CloudRain className="w-5 h-5 text-golden" />
                                </div>
                                <div>
                                  <p className="font-bold text-golden mb-1">Weather Conflict Detected</p>
                                  <p className="text-sm text-yellow-700/80 mb-4">High probability of rain during this outdoor activity.</p>
                                  <div className="flex flex-wrap gap-3">
                                    <Button size="sm" className="bg-golden text-charcoal hover:bg-yellow-400 font-bold shadow-lg shadow-yellow-500/20">
                                      Move to Day 1
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-golden/30 text-yellow-600 hover:bg-golden/10 font-bold">
                                      Keep Plan
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </PageTransition>
  );
}
