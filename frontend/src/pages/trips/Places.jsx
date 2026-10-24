import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, IndianRupee, Plus, Map, Filter, Navigation, X, Sparkles, RefreshCw, Compass, Crosshair, Check, CheckCircle2, Bookmark } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { tripService } from '../../services/tripService';
import { itineraryService } from '../../services/itineraryService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlacePhoto } from '../../utils/destinationImages';

export default function Places() {
  const { trip } = useTrip();
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectionError, setSelectionError] = useState('');

  // User-selected places for Itinerary
  const [savedPlaceNames, setSavedPlaceNames] = useState(new Set());
  const [savingPlaceName, setSavingPlaceName] = useState(null);

  const [searchAreaInput, setSearchAreaInput] = useState('');
  const [activeSearchArea, setActiveSearchArea] = useState('');
  const [radius, setRadius] = useState(10);
  const [visiblePlacesCount, setVisiblePlacesCount] = useState(24);
  const searchRequestId = useRef(0);

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

    setSelectionError('');
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
      setSelectionError(err.response?.data?.message || 'Could not update your itinerary. Please try again.');
    } finally {
      setSavingPlaceName(null);
    }
  };

  const fetchPlaces = async (location = '', r = 10) => {
    const requestId = ++searchRequestId.current;
    setIsLoading(true);
    setSearchError('');
    try {
      const data = await tripService.getPlaces(trip.id, location, r);
      if (requestId === searchRequestId.current) {
        setPlaces(Array.isArray(data?.places) ? data.places : []);
        setVisiblePlacesCount(24);
      }
    } catch (error) {
      console.error('Failed to fetch live places:', error);
      if (requestId === searchRequestId.current) {
        setPlaces([]);
        setSearchError(error.response?.data?.message || 'Could not load map listings. Check your connection and try again.');
      }
    } finally {
      if (requestId === searchRequestId.current) setIsLoading(false);
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
    const area = searchAreaInput.trim();
    setActiveSearchArea(area);
    fetchPlaces(area, radius);
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
  const visiblePlaces = filteredPlaces.slice(0, visiblePlacesCount);

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
                          <Sparkles className="w-3 h-3" /> OpenStreetMap Listings
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
                {activeSearchArea
                  ? <>Map listings near <strong className="text-charcoal">{activeSearchArea}</strong> within {radius} km &bull; Selected places automatically populate your <strong className="text-teal">Itinerary</strong>!</>
                  : <>Showing mapped places across <strong className="text-charcoal">{trip?.destination}</strong> that match your selected moods &bull; Selected places automatically populate your <strong className="text-teal">Itinerary</strong>!</>}
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
                Your selected vibes for <strong>{trip?.destination}</strong>:
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
              Matching listings across your destination are shown first.
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
                placeholder="Optional: narrow results to a city or area"
                value={searchAreaInput}
                maxLength={120}
                onChange={(e) => setSearchAreaInput(e.target.value)}
                className="pl-10 bg-white border-muted/30"
              />
            </div>
            <div className="relative w-full sm:w-44">
              <Crosshair className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <select 
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                disabled={!activeSearchArea && !searchAreaInput.trim()}
                title={!activeSearchArea && !searchAreaInput.trim() ? 'Radius applies when you search a specific area' : undefined}
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

      {isLoading && places.length === 0 ? (
        <div className="space-y-4" role="status" aria-label="Loading places">
          <div className="flex items-center justify-center gap-2 text-sm text-teal font-medium py-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Discovering top spots in {activeSearchArea || trip?.destination}...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[0, 1, 2].map((n) => (
              <div key={n} className={`rounded-2xl border border-muted/20 bg-white shadow-sm animate-pulse overflow-hidden ${n === 0 ? 'md:col-span-2 md:flex min-h-[250px]' : ''}`}>
                <div className={`${n === 0 ? 'md:w-1/2 md:h-auto md:min-h-[250px]' : 'h-64'} shrink-0 bg-muted/15`} />
                <div className="flex-1 p-6 space-y-4">
                  <div className="h-6 bg-muted/20 rounded w-3/4" />
                  <div className="h-4 bg-muted/10 rounded w-1/2" />
                  <div className="h-4 bg-muted/10 rounded w-full" />
                  <div className="h-10 bg-muted/10 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : searchError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center">
          <Compass className="mx-auto mb-3 h-10 w-10 text-rose-500" />
          <h3 className="mb-1 text-lg font-bold text-rose-900">Places search failed</h3>
          <p className="mb-4 text-sm text-rose-800">{searchError}</p>
          <Button onClick={() => fetchPlaces(activeSearchArea, radius)} className="bg-teal text-white hover:bg-teal/90">
            <RefreshCw className="mr-2 h-4 w-4" /> Try again
          </Button>
        </div>
      ) : filteredPlaces.length === 0 && !isLoading && places.length > 0 ? (
        <div className="py-12 text-center text-muted">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-40 text-teal" />
          <h3 className="text-lg font-bold text-charcoal mb-1">No places match these filters</h3>
          <p className="text-sm">There are {places.length} mapped places nearby, but none match “{filter === 'All' ? search : filter}”.</p>
          <Button
            variant="outline"
            className="mt-4 border-teal/30 text-teal hover:bg-teal/5"
            onClick={() => { setFilter('All'); setSearch(''); }}
          >
            Show all nearby places
          </Button>
        </div>
      ) : filteredPlaces.length === 0 && !isLoading ? (
        <div className="py-12 text-center text-muted">
          <Compass className="w-12 h-12 mx-auto mb-3 opacity-40 text-teal" />
          <h3 className="text-lg font-bold text-charcoal mb-1">No mapped places found nearby</h3>
          <p className="text-sm">No mapped places were returned for this destination. Try a city or locality search to explore nearby listings.</p>
        </div>
      ) : (
        <div aria-busy={isLoading} className="relative">
          {isLoading && (
            <div role="status" className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-teal/20 bg-teal/5 px-4 py-3 text-sm font-medium text-teal">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Searching {activeSearchArea || trip?.destination}; showing current results until it finishes...
            </div>
          )}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 transition-opacity duration-300 ${isLoading ? 'pointer-events-none opacity-50' : 'opacity-100'}`}>
            {visiblePlaces.map((place, i) => {
            const isFeatured = i === 0;
            return (
              <Reveal key={place.id || place.name || i} delay={Math.min(0.05 + i * 0.01, 0.2)} className={isFeatured ? 'md:col-span-2' : ''}>
                <motion.div layoutId={`place-card-${place.id || place.name || i}`} className="h-full">
                  <Card hoverLift className={`p-0 overflow-hidden flex flex-col group border-muted/30 hover:border-teal/30 shadow-md hover:shadow-xl hover:shadow-teal/10 cursor-pointer card-travel h-full ${isFeatured ? 'md:flex-row' : ''}`} onClick={() => setSelectedPlace({...place, _uniqueId: place.id || place.name || i})}>
                    <motion.div layoutId={`place-image-${place.id || place.name || i}`} className={`${isFeatured ? 'md:w-1/2' : ''} h-64 md:h-auto min-h-[250px] shrink-0 relative overflow-hidden bg-slate-900 flex items-center justify-center`}>
                      <img 
                        src={getPlacePhoto(place, activeSearchArea || trip?.destination)} 
                        alt={place.name} 
                        className="w-full h-full object-cover zoom-target opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
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
                            {place.rating != null ? `★ ${place.rating}` : 'Map listing'}
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
                          {place.description || 'No description provided by the map listing.'}
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
                            {place.estimatedCost != null ? `₹${place.estimatedCost}` : 'Cost not listed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 bg-bg p-3.5 rounded-xl border border-muted/30">
                          <div className="p-1.5 bg-teal/10 rounded-lg text-teal">
                            <Clock className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-charcoal text-sm">
                            {place.duration || 'Duration not listed'}
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
          {!isLoading && filteredPlaces.length > visiblePlaces.length && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <p className="text-xs text-muted">Showing {visiblePlaces.length} of {filteredPlaces.length} mapped places</p>
              <Button
                variant="outline"
                className="border-teal/30 text-teal hover:bg-teal/5"
                onClick={() => setVisiblePlacesCount(count => Math.min(count + 24, filteredPlaces.length))}
              >
                Load more places
              </Button>
            </div>
          )}
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
              <motion.div layoutId={`place-image-${selectedPlace._uniqueId || selectedPlace.id || selectedPlace.name}`} className="relative h-64 md:h-80 overflow-hidden bg-slate-900 flex items-center justify-center">
                <img 
                  src={getPlacePhoto(selectedPlace, activeSearchArea || trip?.destination)} 
                  alt={selectedPlace.name} 
                  className="w-full h-full object-cover" 
                />
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
                    {selectedPlace.rating != null ? `★ ${selectedPlace.rating}` : 'Map listing'}
                  </span>
                  <span className="text-sm text-muted flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-teal" /> {selectedPlace.location || trip?.destination}
                  </span>
                </div>
                
                <p className="text-muted leading-relaxed text-base">
                  {selectedPlace.description || 'No description provided by the map listing.'}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm text-muted">
                  <div className="flex items-center gap-3 bg-bg p-4 rounded-xl border border-muted/30">
                    <div className="p-2 bg-teal/10 rounded-lg text-teal">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Entry Cost</p>
                      <span className="font-bold text-charcoal">
                        {selectedPlace.estimatedCost != null ? `₹${selectedPlace.estimatedCost}` : 'Cost not listed'}
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
                        {selectedPlace.duration || 'Duration not listed'}
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
                  {selectionError && <p role="alert" className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{selectionError}</p>}

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
