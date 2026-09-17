import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Wifi, Coffee, Wind, Info, Hotel, Filter, RefreshCw, Sparkles, ExternalLink, Building2, Crosshair } from 'lucide-react';
import { useTrip } from '../../context/TripContext';
import { tripService } from '../../services/tripService';
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
  const [isExternalConfigured, setIsExternalConfigured] = useState(false);

  const [searchAreaInput, setSearchAreaInput] = useState('');
  const [activeSearchArea, setActiveSearchArea] = useState('');
  const [radius, setRadius] = useState(5);

  const fetchHotels = async (location = '', r = 5) => {
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
    }
  }, [trip?.id]);

  const handleSearchArea = (e) => {
    e.preventDefault();
    setActiveSearchArea(searchAreaInput);
    fetchHotels(searchAreaInput, radius);
  };

  const filteredHotels = hotels.filter(hotel => {
    return !search || 
      (hotel.name && hotel.name.toLowerCase().includes(search.toLowerCase())) ||
      (hotel.location && hotel.location.toLowerCase().includes(search.toLowerCase()));
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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight font-display text-charcoal">
                  {activeSearchArea ? `Hotels near ${activeSearchArea}` : 'Find Your Stay'}
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal/10 text-teal rounded-full border border-teal/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {isExternalConfigured ? 'Amadeus Live API' : 'Live OSM Accommodations'}
                </span>
              </div>
              <p className="text-muted mt-1">Real accommodations in <strong className="text-charcoal">{activeSearchArea || trip?.destination}</strong></p>
            </div>
          </div>
          
          <div className="w-full md:w-80 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input 
                placeholder="Filter hotels..." 
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
        <div className="bg-teal/5 border border-teal/15 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-teal shrink-0 mt-0.5" />
          <p className="text-sm text-muted leading-relaxed">
            Real hotel and resort listings fetched live from OpenStreetMap and Amadeus APIs. Exact dynamic room rates and live availability are fetched when commercial Amadeus credentials are provided in the backend.
          </p>
        </div>
      </Reveal>

      {isLoading ? (
        <div className="py-16 text-center text-teal flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-muted font-medium">Querying live accommodation databases...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="py-12 text-center text-muted">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40 text-teal" />
          <h3 className="text-lg font-bold text-charcoal mb-1">No accommodations found</h3>
          <p className="text-sm">Try modifying your search criteria.</p>
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
                  
                  {hotel.rating != null ? (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/40 shadow-sm z-10">
                      <Star className="w-4 h-4 text-golden fill-golden" />
                      <span className="text-sm font-bold text-charcoal">{hotel.rating} ★</span>
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

                  <div className="border-t border-muted/30 pt-4 mt-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted mb-0.5">Live Pricing</p>
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
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
