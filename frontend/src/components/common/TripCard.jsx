import React from 'react';
import { motion } from 'framer-motion';
import { Users, IndianRupee, ShieldAlert, Star } from 'lucide-react';
import Card from './Card';
import { Link } from 'react-router-dom';
import { getDestinationImage } from '../../utils/destinationImages';

export default function TripCard({ trip, delay = 0, role = 'TRAVELER' }) {
  const { id, destination, startDate, endDate, members, budget, spent, status, image } = trip;
  
  // Format dates
  const formattedDates = `${new Date(startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${new Date(endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
  
  const budgetProgress = Math.min((spent / budget) * 100, 100);
  const isTight = budgetProgress > 85;

  return (
    <Link to={`/trips/${id}`} className="block">
      <Card hoverLift delay={delay} className="group overflow-hidden flex flex-col h-full border-muted/30 hover:border-teal/50 card-travel">
        <div className="h-48 w-full relative overflow-hidden bg-bg img-zoom-wrap">
          <img 
            src={image || getDestinationImage(destination)} 
            alt={destination} 
            className="w-full h-full object-cover zoom-target opacity-90 group-hover:opacity-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-charcoal/10 to-transparent group-hover:from-charcoal/70 transition-colors duration-500" />
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
              status === 'Planning' ? 'bg-teal/90 text-white backdrop-blur-sm shadow-sm' : 
              status === 'Active' ? 'bg-coral/90 text-white backdrop-blur-sm shadow-sm' : 
              'bg-muted/90 text-white backdrop-blur-sm shadow-sm'
            }`}>
              {status}
            </span>
            
            {role === 'TRIP_ADMIN' && (
              <span className="px-2 py-1 bg-white/90 backdrop-blur-md rounded text-[10px] font-bold text-teal border border-teal/20 uppercase tracking-wider shadow-sm">
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 relative bg-white">
          <h3 className="text-xl font-bold font-display text-charcoal mb-1 group-hover:text-teal group-hover:-translate-y-1 transition-all duration-300">
            {destination}
          </h3>
          <p className="text-sm text-muted mb-4 group-hover:-translate-y-1 transition-all duration-300 delay-75">{formattedDates}</p>
          
          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between text-sm text-muted">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-muted/70" />
                <span>{Array.isArray(members) ? members.length : members} Travelers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-muted/70" />
                <span>{(budget / 1000).toFixed(0)}k</span>
              </div>
            </div>

            {/* Budget Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted">Budget Progress</span>
                <span className={isTight ? "text-danger font-medium" : "text-teal font-medium"}>
                  {Math.round(budgetProgress)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-bg rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: `${budgetProgress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                  className={`h-full rounded-full ${isTight ? 'bg-danger' : 'bg-teal'}`}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
