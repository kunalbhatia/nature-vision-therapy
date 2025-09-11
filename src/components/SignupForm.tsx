import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupData) => {
    if (typeof onSignup === 'function') onSignup();
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });
    const result = await res.json();
    if (typeof onStatusUpdate === 'function') onStatusUpdate(result.message || 'Signup failed', result.status);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <input {...register('email')} placeholder='Email' className='input' />
      {errors.email && <p className='text-red-500'>{errors.email.message}</p>}

      <input {...register('password')} type='password' placeholder='Password' className='input' />
      {errors.password && <p className='text-red-500'>{errors.password.message}</p>}

      <input {...register('confirmPassword')} type='password' placeholder='Confirm Password' className='input' />
      {errors.confirmPassword && <p className='text-red-500'>{errors.confirmPassword.message}</p>}

      <button type='submit' className='btn'>
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;
