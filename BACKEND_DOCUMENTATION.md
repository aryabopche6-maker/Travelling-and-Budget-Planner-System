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
     MySQL / H2 Database           ├─► Open-Meteo (Forecast) & OpenStreetMap Nominatim (Geocoding)
                                   ├─► OpenStreetMap Nominatim/Overpass (Places)
                                   └─► OpenStreetMap & Amadeus (Hotels)
```

---

## 2. Integrated External APIs & Data Provenance

| API Module | Live Provider (Zero Key Required) | Commercial API Supported | Data Provided Live | Unindexed Fields (Returned as `null`) |
| :--- | :--- | :--- | :--- | :--- |
| **Weather API** | **Open-Meteo** (Forecast) + **OpenStreetMap Nominatim** (Destination geocoding) | None | Current conditions, trip-date daily max/min temperatures, precipitation probabilities, up to 16 forecast days, and rain-risk alerts matched to itinerary dates. | Forecasts beyond 16 days are not available yet; lookup failures return an explicit service error rather than sample weather. |
| **Places API** | **OpenStreetMap** (Nominatim & Overpass) | **Geoapify Places** (`PLACES_API_KEY`) | Real attraction names, heritage landmarks, museums, and exact GPS coordinates (latitude/longitude) with Google Maps routing. | `rating: null`, `estimatedCost: null` (unless indexed in OSM tags) |
| **Hotels API** | **OpenStreetMap** (Accommodations Directory) | **Amadeus Hotel API** (`AMADEUS_CLIENT_ID` + `AMADEUS_CLIENT_SECRET`) | Real hotel names, city locations, types (Hotels, Resorts, Hostels). | `pricePerNight: null`, `availabilityStatus: "CHECK_ONLINE"` (requires Amadeus credentials) |

---

## 3. Environment Variables & Key Configuration

All API keys are stored strictly on the backend and are **never exposed to the React frontend**:

```yaml
# backend/src/main/resources/application.yml
app:
  external:
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
$env:PLACES_API_KEY="your_geoapify_key"
$env:AMADEUS_CLIENT_ID="your_amadeus_client_id"
$env:AMADEUS_CLIENT_SECRET="your_amadeus_client_secret"
$env:FRONTEND_URL="https://your-deployed-app.example"
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="your_sender@gmail.com"
$env:MAIL_PASSWORD="your_smtp_or_app_password"
mvn spring-boot:run
```
Email invitations require SMTP configuration. For Gmail, use an app password rather than your account password. If SMTP is unavailable, the invitation is still created and the response includes `emailSent: false` and an acceptance link that the trip admin can share manually. `FRONTEND_URL` is used to build invitation acceptance links; use the deployed frontend URL when inviting people to a deployed backend.
SOS does not use a paid SMS gateway. It prepares an SMS message on the device; the user must open their SMS app and press Send. Normal mobile-carrier SMS charges may apply. The database records the contact and that manual confirmation is pending; the application cannot verify whether the user ultimately sent the message or whether it was delivered.

---

## 4. Complete REST API Catalog

### 🌤️ Weather, Places & Hotels
- `GET /api/trips/{tripId}/weather` — Live Open-Meteo forecast for the destination and trip dates (up to 16 days), with rain-risk warnings matched against same-day itinerary activities. Destination coordinates are resolved through OpenStreetMap Nominatim; no weather API key is required.
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
- `POST /api/trips/{tripId}/invitations` — Invite a member by email (Admin only; sends an email when SMTP is configured)
- `POST /api/trips/{tripId}/invitations/{invitationId}/resend` — Create a fresh email invitation for an expired or cancelled email invite (Admin only)
- `POST /api/trips/{tripId}/invitations/link` — Create or retrieve a shareable trip invite link (Admin only; link holders can join after signing in)
- `POST /api/trips/{tripId}/invitations/{invitationId}/link` — Replace an expired or cancelled invite with a new shareable link (Admin only)
- `GET /api/trips/{tripId}/invitations` — View trip invitations (Admin only)
- `DELETE /api/trips/{tripId}/invitations/{id}` — Cancel invitation
- `GET /api/invitations/verify?token={token}` — Verify an invitation token
- `POST /api/invitations/accept?token={token}` — Accept invitation (email-targeted invites require the invited email account; shareable links accept the authenticated account)
- `POST /api/invitations/decline?token={token}` — Decline an email invitation

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
- `GET /api/trips/{tripId}/sos/contacts` — List the signed-in user's saved emergency contacts for this trip
- `POST /api/trips/{tripId}/sos/contacts` — Save an emergency contact to the database
- `PUT /api/trips/{tripId}/sos/contacts/{contactId}` — Update a saved emergency contact
- `DELETE /api/trips/{tripId}/sos/contacts/{contactId}` — Delete a saved emergency contact
- `POST /api/trips/{tripId}/sos` — Broadcast emergency alert
- `GET /api/trips/{tripId}/sos` — List trip SOS alerts, including saved SMS delivery results
- `PUT /api/trips/{tripId}/sos/{sosId}/location` — Save an active SOS location update
- `POST /api/trips/{tripId}/sos/{sosId}/safe` — Mark the SOS as safe
- `POST /api/surprise-me` — AI destination recommendation
- `GET /api/notifications` — Notification feed

Emergency contacts are stored in `sos_contacts` and scoped to both their owner and trip. SOS events and their initial/current coordinates are stored in `sos_alerts`. Each SMS recipient, phone-number snapshot, and manual-send status is stored in `sos_deliveries` so the record remains available even if a contact is later edited or deleted. The SOS API uses only contacts saved in the database; contact details are not accepted from the trigger request.
