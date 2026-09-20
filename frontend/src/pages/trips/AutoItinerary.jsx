import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTrip } from "../../context/TripContext";
import { Clock, Sun, MapPin, GripVertical, Plus, Coffee, Camera, Compass, Sparkles, Navigation, ChevronRight, X, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import PageTransition from "../../components/common/PageTransition";
import Reveal from "../../components/animations/Reveal";
import { itineraryService } from "../../services/itineraryService";

const CATEGORY_META = {
  "food & culture": { icon: Coffee, gradient: "from-orange-500/20 to-amber-500/20", color: "text-orange-500" },
  food:             { icon: Coffee, gradient: "from-orange-500/20 to-amber-500/20", color: "text-orange-500" },
  attraction:       { icon: Camera, gradient: "from-purple-500/20 to-pink-500/20",  color: "text-purple-500" },
  relax:            { icon: Sparkles, gradient: "from-rose-500/20 to-pink-500/20",  color: "text-rose-500" },
  relaxation:       { icon: Sparkles, gradient: "from-rose-500/20 to-pink-500/20",  color: "text-rose-500" },
  logistics:        { icon: Navigation, gradient: "from-blue-500/20 to-cyan-500/20", color: "text-blue-500" },
};
const DEFAULT_META = { icon: Compass, gradient: "from-teal-500/20 to-emerald-500/20", color: "text-teal-500" };

const CATEGORY_IMAGES = {
  "food & culture": "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=80",
  food:             "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
  attraction:       "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
  relax:            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
  relaxation:       "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
  logistics:        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80",
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80";

function getMeta(category) {
  const key = (category || "").toLowerCase();
  return CATEGORY_META[key] || DEFAULT_META;
}
function getImage(category) {
  const key = (category || "").toLowerCase();
  return CATEGORY_IMAGES[key] || DEFAULT_IMAGE;
}

const timelineItem = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } })
};

