// src/services/tripService.js

// Mock centralized data store
let mockTrips = [
  {
    id: 't1',
    destination: 'Paris, France',
    startingLocation: 'New York, USA',
    startDate: '2024-05-10',
    endDate: '2024-05-20',
    budget: 200000,
    spent: 180000,
    travelMode: 'flight',
    status: 'upcoming',
    createdBy: '1',
    members: [
      { id: '1', name: 'Traveler (You)', role: 'TRIP_ADMIN' }
    ]
  },
  {
    id: 't2',
    destination: 'Tokyo, Japan',
    startingLocation: 'San Francisco, USA',
    startDate: '2024-10-05',
    endDate: '2024-10-15',
    budget: 300000,
    spent: 0,
    travelMode: 'flight',
    status: 'planning',
    createdBy: '1',
    members: [
      { id: '1', name: 'Traveler (You)', role: 'TRIP_ADMIN' },
      { id: '2', name: 'Jane Smith', role: 'TRAVELER' }
    ]
  },
  {
    id: 't3',
    destination: 'Bali, Indonesia',
    startingLocation: 'Mumbai, India',
    startDate: '2024-06-01',
    endDate: '2024-06-10',
    budget: 150000,
    spent: 45000,
    travelMode: 'flight',
    status: 'upcoming',
    createdBy: '2', 
    members: [
      { id: '1', name: 'Traveler (You)', role: 'TRIP_ADMIN' }, 
      { id: '2', name: 'Jane Smith', role: 'TRAVELER' }
    ]
  }
];

// Helper to simulate network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const tripService = {
  getMyTrips: async (userId) => {
    await delay(600);
    return mockTrips.filter(t => t.members.some(m => m.id === userId));
  },
  
  getTrip: async (tripId) => {
    await delay(600);
    const trip = mockTrips.find(t => t.id === tripId);
    if (!trip) throw new Error("Trip not found");
    return trip;
  },

  createTrip: async (tripData, userId, userName) => {
    await delay(1000);
    const newTrip = {
      id: `t${Date.now()}`,
      ...tripData,
      spent: 0,
      status: 'planning',
      createdBy: userId,
      members: [
        { id: userId, name: userName || 'You', role: 'TRIP_ADMIN' }
      ]
    };
    mockTrips.push(newTrip);
    return newTrip;
  }
};
