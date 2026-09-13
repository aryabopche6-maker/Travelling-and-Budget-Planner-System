import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlaneTakeoff } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import { tripService } from '../../services/tripService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const schema = z.object({
  destination: z.string().min(2, "Destination is required"),
  startingLocation: z.string().min(2, "Starting location is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  travelers: z.coerce.number().min(1, "At least 1 traveler required"),
  budget: z.coerce.number().min(100, "Minimum budget required"),
  travelMode: z.string().min(1, "Travel mode is required")
});

export default function CreateTrip() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      travelers: 2,
      travelMode: 'flight'
    }
  });

  const onSubmit = async (data) => {
    try {
      const newTrip = await tripService.createTrip(data, user?.id, user?.name);
      addToast('success', 'Trip created successfully!');
      navigate(`/trips/${newTrip.id}/overview`);
    } catch (error) {
      addToast('error', 'Failed to create trip');
    }
  };

  return (
    <PageTransition variant="scale" className="max-w-3xl mx-auto py-6">
      <Link to="/trips" className="inline-flex items-center gap-2 text-secondary hover:text-charcoal mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to My Trips
      </Link>
      
      <Card glass className="p-6 md:p-10 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-teal/10 text-teal rounded-2xl flex items-center justify-center border border-teal/20 shadow-inner">
            <PlaneTakeoff className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-display text-charcoal">Start Your Adventure</h1>
            <p className="text-muted mt-1">Where are you heading? Let's get the basics down.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1">Where are you heading?</label>
              <Input 
                {...register("destination")}
                placeholder="e.g., Paris, France"
                error={errors.destination?.message}
                className="bg-white border-muted/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Starting Location</label>
              <Input 
                {...register("startingLocation")}
                placeholder="e.g., New York, USA"
                error={errors.startingLocation?.message}
                className="bg-white border-muted/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Start Date</label>
              <Input 
                type="date"
                {...register("startDate")}
                error={errors.startDate?.message}
                className="bg-white border-muted/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">End Date</label>
              <Input 
                type="date"
                {...register("endDate")}
                error={errors.endDate?.message}
                className="bg-white border-muted/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Travelers</label>
              <Input 
                type="number"
                min="1"
                {...register("travelers")}
                error={errors.travelers?.message}
                className="bg-white border-muted/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Budget (Total)</label>
              <Input 
                type="number"
                placeholder="₹"
                {...register("budget")}
                error={errors.budget?.message}
                className="bg-white border-muted/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Travel Mode</label>
              <select 
                {...register("travelMode")}
                className="flex h-11 w-full rounded-lg border border-muted/30 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal text-charcoal transition-colors hover:border-teal/50"
              >
                <option value="flight">Flight</option>
                <option value="train">Train</option>
                <option value="car">Car / Road Trip</option>
                <option value="bus">Bus</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-muted/30 flex justify-end">
            <Button type="submit" size="lg" className="w-full md:w-auto" isLoading={isSubmitting}>
              Create Trip & Start Planning
            </Button>
          </div>
        </form>
      </Card>
    </PageTransition>
  );
}

