import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, MapPin, Calendar, Users, Wallet, Target, Sparkles, Check } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';

const mockResult = {
  destination: 'Hoi An, Vietnam',
  image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
  matchScore: 94,
  reason: 'Perfectly aligns with your budget and desire for rich culture, incredible food, and a relaxed pace.',
  estimatedBudget: '₹42,000 / person',
  suggestedActivities: ['Lantern making class', 'An Bang Beach relaxation', 'Street food night tour']
};

export default function SurpriseMe() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setResult(mockResult);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal/10 text-teal mb-4">
          <Wand2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold font-display text-charcoal">Find My Next Adventure</h1>
        <p className="text-muted mt-2 max-w-lg mx-auto">
          Not sure where to go? Tell us your budget, vibe, and constraints, and our AI will find your perfect destination.
        </p>
      </div>

      {!result ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-muted/30 shadow-sm card-travel"
        >
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Starting Location</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input required placeholder="Where are you flying from?" className="pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Total Budget</label>
                <div className="relative">
                  <Wallet className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input type="number" required placeholder="Maximum budget (₹)" className="pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Days Available</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input type="number" required placeholder="How many days?" className="pl-10" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Travelers</label>
                <div className="relative">
                  <Users className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <Input type="number" required placeholder="Number of people" className="pl-10" />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-muted/30">
              <label className="block text-sm font-medium text-charcoal mb-3">What's the vibe?</label>
              <div className="flex flex-wrap gap-2">
                {['Culture', 'Beach', 'Adventure', 'Food', 'Nightlife', 'Nature'].map(vibe => (
                  <label key={vibe} className="cursor-pointer">
                    <input type="checkbox" className="hidden peer" />
                    <div className="px-4 py-2 rounded-full border border-muted/30 bg-bg text-muted peer-checked:bg-teal peer-checked:text-white peer-checked:border-teal transition-all duration-300 hover:border-teal/40">
                      {vibe}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" size="lg" className="btn-shine w-full text-lg shadow-lg shadow-teal/20" isLoading={isGenerating}>
                {isGenerating ? 'Analyzing Destinations...' : 'Find My Destination'}
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-white rounded-3xl overflow-hidden shadow-lg card-travel"
        >
          <div className="h-72 md:h-80 relative overflow-hidden img-zoom-wrap">
            <motion.img 
              src={result.image} 
              alt={result.destination} 
              className="w-full h-full object-cover zoom-target"
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            />
            <div className="absolute inset-0 hero-overlay" />
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-teal/30 flex items-center gap-2"
            >
              <Target className="w-4 h-4 text-teal" />
              <span className="font-bold text-teal">{result.matchScore}% Match</span>
            </motion.div>
            
            <div className="absolute bottom-6 left-6 right-6">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold text-white mb-3 font-display text-shadow-lg"
              >{result.destination}</motion.h2>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center gap-4 text-sm font-medium"
              >
                <span className="flex items-center gap-1 bg-teal/20 text-white px-3 py-1 rounded-lg border border-teal/30 backdrop-blur-sm">
                  <Wallet className="w-4 h-4" /> {result.estimatedBudget}
                </span>
              </motion.div>
            </div>
          </div>

          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2 text-charcoal">
                <Sparkles className="w-5 h-5 text-coral" /> Why it matches
              </h3>
              <p className="text-muted leading-relaxed bg-bg p-4 rounded-xl border border-muted/30">
                {result.reason}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
            >
              <h3 className="text-lg font-bold mb-3 font-display text-charcoal">Top Activities</h3>
              <ul className="space-y-3">
                {result.suggestedActivities.map((act, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="flex items-center gap-3 text-muted"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-teal" />
                    </div>
                    {act}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div className="p-6 md:p-8 border-t border-muted/30 bg-bg/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => setResult(null)}>Try Again</Button>
            <Link to="/trips/new">
              <Button size="lg" className="btn-shine w-full sm:w-auto shadow-lg shadow-teal/20">
                Build This Trip
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
