# WanderPlan Backend — External APIs & Full System Documentation

## 1. Executive Summary & Architecture

The **WanderPlan** backend is built with **Java 25**, **Spring Boot 3.5.3**, **Spring Security 6 with stateless JWT authentication**, and **Spring Data JPA**.

```
       React + Vite (Frontend)
                 │
           Axios (api.js)
                 │  Bearer JWT
                 ▼
 ┌───────────────────────────────────────────┐
 │       Spring Boot REST Controllers        │
 ├───────────────────────────────────────────┤
 │        Spring Security + JWT Filter       │
 ├───────────────────────────────────────────┤
 │       Service Layer (Business Logic)      │
 ├───────────────────────┬───────────────────┤
 │  Spring Data JPA / DB │ External Services │
 └──────────┬────────────┴─────────┬─────────┘
            │                      │
     MySQL / H2 Database           ├─► Open-Meteo & OpenWeatherMap (Weather)
                                   ├─► OpenStreetMap Nominatim/Overpass (Places)
                                   └─► OpenStreetMap & Amadeus (Hotels)
```

---

## 2. Integrated External APIs & Data Provenance

| API Module | Live Provider (Zero Key Required) | Commercial API Supported | Data Provided Live | Unindexed Fields (Returned as `null`) |
| :--- | :--- | :--- | :--- | :--- |
| **Weather API** | **Open-Meteo** (Global Satellite Forecast) | **OpenWeatherMap** (`WEATHER_API_KEY`) | Real-time temp, wind speed, weather condition, 7-day daily max/min temperatures, precipitation probabilities, and rain conflict analysis. | None (100% full live coverage) |
| **Places API** | **OpenStreetMap** (Nominatim & Overpass) | **Geoapify Places** (`PLACES_API_KEY`) | Real attraction names, heritage landmarks, museums, and exact GPS coordinates (latitude/longitude) with Google Maps routing. | `rating: null`, `estimatedCost: null` (unless indexed in OSM tags) |
| **Hotels API** | **OpenStreetMap** (Accommodations Directory) | **Amadeus Hotel API** (`AMADEUS_CLIENT_ID` + `AMADEUS_CLIENT_SECRET`) | Real hotel names, city locations, types (Hotels, Resorts, Hostels). | `pricePerNight: null`, `availabilityStatus: "CHECK_ONLINE"` (requires Amadeus credentials) |

---

## 3. Environment Variables & Key Configuration

All API keys are stored strictly on the backend and are **never exposed to the React frontend**:

```yaml
# backend/src/main/resources/application.yml
app:
  external:
    weather:
      api-key: ${WEATHER_API_KEY:NO_KEY}
    places:
      api-key: ${PLACES_API_KEY:NO_KEY}
    hotels:
      api-key: ${HOTEL_API_KEY:NO_KEY}
      client-id: ${AMADEUS_CLIENT_ID:NO_KEY}
      client-secret: ${AMADEUS_CLIENT_SECRET:NO_KEY}
```

### To supply your custom keys (Optional):
```powershell
# In PowerShell before running Spring Boot:
$env:WEATHER_API_KEY="your_openweathermap_api_key"
$env:PLACES_API_KEY="your_geoapify_key"
$env:AMADEUS_CLIENT_ID="your_amadeus_client_id"
$env:AMADEUS_CLIENT_SECRET="your_amadeus_client_secret"
mvn spring-boot:run
```

---

## 4. Complete REST API Catalog

### 🌤️ Weather, Places & Hotels
- `GET /api/trips/{tripId}/weather` — Live 7-day weather forecast, rain probability, outdoor conflict detection.
- `GET /api/trips/{tripId}/places` — Live attractions and landmarks with GPS coordinates from OpenStreetMap.
- `GET /api/trips/{tripId}/hotels` — Live accommodation listings with online booking links.

### 🔐 Authentication & Users
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Authenticate user
- `GET /api/users/me` — Current profile

### ✈️ Trips, Members & Invitations
- `POST /api/trips` — Create trip (`isTripAdmin` assigned)
- `GET /api/trips` — List user's trips
- `GET /api/trips/{tripId}` — Trip overview
- `POST /api/trips/{tripId}/invitations` — Send email invitation (Admin only)
- `GET /api/trips/{tripId}/invitations` — View pending invitations (Admin only)
- `DELETE /api/trips/{tripId}/invitations/{id}` — Cancel invitation
- `GET /api/invitations/verify?token={token}` — Verify an invitation token
- `POST /api/invitations/accept?token={token}` — Accept invitation (Strict email match)
- `POST /api/invitations/decline?token={token}` — Decline invitation

### 💰 Budget, Simulator & Rescue
- `GET /api/trips/{tripId}/budget` — Budget breakdown
- `POST /api/trips/{tripId}/budget/hidden-costs` — Add hidden cost
- `POST /api/trips/{tripId}/budget/simulate` — What-If trip simulation
- `GET /api/trips/{tripId}/budget/rescue` — Budget Rescue Plan

### 💸 Expenses & SplitSmart
- `GET /api/trips/{tripId}/expenses` — Trip expenses
- `POST /api/trips/{tripId}/expenses` — Create expense with equal/custom splits
- `POST /api/trips/{tripId}/expenses/{id}/proof` — Upload bill receipt

### 📅 Itinerary, Polls, SOS & Surprise Me
- `GET /api/trips/{tripId}/itinerary` — Day-by-day itinerary
- `POST /api/trips/{tripId}/itinerary/generate` — Auto schedule
- `GET /api/trips/{tripId}/polls` — Group voting polls
- `POST /api/trips/{tripId}/sos` — Broadcast emergency alert
- `POST /api/surprise-me` — AI destination recommendation
- `GET /api/notifications` — Notification feed
