import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { Users, Mail, UserMinus, Shield, Plus, Crown, Clock, X, Copy, Check, MessageCircle, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { tripService } from '../../services/tripService';
import { invitationService } from '../../services/invitationService';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';

export default function GroupMembers() {
  const { trip, isTripAdmin } = useTrip();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  // Store the latest invite link after sending
  const [latestInviteLink, setLatestInviteLink] = useState('');
  const [latestInviteEmail, setLatestInviteEmail] = useState('');
  // Tracks which invitation id had its link copied
  const [copiedId, setCopiedId] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  useEffect(() => {
    if (trip?.id && isTripAdmin) {
      loadInvitations();
    }
  }, [trip?.id, isTripAdmin]);

  const loadInvitations = async () => {
    try {
      setIsLoadingInvites(true);
      const data = await tripService.getInvitations(trip.id);
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations', error);
    } finally {
      setIsLoadingInvites(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setSuccessMsg('');
    setErrorMsg('');
    setLatestInviteLink('');
    setLatestInviteEmail('');
    try {
      setIsInviting(true);
      const result = await tripService.inviteMember(trip.id, inviteEmail);
      // result.data from ApiResponse wrapper
      const inv = result?.data || result;
      setLatestInviteEmail(inviteEmail);
      if (inv?.acceptUrl) {
        setLatestInviteLink(inv.acceptUrl);
        setSuccessMsg(`Invitation created for ${inviteEmail}! Share the link below (email may also have been sent).`);
      } else {
        setSuccessMsg(`Invitation sent to ${inviteEmail}!`);
      }
      setInviteEmail('');
      loadInvitations();
      setTimeout(() => setSuccessMsg(''), 15000);
    } catch (error) {
      console.error('Failed to send invite', error);
      setErrorMsg(error.response?.data?.message || 'Failed to send invitation.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvite = async (invitationId) => {
    try {
      await tripService.deleteInvitation(trip.id, invitationId);
      loadInvitations();
    } catch (error) {
      console.error('Failed to cancel invitation', error);
    }
  };

  const handleResendInvite = async (invitationId) => {
    try {
      setResendingId(invitationId);
      await invitationService.resendInvitation(trip.id, invitationId);
      loadInvitations();
    } catch (error) {
      console.error('Failed to resend invitation', error);
    } finally {
      setResendingId(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const shareWhatsApp = (link, email) => {
    const msg = encodeURIComponent(`Hey! You've been invited to join a trip on WanderPlan. Click here to join: ${link}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30';
      case 'ACCEPTED': return 'text-teal bg-teal/10 border-teal/30';
      case 'DECLINED': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'EXPIRED': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      case 'CANCELLED': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default: return 'text-muted bg-muted/10 border-muted/30';
    }
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

      {/* Invite Form — Admin Only */}
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

          {/* Success + Link Share Box */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 p-4 bg-teal/10 border border-teal/20 rounded-xl space-y-3"
              >
                <p className="text-teal text-sm font-medium">✅ {successMsg}</p>
                {latestInviteLink && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted font-semibold uppercase tracking-wider">📎 Share this link directly with {latestInviteEmail}:</p>
                    <div className="flex items-center gap-2 bg-white border border-teal/20 rounded-lg p-2">
                      <p className="text-xs text-charcoal flex-1 truncate font-mono">{latestInviteLink}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(latestInviteLink, 'new')}
                        className="gap-2 border-teal/30 text-teal hover:bg-teal/10"
                      >
                        {copiedId === 'new' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === 'new' ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shareWhatsApp(latestInviteLink, latestInviteEmail)}
                        className="gap-2 border-green-500/30 text-green-600 hover:bg-green-500/10"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Share via WhatsApp
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}
        </Card>
      )}

      {/* Current Members */}
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

      {/* Invitations List — Admin Only */}
      {isTripAdmin && invitations.length > 0 && (
        <Card className="p-0 overflow-hidden border-muted/30 bg-white shadow-sm mt-8">
          <div className="p-6 md:p-8 border-b border-muted/30 bg-bg flex items-center justify-between">
            <h3 className="text-xl font-bold text-charcoal">Invitations <span className="text-muted font-medium ml-2">({invitations.length})</span></h3>
            <Button size="sm" variant="ghost" onClick={loadInvitations} className="text-muted gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
          <div className="divide-y divide-muted">
            {invitations.map((invitation, index) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                key={invitation.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-bg/50 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-inner border-2 bg-yellow-500/10 text-yellow-600 border-yellow-500/30 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-charcoal truncate">{invitation.invitedEmail}</p>
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(invitation.status)}`}>
                      {invitation.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Copy invite link */}
                  {invitation.acceptUrl && invitation.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(invitation.acceptUrl, invitation.id)}
                        className="gap-1.5 border-blue-500/30 text-blue-500 hover:bg-blue-500/10 text-xs"
                      >
                        {copiedId === invitation.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === invitation.id ? 'Copied!' : 'Copy Link'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => shareWhatsApp(invitation.acceptUrl, invitation.invitedEmail)}
                        className="gap-1.5 border-green-500/30 text-green-600 hover:bg-green-500/10 text-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </Button>
                    </>
                  )}

                  {/* Resend for expired/cancelled */}
                  {(invitation.status === 'EXPIRED' || invitation.status === 'CANCELLED') && (
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={resendingId === invitation.id}
                      onClick={() => handleResendInvite(invitation.id)}
                      className="gap-1.5 border-teal/30 text-teal hover:bg-teal/10 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend
                    </Button>
                  )}

                  {/* Cancel pending */}
                  {invitation.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => handleCancelInvite(invitation.id)}
                      variant="ghost"
                      className="text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border border-transparent gap-1.5 text-xs"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </PageTransition>
  );
}
