import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, IndianRupee, Plus, Map, Filter, Navigation, X, Sparkles, RefreshCw, Compass, Crosshair, Check, CheckCircle2, Bookmark } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { tripService } from '../../services/tripService';
import { itineraryService } from '../../services/itineraryService';
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

  // User-selected places for Itinerary
  const [savedPlaceNames, setSavedPlaceNames] = useState(new Set());
  const [savingPlaceName, setSavingPlaceName] = useState(null);

  const [searchAreaInput, setSearchAreaInput] = useState('');
  const [activeSearchArea, setActiveSearchArea] = useState('');
  const [radius, setRadius] = useState(10);

  const loadSavedPlaces = async () => {
    if (!trip?.id) return;
    try {
      const saved = await itineraryService.getSelectedPlaces(trip.id);
      if (Array.isArray(saved)) {
        setSavedPlaceNames(new Set(saved.map(p => p.name?.toLowerCase())));
      }
    } catch (err) {
      console.warn("Could not load saved places:", err);
    }
  };

  const togglePlaceSelection = async (place, e) => {
    if (e) e.stopPropagation();
    if (!trip?.id || !place?.name) return;
    const nameLower = place.name.toLowerCase();
    const isAlreadySaved = savedPlaceNames.has(nameLower);

    setSavingPlaceName(place.name);
    try {
      if (isAlreadySaved) {
        await itineraryService.removeSelectedPlace(trip.id, place.name);
        setSavedPlaceNames(prev => {
          const next = new Set(prev);
          next.delete(nameLower);
          return next;
        });
      } else {
        await itineraryService.addSelectedPlace(trip.id, place);
        setSavedPlaceNames(prev => {
          const next = new Set(prev);
          next.add(nameLower);
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to toggle place selection:", err);
    } finally {
      setSavingPlaceName(null);
    }
  };

  const fetchPlaces = async (location = '', r = 10) => {
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
      loadSavedPlaces();
    }
  }, [trip?.id, trip?.interests]);

  const handleSearchArea = (e) => {
    e.preventDefault();
    setActiveSearchArea(searchAreaInput);
    fetchPlaces(searchAreaInput, radius);
  };

  const handleClearArea = () => {
    setSearchAreaInput('');
    setActiveSearchArea('');
    fetchPlaces('', radius);
  };

  // Build categories including user selected moods if available
  const baseCategories = ['All', 'History & Heritage', 'Museums & Art', 'Parks & Nature', 'Beach & Relax', 'Sightseeing & Culture'];
  const userInterests = trip?.interests && Array.isArray(trip.interests) ? trip.interests : [];
  
  // Combine unique categories
  const categories = Array.from(new Set([...baseCategories, ...userInterests]));

  const filteredPlaces = places.filter(place => {
    if (filter === 'All') {
      // Matches all
    } else {
      const target = filter.toLowerCase();
      const catMatch = place.category && place.category.toLowerCase().includes(target);
      const moodMatch = place.matchedMood && place.matchedMood.toLowerCase().includes(target);
      const tagMatch = place.tags && place.tags.some(t => t.toLowerCase().includes(target));
      const descMatch = (place.description && place.description.toLowerCase().includes(target)) ||
                        (place.name && place.name.toLowerCase().includes(target));
      if (!catMatch && !moodMatch && !tagMatch && !descMatch) return false;
    }

    if (search) {
      const s = search.toLowerCase();
      const matchesSearch = (place.name && place.name.toLowerCase().includes(s)) ||
                            (place.location && place.location.toLowerCase().includes(s)) ||
                            (place.category && place.category.toLowerCase().includes(s)) ||
                            (place.matchedMood && place.matchedMood.toLowerCase().includes(s));
      if (!matchesSearch) return false;
    }

    return true;
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight font-display text-charcoal">
                  {activeSearchArea ? `Places in ${activeSearchArea}` : 'Places & Attractions'}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal/10 text-teal rounded-full border border-teal/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live OSM Data
                </span>
                {places.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-charcoal/10 text-charcoal rounded-full">
                    {places.length} Spots Found
                  </span>
                )}
                {savedPlaceNames.size > 0 && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500 text-white rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> {savedPlaceNames.size} Added to Itinerary
                  </span>
                )}
              </div>
              <p className="text-muted mt-1">
                Showing top curated landmarks in <strong className="text-charcoal">{activeSearchArea || trip?.destination}</strong> &bull; Selected places automatically populate your <strong className="text-teal">Itinerary</strong>!
                {userInterests.length > 0 && !activeSearchArea && (
                  <span> &bull; Prioritizing your mood: <span className="text-teal font-semibold">{userInterests.join(', ')}</span></span>
                )}
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-80 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input 
                placeholder="Filter attractions or name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-bg border-muted/30"
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Mood Preference Banner if trip has interests */}
      {userInterests.length > 0 && (
        <Reveal delay={0.03}>
          <div className="p-3.5 bg-teal/5 border border-teal/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal shrink-0" />
              <span className="text-charcoal font-medium">
                Vibe matched for <strong>{trip?.destination}</strong>:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {userInterests.map((interest) => (
                  <span key={interest} className="px-2.5 py-0.5 rounded-full bg-teal text-white text-xs font-semibold shadow-xs">
                    {interest}
                  </span>
                ))}
                {trip?.travelPace && (
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-teal/30 text-teal text-xs font-semibold">
                    {trip.travelPace} Pace
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-muted">
              Matching spots automatically appear at the top!
            </span>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.05}>
        <Card className="p-4 bg-bg border-muted/30">
          <form onSubmit={handleSearchArea} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-teal" />
              <Input 
                placeholder="Search specific locality/area (e.g. Banjara Hills, Baga Beach, Old Town...)" 
                value={searchAreaInput}
                onChange={(e) => setSearchAreaInput(e.target.value)}
                className="pl-10 bg-white border-muted/30"
              />
            </div>
            <div className="relative w-full sm:w-44">
              <Crosshair className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select 
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-muted/30 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-teal/50"
              >
                <option value={3}>Within 3 km</option>
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km (Standard)</option>
                <option value={20}>Within 20 km (Wide)</option>
                <option value={35}>Within 35 km (Full Region)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-teal hover:bg-teal/90 text-white shadow-sm shrink-0">
                Search Area
              </Button>
              {activeSearchArea && (
                <Button type="button" variant="outline" onClick={handleClearArea} className="border-muted/40 text-muted shrink-0">
                  Reset
                </Button>
              )}
            </div>
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
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-teal font-medium py-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Discovering top spots in {activeSearchArea || trip?.destination}...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-2xl border border-muted/20 bg-white p-6 shadow-sm animate-pulse space-y-4">
                <div className="h-48 bg-muted/15 rounded-xl w-full" />
                <div className="space-y-2">
                  <div className="h-6 bg-muted/20 rounded w-3/4" />
                  <div className="h-4 bg-muted/10 rounded w-1/2" />
                </div>
                <div className="h-10 bg-muted/10 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="py-12 text-center text-muted">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-40 text-teal" />
          <h3 className="text-lg font-bold text-charcoal mb-1">No matching places found</h3>
          <p className="text-sm">Try switching the category filter or changing your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPlaces.map((place, i) => {
            const isFeatured = i === 0;
            return (
              <Reveal key={place.id || place.name || i} delay={0.05 + i * 0.05} className={isFeatured ? 'md:col-span-2' : ''}>
                <motion.div layoutId={`place-card-${place.id || place.name || i}`} className="h-full">
                  <Card hoverLift className={`p-0 overflow-hidden flex flex-col group border-muted/30 hover:border-teal/30 shadow-md hover:shadow-xl hover:shadow-teal/10 cursor-pointer card-travel h-full ${isFeatured ? 'md:flex-row' : ''}`} onClick={() => setSelectedPlace({...place, _uniqueId: place.id || place.name || i})}>
                    <motion.div layoutId={`place-image-${place.id || place.name || i}`} className={`${isFeatured ? 'md:w-1/2' : ''} h-64 md:h-auto min-h-[250px] shrink-0 relative overflow-hidden bg-gradient-to-br from-teal/20 via-sky/10 to-teal/5 flex items-center justify-center`}>
                      {place.imageUrl ? (
                        <img 
                          src={place.imageUrl} 
                          alt={place.name} 
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'; }}
                          className="w-full h-full object-cover zoom-target opacity-90 group-hover:opacity-100" 
                        />
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-2xl bg-teal/10 text-teal flex items-center justify-center border border-teal/20">
                            <Compass className="w-7 h-7" />
                          </div>
                          <span className="text-xs font-semibold text-teal/80">OpenStreetMap Verified Spot</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                        <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-charcoal border border-white/40 uppercase tracking-wider shadow-sm">
                          {place.category || 'Attraction'}
                        </span>
                        {place.matchedMood && (
                          <span className="bg-teal text-white px-2.5 py-1 rounded text-[10px] font-bold border border-teal/40 uppercase tracking-wider shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {place.matchedMood}
                          </span>
                        )}
                        {savedPlaceNames.has(place.name?.toLowerCase()) && (
                          <span className="bg-emerald-600 text-white px-2.5 py-1 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                            <Check className="w-3 h-3" /> In Itinerary
                          </span>
                        )}
                      </div>
                    </motion.div>
                    
                    <div className="p-6 md:p-8 flex-1 flex flex-col bg-white">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <motion.h3 layoutId={`place-title-${place.id || place.name || i}`} className="text-2xl font-bold font-display line-clamp-2 pr-4 text-charcoal group-hover:text-teal transition-all duration-300 leading-tight">
                            {place.name}
                          </motion.h3>
                          <span className="text-sm font-bold text-muted flex items-center gap-1 shrink-0 bg-bg px-2.5 py-1 rounded-md border border-muted/30">
                            {place.rating ? `★ ${place.rating}` : 'OSM Verified'}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <p className="text-base text-muted flex items-center gap-2 font-medium">
                            <MapPin className="w-5 h-5 text-teal shrink-0" /> {place.location || trip?.destination}
                          </p>
                          {place.distanceKm != null && (
                            <span className="bg-emerald-500/10 text-emerald-600 font-bold px-2.5 py-0.5 rounded-full text-xs border border-emerald-500/20">
                              📍 {place.distanceKm} km away
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-base text-muted mb-4 leading-relaxed ${isFeatured ? '' : 'line-clamp-3'}`}>
                          {place.description || 'Verified landmark in destination.'}
                        </p>

                        {place.tags && place.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {place.tags.slice(0, 3).map((tg, idx) => (
                              <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-bg text-muted border border-muted/30">
                                #{tg}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-muted">
                        <div className="flex items-center gap-3 bg-bg p-3.5 rounded-xl border border-muted/30">
                          <div className="p-1.5 bg-teal/10 rounded-lg text-teal">
                            <IndianRupee className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-charcoal text-sm">
                            {place.estimatedCost != null ? `₹${place.estimatedCost}` : 'Free / Public'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 bg-bg p-3.5 rounded-xl border border-muted/30">
                          <div className="p-1.5 bg-teal/10 rounded-lg text-teal">
                            <Clock className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-charcoal text-sm">
                            {place.duration || '1.5 - 2 hrs'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {/* Itinerary Select Toggle Button */}
                        <Button
                          className={`flex-1 gap-2 text-sm font-semibold transition-all shadow-sm ${
                            savedPlaceNames.has(place.name?.toLowerCase())
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                              : 'bg-teal hover:bg-bright text-white shadow-teal/30'
                          }`}
                          onClick={(e) => togglePlaceSelection(place, e)}
                          isLoading={savingPlaceName === place.name}
                        >
                          {savedPlaceNames.has(place.name?.toLowerCase()) ? (
                            <>
                              <Check className="w-4 h-4" /> Added to Itinerary
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" /> Select for Itinerary
                            </>
                          )}
                        </Button>

                        {place.latitude && place.longitude && (
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant="outline" className="px-3 gap-1.5 text-sm border-muted/30 hover:bg-bg text-muted">
                              <Map className="w-4 h-4" /> Map
                            </Button>
                          </a>
                        )}

                        <Button 
                          variant="outline" 
                          className="px-3 text-sm border-muted/30 hover:bg-bg text-charcoal"
                          onClick={(e) => { e.stopPropagation(); setSelectedPlace(place); }}
                        >
                          Details
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
              layoutId={`place-card-${selectedPlace._uniqueId || selectedPlace.id || selectedPlace.name}`}
              className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div layoutId={`place-image-${selectedPlace._uniqueId || selectedPlace.id || selectedPlace.name}`} className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-br from-teal/20 via-sky/10 to-teal/5 flex items-center justify-center">
                {selectedPlace.imageUrl ? (
                  <img 
                    src={selectedPlace.imageUrl} 
                    alt={selectedPlace.name} 
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'; }}
                    className="w-full h-full object-cover" 
                  />
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
                  <motion.h2 layoutId={`place-title-${selectedPlace._uniqueId || selectedPlace.id || selectedPlace.name}`} className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-lg">
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

                <div className="flex flex-wrap gap-4 pt-4 border-t border-muted/30">
                  <Button
                    onClick={() => togglePlaceSelection(selectedPlace)}
                    isLoading={savingPlaceName === selectedPlace.name}
                    className={`flex-1 gap-2 text-sm font-semibold transition-all shadow-sm ${
                      savedPlaceNames.has(selectedPlace.name?.toLowerCase())
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                        : 'bg-teal hover:bg-bright text-white shadow-teal/30'
                    }`}
                  >
                    {savedPlaceNames.has(selectedPlace.name?.toLowerCase()) ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Itinerary
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Select for Itinerary
                      </>
                    )}
                  </Button>

                  {selectedPlace.latitude && selectedPlace.longitude && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.latitude},${selectedPlace.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full gap-2 border-muted/30 hover:bg-bg text-muted">
                        <Map className="w-5 h-5" /> Open Maps
                      </Button>
                    </a>
                  )}
                  <Button onClick={() => setSelectedPlace(null)} variant="outline" className="px-5 border-muted/40 text-charcoal">
                    Close
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
