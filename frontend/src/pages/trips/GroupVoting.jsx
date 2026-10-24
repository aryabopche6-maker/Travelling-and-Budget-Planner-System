import React, { useEffect, useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, Plus, Users, Clock, CheckCircle2, MoreHorizontal, 
  RotateCcw, Sparkles, Hotel, Compass, Search, Check, X
} from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';
import Reveal from '../../components/animations/Reveal';
import { pollService } from '../../services/pollService';

const initialPolls = [
  {
    id: 'poll1',
    category: 'HOTEL',
    type: 'Hotel',
    question: 'Which hotel should we book?',
    totalVotes: 4,
    status: 'Open',
    endsIn: 'Ends in 2 days',
    createdBy: {
      name: 'Arya',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
    },
    headerImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=200&fit=crop',
    userVotedOptionId: 'opt1', // Arya voted for Oceanview Resort
    voters: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop'
    ],
    options: [
      { 
        id: 'opt1', 
        name: 'Oceanview Resort', 
        price: '₹35,000', 
        votes: 3,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=120&h=120&fit=crop'
      },
      { 
        id: 'opt2', 
        name: 'Jungle Retreat', 
        price: '₹28,000', 
        votes: 1,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=120&h=120&fit=crop'
      },
      { 
        id: 'opt3', 
        name: 'City Center Inn', 
        price: '₹20,000', 
        votes: 0,
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=120&h=120&fit=crop'
      },
    ]
  },
  {
    id: 'poll2',
    category: 'ACTIVITY',
    type: 'Activity',
    question: 'Should we add Scuba Diving?',
    extraCost: 'Extra cost: ₹4,000 per person',
    totalVotes: 2,
    status: 'Open',
    endsIn: 'Ends in 4 days',
    createdBy: {
      name: 'Sanu',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
    },
    headerImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=200&fit=crop',
    userVotedOptionId: 'opt4',
    voters: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'
    ],
    voterNote: 'Sanu voted for Yes, definitely! 2 people have voted so far.',
    options: [
      { 
        id: 'opt4', 
        name: 'Yes, definitely!', 
        votes: 2,
        image: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=120&h=120&fit=crop'
      },
      { 
        id: 'opt5', 
        name: "No, let's relax", 
        votes: 1,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=120&fit=crop'
      },
    ]
  }
];

const mapPoll = (poll) => ({
  id: String(poll.id),
  category: (poll.category || 'GENERAL').toUpperCase(),
  question: poll.title,
  totalVotes: Number(poll.totalVotes) || 0,
  status: poll.isLocked ? 'Closed' : 'Open',
  endsIn: poll.createdAt ? `Created ${new Date(poll.createdAt).toLocaleDateString()}` : '',
  createdBy: { name: `Member ${poll.createdBy ?? ''}`.trim() },
  headerImage: null,
  userVotedOptionId: poll.userVotedOptionId == null ? null : String(poll.userVotedOptionId),
  voters: [],
  voterNote: null,
  isLocked: Boolean(poll.isLocked),
  options: (poll.options || []).map((option) => ({
    id: String(option.id),
    name: option.text,
    votes: Number(option.votesCount) || 0,
    image: null
  }))
});

