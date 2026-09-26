import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Public
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import InvitationLanding from './pages/trips/InvitationLanding';

// Layouts
import MainLayout from './components/layout/MainLayout';
import TripLayout from './components/layout/TripLayout';

// Dashboard & Core
import Dashboard from './pages/dashboard/Dashboard';
import SurpriseMe from './pages/dashboard/SurpriseMe';
import ProfileSettings from './pages/dashboard/ProfileSettings';
import CreateTrip from './pages/trips/CreateTrip';
import MyTrips from './pages/trips/MyTrips';

// Trip Specific - All Phases
import TripDashboard from './pages/trips/TripDashboard';
import GroupMembers from './pages/trips/GroupMembers';
import MoodPreferences from './pages/trips/MoodPreferences';
import Hotels from './pages/trips/Hotels';
import Places from './pages/trips/Places';
import BudgetAffordability from './pages/trips/BudgetAffordability';
import WhatIfSimulator from './pages/trips/WhatIfSimulator';
import AutoItinerary from './pages/trips/AutoItinerary';
import GroupVoting from './pages/trips/GroupVoting';
import SplitSmart from './pages/trips/SplitSmart';
import SOSEmergency from './pages/trips/SOSEmergency';
import WeatherForecaster from './pages/trips/WeatherForecaster';
import HiddenCosts from './pages/trips/HiddenCosts';
import SmartAlternatives from './pages/trips/SmartAlternatives';
import BudgetRescue from './pages/trips/BudgetRescue';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen flex items-center justify-center text-teal">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen flex items-center justify-center text-teal">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

import { ErrorBoundary } from './components/common/ErrorBoundary';
import HeroBackground from './components/animations/HeroBackground';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/invitations/:action" element={<InvitationLanding />} />
      
      {/* Main App Layout */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trips" element={<MyTrips />} /> 
        <Route path="/trips/new" element={<CreateTrip />} />
        <Route path="/surprise-me" element={<SurpriseMe />} />
        <Route path="/profile" element={<ProfileSettings />} />
      </Route>

      {/* Trip Specific Layout (Replaces MainLayout) */}
      <Route path="/trips/:tripId" element={<ProtectedRoute><TripLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<TripDashboard />} />
        <Route path="mood" element={<MoodPreferences />} />
        <Route path="places" element={<Places />} />
        <Route path="hotels" element={<Hotels />} />
        <Route path="weather" element={<WeatherForecaster />} />
        <Route path="budget" element={<BudgetAffordability />} />
        <Route path="hidden-costs" element={<HiddenCosts />} />
        <Route path="alternatives" element={<SmartAlternatives />} />
        <Route path="simulator" element={<WhatIfSimulator />} />
        <Route path="itinerary" element={<AutoItinerary />} />
        <Route path="members" element={<GroupMembers />} />
        <Route path="voting" element={<GroupVoting />} />
        <Route path="expenses" element={<SplitSmart />} />
        <Route path="budget-rescue" element={<BudgetRescue />} />
        <Route path="sos" element={<SOSEmergency />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HeroBackground />
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
