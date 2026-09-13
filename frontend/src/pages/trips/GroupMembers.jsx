import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { Users, Mail, UserMinus, Shield, Plus, Crown } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { motion } from 'framer-motion';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';

export default function GroupMembers() {
  const { trip, isTripAdmin } = useTrip(); // Use isTripAdmin
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsInviting(true);
    setTimeout(() => {
      setIsInviting(false);
      setInviteEmail('');
      // Show toast ideally
    }, 1000);
  };

  return (
    <PageTransition variant="slideUp" className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-muted/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-coral/10 text-coral rounded-xl flex items-center justify-center shrink-0 border border-coral/20 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Trip Members</h1>
            <p className="text-muted mt-1">Manage everyone joining the trip to {trip?.destination}.</p>
          </div>
        </div>
      </div>

      {isTripAdmin && (
        <Card className="p-6 md:p-8 bg-coral/5 border-coral/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-5 h-5 text-coral" />
            <h3 className="text-xl font-bold text-charcoal tracking-tight">Invite New Member</h3>
          </div>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-muted mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <Input 
                  type="email"
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-9 bg-white border-coral/20 focus:border-coral text-charcoal"
                />
              </div>
            </div>
            <Button type="submit" isLoading={isInviting} className="w-full sm:w-auto gap-2 bg-coral hover:bg-coral/90 shadow-lg shadow-coral/20 text-white">
              <Mail className="w-4 h-4" /> Send Invite
            </Button>
          </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden border-muted/30 bg-white shadow-sm">
        <div className="p-6 md:p-8 border-b border-muted/30 bg-bg">
          <h3 className="text-xl font-bold text-charcoal">Current Members <span className="text-muted font-medium ml-2">({trip?.members.length || 0})</span></h3>
        </div>
        <div className="divide-y divide-muted">
          {trip?.members.map((member, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={member.id} 
              className="p-6 flex items-center justify-between hover:bg-bg/50 transition-colors group"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-inner border-2 ${
                  member.role === 'TRIP_ADMIN' ? 'bg-coral/10 text-coral border-coral/30' : 'bg-teal/10 text-teal border-teal/30'
                }`}>
                  {member.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-lg text-charcoal flex items-center gap-2">
                    {member.name}
                    {member.role === 'TRIP_ADMIN' && (
                      <span className="flex items-center justify-center w-6 h-6 bg-coral/20 rounded-full">
                        <Shield className="w-3.5 h-3.5 text-coral" />
                      </span>
                    )}
                  </p>
                  <p className="text-sm font-medium text-muted mt-0.5 tracking-wide uppercase">{member.role}</p>
                </div>
              </div>

              {isTripAdmin && member.role !== 'TRIP_ADMIN' && (
                <Button variant="ghost" className="text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent gap-2 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100">
                  <UserMinus className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span>
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </Card>
    </PageTransition>
  );
}
