import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Wifi, Coffee, Wind, Info, Hotel, Filter, RefreshCw, Sparkles, ExternalLink, Building2, Crosshair, Check, CheckCircle2 } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { tripService } from '../../services/tripService';
import { itineraryService } from '../../services/itineraryService';
import api from '../../services/api';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';
import { motion } from 'framer-motion';

export default function Hotels() {
  const { trip } = useTrip();
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isExternalConfigured, setIsExternalConfigured] = useState(false);

  // Selected Hotel state
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isSelectingHotel, setIsSelectingHotel] = useState(false);

  const [searchAreaInput, setSearchAreaInput] = useState('');
  const [activeSearchArea, setActiveSearchArea] = useState('');
  const [radius, setRadius] = useState(10);

  const loadSavedHotel = async () => {
    if (!trip?.id) return;
    try {
      const saved = await itineraryService.getSelectedHotel(trip.id);
      setSelectedHotel(saved || null);
    } catch (err) {
      console.warn("Could not load saved hotel:", err);
    }
  };

  const handleSelectHotel = async (hotel) => {
    if (!trip?.id || !hotel?.name) return;
    setIsSelectingHotel(true);
    try {
      if (selectedHotel && selectedHotel.name?.toLowerCase() === hotel.name?.toLowerCase()) {
        // Deselect
        await itineraryService.removeSelectedHotel(trip.id);
        setSelectedHotel(null);
      } else {
        const saved = await itineraryService.selectHotel(trip.id, hotel);
        setSelectedHotel(saved);
      }
    } catch (err) {
      console.error("Failed to update selected hotel:", err);
    } finally {
      setIsSelectingHotel(false);
    }
  };

  const fetchHotels = async (location = '', r = 10) => {
    setIsLoading(true);
    try {
      const data = await tripService.getHotels(trip.id, location, r);
      if (data?.hotels) {
        setHotels(data.hotels);
        setIsExternalConfigured(data.isExternalConfigured || false);
      }
    } catch (error) {
      console.error('Failed to fetch hotels from backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trip?.id) {
      fetchHotels();
      loadSavedHotel();
    }
  }, [trip?.id, trip?.interests]);

  const handleSearchArea = (e) => {
    e.preventDefault();
    setActiveSearchArea(searchAreaInput);
    fetchHotels(searchAreaInput, radius);
  };

  const handleClearArea = () => {
    setSearchAreaInput('');
    setActiveSearchArea('');
    fetchHotels('', radius);
  };

  const userInterests = trip?.interests && Array.isArray(trip.interests) ? trip.interests : [];
  const hotelTypes = ['All', 'Resort', 'Hotel', 'Boutique Hotel', 'Guest House', 'Hostel', 'Villa'];

  const filteredHotels = hotels.filter(hotel => {
    if (typeFilter !== 'All') {
      const target = typeFilter.toLowerCase();
      const typeMatch = hotel.hotelType && hotel.hotelType.toLowerCase().includes(target);
      const nameMatch = hotel.name && hotel.name.toLowerCase().includes(target);
      const moodMatch = hotel.matchedMood && hotel.matchedMood.toLowerCase().includes(target);
      if (!typeMatch && !nameMatch && !moodMatch) return false;
    }

    if (search) {
      const s = search.toLowerCase();
      const matchesSearch = 
        (hotel.name && hotel.name.toLowerCase().includes(s)) ||
        (hotel.location && hotel.location.toLowerCase().includes(s)) ||
        (hotel.hotelType && hotel.hotelType.toLowerCase().includes(s)) ||
        (hotel.matchedMood && hotel.matchedMood.toLowerCase().includes(s));
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
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight font-display text-charcoal">
                  {activeSearchArea ? `Hotels in ${activeSearchArea}` : 'Find Your Stay'}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal/10 text-teal rounded-full border border-teal/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {isExternalConfigured ? 'Amadeus Live API' : 'Live OSM Stays'}
                </span>
                {hotels.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-charcoal/10 text-charcoal rounded-full">
                    {hotels.length} Stays Found
                  </span>
                )}
                {selectedHotel && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-500 text-white rounded-full flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> Stay Selected: {selectedHotel.name}
                  </span>
                )}
              </div>
              <p className="text-muted mt-1">
                Real accommodations in <strong className="text-charcoal">{activeSearchArea || trip?.destination}</strong> &bull; Selected hotel automatically sets check-in & breakfast in your <strong className="text-teal">Itinerary</strong>!
                {userInterests.length > 0 && !activeSearchArea && (
                  <span> &bull; Matching vibe: <span className="text-teal font-semibold">{userInterests.join(', ')}</span></span>
                )}
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-80 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input 
                placeholder="Filter hotels or resort..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-bg border-muted/30"
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* Mood Preference Banner */}
      {userInterests.length > 0 && (
        <Reveal delay={0.03}>
          <div className="p-3.5 bg-teal/5 border border-teal/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal shrink-0" />
              <span className="text-charcoal font-medium">
                Tailored for your <strong>{trip?.destination}</strong> vibe:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {userInterests.map((interest) => (
                  <span key={interest} className="px-2.5 py-0.5 rounded-full bg-teal text-white text-xs font-semibold shadow-xs">
                    {interest}
                  </span>
                ))}
                {trip?.travelStyle && (
                  <span className="px-2.5 py-0.5 rounded-full bg-coral-500/10 border border-coral/30 text-coral text-xs font-semibold">
                    {trip.travelStyle} Stay
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-muted">
              Stays fitting your style appear first!
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
                placeholder="Enter specific area/beach/locality (e.g. Banjara Hills, Candolim, Old City)" 
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

      {/* Stay Type Filters */}
      <Reveal delay={0.08}>
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {hotelTypes.map(type => (
            <motion.button
              key={type}
              onClick={() => setTypeFilter(type)}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 border ${
                typeFilter === type 
                  ? 'bg-teal text-white border-teal shadow-lg shadow-teal/30' 
                  : 'bg-bg text-muted border-muted/30 hover:border-teal/50 hover:text-charcoal'
              }`}
            >
              {type}
            </motion.button>
          ))}
        </div>
      </Reveal>

      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-teal font-medium py-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Finding best stays in {activeSearchArea || trip?.destination}...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="rounded-2xl border border-muted/20 bg-white p-5 shadow-sm animate-pulse space-y-4">
                <div className="h-44 bg-muted/15 rounded-xl w-full" />
                <div className="space-y-2">
                  <div className="h-5 bg-muted/20 rounded w-2/3" />
                  <div className="h-4 bg-muted/10 rounded w-1/3" />
                </div>
                <div className="h-10 bg-muted/10 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="py-12 text-center text-muted">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-teal" />
          <h3 className="text-lg font-bold text-charcoal mb-1">No accommodations found</h3>
          <p className="text-sm">Try modifying your locality search or expanding the radius.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel, i) => (
            <Reveal key={hotel.id || i} delay={0.05 + i * 0.05}>
              <Card hoverLift className="p-0 overflow-hidden flex flex-col group border-muted/30 hover:border-teal/30 shadow-sm h-full card-travel">
                <div className="h-52 relative overflow-hidden bg-gradient-to-br from-teal/20 via-sky/10 to-teal/5 flex items-center justify-center">
                  {hotel.imageUrl ? (
                    <img src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover zoom-target opacity-90 group-hover:opacity-100" />
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-teal/10 text-teal flex items-center justify-center border border-teal/20">
                        <Building2 className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-semibold text-teal/80">Verified Accommodation</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                    <span className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold text-charcoal border border-white/40 uppercase tracking-wider shadow-sm">
                      {hotel.hotelType || 'Hotel'}
                    </span>
                    {hotel.matchedMood && (
                      <span className="bg-teal text-white px-2 py-1 rounded text-[10px] font-bold border border-teal/40 uppercase tracking-wider shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {hotel.matchedMood}
                      </span>
                    )}
                    {selectedHotel && selectedHotel.name?.toLowerCase() === hotel.name?.toLowerCase() && (
                      <span className="bg-emerald-600 text-white px-2.5 py-1 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected Stay
                      </span>
                    )}
                  </div>
                  
                  {hotel.rating != null ? (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/40 shadow-sm z-10">
                      <Star className="w-4 h-4 text-golden fill-golden" />
                      <span className="text-sm font-bold text-charcoal">{hotel.rating.toFixed(1)} ★</span>
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-muted border border-white/40 shadow-sm z-10">
                      OSM Verified
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col bg-white">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 line-clamp-1 pr-2 text-charcoal font-display group-hover:text-teal transition-all duration-300">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-muted flex items-center gap-1.5 mb-4 font-medium">
                      <MapPin className="w-4 h-4 text-teal shrink-0" /> {hotel.location || trip?.destination}
                    </p>
                    
                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {hotel.amenities.map(amenity => (
                          <span 
                            key={amenity} 
                            className="text-[11px] px-2.5 py-0.5 bg-bg text-muted rounded-md border border-muted/30"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-muted/30 pt-4 mt-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted mb-0.5">Estimated Rate</p>
                        <p className="font-bold text-base text-teal tracking-tight">
                          {hotel.pricePerNight != null ? `₹${hotel.pricePerNight} / night` : 'Price on Booking'}
                        </p>
                      </div>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(hotel.name + ' ' + (hotel.location || trip?.destination))}`} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-1.5 border-muted/30 hover:bg-bg hover:border-teal/40 transition-all text-xs">
                          Book <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </div>

                    {/* Select for Itinerary button */}
                    <Button
                      onClick={() => handleSelectHotel(hotel)}
                      disabled={isSelectingHotel}
                      className={`w-full py-2.5 text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                        selectedHotel && selectedHotel.name?.toLowerCase() === hotel.name?.toLowerCase()
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                          : 'bg-teal hover:bg-bright text-white shadow-teal/30'
                      }`}
                    >
                      {selectedHotel && selectedHotel.name?.toLowerCase() === hotel.name?.toLowerCase() ? (
                        <>
                          <Check className="w-4 h-4" /> Selected as Trip Stay
                        </>
                      ) : (
                        <>
                          <Hotel className="w-4 h-4" /> Select as My Trip Stay
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
