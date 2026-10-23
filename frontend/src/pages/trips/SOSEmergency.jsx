import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle, Check, CheckCircle2, ChevronRight, Clock3, HeartHandshake, LocateFixed,
  MapPin, Navigation, Pencil, Phone, Plus, Radio, Search, ShieldAlert, ShieldCheck,
  Send, Siren, Trash2, Users, X
} from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { sosService, startSOSLocationSharing, stopSOSLocationSharing } from '../../services/sosService';

const CONTACT_RELATIONSHIPS = ['Family', 'Friend', 'Travel buddy', 'Other'];
const EMERGENCY_TYPES = ['Medical', 'Personal safety', 'Lost', 'Travel assistance', 'Other'];
const HOLD_DURATION_MS = 3000;

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('This browser does not support location sharing.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => reject(new Error(
        error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied.'
          : error.code === error.TIMEOUT
            ? 'Could not get your location in time.'
            : 'Your current location is unavailable.'
      )),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  });
}

function formatLocation(coords) {
  return {
    latitude: coords.latitude,
    longitude: coords.longitude
  };
}

function getMapUrl(location) {
  return location?.latitude != null && location?.longitude != null
    ? `https://maps.google.com/?q=${location.latitude},${location.longitude}`
    : null;
}

export default function SOSEmergency() {
  const { trip } = useTrip();
  const { user } = useAuth();
  const legacyStorageKey = `wanderplan:sos-contacts:${user?.id || 'guest'}:${trip?.id || 'trip'}`;
  const [contacts, setContacts] = useState([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [contactDraft, setContactDraft] = useState({ name: '', phone: '', relationship: 'Family' });
  const [contactError, setContactError] = useState('');
  const [isPressing, setIsPressing] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isActivating, setIsActivating] = useState(false);
  const [activeAlert, setActiveAlert] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [locationSyncError, setLocationSyncError] = useState('');
  const [deliveryResults, setDeliveryResults] = useState([]);
  const [lastAlert, setLastAlert] = useState(null);
  const [emergencyType, setEmergencyType] = useState('Personal safety');
  const [pageError, setPageError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const progressFrameRef = useRef(null);
  const pressStartedAtRef = useRef(0);
  const locationUnsubscribeRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setContactsLoaded(false);
    const loadContacts = async () => {
      let savedContacts;
      try {
        savedContacts = await sosService.getContacts(trip.id);
      } catch (error) {
        if (isMounted) {
          setContacts([]);
          setContactError(`Could not load emergency contacts: ${error.response?.data?.message || error.message || 'Please try again.'}`);
        }
        return;
      }

      let migrationWarning = '';
      try {
        const legacyJson = localStorage.getItem(legacyStorageKey);
        if (legacyJson) {
          const legacyContacts = JSON.parse(legacyJson);
          if (!Array.isArray(legacyContacts)) {
            throw new Error('Previously saved contacts have an invalid format.');
          }

          for (const legacyContact of legacyContacts) {
            const name = typeof legacyContact.name === 'string' ? legacyContact.name.trim() : '';
            const phone = typeof legacyContact.phone === 'string'
              ? legacyContact.phone.replace(/[\s()-]/g, '')
              : '';
            if (!name || !/^\+[1-9]\d{7,14}$/.test(phone)) {
              migrationWarning = 'Some old browser-saved contacts have invalid details. Please review and add them again.';
              break;
            }
            if (savedContacts.some((contact) => contact.phone === phone)) continue;
            if (savedContacts.length >= 5) {
              migrationWarning = 'There is no space to migrate all old contacts. Remove a contact or add the remaining ones manually.';
              break;
            }
            const migrated = await sosService.addContact(trip.id, {
              name,
              phone,
              relationship: legacyContact.relationship || 'Family'
            });
            savedContacts = [...savedContacts, migrated];
          }

          if (!migrationWarning) localStorage.removeItem(legacyStorageKey);
        }
      } catch (error) {
        migrationWarning = `Could not migrate all previously saved contacts: ${error.response?.data?.message || error.message || 'Please try again.'}`;
      }

      if (isMounted) {
        setContacts(savedContacts);
        setContactError(migrationWarning);
      }
    };

    loadContacts().finally(() => {
      if (isMounted) setContactsLoaded(true);
    });
    return () => {
      isMounted = false;
    };
  }, [legacyStorageKey, trip.id]);

  const startLocationWatch = useCallback((alert) => {
    if (!alert?.id) return;
    locationUnsubscribeRef.current?.();
    locationUnsubscribeRef.current = startSOSLocationSharing(
      trip.id,
      alert.id,
      {
        onLocation: (nextLocation) => {
          setLocation(nextLocation);
          setLocationError('');
        },
        onError: setLocationError,
        onSync: () => setLocationSyncError(''),
        onSyncError: () => setLocationSyncError('Live location could not be synced. Check your connection.')
      },
      alert.latitude != null && alert.longitude != null
    );
  }, [trip?.id]);

  useEffect(() => {
    let isMounted = true;
    sosService.getAlerts(trip.id)
      .then((alerts) => {
        if (!isMounted) return;
        const userActiveAlert = alerts.find((alert) =>
          String(alert.userId) === String(user?.id) && alert.status === 'ACTIVE'
        );
        setLastAlert(alerts[0] || null);
        if (userActiveAlert) {
          setActiveAlert(userActiveAlert);
          setDeliveryResults(userActiveAlert.smsDeliveryResults || []);
          setLocation(userActiveAlert.latitude != null && userActiveAlert.longitude != null
            ? { latitude: userActiveAlert.latitude, longitude: userActiveAlert.longitude }
            : null);
          startLocationWatch(userActiveAlert);
        }
      })
      .catch(() => {
        if (isMounted) setPageError('Could not load SOS status. Check your connection and reload this page.');
      });

    return () => {
      isMounted = false;
    };
  }, [trip.id, user?.id, startLocationWatch]);

  useEffect(() => () => {
    if (progressFrameRef.current != null) cancelAnimationFrame(progressFrameRef.current);
    locationUnsubscribeRef.current?.();
  }, []);

  const visibleContacts = useMemo(() => contacts.filter((contact) => {
    const search = contactSearch.trim().toLowerCase();
    return !search || `${contact.name} ${contact.phone} ${contact.relationship}`.toLowerCase().includes(search);
  }), [contacts, contactSearch]);

  const openContactForm = (contact = null) => {
    setEditingContactId(contact?.id || null);
    setContactDraft(contact
      ? { name: contact.name, phone: contact.phone, relationship: contact.relationship || 'Family' }
      : { name: '', phone: '', relationship: 'Family' });
    setContactError('');
    setContactFormOpen(true);
  };

  const saveContact = async (event) => {
    event.preventDefault();
    const name = contactDraft.name.trim();
    const phone = contactDraft.phone.replace(/[\s()-]/g, '');
    if (!name) {
      setContactError('Enter your contact’s name.');
      return;
    }
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      setContactError('Use an international phone number, for example +919876543210.');
      return;
    }

    const duplicate = contacts.some((contact) =>
      contact.phone === phone && contact.id !== editingContactId
    );
    if (duplicate) {
      setContactError('That phone number is already in your emergency contacts.');
      return;
    }
    if (!editingContactId && contacts.length >= 5) {
      setContactError('You can add up to five emergency contacts.');
      return;
    }

    setContactError('');
    setIsSavingContact(true);
    try {
      const payload = { name, phone, relationship: contactDraft.relationship };
      const savedContact = editingContactId
        ? await sosService.updateContact(trip.id, editingContactId, payload)
        : await sosService.addContact(trip.id, payload);
      setContacts((current) => editingContactId
        ? current.map((contact) => contact.id === editingContactId ? savedContact : contact)
        : [...current, savedContact]);
      setContactFormOpen(false);
      setActionMessage(editingContactId ? 'Emergency contact updated.' : 'Emergency contact added.');
      window.setTimeout(() => setActionMessage(''), 3500);
    } catch (error) {
      setContactError(error.response?.data?.message || error.message || 'Could not save this emergency contact.');
    } finally {
      setIsSavingContact(false);
    }
  };

  const deleteContact = async (contact) => {
    setContactError('');
    try {
      await sosService.deleteContact(trip.id, contact.id);
      setContacts((current) => current.filter((item) => item.id !== contact.id));
      setActionMessage(`${contact.name} removed from emergency contacts.`);
      window.setTimeout(() => setActionMessage(''), 3500);
    } catch (error) {
      setContactError(error.response?.data?.message || error.message || 'Could not remove this emergency contact.');
    }
  };

  const activateSOS = useCallback(async () => {
    setIsPressing(false);
    setIsActivating(true);
    setPageError('');
    setLocationError('');
    setLocationSyncError('');

    let currentLocation = null;
    try {
      const position = await getCurrentPosition();
      currentLocation = formatLocation(position.coords);
      setLocation(currentLocation);
    } catch (error) {
      setLocation(null);
      setLocationError(error.message);
    }

    try {
      const alert = await sosService.trigger(trip.id, {
        emergencyType,
        latitude: currentLocation?.latitude ?? null,
        longitude: currentLocation?.longitude ?? null
      });
      setActiveAlert(alert);
      setLastAlert(alert);
      setDeliveryResults(alert.smsDeliveryResults || []);
      startLocationWatch(alert);
    } catch (error) {
      const detail = error.response?.data?.message || error.message;
      setPageError(`SOS could not be activated: ${detail || 'Please try again.'}`);
      setLocation(null);
    } finally {
      setIsActivating(false);
    }
  }, [emergencyType, startLocationWatch, trip.id]);

  const startPress = (event) => {
    if (activeAlert || isActivating || isPressing) return;
    if (typeof event.pointerId === 'number') {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    setPageError('');
    setIsPressing(true);
    setHoldProgress(0);
    pressStartedAtRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - pressStartedAtRef.current;
      setHoldProgress(Math.min(elapsed / HOLD_DURATION_MS, 1));
      if (elapsed >= HOLD_DURATION_MS) {
        setHoldProgress(0);
        setIsPressing(false);
        activateSOS();
        return;
      }
      progressFrameRef.current = requestAnimationFrame(updateProgress);
    };
    progressFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const cancelPress = () => {
    if (!isPressing) return;
    if (progressFrameRef.current != null) cancelAnimationFrame(progressFrameRef.current);
    setIsPressing(false);
    setHoldProgress(0);
  };

  const markSafe = async () => {
    if (!activeAlert) return;
    setPageError('');
    try {
      const resolvedAlert = await sosService.markSafe(trip.id, activeAlert.id);
      setLastAlert(resolvedAlert);
      setActiveAlert(null);
      setDeliveryResults([]);
      setLocation(null);
      setLocationError('');
      setLocationSyncError('');
      locationUnsubscribeRef.current?.();
      locationUnsubscribeRef.current = null;
      stopSOSLocationSharing(activeAlert.id);
    } catch (error) {
      setPageError(`Could not mark you safe: ${error.response?.data?.message || error.message || 'Please try again.'}`);
    }
  };

  const mapUrl = getMapUrl(location);
  return (
    <PageTransition variant="slideUp" className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="rounded-3xl bg-gradient-to-r from-slate-950 via-teal-950 to-slate-800 px-6 py-7 text-white shadow-xl md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/20 text-teal-200 ring-1 ring-white/15">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">Safety center</p>
              <h1 className="text-3xl font-bold tracking-tight">Emergency SOS</h1>
              <p className="mt-1 text-sm text-slate-200">Reach your trusted people and share your current location.</p>
            </div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
            <span className="text-slate-300">Current trip</span>
            <p className="font-semibold text-white">{trip.destination || 'Your trip'}</p>
          </div>
        </div>
      </header>

      {pageError && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}
      {actionMessage && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-5 w-5" /> {actionMessage}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3" aria-label="SOS overview">
        <div className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
          <span className="rounded-xl bg-teal-50 p-3 text-teal-700"><Users className="h-6 w-6" /></span>
          <div><p className="text-sm text-slate-500">Emergency contacts</p><p className="font-bold text-slate-900">{contacts.length} added</p></div>
          <ChevronRight className="ml-auto h-5 w-5 text-teal-700" />
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
          <span className={`rounded-xl p-3 ${activeAlert ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><MapPin className="h-6 w-6" /></span>
          <div><p className="text-sm text-slate-500">Location sharing</p><p className="font-bold text-slate-900">{activeAlert ? 'Active' : 'Off until SOS'}</p></div>
          <ChevronRight className="ml-auto h-5 w-5 text-teal-700" />
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
          <span className={`rounded-xl p-3 ${lastAlert ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}><ShieldCheck className="h-6 w-6" /></span>
          <div><p className="text-sm text-slate-500">Last alert</p><p className="font-bold text-slate-900">{lastAlert ? lastAlert.status : 'Not triggered'}</p></div>
          <ChevronRight className="ml-auto h-5 w-5 text-teal-700" />
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,0.9fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-teal-50 p-3 text-teal-700"><HeartHandshake className="h-6 w-6" /></span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Emergency contacts</h2>
                <p className="text-sm text-slate-500">These people get an SMS when you trigger SOS.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openContactForm()}
              disabled={!contactsLoaded || contacts.length >= 5 || Boolean(activeAlert)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add contact
            </button>
          </div>

          <div className="mb-4 flex gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-slate-400 focus-within:border-teal-600">
              <Search className="h-4 w-4" />
              <input
                value={contactSearch}
                onChange={(event) => setContactSearch(event.target.value)}
                placeholder="Search contacts..."
                aria-label="Search emergency contacts"
                className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>
            <span className="hidden items-center rounded-xl border border-slate-200 px-3 text-sm text-slate-500 sm:flex">Up to 5</span>
          </div>

          {contactFormOpen && (
            <form onSubmit={saveContact} className="mb-4 rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{editingContactId ? 'Edit contact' : 'Add trusted contact'}</h3>
                <button type="button" onClick={() => setContactFormOpen(false)} aria-label="Close contact form" className="rounded-lg p-1.5 text-slate-500 hover:bg-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">
                  Name
                  <input
                    autoFocus
                    value={contactDraft.name}
                    onChange={(event) => setContactDraft((draft) => ({ ...draft, name: event.target.value }))}
                    maxLength={80}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-teal-600"
                    placeholder="e.g. Mom"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Phone number
                  <input
                    type="tel"
                    value={contactDraft.phone}
                    onChange={(event) => setContactDraft((draft) => ({ ...draft, phone: event.target.value }))}
                    maxLength={20}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-teal-600"
                    placeholder="+919876543210"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                  Relationship
                  <select
                    value={contactDraft.relationship}
                    onChange={(event) => setContactDraft((draft) => ({ ...draft, relationship: event.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900 outline-none focus:border-teal-600"
                  >
                    {CONTACT_RELATIONSHIPS.map((relationship) => <option key={relationship}>{relationship}</option>)}
                  </select>
                </label>
              </div>
              {contactError && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{contactError}</p>}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setContactFormOpen(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white">Cancel</button>
                <button type="submit" disabled={isSavingContact} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">{isSavingContact ? 'Saving…' : editingContactId ? 'Save changes' : 'Add contact'}</button>
              </div>
            </form>
          )}

          {contactError && !contactFormOpen && <p role="alert" className="mb-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{contactError}</p>}

          {visibleContacts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-center">
              <Users className="mx-auto mb-3 h-9 w-9 text-teal-700" />
              <p className="font-semibold text-slate-800">{!contactsLoaded ? 'Loading emergency contacts…' : contacts.length ? 'No matching contacts' : 'Add someone you trust'}</p>
              <p className="mt-1 text-sm text-slate-500">Contacts are saved to your account and this trip in the database.</p>
              {contactsLoaded && !contacts.length && <button type="button" onClick={() => openContactForm()} className="mt-4 font-semibold text-teal-700 hover:underline">Add your first contact</button>}
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleContacts.map((contact, index) => (
                <li key={contact.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:border-teal-300 sm:flex-nowrap">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${['bg-teal-100 text-teal-800', 'bg-violet-100 text-violet-800', 'bg-orange-100 text-orange-800', 'bg-rose-100 text-rose-800', 'bg-sky-100 text-sky-800'][index % 5]}`}>
                    {contact.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{contact.name}</p>
                      <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">{contact.relationship || 'Contact'}</span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><Phone className="h-3.5 w-3.5" />{contact.phone}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => openContactForm(contact)} disabled={Boolean(activeAlert)} aria-label={`Edit ${contact.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-800 disabled:opacity-40"><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => deleteContact(contact)} disabled={Boolean(activeAlert)} aria-label={`Remove ${contact.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Phone numbers must include their country code. Contacts are stored securely with your account and trip; SMS recipient details are also saved with each alert.
          </p>
        </section>

        <aside className="overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950 p-5 text-white shadow-xl md:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Emergency action</p>
              <h2 className="mt-1 text-xl font-bold">{activeAlert ? 'SOS is active' : 'Need help?'}</h2>
              <p className="mt-1 text-sm text-slate-300">{activeAlert ? 'SOS is active. Open SMS to alert your contacts.' : 'Press and hold the button for 3 seconds.'}</p>
            </div>
            <span className="rounded-xl bg-red-500/15 p-3 text-red-300"><Siren className="h-6 w-6" /></span>
          </div>

          {!activeAlert ? (
            <>
              <label className="mb-5 block text-sm font-medium text-slate-200">
                What do you need help with?
                <select
                  value={emergencyType}
                  onChange={(event) => setEmergencyType(event.target.value)}
                  disabled={isPressing || isActivating}
                  className="mt-2 w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-white outline-none focus:border-teal-400"
                >
                  {EMERGENCY_TYPES.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <div className="flex flex-col items-center py-2">
                <div className="relative flex h-56 w-56 items-center justify-center">
                  <div className={`absolute inset-2 rounded-full border ${isPressing ? 'animate-ping border-red-300/60' : 'border-red-300/15'}`} />
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 224 224" aria-hidden="true">
                    <circle cx="112" cy="112" r="103" fill="none" stroke="rgba(248,113,113,0.18)" strokeWidth="5" />
                    <circle
                      cx="112" cy="112" r="103" fill="none" stroke="#fb7185" strokeWidth="5"
                      strokeDasharray={2 * Math.PI * 103}
                      strokeDashoffset={2 * Math.PI * 103 * (1 - holdProgress)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <button
                    type="button"
                    onPointerDown={startPress}
                    onPointerUp={cancelPress}
                    onPointerCancel={cancelPress}
                    onLostPointerCapture={cancelPress}
                    onKeyDown={(event) => {
                      if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
                        event.preventDefault();
                        startPress(event);
                      }
                    }}
                    onKeyUp={(event) => {
                      if (event.key === ' ' || event.key === 'Enter') cancelPress();
                    }}
                    onBlur={cancelPress}
                    disabled={isActivating}
                    aria-label="Press and hold for three seconds to activate emergency SOS"
                    className="relative flex h-44 w-44 select-none flex-col items-center justify-center rounded-full border-[5px] border-red-300 bg-gradient-to-b from-red-500 to-rose-700 text-white shadow-[0_0_42px_rgba(244,63,94,0.45)] transition-transform active:scale-95 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isActivating ? <LocateFixed className="mb-2 h-12 w-12 animate-pulse" /> : <ShieldAlert className="mb-2 h-12 w-12" />}
                    <span className="text-3xl font-black tracking-widest">{isActivating ? 'GPS' : 'SOS'}</span>
                    <span className="mt-2 text-[11px] font-bold uppercase tracking-wide">{isActivating ? 'Getting location' : isPressing ? 'Keep holding...' : 'Hold 3 seconds'}</span>
                  </button>
                </div>
                <p className="mt-3 text-center text-xs text-slate-400">An SOS alert will be recorded for this trip.</p>
              </div>
            </>
          ) : (
            <div role="status" className="rounded-2xl border border-red-300/30 bg-red-950/40 p-4">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-300"><Radio className="h-5 w-5" /></span>
                <div><p className="font-bold text-red-200">SOS activated</p><p className="text-xs text-slate-300">{activeAlert.emergencyType} · {activeAlert.status}</p></div>
              </div>
              <div className="space-y-3 rounded-xl bg-slate-950/40 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                  <div className="min-w-0">
                    <p className="font-semibold">Live location</p>
                    {location ? (
                      <>
                        <p className="break-all text-xs text-slate-300">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p>
                        {mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-teal-300 hover:underline"><Navigation className="h-3 w-3" />Open map</a>}
                      </>
                    ) : <p className="text-xs text-amber-300">{locationError || 'Waiting for GPS…'}</p>}
                  </div>
                </div>
                {(locationSyncError || locationError) && <p className="text-xs text-amber-300">{locationSyncError || locationError}</p>}
              </div>
              <div className="mt-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-teal-300" /> Alert your contacts</p>
                {deliveryResults.length ? (
                  <ul className="space-y-2">
                    {deliveryResults.map((result, index) => (
                      <li key={`${result.phone}-${index}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs">
                        <span className="min-w-0 flex-1 truncate">{result.name} · {result.phone}</span>
                        <a
                          href={`sms:${result.phone}?body=${encodeURIComponent(
                            `EMERGENCY: ${activeAlert.userName || user?.name || 'I'} need help (${activeAlert.emergencyType}). ${
                              getMapUrl(location) || 'My current location is unavailable.'
                            } Please contact me now.`
                          )}`}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-2 font-semibold text-white hover:bg-teal-500"
                        >
                          <Send className="h-3.5 w-3.5" /> Open SMS app
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-amber-200">
                    {contacts.length
                      ? 'SMS recipient history is unavailable for this alert. Your contacts are saved; use them when creating a new SOS alert.'
                      : 'No emergency contacts were added. Trip members still receive an in-app alert.'}
                  </p>
                )}
                {deliveryResults.length > 0 && (
                  <p className="mt-2 text-xs leading-relaxed text-amber-200">Tap Open SMS app, then press Send in your messaging app. The website cannot confirm whether the message was sent. Carrier charges may apply.</p>
                )}
              </div>
              <button type="button" onClick={markSafe} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-500">
                <Check className="h-5 w-5" /> I am safe now
              </button>
              <p className="mt-2 text-center text-xs text-slate-400">This stops live location updates and tells trip members you are safe.</p>
            </div>
          )}

          {!activeAlert && (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-4 w-4 text-teal-300" /> How it works</h3>
              <ol className="space-y-2.5 text-xs leading-relaxed text-slate-300">
                <li className="flex gap-2"><span className="font-bold text-teal-300">1.</span> Hold SOS for 3 seconds to request your GPS location.</li>
                <li className="flex gap-2"><span className="font-bold text-teal-300">2.</span> Trip members get an in-app alert. Tap Open SMS app for each saved contact, then press Send.</li>
                <li className="flex gap-2"><span className="font-bold text-teal-300">3.</span> Location updates continue until you mark yourself safe.</li>
              </ol>
            </div>
          )}
        </aside>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 text-sm text-slate-700">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-amber-100 p-2 text-amber-800"><AlertCircle className="h-5 w-5" /></span>
          <div><p className="font-semibold">A few safety reminders</p><p className="text-xs text-slate-500">Keep your phone charged, share your live location, and contact local emergency services if you are in immediate danger.</p></div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-800"><LocateFixed className="h-4 w-4" /> GPS permission is needed to share your location</span>
      </section>
    </PageTransition>
  );
}
