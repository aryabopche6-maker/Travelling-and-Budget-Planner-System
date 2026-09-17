import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { tripService } from '../services/tripService';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!tripId) return;

    const fetchTrip = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedTrip = await tripService.getTrip(tripId);
        if (isMounted) {
          setTrip(fetchedTrip);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load trip');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrip();

    return () => {
      isMounted = false;
    };
  }, [tripId]);

  const isTripAdmin = trip?.members?.find(m => m.userId === user?.id)?.role === 'TRIP_ADMIN';

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-teal">Loading Trip...</div>;
  }

  if (error || !trip) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-2">Trip not found</h2>
        <p className="text-muted mb-6">You might not have access to this trip.</p>
        <button onClick={() => navigate('/dashboard')} className="text-teal hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <TripContext.Provider value={{ trip, setTrip, isTripAdmin, isAdmin: isTripAdmin, isLoading }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
