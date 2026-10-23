# WanderPlan - Travel & Budget Planner System Frontend

This is the fully completed React frontend for the Travel & Budget Planner System. It is built to be modern, premium, highly responsive, and API-ready for integration with a Spring Boot backend.

## Tech Stack
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM (v6+)
- **Styling**: Tailwind CSS (v4)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **API Client**: Axios (Centralized instance)
- **Charts**: Recharts

## Architecture Highlights
- **Midnight Travel Theme**: Custom color palette (`navy`, `teal`, `coral`, `sand`) configured in `tailwind.config.js`.
- **API Ready**: All data fetching logic is built around simulated Axios delays, ready to be swapped with actual backend endpoints in `src/services/api.js`.
- **State Management**: React Context handles global states like Authentication, active Trip Context (with role-based access), and Global Toasts.
- **Component Driven**: Extensive use of reusable components (`Button`, `Input`, `Toast`, Layouts) located in `src/components/common`.

## Features Built
1. **Authentication**: Landing, Login, and Signup pages with full validation.
2. **Dashboard & Planning**: User dashboard, "Surprise Me" destination generator, and trip creation flow.
3. **Trip Context (Role-Based)**: 
   - **Hotels & Places**: External API data simulation.
   - **Budget Affordability**: Advanced tracking with hidden costs, dynamic Recharts doughnut chart, and "Smart Alternatives".
   - **What-If Simulator**: Safely experiment with budget variables.
   - **Auto Itinerary**: Interactive timeline with weather conflict detection and warnings.
   - **Group Voting**: Collaborative polling with animated progress results.
   - **SplitSmart**: Expense splitting with a dispute resolution mechanism.
   - **SOS Emergency**: 3-second hold safeguard, GPS sharing, trusted contacts, and trip alerts.

### SOS Safety Center
- Add, search, edit, and remove up to five trusted contacts. Contact numbers must include their country code (for example, `+919876543210`); contacts are stored in the database for the signed-in user and trip.
- Holding SOS for three seconds requests the device's current GPS location and creates an SOS alert. Each trusted contact gets a button to open the device's SMS app with an emergency message and Google Maps link prefilled; the user must press Send.
- Trip members receive in-app SOS and safe-status notifications. While SOS is active, GPS updates are sent to the backend until the user marks themselves safe.
- No paid SMS gateway is required. Sending and delivery cannot be confirmed by the website, and normal carrier SMS charges may apply. The SMS app link requires a device/browser with an SMS handler.

## How to Run

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. View in the browser at `http://localhost:5173`. 
*(Some frontend flows still use simulated data. SOS requires the Spring Boot backend, an authenticated trip, and browser location permission for GPS.)*
