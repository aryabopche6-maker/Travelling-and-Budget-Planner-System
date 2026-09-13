import React, { useState } from 'react';
import { Search, MapPin, Clock, IndianRupee, Plus, Map, Filter, Navigation, X } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';
import ImageReveal from '../../components/animations/ImageReveal';
import { motion, AnimatePresence } from 'framer-motion';

const mockPlaces = [
  {
    id: 'p1',
    name: 'Sacred Monkey Forest Sanctuary',
    category: 'Nature & Wildlife',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    rating: 4.7,
    location: 'Ubud, Bali',
    cost: '₹400 / person',
    duration: '2-3 hours',
    description: 'A natural habitat of Balinese long-tailed macaque, featuring ancient temples hidden in a lush forest.'
  },
  {
    id: 'p2',
    name: 'Uluwatu Temple',
    category: 'History & Culture',
    image: 'https://images.unsplash.com/photo-1554481923-a6918bd997bc?w=800&q=80',
    rating: 4.8,
    location: 'South Kuta, Bali',
    cost: '₹300 / person',
    duration: '1.5 hours',
    description: 'Famous cliff-top sea temple known for stunning sunset views and traditional Kecak fire dances.'
  }
];

export default function Places() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState(null);

  const categories = ['All', 'Nature & Wildlife', 'History & Culture', 'Adventure', 'Food & Drink'];

  return (
    <PageTransition variant="slideUp" className="max-w-6xl mx-auto space-y-8 pb-8">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-display text-charcoal">Places & Attractions</h1>
              <p className="text-muted mt-1">Discover places to visit and add them to your itinerary.</p>
            </div>
          </div>
          
          <div className="w-full md:w-80 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input 
                placeholder="Search attractions..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-bg border-muted/30"
              />
            </div>
            <Button variant="outline" className="px-3 border-muted/30 bg-bg hover:bg-white">
              <Filter className="w-5 h-5 text-muted" />
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {categories.map(cat => (
            <motion.button
              key={cat}
              onClick={() => setFilter(cat)}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border ${
                filter === cat 
                  ? 'bg-teal text-white border-teal shadow-lg shadow-teal/30' 
                  : 'bg-bg text-muted border-muted/30 hover:border-teal/50 hover:text-charcoal'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPlaces.map((place, i) => {
          const isFeatured = i === 0;
          return (
          <Reveal key={place.id} delay={0.1 + i * 0.1} className={isFeatured ? 'md:col-span-2 lg:col-span-2' : ''}>
            <motion.div layoutId={`place-card-${place.id}`} className="h-full">
              <Card hoverLift className={`p-0 overflow-hidden flex flex-col group border-muted/30 hover:border-teal/30 shadow-sm cursor-pointer card-travel h-full ${isFeatured ? 'md:flex-row' : ''}`} onClick={() => setSelectedPlace(place)}>
                <motion.div layoutId={`place-image-${place.id}`} className={`${isFeatured ? 'md:w-1/2' : ''} h-56 md:h-auto shrink-0 relative overflow-hidden img-zoom-wrap bg-bg`}>
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover zoom-target opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent md:hidden" />
                  <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-charcoal border border-white/40 uppercase tracking-wider shadow-sm">
                    {place.category}
                  </div>
                </motion.div>
                
                <div className="p-5 md:p-6 flex-1 flex flex-col bg-white">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <motion.h3 layoutId={`place-title-${place.id}`} className="text-xl font-bold font-display line-clamp-2 pr-2 text-charcoal group-hover:text-teal group-hover:-translate-y-1 transition-all duration-300">{place.name}</motion.h3>
                      <span className="text-sm font-bold text-golden flex items-center gap-1 shrink-0 bg-golden/10 px-2 py-0.5 rounded border border-golden/20">
                        ★ {place.rating}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted flex items-center gap-1.5 mb-3 font-medium">
                      <MapPin className="w-4 h-4 text-teal" /> {place.location}
                    </p>
                    
                    <p className={`text-sm text-muted mb-5 leading-relaxed ${isFeatured ? '' : 'line-clamp-2'}`}>
                      {place.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5 text-sm text-muted">
                    <div className="flex items-center gap-2 bg-bg p-2.5 rounded-xl border border-muted/30">
                      <div className="p-1 bg-teal/10 rounded-lg text-teal">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-charcoal">{place.cost}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-bg p-2.5 rounded-xl border border-muted/30">
                      <div className="p-1 bg-teal/10 rounded-lg text-teal">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-charcoal">{place.duration}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 gap-2 text-sm border-muted/30 hover:bg-bg" onClick={(e) => e.stopPropagation()}>
                      <Map className="w-4 h-4 text-muted" /> Map
                    </Button>
                    <Button className="btn-shine flex-1 gap-2 text-sm bg-teal hover:bg-bright text-white shadow-teal/30" onClick={(e) => e.stopPropagation()}>
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Reveal>
          );
        })}
      </div>

      {/* Fullscreen Place Detail Overlay */}
      <AnimatePresence>
        {selectedPlace && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedPlace(null)}
          >
            <motion.div 
              layoutId={`place-card-${selectedPlace.id}`}
              className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div layoutId={`place-image-${selectedPlace.id}`} className="relative h-72 md:h-96 overflow-hidden">
                <img src={selectedPlace.image} alt={selectedPlace.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <button 
                  onClick={() => setSelectedPlace(null)} 
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/20 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded text-xs font-bold text-white border border-white/20 uppercase tracking-wider shadow-sm inline-block mb-3">
                    {selectedPlace.category}
                  </div>
                  <motion.h2 layoutId={`place-title-${selectedPlace.id}`} className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
                    {selectedPlace.name}
                  </motion.h2>
                </div>
              </motion.div>
              
              <div className="p-6 md:p-8 space-y-6 bg-white">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-bold text-golden flex items-center gap-1 bg-golden/10 px-3 py-1.5 rounded-lg border border-golden/20">
                    ★ {selectedPlace.rating}
                  </span>
                  <span className="text-sm text-muted flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-teal" /> {selectedPlace.location}
                  </span>
                </div>
                
                <p className="text-muted leading-relaxed text-lg">
                  {selectedPlace.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted">
                  <div className="flex items-center gap-3 bg-bg p-4 rounded-xl border border-muted/30">
                    <div className="p-2 bg-teal/10 rounded-lg text-teal">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Cost</p>
                      <span className="font-bold text-charcoal">{selectedPlace.cost}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-bg p-4 rounded-xl border border-muted/30">
                    <div className="p-2 bg-teal/10 rounded-lg text-teal">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Duration</p>
                      <span className="font-bold text-charcoal">{selectedPlace.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-muted/30">
                  <Button variant="outline" className="flex-1 gap-2 border-muted/30 hover:bg-bg text-muted">
                    <Map className="w-5 h-5" /> View on Map
                  </Button>
                  <Button className="btn-shine flex-1 gap-2 bg-teal hover:bg-bright shadow-teal/30 text-white">
                    <Plus className="w-5 h-5" /> Add to Itinerary
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
