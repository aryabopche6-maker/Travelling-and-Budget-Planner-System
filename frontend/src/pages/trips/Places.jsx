import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, IndianRupee, Plus, Map, Filter, Navigation, X, Sparkles, RefreshCw, Compass, Crosshair } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { tripService } from '../../services/tripService';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';
import { motion, AnimatePresence } from 'framer-motion';

export default function Places() {
  const { trip } = useTrip();
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState(null);

  const [searchAreaInput, setSearchAreaInput] = useState('');
  const [activeSearchArea, setActiveSearchArea] = useState('');
  const [radius, setRadius] = useState(5);

  const fetchPlaces = async (location = '', r = 5) => {
    setIsLoading(true);
    try {
      const data = await tripService.getPlaces(trip.id, location, r);
      if (data?.places) {
        setPlaces(data.places);
      }
    } catch (error) {
      console.error('Failed to fetch live places:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trip?.id) {
      fetchPlaces();
    }
  }, [trip?.id]);

  const handleSearchArea = (e) => {
    e.preventDefault();
    setActiveSearchArea(searchAreaInput);
    fetchPlaces(searchAreaInput, radius);
  };

  const categories = ['All', 'History & Heritage', 'Museums & Art', 'Parks & Nature', 'Sightseeing & Culture'];

  const filteredPlaces = places.filter(place => {
    const matchesCategory = filter === 'All' || (place.category && place.category.toLowerCase().includes(filter.toLowerCase()));
    const matchesSearch = !search || (place.name && place.name.toLowerCase().includes(search.toLowerCase())) ||
                          (place.location && place.location.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition variant="slideUp" className="max-w-6xl mx-auto space-y-8 pb-8">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-display text-charcoal">
                  {activeSearchArea ? `Places near ${activeSearchArea}` : 'Places & Attractions'}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal/10 text-teal rounded-full border border-teal/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live OSM Data
                </span>
              </div>
              <p className="text-muted mt-1">Real attractions & landmarks in <strong className="text-charcoal">{activeSearchArea || trip?.destination}</strong></p>
            </div>
          </div>
          
          <div className="w-full md:w-80 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input 
                placeholder="Filter attractions..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-bg border-muted/30"
              />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="p-4 bg-bg border-muted/30">
          <form onSubmit={handleSearchArea} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-teal" />
              <Input 
                placeholder="Enter specific area (e.g. Banjara Hills)" 
                value={searchAreaInput}
                onChange={(e) => setSearchAreaInput(e.target.value)}
                className="pl-10 bg-white border-muted/30"
              />
            </div>
            <div className="relative w-full sm:w-40">
              <Crosshair className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select 
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-muted/30 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/50"
              >
                <option value={2}>Within 2 km</option>
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={20}>Within 20 km</option>
              </select>
            </div>
            <Button type="submit" className="bg-teal hover:bg-teal/90 text-white shadow-sm shrink-0">
              Search Area
            </Button>
          </form>
        </Card>
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

      {isLoading ? (
        <div className="py-16 text-center text-teal flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-muted font-medium">Fetching real attractions from OpenStreetMap...</p>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="py-12 text-center text-muted">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-40 text-teal" />
          <h3 className="text-lg font-bold text-charcoal mb-1">No matching places found</h3>
          <p className="text-sm">Try switching the category filter or changing your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, i) => {
            const isFeatured = i === 0;
            return (
              <Reveal key={place.id || i} delay={0.05 + i * 0.05} className={isFeatured ? 'md:col-span-2 lg:col-span-2' : ''}>
                <motion.div layoutId={`place-card-${place.id}`} className="h-full">
                  <Card hoverLift className={`p-0 overflow-hidden flex flex-col group border-muted/30 hover:border-teal/30 shadow-sm cursor-pointer card-travel h-full ${isFeatured ? 'md:flex-row' : ''}`} onClick={() => setSelectedPlace(place)}>
                    <motion.div layoutId={`place-image-${place.id}`} className={`${isFeatured ? 'md:w-1/2' : ''} h-52 md:h-auto shrink-0 relative overflow-hidden bg-gradient-to-br from-teal/20 via-sky/10 to-teal/5 flex items-center justify-center`}>
                      {place.imageUrl ? (
                        <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover zoom-target opacity-90 group-hover:opacity-100" />
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-2xl bg-teal/10 text-teal flex items-center justify-center border border-teal/20">
                            <Compass className="w-7 h-7" />
                          </div>
                          <span className="text-xs font-semibold text-teal/80">OpenStreetMap Verified Spot</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-charcoal border border-white/40 uppercase tracking-wider shadow-sm">
                        {place.category || 'Attraction'}
                      </div>
                    </motion.div>
                    
                    <div className="p-5 md:p-6 flex-1 flex flex-col bg-white">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <motion.h3 layoutId={`place-title-${place.id}`} className="text-xl font-bold font-display line-clamp-2 pr-2 text-charcoal group-hover:text-teal transition-all duration-300">
                            {place.name}
                          </motion.h3>
                          <span className="text-xs font-bold text-muted flex items-center gap-1 shrink-0 bg-bg px-2 py-0.5 rounded border border-muted/30">
                            {place.rating ? `★ ${place.rating}` : 'OSM Verified'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted flex items-center gap-1.5 mb-3 font-medium">
                          <MapPin className="w-4 h-4 text-teal shrink-0" /> {place.location || trip?.destination}
                        </p>
                        
                        <p className={`text-sm text-muted mb-5 leading-relaxed ${isFeatured ? '' : 'line-clamp-2'}`}>
                          {place.description || 'Verified landmark in destination.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-5 text-sm text-muted">
                        <div className="flex items-center gap-2 bg-bg p-2.5 rounded-xl border border-muted/30">
                          <div className="p-1 bg-teal/10 rounded-lg text-teal">
                            <IndianRupee className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-charcoal text-xs">
                            {place.estimatedCost != null ? `₹${place.estimatedCost}` : 'Free / Public'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-bg p-2.5 rounded-xl border border-muted/30">
                          <div className="p-1 bg-teal/10 rounded-lg text-teal">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-charcoal text-xs">
                            {place.duration || '1.5 - 2 hrs'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        {place.latitude && place.longitude && (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" className="w-full gap-2 text-sm border-muted/30 hover:bg-bg">
                              <Map className="w-4 h-4 text-muted" /> Open Map
                            </Button>
                          </a>
                        )}
                        <Button className="btn-shine flex-1 gap-2 text-sm bg-teal hover:bg-bright text-white shadow-teal/30" onClick={(e) => { e.stopPropagation(); setSelectedPlace(place); }}>
                          <Plus className="w-4 h-4" /> Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      )}

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
              <motion.div layoutId={`place-image-${selectedPlace.id}`} className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-teal/20 via-sky/10 to-teal/5 flex items-center justify-center">
                {selectedPlace.imageUrl ? (
                  <img src={selectedPlace.imageUrl} alt={selectedPlace.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-3xl bg-teal/10 text-teal flex items-center justify-center border border-teal/20">
                      <Compass className="w-10 h-10" />
                    </div>
                    <span className="text-sm font-semibold text-teal">OpenStreetMap Indexed Attraction</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <button 
                  onClick={() => setSelectedPlace(null)} 
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/20 z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded text-xs font-bold text-white border border-white/20 uppercase tracking-wider shadow-sm inline-block mb-3">
                    {selectedPlace.category || 'Attraction'}
                  </div>
                  <motion.h2 layoutId={`place-title-${selectedPlace.id}`} className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                    {selectedPlace.name}
                  </motion.h2>
                </div>
              </motion.div>
              
              <div className="p-6 md:p-8 space-y-6 bg-white">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-sm font-bold text-muted flex items-center gap-1 bg-bg px-3 py-1.5 rounded-lg border border-muted/30">
                    {selectedPlace.rating ? `★ ${selectedPlace.rating}` : 'OSM Verified'}
                  </span>
                  <span className="text-sm text-muted flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-teal" /> {selectedPlace.location || trip?.destination}
                  </span>
                </div>
                
                <p className="text-muted leading-relaxed text-base">
                  {selectedPlace.description || 'Landmark information fetched live from OpenStreetMap.'}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted">
                  <div className="flex items-center gap-3 bg-bg p-4 rounded-xl border border-muted/30">
                    <div className="p-2 bg-teal/10 rounded-lg text-teal">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Entry Cost</p>
                      <span className="font-bold text-charcoal">
                        {selectedPlace.estimatedCost != null ? `₹${selectedPlace.estimatedCost}` : 'Free / Public Access'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-bg p-4 rounded-xl border border-muted/30">
                    <div className="p-2 bg-teal/10 rounded-lg text-teal">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Recommended Time</p>
                      <span className="font-bold text-charcoal">
                        {selectedPlace.duration || '1 - 2 Hours'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-muted/30">
                  {selectedPlace.latitude && selectedPlace.longitude && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.latitude},${selectedPlace.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full gap-2 border-muted/30 hover:bg-bg text-muted">
                        <Map className="w-5 h-5" /> Open in Google Maps
                      </Button>
                    </a>
                  )}
                  <Button onClick={() => setSelectedPlace(null)} className="btn-shine flex-1 gap-2 bg-teal hover:bg-bright shadow-teal/30 text-white">
                    Done
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
