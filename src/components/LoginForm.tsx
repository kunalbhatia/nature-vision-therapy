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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='max-w-md w-full bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-6 space-y-5'
    >
      <h2 className='text-xl font-semibold text-green-700 text-center'>Login to Your Account</h2>

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

      <button
        type='submit'
        className='w-full py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition'
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
