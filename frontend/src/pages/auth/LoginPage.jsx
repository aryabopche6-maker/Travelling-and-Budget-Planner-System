import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { invitationService } from '../../services/invitationService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Compass, Mail } from 'lucide-react';

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const invitedEmail = searchParams.get('email');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: invitedEmail || ''
    }
  });
  
  const [errorMsg, setErrorMsg] = React.useState('');

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      await login(data.email, data.password);
      
      // If came from invitation link, auto-accept after login
      if (inviteToken) {
        if (invitedEmail && data.email.toLowerCase() !== invitedEmail.toLowerCase()) {
           setErrorMsg(`Logged in as ${data.email}, but invitation was for ${invitedEmail}. Invitation not accepted.`);
           setTimeout(() => navigate('/trips'), 4000);
           return;
        }

        try {
          const res = await invitationService.acceptInvitation(inviteToken);
          if (res && res.tripId) {
            navigate(`/trips/${res.tripId}/overview`);
          } else {
            navigate('/trips');
          }
        } catch (inviteErr) {
          console.warn('Invitation accept after login failed:', inviteErr);
          setErrorMsg(inviteErr?.response?.data?.message || 'Failed to accept invitation automatically.');
          setTimeout(() => navigate('/trips'), 3000);
        }
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMsg('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-teal/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Invitation Banner */}
      {inviteToken && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:mx-auto sm:w-full sm:max-w-md mb-4 relative z-10"
        >
          <div className="bg-teal/10 border border-teal/30 rounded-2xl px-5 py-4 flex items-start gap-3">
            <Mail className="w-5 h-5 text-teal shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-teal">Trip Invitation</p>
              <p className="text-xs text-teal/80 mt-0.5">
                Login with the invited email account to join the trip automatically!
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <Compass className="text-teal w-12 h-12" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-charcoal">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Don't have an account?{' '}
          <Link to={inviteToken ? `/signup?inviteToken=${inviteToken}` : '/signup'} className="font-medium text-teal hover:text-teal-600">
            Sign up
          </Link>
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 border border-muted/30">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                {errorMsg}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Email address</label>
              <Input 
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Password</label>
              <Input 
                {...register("password")}
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-teal focus:ring-teal border-muted/30 rounded bg-white" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-teal hover:text-teal-600">Forgot password?</a>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
