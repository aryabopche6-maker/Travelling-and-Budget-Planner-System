import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { tripService } from '../../services/tripService';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';

const MOODS = [
  { id: 'Adventure', name: 'Adventure', image: 'https://images.unsplash.com/photo-1533692328991-08159ff19fca?w=500&q=80' },
  { id: 'Beach & Relax', name: 'Beach & Relax', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80' },
  { id: 'Nature', name: 'Nature', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&q=80' },
  { id: 'Food & Culture', name: 'Food & Culture', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80' },
  { id: 'History', name: 'History', image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&q=80' },
  { id: 'Luxury', name: 'Luxury', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&q=80' },
  { id: 'Nightlife', name: 'Nightlife', image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=500&q=80' },
  { id: 'Romantic', name: 'Romantic', image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=500&q=80' },
  { id: 'Family', name: 'Family', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&q=80' },
  { id: 'Road Trip', name: 'Road Trip', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=80' },
];

const moodCard = {
  hidden: { opacity: 0, scale: 0.85 },
  show: (i) => ({
    opacity: 1, 
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  })
};

export default function MoodPreferences() {
  const { trip, setTrip } = useTrip();
  const navigate = useNavigate();
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [pace, setPace] = useState('Balanced');
  const [style, setStyle] = useState('Moderate');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (trip) {
      if (trip.interests && Array.isArray(trip.interests)) {
        setSelectedMoods(trip.interests);
      }
      if (trip.travelPace) setPace(trip.travelPace.charAt(0).toUpperCase() + trip.travelPace.slice(1).toLowerCase());
      if (trip.travelStyle) setStyle(trip.travelStyle.charAt(0).toUpperCase() + trip.travelStyle.slice(1).toLowerCase());
    }
  }, [trip]);

  const toggleMood = (id) => {
    setSelectedMoods(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSave = async (redirectPlaces = false) => {
    if (!trip?.id) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await tripService.updateTrip(trip.id, {
        travelPace: pace,
        travelStyle: style,
        interests: selectedMoods
      });
      if (updated) {
        setTrip(updated);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (redirectPlaces) {
        navigate(`/trips/${trip.id}/places`);
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-10 pb-10">
      <Reveal>
        <div className="flex items-center gap-4 border-b border-muted/30 pb-6">
          <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">What's the vibe?</h1>
            <p className="text-muted mt-1">Select the moods that describe this trip to help us recommend hotels and places.</p>
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {MOODS.map((mood, i) => {
          const isSelected = selectedMoods.includes(mood.id);
          return (
            <motion.div
              custom={i}
              variants={moodCard}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              key={mood.id}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggleMood(mood.id)}
              className={`relative h-40 rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-500 ${
                isSelected 
                  ? 'ring-2 ring-teal shadow-[0_0_20px_rgba(25,181,165,0.3)]' 
                  : 'ring-1 ring-muted/50 hover:ring-teal/50 shadow-md'
              }`}
            >
              <img src={mood.image} alt={mood.name} className="w-full h-full object-cover" />
              
              {/* Glow overlay when selected */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-teal-900/40 mix-blend-multiply"
                  />
                )}
              </AnimatePresence>
              
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                isSelected ? 'opacity-0' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'
              }`} />
              
              {/* Selected glow ring effect */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-2xl border-2 border-teal pointer-events-none"
                    style={{ boxShadow: 'inset 0 0 20px rgba(25, 181, 165, 0.15)' }}
                  />
                )}
              </AnimatePresence>
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="font-semibold text-white text-shadow-sm drop-shadow-lg">{mood.name}</span>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="w-7 h-7 bg-teal rounded-full flex items-center justify-center shadow-lg shadow-teal/30"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Reveal delay={0.1}>
          <Card glass className="p-6 md:p-8 shadow-sm h-full">
            <h3 className="text-xl font-bold mb-6 text-charcoal tracking-tight">Travel Pace</h3>
            <div className="space-y-4">
              {[
                { id: 'Relaxed', label: 'Relaxed', desc: '1-2 activities/day' },
                { id: 'Balanced', label: 'Balanced', desc: '3-4 activities/day' },
                { id: 'Packed', label: 'Packed', desc: 'Maximize every minute' }
              ].map(opt => (
                <motion.label 
                  key={opt.id} 
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-300 ${
                    pace.toLowerCase() === opt.id.toLowerCase() 
                      ? 'bg-teal/10 border-teal shadow-[0_0_15px_rgba(25,181,165,0.15)]' 
                      : 'bg-bg border-muted/30 hover:border-teal/50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="pace" 
                    value={opt.id} 
                    checked={pace.toLowerCase() === opt.id.toLowerCase()} 
                    onChange={(e) => setPace(e.target.value)} 
                    className="hidden" 
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mr-4 transition-colors ${
                    pace.toLowerCase() === opt.id.toLowerCase() ? 'border-teal' : 'border-grayblue-400'
                  }`}>
                    <AnimatePresence>
                      {pace.toLowerCase() === opt.id.toLowerCase() && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="w-3 h-3 rounded-full bg-teal" 
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <span className={`block font-bold text-sm ${pace.toLowerCase() === opt.id.toLowerCase() ? 'text-teal' : 'text-charcoal'}`}>{opt.label}</span>
                    <span className="block text-xs text-muted mt-0.5">{opt.desc}</span>
                  </div>
                </motion.label>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card glass className="p-6 md:p-8 shadow-sm h-full">
            <h3 className="text-xl font-bold mb-6 text-charcoal tracking-tight">Travel Style</h3>
            <div className="space-y-4">
              {[
                { id: 'Budget', label: 'Budget', desc: 'Hostels, street food, public transit' },
                { id: 'Moderate', label: 'Moderate', desc: 'Standard hotels, mix of experiences' },
                { id: 'Premium', label: 'Premium', desc: 'Luxury stays, fine dining, private tours' }
              ].map(opt => (
                <motion.label 
                  key={opt.id} 
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center p-4 rounded-xl cursor-pointer border-2 transition-all duration-300 ${
                    style.toLowerCase() === opt.id.toLowerCase() 
                      ? 'bg-coral-500/10 border-coral shadow-[0_0_15px_rgba(255,128,102,0.15)]' 
                      : 'bg-bg border-muted/30 hover:border-coral/50'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="style" 
                    value={opt.id} 
                    checked={style.toLowerCase() === opt.id.toLowerCase()} 
                    onChange={(e) => setStyle(e.target.value)} 
                    className="hidden" 
                  />
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mr-4 transition-colors ${
                    style.toLowerCase() === opt.id.toLowerCase() ? 'border-coral' : 'border-grayblue-400'
                  }`}>
                    <AnimatePresence>
                      {style.toLowerCase() === opt.id.toLowerCase() && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          className="w-3 h-3 rounded-full bg-coral" 
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <span className={`block font-bold text-sm ${style.toLowerCase() === opt.id.toLowerCase() ? 'text-coral' : 'text-charcoal'}`}>{opt.label}</span>
                    <span className="block text-xs text-muted mt-0.5">{opt.desc}</span>
                  </div>
                </motion.label>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.3}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-muted/30">
          <div className="text-sm text-muted">
            {saveSuccess && (
              <span className="text-teal font-semibold flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4" /> Preferences saved! Places & Hotels updated.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={() => handleSave(false)} 
              isLoading={isSaving} 
              className="flex-1 sm:flex-none px-6 text-sm border-muted/40"
            >
              Save Preferences
            </Button>
            <Button 
              onClick={() => handleSave(true)} 
              isLoading={isSaving} 
              className="flex-1 sm:flex-none px-8 shadow-lg shadow-teal/30 text-sm bg-teal hover:bg-teal/90 text-white flex items-center gap-2"
            >
              <Compass className="w-4 h-4" /> Save & Explore Places
            </Button>
          </div>
        </div>
      </Reveal>
    </PageTransition>
  );
}