export default function AutoItinerary() {
  const { trip } = useTrip();
  const tripId = trip?.id;

  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newActivity, setNewActivity] = useState({ title: "", time: "", category: "attraction", location: "", dayId: "" });

  useEffect(() => { if (tripId) fetchItinerary(); }, [tripId]);

  const fetchItinerary = async () => {
    try {
      setLoading(true); setError(null);
      const data = await itineraryService.getItinerary(tripId);
      setDays(data.days || []);
      if (data.days?.length > 0) setNewActivity(prev => ({ ...prev, dayId: data.days[0].id }));
    } catch { setError("Could not load itinerary. Please try again."); }
    finally { setLoading(false); }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.title || !newActivity.time || !newActivity.dayId) return;
    try {
      setSaving(true);
      await itineraryService.addActivity(tripId, { dayId: newActivity.dayId, title: newActivity.title, time: newActivity.time, category: newActivity.category, location: newActivity.location });
      setIsModalOpen(false);
      setNewActivity({ title: "", time: "", category: "attraction", location: "", dayId: days[0]?.id || "" });
      await fetchItinerary();
    } catch { alert("Failed to add activity."); }
    finally { setSaving(false); }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!confirm("Remove this activity?")) return;
    try { await itineraryService.deleteActivity(tripId, activityId); await fetchItinerary(); }
    catch { alert("Failed to delete activity."); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-muted">
      <Loader2 className="w-10 h-10 animate-spin text-teal" />
      <p className="font-medium">Loading your itinerary...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <AlertTriangle className="w-10 h-10 text-orange-400" />
      <p className="text-charcoal font-semibold">{error}</p>
      <Button onClick={fetchItinerary} className="bg-teal text-white">Retry</Button>
    </div>
  );

  return (
    <PageTransition variant="fade" className="max-w-6xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-charcoal text-white p-8 sm:p-12 mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-coral/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-md mb-4 text-teal-100">
                <Sparkles className="w-4 h-4" /> Smart Day Planner
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">{trip?.name || "Your Curated Journey"}</h1>
              <p className="text-lg text-white/70">Trip to <span className="text-teal-300 font-semibold">{trip?.destination || "..."}</span> — day-by-day, perfectly paced.</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-gradient-to-r from-teal to-emerald-500 text-white border-0 shadow-lg shadow-teal/30 px-6 py-6 rounded-2xl text-lg hover:shadow-teal/50 transition-all duration-300">
                <Plus className="w-5 h-5" /> Add Activity
              </Button>
            </motion.div>
          </div>
        </div>
      </Reveal>

      <div className="space-y-16">
        {days.map((day, dayIdx) => (
          <Reveal key={day.id} delay={dayIdx * 0.1}>
            <div className="relative">
              <div className="sticky top-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-sm ring-1 ring-black/5">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-charcoal to-gray-800 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-black/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">Day</span>
                    <span className="text-xl font-black">{day.dayNumber}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-charcoal">{day.title || ("Day " + day.dayNumber)}</h3>
                    <p className="text-muted font-medium">{day.date ? new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold shadow-inner border backdrop-blur-sm bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600">
                  <div className="p-1.5 rounded-lg bg-blue-500/20"><Sun className="w-5 h-5" /></div>
                  <span>{day.activities?.length || 0} activities</span>
                </div>
              </div>

              <div className="relative pl-8 sm:pl-12">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal/30 via-emerald-500/30 to-transparent rounded-full ml-3 sm:ml-[1.15rem]" />
                <div className="space-y-6">
                  {(day.activities || []).length === 0 && (
                    <div className="text-center py-10 text-muted border-2 border-dashed border-muted/30 rounded-2xl">No activities yet — add one!</div>
                  )}
                  {(day.activities || []).map((act, actIdx) => {
                    const globalIdx = dayIdx * 5 + actIdx;
                    const meta = getMeta(act.category);
                    const Icon = meta.icon;
                    const image = getImage(act.category);
                    return (
                      <motion.div key={act.id} custom={globalIdx} variants={timelineItem} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="relative group">
                        <div className="absolute -left-8 sm:-left-12 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center">
                          <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }} className="w-10 h-10 rounded-full bg-white border-4 border-teal shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <div className="w-2 h-2 bg-teal rounded-full" />
                          </motion.div>
                        </div>
                        <div className="relative overflow-hidden rounded-3xl transition-all duration-500 bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 hover:border-teal/30">
                          <div className={"absolute inset-0 bg-gradient-to-br " + meta.gradient + " opacity-50 pointer-events-none"} />
                          <div className="relative flex flex-col md:flex-row p-3 gap-6 h-full items-stretch">
                            <div className="relative w-full md:w-56 h-44 md:h-auto rounded-2xl overflow-hidden shrink-0 shadow-inner group-hover:shadow-lg transition-shadow duration-300">
                              <img src={image} alt={act.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                              <div className="absolute bottom-3 left-3">
                                <div className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-sm font-bold flex items-center gap-1.5 border border-white/20 shadow-sm">
                                  <Clock className="w-3.5 h-3.5" /> {act.time}
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 py-4 pr-4 flex flex-col justify-center">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div>
                                  <div className={"inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 " + meta.color}>
                                    <Icon className="w-4 h-4" /> {act.category || "Activity"}
                                  </div>
                                  <h4 className="font-extrabold text-2xl text-charcoal group-hover:text-teal transition-colors duration-300">{act.title}</h4>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="cursor-grab p-2 text-muted hover:text-charcoal bg-white/50 rounded-xl hover:bg-white transition-colors shadow-sm hidden md:block"><GripVertical className="w-5 h-5" /></div>
                                  <button onClick={() => handleDeleteActivity(act.id)} className="p-2 text-muted hover:text-red-500 bg-white/50 rounded-xl hover:bg-red-50 transition-colors shadow-sm hidden md:block"><Trash2 className="w-5 h-5" /></button>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-muted font-medium mt-1 text-sm">
                                {act.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {act.location}</span>}
                                {act.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {act.duration}</span>}
                                {act.estimatedCost > 0 && <span className="flex items-center gap-1.5 text-teal font-semibold">Rs.{act.estimatedCost?.toLocaleString()}</span>}
                              </div>
                              <div className="mt-5 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <a href={"https://www.google.com/maps/search/" + encodeURIComponent(act.location || act.title)} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" className="rounded-xl bg-teal/10 text-teal hover:bg-teal hover:text-white border-0">Get Directions <ChevronRight className="w-4 h-4 ml-1" /></Button>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-muted hover:text-charcoal bg-black/5 hover:bg-black/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              <h2 className="text-2xl font-bold text-charcoal mb-2">Add New Activity</h2>
              <p className="text-muted text-sm mb-6">Saved directly to your trip itinerary.</p>
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1.5">Activity Title *</label>
                  <input type="text" required value={newActivity.title} onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })} placeholder="e.g. Sunset Dinner" className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1.5">Day *</label>
                    <select value={newActivity.dayId} onChange={(e) => setNewActivity({ ...newActivity, dayId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all">
                      {days.map((d) => (<option key={d.id} value={d.id}>Day {d.dayNumber} – {d.date ? new Date(d.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : ""}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1.5">Time *</label>
                    <input type="time" required value={newActivity.time} onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1.5">Category</label>
                    <select value={newActivity.category} onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all">
                      <option value="attraction">Attraction</option>
                      <option value="food">Food & Drink</option>
                      <option value="relax">Relaxation</option>
                      <option value="logistics">Logistics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-muted mb-1.5">Location</label>
                    <input type="text" value={newActivity.location} onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })} placeholder="e.g. Seminyak Beach" className="w-full px-4 py-3 rounded-xl border border-black/10 bg-white/50 focus:bg-white focus:ring-2 focus:ring-teal/50 outline-none transition-all" />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={saving} className="w-full py-4 text-lg bg-gradient-to-r from-teal to-emerald-500 text-white border-0 shadow-lg shadow-teal/30 rounded-xl hover:shadow-teal/50 disabled:opacity-60">
                    {saving ? "Saving..." : "Add to Itinerary"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
