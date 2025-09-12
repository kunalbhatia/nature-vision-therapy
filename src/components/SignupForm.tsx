import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePreloader } from '../hooks/Preloader';

const signupSchema = z
  .object({
    email: z.email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupData = z.infer<typeof signupSchema>;
type SignupFormProps = {
  onSignup: () => void;
  onStatusUpdate: (message: string, status?: 'error' | 'success' | 'info') => void;
};
const SignupForm = ({ onSignup, onStatusUpdate }: SignupFormProps) => {
  const { showPreloader, hidePreloader } = usePreloader();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupData) => {
    if (typeof onSignup === 'function') onSignup();
    showPreloader();
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
    const result = await res.json();
    if (typeof onStatusUpdate === 'function') onStatusUpdate(result.message || 'Signup failed', result.status);
    hidePreloader();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 space-y-5'
    >
      <h2 className='text-xl font-semibold text-green-700 text-center'>Create Your Account</h2>

      <div className='space-y-1'>
        <input
          {...register('email')}
          placeholder='Email'
          className='w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition'
        />
        {errors.email && <p className='text-sm text-red-500'>{errors.email.message}</p>}
      </div>

      <div className='space-y-1'>
        <input
          {...register('password')}
          type='password'
          placeholder='Password'
          className='w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition'
        />
        {errors.password && <p className='text-sm text-red-500'>{errors.password.message}</p>}
      </div>

      <div className='space-y-1'>
        <input
          {...register('confirmPassword')}
          type='password'
          placeholder='Confirm Password'
          className='w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition'
        />
        {errors.confirmPassword && <p className='text-sm text-red-500'>{errors.confirmPassword.message}</p>}
      </div>

      <button
        type='submit'
        className='w-full py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition'
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;
