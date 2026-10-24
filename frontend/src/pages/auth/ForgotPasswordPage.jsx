import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Compass, Mail } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }) => {
    setErrorMessage('');
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      setErrorMessage('We could not send a recovery email right now. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-teal/10 blur-[100px] rounded-full pointer-events-none" />
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 border border-muted/30">
          <div className="flex justify-center mb-5"><Compass className="text-teal w-11 h-11" /></div>
          <h1 className="text-center text-2xl font-extrabold text-charcoal">Forgot your password?</h1>
          <p className="mt-2 text-center text-sm text-secondary">
            Enter your account email and we’ll send you a password reset link.
          </p>

          {submitted ? (
            <div role="status" className="mt-6 rounded-xl border border-teal/30 bg-teal/10 p-4 text-sm text-charcoal">
              If an account exists for that address, a recovery email is on its way. Check your inbox for the reset link.
            </div>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              {errorMessage && <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm p-3 rounded-lg">{errorMessage}</div>}
              <div>
                <label htmlFor="recovery-email" className="block text-sm font-medium text-secondary mb-1">Email address</label>
                <Input
                  id="recovery-email"
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                />
              </div>
              <Button type="submit" className="w-full gap-2" isLoading={isSubmitting}>
                <Mail className="w-4 h-4" /> Send reset link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="font-medium text-teal hover:text-teal-600">Back to sign in</Link>
          </p>
        </div>
      </motion.main>
    </div>
  );
}
