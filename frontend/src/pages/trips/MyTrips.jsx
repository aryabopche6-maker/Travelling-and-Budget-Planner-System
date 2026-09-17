import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import TripCard from '../../components/common/TripCard';
import PageTransition from '../../components/common/PageTransition';
import { tripService } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';



export default function MyTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    
    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const fetchedTrips = await tripService.getMyTrips(user?.id);
        if (isMounted) {
          setTrips(fetchedTrips);
        }
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    if (user?.id) {
      fetchTrips();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const filteredTrips = trips.filter(trip => filter === 'All' || trip.status === filter);

  return (
    <PageTransition variant="slideUp" className="space-y-8 pb-8 h-full flex flex-col">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-charcoal">My Trips</h1>
          <p className="text-secondary mt-1">Manage and view all your travel plans.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/trips/new">
            <Button className="gap-2">
              <Plus className="w-5 h-5" /> Create New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 shrink-0">
        <div className="flex gap-2 p-1 bg-bg border border-muted/30 rounded-lg inline-flex">
          {['All', 'Planning', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === f ? 'bg-white text-charcoal shadow-sm border border-muted/30' : 'text-secondary hover:text-charcoal'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input 
            type="text" 
            placeholder="Search trips..." 
            className="w-full sm:w-64 bg-white border border-muted/30 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500 text-charcoal transition-colors placeholder:text-secondary"
          />
        </div>
      </div>

      {/* Trips Grid */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-bg rounded-2xl h-[340px] border border-muted/30" />
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTrips.map((trip, idx) => (
              <TripCard key={trip.id} trip={trip} role={trip.role} delay={idx * 0.1} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-bg/50 rounded-2xl border border-muted/30 border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">No trips found</h3>
            <p className="text-secondary max-w-md">
              {filter === 'All' 
                ? "You haven't created any trips yet. Start planning your next adventure!"
                : `You don't have any ${filter.toLowerCase()} trips right now.`}
            </p>
            {filter === 'All' && (
              <Link to="/trips/new" className="mt-6">
                <Button className="bg-white text-charcoal border border-muted/30 hover:bg-bg">Create Trip</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
