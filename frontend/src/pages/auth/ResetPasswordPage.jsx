import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Compass, KeyRound } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(values => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }) => {
    setErrorMessage('');
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'This reset link may have expired. Request a new one and try again.');
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
          <h1 className="text-center text-2xl font-extrabold text-charcoal">Reset your password</h1>
          {success ? (
            <div className="mt-6 text-center">
              <p role="status" className="text-sm text-secondary">Your password has been updated. You can now sign in with your new password.</p>
              <Link to="/login" className="mt-5 inline-block font-medium text-teal hover:text-teal-600">Go to sign in</Link>
            </div>
          ) : !token ? (
            <div className="mt-6 text-center">
              <p role="alert" className="text-sm text-red-600">This password reset link is missing its token.</p>
              <Link to="/forgot-password" className="mt-5 inline-block font-medium text-teal hover:text-teal-600">Request a new reset link</Link>
            </div>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <p className="text-center text-sm text-secondary">Choose a new password for your account.</p>
              {errorMessage && <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm p-3 rounded-lg">{errorMessage}</div>}
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-secondary mb-1">New password</label>
                <Input
                  id="new-password"
                  {...register('password')}
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  error={errors.password?.message}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-secondary mb-1">Confirm new password</label>
                <Input
                  id="confirm-password"
                  {...register('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your new password again"
                  error={errors.confirmPassword?.message}
                />
              </div>
              <Button type="submit" className="w-full gap-2" isLoading={isSubmitting}>
                <KeyRound className="w-4 h-4" /> Update password
              </Button>
            </form>
          )}
        </div>
      </motion.main>
    </div>
  );
}
