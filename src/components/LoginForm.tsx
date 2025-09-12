// components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePreloader } from '../hooks/Preloader';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

type LoginData = z.infer<typeof loginSchema>;
type LoginFormType = {
  onLogin: () => void;
  onStatusUpdate: (message: string, status?: 'error' | 'success' | 'info') => void;
};
const LoginForm = ({ onLogin, onStatusUpdate }: LoginFormType) => {
  const { showPreloader, hidePreloader } = usePreloader();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    if (typeof onLogin === 'function') onLogin();
    showPreloader();
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (typeof onStatusUpdate === 'function') onStatusUpdate(result.message || 'Login failed', result.status);
    hidePreloader();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <input {...register('email')} placeholder='Email' className='input' />
      {errors.email && <p className='text-red-500'>{errors.email.message}</p>}

      <input {...register('password')} type='password' placeholder='Password' className='input' />
      {errors.password && <p className='text-red-500'>{errors.password.message}</p>}

      <button type='submit' className='btn'>
        Login
      </button>
    </form>
  );
};

export default LoginForm;
