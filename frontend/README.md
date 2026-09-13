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
   - **SOS Emergency**: 3-second hold safeguard for instant location sharing.

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
*(Note: Use dummy data like `user@example.com` to log in since the backend is mocked).*
