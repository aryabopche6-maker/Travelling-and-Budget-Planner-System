import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { invitationService } from '../../services/invitationService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Mail, Check, X, Loader2, MapPin, Calendar, User } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

export default function InvitationLanding() {
  const { action } = useParams(); // 'accept' or 'decline'
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, isLoading: authLoading, logout } = useAuth();

  const [status, setStatus] = useState('VERIFYING'); // VERIFYING, VALID, INVALID, ACCEPTED, DECLINED
  const [invitationDetails, setInvitationDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('INVALID');
      setErrorMsg('No invitation token provided.');
      return;
    }
    verifyToken(token);
  }, [token]);

  // After token is verified: if user not logged in or mismatched email, redirect to signup/login with token preserved
  useEffect(() => {
    if (status === 'VALID' && !authLoading) {
      if (!user) {
        // Not logged in -> redirect based on whether signup is required
        const targetPath = invitationDetails?.requiresSignup ? '/signup' : '/login';
        navigate(`${targetPath}?inviteToken=${token}&email=${encodeURIComponent(invitationDetails?.invitedEmail || '')}`, { replace: true });
      } else if (invitationDetails && user.email.toLowerCase() !== invitationDetails.invitedEmail?.toLowerCase()) {
        // Mismatched email -> clear session and redirect
        logout().then(() => {
           const targetPath = invitationDetails?.requiresSignup ? '/signup' : '/login';
           navigate(`${targetPath}?inviteToken=${token}&email=${encodeURIComponent(invitationDetails?.invitedEmail || '')}`, { replace: true });
        });
      } else if (action === 'accept') {
        // Logged in and action is accept -> auto-accept
        handleAccept();
      } else if (action === 'decline') {
        // Logged in and action is decline -> auto-decline
        handleDecline();
      }
    }
  }, [status, user, authLoading, invitationDetails, action, navigate, token, logout]);

  const verifyToken = async (t) => {
    try {
      const details = await invitationService.verifyInvitation(t);
      setInvitationDetails(details);
      setStatus('VALID');
    } catch (error) {
      setStatus('INVALID');
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('This invitation link is invalid or has expired.');
      }
    }
  };

  const handleAccept = async () => {
    if (!user) {
      const targetPath = invitationDetails?.requiresSignup ? '/signup' : '/login';
      navigate(`${targetPath}?inviteToken=${token}&email=${encodeURIComponent(invitationDetails?.invitedEmail || '')}`);
      return;
    }

    // Safeguard for email mismatch
    if (invitationDetails && user.email.toLowerCase() !== invitationDetails.invitedEmail?.toLowerCase()) {
      logout().then(() => {
        const targetPath = invitationDetails?.requiresSignup ? '/signup' : '/login';
        navigate(`${targetPath}?inviteToken=${token}&email=${encodeURIComponent(invitationDetails?.invitedEmail || '')}`, { replace: true });
      });
      return;
    }

    try {
      setIsProcessing(true);
      const response = await invitationService.acceptInvitation(token);
      setStatus('ACCEPTED');
      
      // Navigate directly to the trip dashboard
      const tripId = response.tripId || invitationDetails?.tripId;
      setTimeout(() => {
        if (tripId) {
          navigate(`/trips/${tripId}/overview`);
        } else {
          navigate('/trips');
        }
      }, 1500);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to accept invitation. It may have expired.');
      setStatus('INVALID');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsProcessing(true);
      await invitationService.declineInvitation(token);
      setStatus('DECLINED');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to decline invitation.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || status === 'VERIFYING') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-teal mx-auto mb-4" />
          <p className="text-muted font-medium">
            {status === 'VERIFYING' ? 'Verifying your invitation...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition variant="fadeIn" className="min-h-screen bg-gradient-to-br from-teal/5 via-bg to-coral/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-0 shadow-2xl overflow-hidden border-0">
        
        {/* Header gradient bar */}
        <div className="h-2 bg-gradient-to-r from-teal via-bright to-coral" />

        <div className="p-8">
          {/* Logo / Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-teal" />
            </div>
          </div>

          {/* INVALID State */}
          {status === 'INVALID' && (
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                <X className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal mb-2">Invitation Not Found</h2>
              <p className="text-muted mb-6 leading-relaxed">{errorMsg}</p>
              <Button className="w-full bg-teal hover:bg-teal/90 text-white" onClick={() => navigate('/signup')}>
                Create an Account
              </Button>
              <p className="text-sm text-muted mt-4">
                Already have an account?{' '}
                <span className="text-teal cursor-pointer hover:underline font-medium" onClick={() => navigate('/login')}>
                  Sign in
                </span>
              </p>
            </div>
          )}

          {/* ACCEPTED State */}
          {status === 'ACCEPTED' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center text-teal mx-auto mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal mb-2">You're In! 🎉</h2>
              <p className="text-muted">You've joined the trip successfully. Redirecting to your trips...</p>
              <div className="mt-4">
                <Loader2 className="w-5 h-5 animate-spin text-teal mx-auto" />
              </div>
            </div>
          )}

          {/* DECLINED State */}
          {status === 'DECLINED' && (
            <div className="text-center">
              <div className="w-14 h-14 bg-muted/20 rounded-full flex items-center justify-center text-muted mx-auto mb-4">
                <X className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal mb-2">Invitation Declined</h2>
              <p className="text-muted mb-6">You've declined this trip invitation.</p>
              <Button className="w-full" variant="outline" onClick={() => navigate('/')}>
                Return Home
              </Button>
            </div>
          )}

          {/* VALID + Logged In — show confirm buttons */}
          {status === 'VALID' && user && invitationDetails && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-charcoal mb-1">You're Invited! ✈️</h2>
              <p className="text-muted mb-6">
                <strong className="text-charcoal">{invitationDetails.invitedByName || 'Someone'}</strong> has invited you to join a trip on WanderPlan.
              </p>

              {/* Trip Info Box */}
              <div className="bg-gradient-to-br from-teal/5 to-coral/5 border border-teal/20 rounded-2xl p-5 mb-6 text-left space-y-3">
                {invitationDetails.destination && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal/10 rounded-lg flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-teal" />
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Destination</p>
                      <p className="font-bold text-charcoal">{invitationDetails.destination}</p>
                    </div>
                  </div>
                )}
                {(invitationDetails.startDate || invitationDetails.endDate) && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-golden/10 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-golden" />
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Dates</p>
                      <p className="font-bold text-charcoal">
                        {invitationDetails.startDate} {invitationDetails.endDate ? `→ ${invitationDetails.endDate}` : ''}
                      </p>
                    </div>
                  </div>
                )}
                {invitationDetails.invitedByName && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-coral/10 rounded-lg flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-coral" />
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider">Invited By</p>
                      <p className="font-bold text-charcoal">{invitationDetails.invitedByName}</p>
                    </div>
                  </div>
                )}
              </div>

              {errorMsg && (
                <p className="text-red-500 text-sm mb-4 bg-red-50 border border-red-200 rounded-lg p-3">{errorMsg}</p>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleAccept}
                  isLoading={isProcessing}
                  className="w-full bg-teal hover:bg-teal/90 text-white shadow-md py-3 text-base font-semibold"
                >
                  <Check className="w-4 h-4 mr-2" /> Accept & Join Trip
                </Button>
                <Button
                  onClick={handleDecline}
                  isLoading={isProcessing}
                  variant="outline"
                  className="w-full border-muted/30 hover:bg-red-50 text-red-500 hover:border-red-200"
                >
                  <X className="w-4 h-4 mr-2" /> Decline
                </Button>
              </div>
            </div>
          )}

        </div>
      </Card>
    </PageTransition>
  );
}
