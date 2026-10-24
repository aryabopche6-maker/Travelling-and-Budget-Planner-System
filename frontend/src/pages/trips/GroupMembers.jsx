import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { 
  Users, Mail, UserMinus, Shield, Crown, Clock, X, Copy, Check, 
  MessageCircle, RefreshCw, Sparkles, UserPlus, Send, Share2, AlertCircle, HeartHandshake
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { tripService } from '../../services/tripService';
import { invitationService } from '../../services/invitationService';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/common/PageTransition';
import Card from '../../components/common/Card';

export default function GroupMembers() {
  const { trip, isTripAdmin, setTrip } = useTrip();
  const navigate = useNavigate();

  useEffect(() => {
    if (trip && !isTripAdmin) {
      navigate(`/trips/${trip.id}/overview`, { replace: true });
    }
  }, [trip, isTripAdmin, navigate]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [latestInviteLink, setLatestInviteLink] = useState('');
  const [latestInviteEmail, setLatestInviteEmail] = useState('');
  const [latestEmailSent, setLatestEmailSent] = useState(null);
  
  const [copiedId, setCopiedId] = useState(null);
  const [refreshingId, setRefreshingId] = useState(null);
  const [resendingId, setResendingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

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

  const handleInvite = async (event) => {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;

    setSuccessMsg('');
    setErrorMsg('');
    setLatestInviteLink('');
    setLatestInviteEmail('');
    setLatestEmailSent(null);
    try {
      setIsInviting(true);
      const result = await tripService.inviteMember(trip.id, email);
      const invitation = result?.data || result;
      setLatestInviteEmail(invitation?.invitedEmail || email);
      setLatestEmailSent(invitation?.emailSent === true);
      setLatestInviteLink(invitation?.acceptUrl || '');
      setSuccessMsg(invitation?.emailSent
        ? `Invitation email sent successfully to ${email}.`
        : `Invitation link generated for ${email}! Share directly below.`);
      setInviteEmail('');
      await loadInvitations();
      setTimeout(() => setSuccessMsg(''), 15000);
    } catch (error) {
      console.error('Failed to send invite', error);
      setErrorMsg(error.response?.data?.message || 'Failed to send invitation.');
      setTimeout(() => setErrorMsg(''), 6000);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvite = async (invitationId, email) => {
    try {
      setCancellingId(invitationId);
      setErrorMsg('');
      await tripService.deleteInvitation(trip.id, invitationId);
      setSuccessMsg(`Invitation for ${email || 'member'} was successfully cancelled.`);
      setTimeout(() => setSuccessMsg(''), 5000);
      await loadInvitations();
    } catch (error) {
      console.error('Failed to cancel invite', error);
      setErrorMsg(error.response?.data?.message || 'Failed to cancel invitation.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleRefreshInviteLink = async (invitationId) => {
    try {
      setRefreshingId(invitationId);
      setErrorMsg('');
      const result = await tripService.refreshInviteLink(trip.id, invitationId);
      const inv = result?.data || result;
      setLatestInviteEmail('');
      setLatestInviteLink(inv.acceptUrl);
      setSuccessMsg('A new invite link is ready to copy or share.');
      await loadInvitations();
    } catch (error) {
      console.error('Failed to refresh invite link', error);
      setErrorMsg(error.response?.data?.message || 'Failed to create a new invite link.');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleResendInvite = async (invitationId, email) => {
    try {
      setResendingId(invitationId);
      setErrorMsg('');
      const result = await tripService.resendInvitation(trip.id, invitationId);
      const invitation = result?.data || result;
      setLatestInviteEmail(invitation?.invitedEmail || email);
      setLatestInviteLink(invitation?.acceptUrl || '');
      setSuccessMsg(`Invitation resent to ${email}.`);
      await loadInvitations();
    } catch (error) {
      console.error('Failed to resend invite', error);
      setErrorMsg(error.response?.data?.message || 'Failed to resend invitation.');
    } finally {
      setResendingId(null);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this trip?`)) return;
    try {
      setRemovingMemberId(memberId);
      await tripService.removeMember(trip.id, memberId);
      setTrip(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId)
      }));
      setSuccessMsg(`${memberName} removed from trip.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error('Failed to remove member', error);
      setErrorMsg(error.response?.data?.message || 'Failed to remove member.');
    } finally {
      setRemovingMemberId(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const shareWhatsApp = (link) => {
    const msg = encodeURIComponent(`Hey! You've been invited to join our trip to ${trip?.destination || 'an adventure'} on WanderPlan. Click here to join: ${link}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-amber-800 bg-amber-100 border-amber-300';
      case 'ACCEPTED': return 'text-emerald-800 bg-emerald-100 border-emerald-300';
      case 'DECLINED': return 'text-rose-800 bg-rose-100 border-rose-300';
      case 'EXPIRED': return 'text-slate-600 bg-slate-100 border-slate-300';
      case 'CANCELLED': return 'text-slate-600 bg-slate-100 border-slate-300';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <PageTransition variant="slideUp" className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* ──────────────────────────────────────────────────────────
          1. GLOWING CINEMATIC HERO BANNER
         ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2.5rem] border-2 border-white/60 bg-gradient-to-br from-[#0F766E] via-[#115E59] to-[#042F2E] p-8 sm:p-9 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-gradient-to-br from-amber-400/25 via-coral/25 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 h-44 w-44 rounded-full bg-teal-300/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#F4B942] text-white flex items-center justify-center shrink-0 shadow-lg shadow-black/25"
            >
              <Users className="w-8 h-8 drop-shadow" />
            </motion.div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-amber-200 border border-white/20 mb-2.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Travel Tribe & Group Sync
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display drop-shadow-sm">
                Trip Squad & Members
              </h1>
              <p className="text-teal-100/90 mt-1.5 text-base max-w-xl leading-relaxed">
                Coordinate and invite companions joining your adventure to <span className="font-bold text-white underline decoration-amber-400 decoration-2 underline-offset-4">{trip?.destination || 'the trip'}</span>.
              </p>
            </div>
          </div>

          <motion.div
            whileHover={{ y: -4, scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-end justify-center rounded-2xl border border-white/25 bg-white/10 p-5 shadow-2xl backdrop-blur-xl min-w-[210px]"
          >
            <span className="text-xs font-bold text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-amber-300" /> Confirmed Travelers
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1 drop-shadow">
              {trip?.members?.length || 1}
            </div>
            <span className="text-xs font-semibold text-teal-100/80 mt-1 bg-white/15 px-2.5 py-0.5 rounded-full">
              {invitations.filter(i => i.status === 'PENDING').length} pending invites
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ──────────────────────────────────────────────────────────
          2. INVITE NEW MEMBER CARD (High Contrast with Glass Styling)
         ────────────────────────────────────────────────────────── */}
      {isTripAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border-2 border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-charcoal font-display tracking-tight">
                Invite New Companion
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                They will receive an email invitation to collaborate on expenses, votes, and itinerary.
              </p>
            </div>
          </div>

          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-2">
                Friend's Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:bg-white focus:border-teal focus:ring-4 focus:ring-teal/20 transition-all outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isInviting}
              className="gap-2 px-8 py-3.5 bg-gradient-to-r from-teal to-emerald-600 hover:from-bright hover:to-teal text-white font-extrabold shadow-lg shadow-teal/25 rounded-xl transition-all"
            >
              <Send className="w-4 h-4" /> Send Invitation
            </Button>
          </form>

          {/* Feedback Messages */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {latestInviteLink && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50/50 to-white border-2 border-teal/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <div className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                      Direct Join Link Ready:
                    </p>
                    <p className="text-xs text-slate-600 font-mono truncate max-w-sm">
                      {latestInviteLink}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(latestInviteLink, 'latest')}
                    className="gap-1.5 border-teal/40 text-teal hover:bg-teal/10 font-bold text-xs"
                  >
                    {copiedId === 'latest' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedId === 'latest' ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => shareWhatsApp(latestInviteLink)}
                    className="gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 font-bold text-xs"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ──────────────────────────────────────────────────────────
          3. CURRENT MEMBERS SQUAD LIST (Avatar Cards with Micro-Animations)
         ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="rounded-3xl border-2 border-slate-200/90 bg-white/95 overflow-hidden shadow-xl backdrop-blur-md"
      >
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal/15 text-teal flex items-center justify-center font-bold">
              👥
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-charcoal font-display tracking-tight">
                Current Members
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Active travelers sharing the budget and itinerary
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1 rounded-full text-xs font-black bg-teal/15 text-teal border border-teal/20">
            {trip?.members?.length || 0} Travelers
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {trip?.members?.map((member, index) => {
            const isAdmin = member.role === 'TRIP_ADMIN';
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ backgroundColor: 'rgba(240, 253, 250, 0.6)' }}
                className="p-5 sm:p-6 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                    className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-xl shadow-md border-2 ${
                      isAdmin 
                        ? 'bg-gradient-to-tr from-[#FF6B4A] to-amber-500 text-white border-white shadow-coral/20' 
                        : 'bg-gradient-to-tr from-teal to-emerald-500 text-white border-white shadow-teal/20'
                    }`}
                  >
                    {member.name?.charAt(0).toUpperCase()}
                  </motion.div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-teal transition-colors">
                        {member.name}
                      </h4>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
                          <Crown className="w-3 h-3 text-amber-600" /> Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {member.email || (isAdmin ? 'Trip Organizer' : 'Traveler Companion')}
                    </p>
                  </div>
                </div>

                {isTripAdmin && !isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    isLoading={removingMemberId === member.id}
                    onClick={() => handleRemoveMember(member.id, member.name)}
                    className="text-rose-500 hover:bg-rose-50 hover:border-rose-200 border border-transparent gap-1.5 font-bold text-xs transition-all"
                  >
                    <UserMinus className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span>
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ──────────────────────────────────────────────────────────
          4. INVITATIONS & PENDING REQUESTS (Cards with Action Badges)
         ────────────────────────────────────────────────────────── */}
      {isTripAdmin && invitations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          className="rounded-3xl border-2 border-slate-200/90 bg-white/95 overflow-hidden shadow-xl backdrop-blur-md"
        >
          <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                ✉️
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-charcoal font-display tracking-tight">
                  Outgoing Invitations
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Track sent invite links and approval status
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={loadInvitations}
              className="text-slate-600 border-slate-300 hover:bg-slate-100 gap-1.5 text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {invitations.map((invitation, index) => {
              const isShareableLink = !invitation.invitedEmail;
              return (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300/60 text-amber-800 flex items-center justify-center font-bold shrink-0 shadow-sm">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-slate-900 truncate text-sm sm:text-base">
                          {invitation.invitedEmail || 'Shareable Open Invite Link'}
                        </p>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-xs ${getStatusColor(invitation.status)}`}>
                          {invitation.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {invitation.status === 'PENDING' ? 'Expires in 7 days · Waiting for confirmation' : `Status: ${invitation.status}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {invitation.acceptUrl && invitation.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(invitation.acceptUrl, invitation.id)}
                          className="gap-1.5 border-teal/40 text-teal hover:bg-teal/10 font-bold text-xs"
                        >
                          {copiedId === invitation.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === invitation.id ? 'Copied!' : 'Copy Link'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareWhatsApp(invitation.acceptUrl)}
                          className="gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 font-bold text-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </Button>
                      </>
                    )}

                    {(invitation.status === 'EXPIRED' || invitation.status === 'CANCELLED') && !isShareableLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={resendingId === invitation.id}
                        onClick={() => handleResendInvite(invitation.id, invitation.invitedEmail)}
                        className="gap-1.5 border-teal/40 text-teal hover:bg-teal/10 font-bold text-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Resend
                      </Button>
                    )}

                    {invitation.status === 'PENDING' && (
                      <Button
                        size="sm"
                        isLoading={cancellingId === invitation.id}
                        onClick={() => handleCancelInvite(invitation.id, invitation.invitedEmail)}
                        variant="ghost"
                        className="text-rose-500 hover:bg-rose-50 font-bold text-xs gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </PageTransition>
  );
}
