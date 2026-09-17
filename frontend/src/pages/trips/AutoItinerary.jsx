import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../../context/TripContext';
import { Calendar, Clock, CloudRain, Sun, MapPin, GripVertical, Plus, Route, Coffee, Camera, Compass, Sparkles, Navigation, ChevronRight, X } from 'lucide-react';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Reveal from '../../components/animations/Reveal';

// Mock data with rich images
const mockDays = [
  {
    date: '2024-06-01',
    weather: { type: 'sunny', temp: '28°C', risk: false },
    activities: [
      { id: 'a1', time: '09:00', title: 'Arrival & VIP Transfer', type: 'logistics', icon: Navigation, location: 'Ngurah Rai International Airport', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80', gradient: 'from-blue-500/20 to-cyan-500/20', color: 'text-blue-500' },
      { id: 'a2', time: '12:30', title: 'Lunch at Seaside Cafe', type: 'food', icon: Coffee, location: 'Jimbaran Bay', image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=80', gradient: 'from-orange-500/20 to-amber-500/20', color: 'text-orange-500' },
      { id: 'a3', time: '15:00', title: 'Uluwatu Temple Sunset', type: 'attraction', icon: Camera, location: 'Uluwatu, Bali', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', gradient: 'from-purple-500/20 to-pink-500/20', color: 'text-purple-500' },
    ]
  },
  {
    date: '2024-06-02',
    weather: { type: 'rain', temp: '24°C', risk: true },
    activities: [
      { id: 'a4', time: '10:00', title: 'Jungle Waterfall Trek', type: 'attraction', icon: Compass, location: 'Sekumpul Waterfall', image: 'https://images.unsplash.com/photo-1518182170546-076616fdfaaf?auto=format&fit=crop&w=800&q=80', conflict: true, gradient: 'from-emerald-500/20 to-teal-500/20', color: 'text-emerald-500' },
      { id: 'a5', time: '14:00', title: 'Luxury Spa Treatment', type: 'relax', icon: Sparkles, location: 'Ubud Wellness Center', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', gradient: 'from-rose-500/20 to-pink-500/20', color: 'text-rose-500' },
    ]
  }
];

const timelineItem = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1, 
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  })
};

export default function AutoItinerary() {
  const { trip } = useTrip();
  const [days, setDays] = useState(mockDays);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: '', time: '', type: 'attraction', location: '', dayIndex: 0 });

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.title || !newActivity.time) return;
    
    // Add to the first day for simplicity in this demo
    const newAct = {
      id: 'a' + Date.now(),
      time: newActivity.time,
      title: newActivity.title,
      type: newActivity.type,
      icon: newActivity.type === 'food' ? Coffee : newActivity.type === 'relax' ? Sparkles : newActivity.type === 'logistics' ? Navigation : Compass,
      location: newActivity.location || 'Unknown Location',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
      gradient: 'from-teal-500/20 to-emerald-500/20',
      color: 'text-teal-500'
    };

    const updatedDays = [...days];
    const targetIdx = Number(newActivity.dayIndex);
    updatedDays[targetIdx].activities.push(newAct);
    // Sort activities by time
    updatedDays[targetIdx].activities.sort((a, b) => a.time.localeCompare(b.time));
    
    setDays(updatedDays);
    setIsModalOpen(false);
    setNewActivity({ title: '', time: '', type: 'attraction', location: '', dayIndex: 0 });
  };

  return (
    <PageTransition variant="fade" className="max-w-6xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-charcoal text-white p-8 sm:p-12 mb-12 shadow-2xl">
          {/* Background Decorative Gradients */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-coral/20 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-md mb-4 text-teal-100">
                <Sparkles className="w-4 h-4" /> AI-Powered Planner
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
                Your Curated Journey
              </h1>
              <p className="text-lg text-white/70">
                A perfectly paced itinerary tailored to your preferences, dynamically adjusting to weather conditions and travel times.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-gradient-to-r from-teal to-emerald-500 text-white border-0 shadow-lg shadow-teal/30 px-6 py-6 rounded-2xl text-lg hover:shadow-teal/50 hover:from-teal-400 hover:to-emerald-400 transition-all duration-300">
                <Plus className="w-5 h-5" /> Add Activity
              </Button>
            </motion.div>
          </div>
        </div>
      </Reveal>

      <div className="space-y-16">
        {days.map((day, dayIdx) => (
          <Reveal key={day.date} delay={dayIdx * 0.1}>
            <div className="relative">
              
              {/* Day Header */}
              <div className="sticky top-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-charcoal to-gray-800 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-black/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">Day</span>
                    <span className="text-xl font-black">{dayIdx + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-charcoal">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </h3>
                    <p className="text-muted font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold shadow-inner border backdrop-blur-sm ${
                    day.weather.risk 
                      ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 text-orange-600' 
                      : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${day.weather.risk ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}>
                    {day.weather.type === 'rain' ? <CloudRain className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span>{day.weather.temp}</span>
                    <span className="text-xs opacity-80">{day.weather.type === 'rain' ? 'Rain Expected' : 'Clear Skies'}</span>
                  </div>
                </motion.div>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-8 sm:pl-12">
                {/* Continuous Timeline Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal/30 via-emerald-500/30 to-transparent rounded-full ml-3 sm:ml-[1.15rem]" />

                <div className="space-y-6">
                  {day.activities.map((act, actIdx) => {
                    const globalIdx = dayIdx * 3 + actIdx;
                    const Icon = act.icon;
                    return (
                      <motion.div 
                        key={act.id}
                        custom={globalIdx}
                        variants={timelineItem}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="relative group"
                      >
                        {/* Timeline Marker */}
                        <div className="absolute -left-8 sm:-left-12 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center">
                          <motion.div 
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                            className="w-10 h-10 rounded-full bg-white border-4 border-teal shadow-md flex items-center justify-center relative group-hover:scale-110 transition-transform duration-300"
                          >
                             <div className="w-2 h-2 bg-teal rounded-full" />
                          </motion.div>
                        </div>
                        
                        {/* Activity Card */}
                        <div className={`
                          relative overflow-hidden rounded-3xl transition-all duration-500 
                          bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10
                          ${act.conflict ? 'ring-2 ring-orange-400/50' : 'hover:border-teal/30'}
                        `}>
                          {/* Inner Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${act.gradient} opacity-50 pointer-events-none`} />
                          
                          <div className="relative flex flex-col md:flex-row p-3 gap-6 h-full items-stretch">
                            {/* Image Section */}
                            <div className="relative w-full md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:shadow-lg transition-shadow duration-300">
                              <img src={act.image} alt={act.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-sm font-bold flex items-center gap-1.5 border border-white/20 shadow-sm">
                                  <Clock className="w-3.5 h-3.5" /> {act.time}
                                </div>
                              </div>
                            </div>
                            
                            {/* Content Section */}
                            <div className="flex-1 py-4 pr-6 flex flex-col justify-center">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 ${act.color}`}>
                                    <Icon className="w-4 h-4" /> {act.type}
                                  </div>
                                  <h4 className="font-extrabold text-2xl text-charcoal group-hover:text-teal transition-colors duration-300">
                                    {act.title}
                                  </h4>
                                </div>
                                <div className="cursor-grab active:cursor-grabbing p-2 text-muted hover:text-charcoal bg-white/50 rounded-xl hover:bg-white transition-colors shadow-sm hidden md:block border border-transparent hover:border-black/5">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-muted font-medium mt-1">
                                <MapPin className="w-4 h-4" /> {act.location}
                              </div>

                              {/* Action Buttons */}
                              <div className="mt-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button size="sm" variant="outline" className="rounded-xl border-black/10 bg-white/50 hover:bg-white hover:shadow-sm">
                                  View Details
                                </Button>
                                <Button size="sm" className="rounded-xl bg-teal/10 text-teal hover:bg-teal hover:text-white border-0">
                                  Get Directions <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Weather Conflict Overlay Alert */}
                          <AnimatePresence>
                            {act.conflict && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border-t border-orange-500/20 bg-orange-50/80 backdrop-blur-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 border border-orange-200">
                                    <CloudRain className="w-6 h-6 text-orange-600" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-orange-900 text-lg">Weather Alert</p>
                                    <p className="text-sm text-orange-700 font-medium">High chance of rain during this outdoor activity.</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Button className="flex-1 sm:flex-none bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/20 border-0 rounded-xl">
                                    Reschedule
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-charcoal bg-black/5 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-charcoal mb-6">Add New Activity</h2>
              
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1.5">Activity Title</label>
                  <input 
                    type="text" 
                    required
                    value={newActivity.title}
                    onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                    placeholder="e.g. Sunset Dinner"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1.5">Day</label>
                    <select 
                      value={newActivity.dayIndex}
                      onChange={(e) => setNewActivity({...newActivity, dayIndex: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all"
                    >
                      {days.map((d, i) => (
                        <option key={i} value={i}>Day {i + 1} - {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1.5">Time</label>
                    <input 
                      type="time" 
                      required
                      value={newActivity.time}
                      onChange={(e) => setNewActivity({...newActivity, time: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1.5">Category</label>
                    <select 
                      value={newActivity.type}
                      onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all"
                    >
                      <option value="attraction">Attraction</option>
                      <option value="food">Food & Drink</option>
                      <option value="relax">Relaxation</option>
                      <option value="logistics">Logistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1.5">Location</label>
                    <input 
                      type="text" 
                      value={newActivity.location}
                      onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                      placeholder="e.g. Seminyak Beach"
                      className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full py-4 text-lg bg-gradient-to-r from-teal to-emerald-500 text-white border-0 shadow-lg shadow-teal/30 rounded-xl hover:shadow-teal/50">
                    Add to Itinerary
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
