import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, Users, Vote, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';
import Reveal from '../../components/animations/Reveal';

const mockPolls = [
  {
    id: 'poll1',
    question: 'Which hotel should we book?',
    type: 'Hotel',
    totalVotes: 4,
    hasVoted: true,
    options: [
      { id: 'opt1', text: 'Oceanview Resort (₹35k)', votes: 3 },
      { id: 'opt2', text: 'Jungle Retreat (₹28k)', votes: 1 },
      { id: 'opt3', text: 'City Center Inn (₹20k)', votes: 0 },
    ]
  },
  {
    id: 'poll2',
    question: 'Should we add Scuba Diving? (₹4000 extra)',
    type: 'Activity',
    totalVotes: 2,
    hasVoted: false,
    options: [
      { id: 'opt4', text: 'Yes, definitely!', votes: 2 },
      { id: 'opt5', text: 'No, let\'s relax', votes: 0 },
    ]
  }
];

export default function GroupVoting() {
  const { trip, isTripAdmin } = useTrip(); // Use isTripAdmin
  const [polls, setPolls] = useState(mockPolls);
  const [justVoted, setJustVoted] = useState(null);

  const handleVote = (pollId, optionId) => {
    setJustVoted(optionId);
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        return {
          ...p,
          hasVoted: true,
          totalVotes: p.totalVotes + 1,
          options: p.options.map(opt => 
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          )
        };
      }
      return p;
    }));
    setTimeout(() => setJustVoted(null), 1500);
  };

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-12">
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal/10 text-teal rounded-xl flex items-center justify-center shrink-0 border border-teal/20 shadow-inner">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-charcoal">Group Voting</h1>
              <p className="text-muted mt-1">Make decisions together without the endless group chat debates.</p>
            </div>
          </div>
          {isTripAdmin && (
            <Button className="gap-2 shrink-0 bg-teal hover:bg-teal-500 shadow-lg shadow-teal/30 text-white">
              <Plus className="w-4 h-4" /> Create Poll
            </Button>
          )}
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll, index) => (
          <Reveal key={poll.id} delay={0.1 + index * 0.1}>
            <Card className="p-0 overflow-hidden flex flex-col h-full border-muted/30 bg-white shadow-sm hover:shadow-md hover:border-teal/30 transition-all duration-300">
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-xs px-2.5 py-1 bg-bg border border-muted/30 rounded-full text-teal font-bold tracking-wider uppercase mb-3 inline-block shadow-inner">
                      {poll.type}
                    </span>
                    <h3 className="font-bold text-xl text-charcoal leading-tight">{poll.question}</h3>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    className="flex items-center gap-1.5 text-xs font-bold text-muted bg-bg px-2.5 py-1.5 rounded-lg border border-muted/30 shrink-0 shadow-inner"
                  >
                    <Users className="w-3.5 h-3.5 text-teal" /> {poll.totalVotes}
                  </motion.div>
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-end">
                  {poll.options.map((opt, optIdx) => {
                    const percentage = poll.totalVotes > 0 ? (opt.votes / poll.totalVotes) * 100 : 0;
                    const isWinning = poll.hasVoted && percentage === Math.max(...poll.options.map(o => poll.totalVotes > 0 ? (o.votes / poll.totalVotes) * 100 : 0));
                    
                    return (
                      <div key={opt.id} className="relative w-full">
                        {!poll.hasVoted ? (
                          <motion.button
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleVote(poll.id, opt.id)}
                            className="w-full text-left px-5 py-3.5 rounded-xl border-2 border-muted/30 hover:border-teal hover:bg-teal/5 transition-all duration-300 font-medium text-sm text-muted group"
                          >
                            <span className="group-hover:text-charcoal transition-colors">{opt.text}</span>
                          </motion.button>
                        ) : (
                          <div className="w-full relative overflow-hidden rounded-xl bg-bg/50 border border-muted/30 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.2 + optIdx * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                              className={`absolute inset-0 border-r ${isWinning ? 'bg-teal/25 border-teal/60' : 'bg-teal/10 border-teal/30'}`}
                            />
                            <div className="relative px-5 py-3.5 flex items-center justify-between text-sm">
                              <span className={`font-bold z-10 ${isWinning ? 'text-charcoal' : 'text-muted'}`}>{opt.text}</span>
                              <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 + optIdx * 0.15 }}
                                className={`font-bold z-10 ${isWinning ? 'text-teal' : 'text-teal/70'}`}
                              >
                                {Math.round(percentage)}%
                              </motion.span>
                            </div>
                            {/* Winner sparkle */}
                            {isWinning && percentage > 0 && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="absolute right-12 top-1/2 -translate-y-1/2 z-10"
                              >
                                <Sparkles className="w-4 h-4 text-teal" />
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <AnimatePresence>
                {poll.hasVoted && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.3 }}
                    className="bg-bg/50 py-3 text-center border-t border-muted/30"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-teal/80">
                      <CheckSquare className="w-3.5 h-3.5 inline mr-1 mb-0.5" /> Voted
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageTransition>
  );
}
