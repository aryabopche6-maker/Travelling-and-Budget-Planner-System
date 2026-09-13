import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Compass } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });
  
  const [errorMsg, setErrorMsg] = React.useState('');

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      await signup(data);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg('Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-coral/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center mb-6">
          <Compass className="text-teal w-12 h-12" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-charcoal">Create your account</h2>
        <p className="mt-2 text-center text-sm text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal hover:text-teal-600">
            Log in
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
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center">
                {errorMsg}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Full Name</label>
              <Input 
                {...register("name")}
                type="text"
                placeholder="John Doe"
                error={errors.name?.message}
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Confirm Password</label>
              <Input 
                {...register("confirmPassword")}
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
              />
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