export default function GroupVoting() {
  const { trip, isTripAdmin } = useTrip();
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pollsError, setPollsError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState('All'); // 'All', 'MyVotes', 'Open', 'Closed'
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newCategory, setNewCategory] = useState('HOTEL');
  const [newOptions, setNewOptions] = useState(['', '']);

  useEffect(() => {
    let isMounted = true;
    if (!trip?.id) {
      setIsLoading(false);
      return () => { isMounted = false; };
    }

    setIsLoading(true);
    pollService.getTripPolls(trip.id)
      .then((data) => {
        if (isMounted) setPolls(data.map(mapPoll));
      })
      .catch((error) => {
        console.error('Failed to load group polls:', error);
        if (isMounted) setPollsError(error.response?.data?.message || 'Could not load group polls.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [trip?.id]);

  // Handle Voting / Changing Vote
  const handleVote = async (pollId, optionId) => {
    if (!trip?.id) return;
    try {
      setPollsError('');
      const poll = optionId == null
        ? await pollService.removeVote(trip.id, pollId)
        : await pollService.castVote(trip.id, pollId, Number(optionId));
      const updatedPoll = mapPoll(poll);
      setPolls((previous) => previous.map((item) => item.id === updatedPoll.id ? updatedPoll : item));
    } catch (error) {
      console.error('Failed to update group poll vote:', error);
      setPollsError(error.response?.data?.message || 'Could not save your vote. Please try again.');
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const options = newOptions.map((option) => option.trim()).filter(Boolean);
    if (!trip?.id || !newQuestion.trim() || options.length < 2) return;

    try {
      setIsSaving(true);
      setPollsError('');
      const poll = await pollService.createPoll(trip.id, {
        title: newQuestion.trim(),
        category: newCategory,
        isAnonymous: false,
        options
      });
      setPolls((previous) => [mapPoll(poll), ...previous]);
      setIsCreateModalOpen(false);
      setNewQuestion('');
      setNewOptions(['', '']);
    } catch (error) {
      console.error('Failed to create group poll:', error);
      setPollsError(error.response?.data?.message || 'Could not create this poll. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLockPoll = async (pollId) => {
    if (!trip?.id) return;
    try {
      setPollsError('');
      const poll = await pollService.lockPoll(trip.id, pollId);
      const updatedPoll = mapPoll(poll);
      setPolls((previous) => previous.map((item) => item.id === updatedPoll.id ? updatedPoll : item));
    } catch (error) {
      console.error('Failed to lock group poll:', error);
      setPollsError(error.response?.data?.message || 'Could not lock this poll. Please try again.');
    }
  };

  // Filtered Polls
  const filteredPolls = polls.filter(poll => {
    if (searchQuery && !poll.question.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filter === 'MyVotes') return Boolean(poll.userVotedOptionId);
    if (filter === 'Open') return poll.status === 'Open';
    if (filter === 'Closed') return poll.status === 'Closed';
    return true;
  });

  const totalPollsCount = polls.length;
  const userVotedCount = polls.filter(p => Boolean(p.userVotedOptionId)).length;

  return (
    <PageTransition variant="fade" className="min-h-screen pb-16 text-slate-800">
      
      {/* Top Search Bar & Header Section */}
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Search & Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          {/* Search Input */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full pl-10 pr-4 py-2 text-sm text-slate-700 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Right Header Badges / Actions */}
          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-flex text-xs font-handwriting italic text-slate-500 mr-2">
              Same goals • Better plans ♡
            </span>
            {isTripAdmin && (
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-full text-sm font-semibold shadow-md shadow-emerald-900/15 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Poll
              </motion.button>
            )}
          </div>
        </div>

        {/* Title Header Banner */}
        <Reveal>
          <div className="flex items-center gap-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-100/70 border border-teal-200/70 flex items-center justify-center text-teal-700 shadow-xs">
              <Vote className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Group Voting</h1>
              <p className="text-slate-500 text-sm mt-0.5">Make decisions together without the endless group chat debates.</p>
            </div>
          </div>
        </Reveal>

        {pollsError && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {pollsError}
          </p>
        )}

        {/* Stats Cards (Active Polls & Your Votes) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Active Polls</p>
              <p className="text-xl font-bold text-slate-800">{totalPollsCount}</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-200/70 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Your Votes</p>
              <p className="text-xl font-bold text-slate-800">{userVotedCount} / {totalPollsCount}</p>
            </div>
          </motion.div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'All', label: 'All Polls', icon: Vote },
            { id: 'MyVotes', label: 'My Votes', icon: CheckCircle2 },
            { id: 'Open', label: 'Open', icon: Clock },
            { id: 'Closed', label: 'Closed', icon: Check }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-slate-900/10'
                  : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/70'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Polls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {filteredPolls.map((poll) => {
            const hasVoted = Boolean(poll.userVotedOptionId);
            const userChosenOption = poll.options.find(o => o.id === poll.userVotedOptionId);

            return (
              <Reveal key={poll.id}>
                <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-md shadow-slate-200/50 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                  
                  {/* Top Card Section */}
                  <div className="p-6 pb-4">
                    
                    {/* Header Row: Category Badge + Header Image + Menu */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2.5 ${
                          poll.category === 'HOTEL' 
                            ? 'bg-teal-50 text-teal-700 border border-teal-200/80' 
                            : 'bg-sky-50 text-sky-700 border border-sky-200/80'
                        }`}>
                          {poll.category === 'HOTEL' ? <Hotel className="w-3 h-3" /> : <Compass className="w-3 h-3" />}
                          {poll.category}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 leading-snug">{poll.question}</h3>
                        
                        {poll.extraCost && (
                          <p className="text-xs font-semibold text-slate-500 mt-1">{poll.extraCost}</p>
                        )}
                      </div>

                      <div className="relative shrink-0 flex items-center gap-2">
                        {poll.headerImage && (
                          <img 
                            src={poll.headerImage} 
                            alt="" 
                            className="w-24 h-16 rounded-xl object-cover shadow-xs border border-white"
                          />
                        )}
                        {isTripAdmin && !poll.isLocked && (
                          <button
                            type="button"
                            aria-label="Lock poll"
                            title="Lock poll"
                            onClick={() => handleLockPoll(poll.id)}
                            className="p-1 text-slate-400 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata Row: Votes, Status, Creator */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-5">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {poll.totalVotes} votes
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {poll.status} - {poll.endsIn}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5 font-medium">
                        Created by {poll.createdBy.name}
                      </span>
                    </div>

                    {/* Options List */}
                    <div className="space-y-3">
                      {poll.options.map((option) => {
                        const percentage = poll.totalVotes > 0 
                          ? Math.round((option.votes / poll.totalVotes) * 100) 
                          : 0;
                        const isSelected = poll.userVotedOptionId === option.id;

                        return (
                          <div 
                            key={option.id}
                            onClick={() => !poll.isLocked && handleVote(poll.id, option.id)}
                            className={`group relative rounded-2xl p-3 border transition-all duration-200 ${poll.isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} flex items-center justify-between gap-4 ${
                              isSelected 
                                ? 'bg-emerald-50/50 border-emerald-500/70 shadow-xs' 
                                : 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-slate-300'
                            }`}
                          >
                            {/* Option Left: Thumbnail & Name / Price */}
                            <div className="flex items-center gap-3 min-w-0">
                              {option.image && (
                                <img 
                                  src={option.image} 
                                  alt={option.name} 
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-xs" 
                                />
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">{option.name}</p>
                                {option.price && (
                                  <p className="text-xs font-semibold text-slate-500">{option.price}</p>
                                )}
                              </div>
                            </div>

                            {/* Option Center/Right: Progress Bar + Percentage + Radio */}
                            <div className="flex items-center gap-4 shrink-0">
                              
                              {/* Horizontal Progress Bar & % */}
                              <div className="flex items-center gap-2.5 w-28 sm:w-36">
                                <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className={`h-full rounded-full ${isSelected ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                  />
                                </div>
                                <span className="text-xs font-bold text-slate-600 w-8 text-right">{percentage}%</span>
                              </div>

                              {/* Radio / Check Indicator */}
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                                isSelected 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'border-2 border-slate-300 group-hover:border-slate-400'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>

                  {/* Card Bottom: Confirmation banner or Voters Footer */}
                  {hasVoted ? (
                    <div className="mx-6 mb-6 mt-2 p-3 bg-teal-50/70 border border-teal-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Avatar stack */}
                        <div className="flex items-center -space-x-2 shrink-0">
                          {poll.voters.map((avatar, idx) => (
                            <img 
                              key={idx} 
                              src={avatar} 
                              alt="" 
                              className="w-6 h-6 rounded-full border-2 border-white object-cover" 
                            />
                          ))}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-teal-900 truncate">
                            {poll.voterNote || `You voted for ${userChosenOption?.name}`}
                          </p>
                          <p className="text-[11px] text-teal-700/80">Tap a different option to change your vote.</p>
                        </div>
                      </div>

                      <button 
                        type="button"
                        disabled={poll.isLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(poll.id, null);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 bg-white hover:bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RotateCcw className="w-3 h-3" /> Change Vote
                      </button>
                    </div>
                  ) : (
                    <div className="mx-6 mb-6 mt-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <p className="text-xs text-slate-500">Tap an option to submit your vote.</p>
                      <span className="text-xs font-semibold text-slate-400">Not voted yet</span>
                    </div>
                  )}

                </div>
              </Reveal>
            );
          })}
        </div>
        {isLoading && (
          <p role="status" className="py-10 text-center text-sm text-slate-500">Loading polls...</p>
        )}
        {!isLoading && !pollsError && filteredPolls.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">No polls yet for this trip.</p>
        )}

        {/* Footer subtle text */}
        <div className="pt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Your next adventure is a group decision ♡</span>
        </div>

      </div>

      {/* Create Poll Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Create New Poll</h3>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePoll} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewCategory('HOTEL')}
                      className={`p-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 ${
                        newCategory === 'HOTEL' 
                          ? 'border-teal-500 bg-teal-50 text-teal-800' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Hotel className="w-4 h-4" /> Hotel
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCategory('ACTIVITY')}
                      className={`p-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 ${
                        newCategory === 'ACTIVITY' 
                          ? 'border-sky-500 bg-sky-50 text-sky-800' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Compass className="w-4 h-4" /> Activity
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Question</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Which sunset cruise should we pick?"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Options</label>
                  <div className="space-y-2">
                    {newOptions.map((opt, i) => (
                      <input 
                        key={i}
                        type="text" 
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[i] = e.target.value;
                          setNewOptions(updated);
                        }}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      />
                    ))}
                  </div>
                  {newOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setNewOptions([...newOptions, ''])}
                      className="mt-2 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add another option
                    </button>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md"
                  >
                    {isSaving ? 'Creating...' : 'Create Poll'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageTransition>
  );
}
