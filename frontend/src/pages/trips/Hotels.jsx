import React, { useState } from 'react';
import { Search, MapPin, Star, Wifi, Coffee, Wind, Info, Hotel, Filter } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';
import ImageReveal from '../../components/animations/ImageReveal';
import { motion } from 'framer-motion';

// Mock API data structure - wait for actual API
const mockHotels = [
  {
    id: 'h1',
    name: 'Oceanview Resort & Spa',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    location: 'North Beach, Bali',
    rating: 4.8,
    reviews: 1240,
    priceInfo: '₹8,500 / night',
    amenities: ['Pool', 'Spa', 'Free WiFi', 'Breakfast Included'],
    available: true
  },
  {
    id: 'h2',
    name: 'Jungle Retreat Villas',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    location: 'Ubud, Bali',
    rating: 4.6,
    reviews: 856,
    priceInfo: '₹6,200 / night',
    amenities: ['Free WiFi', 'AC', 'Restaurant'],
    available: false
  },
];

export default function Hotels() {
  const [search, setSearch] = useState('');

  return (
    <PageTransition variant="slideUp" className="max-w-6xl mx-auto space-y-8 pb-8">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
              <Hotel className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-display text-charcoal">Find Your Stay</h1>
              <p className="text-muted mt-1">Explore accommodation options based on your preferences.</p>
            </div>
          </div>
          
          <div className="w-full md:w-80 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input 
                placeholder="Search hotels..." 
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
        <div className="bg-teal/5 border border-teal/15 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-teal shrink-0 mt-0.5" />
          <p className="text-sm text-muted leading-relaxed">
            These options are aggregated from external providers based on your destination and mood. Booking is not handled directly through this platform. Use the info to budget and add to your plan.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockHotels.map((hotel, i) => (
          <Reveal key={hotel.id} delay={0.1 + i * 0.1}>
            <Card hoverLift className="p-0 overflow-hidden flex flex-col group border-muted/30 hover:border-teal/30 shadow-sm h-full card-travel">
              <div className="h-56 relative overflow-hidden img-zoom-wrap bg-bg">
                <ImageReveal 
                  src={hotel.image} 
                  alt={hotel.name} 
                  className="h-full w-full"
                  imgClassName="h-full w-full zoom-target"
                  delay={0.15 + i * 0.1}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent pointer-events-none group-hover:from-charcoal/80 transition-colors duration-500" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/40 shadow-sm z-10">
                  <Star className="w-4 h-4 text-golden fill-golden" />
                  <span className="text-sm font-bold text-charcoal">{hotel.rating}</span>
                  <span className="text-xs text-muted font-medium">({hotel.reviews})</span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col bg-white">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1 pr-2 text-charcoal font-display group-hover:text-teal group-hover:-translate-y-1 transition-all duration-300">{hotel.name}</h3>
                  <p className="text-sm text-muted flex items-center gap-1.5 mb-5 font-medium">
                    <MapPin className="w-4 h-4 text-teal" /> {hotel.location}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.map(amenity => (
                      <motion.span 
                        key={amenity} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="text-xs px-2.5 py-1 bg-bg text-muted rounded-md border border-muted/30"
                      >
                        {amenity}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-muted/30 pt-4 mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted mb-0.5">Estimated Price</p>
                    <p className="font-bold text-lg text-teal tracking-tight">{hotel.priceInfo}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-muted/30 hover:bg-bg hover:border-teal/40 transition-all">
                    View Details
                  </Button>
                </div>
                
                {!hotel.available && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 text-xs font-bold text-golden text-center bg-golden/10 py-2 rounded-lg border border-golden/20 uppercase tracking-wider"
                  >
                    Fully booked for dates
                  </motion.div>
                )}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageTransition>
  );
}
