import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Moon, Sun, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { resolvedTheme, setTheme } = useApp();
  const toggleTheme = () => setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      setError('');
      await registerUser(data);
      navigate('/dashboard');
    } catch (err: any) {
      // Translate backend errors to Uzbek
      const errorMessage = err?.response?.data?.message || err?.message || '';
      
      let uzbekMessage = '';
      
      if (errorMessage.toLowerCase().includes('phone already exists') ||
          errorMessage.toLowerCase().includes('telefon raqam allaqachon mavjud') ||
          errorMessage.toLowerCase().includes('already registered')) {
        uzbekMessage = 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan';
      } else if (errorMessage.toLowerCase().includes('email already exists') ||
                 errorMessage.toLowerCase().includes('email allaqachon mavjud')) {
        uzbekMessage = 'Bu email allaqachon ro\'yxatdan o\'tgan';
      } else if (errorMessage.toLowerCase().includes('center name') &&
                 errorMessage.toLowerCase().includes('required')) {
        uzbekMessage = 'O\'quv markaz nomi kiritilishi shart';
      } else if (errorMessage.toLowerCase().includes('full name') &&
                 errorMessage.toLowerCase().includes('required')) {
        uzbekMessage = 'Ism familya kiritilishi shart';
      } else if (errorMessage.toLowerCase().includes('password') &&
                 errorMessage.toLowerCase().includes('short')) {
        uzbekMessage = 'Parol juda qisqa. Kamida 8 ta belgi kiriting';
      } else if (errorMessage.toLowerCase().includes('network') ||
                 errorMessage.toLowerCase().includes('connection')) {
        uzbekMessage = 'Internet bilan bog\'lanishda xatolik. Qaytadan urinib ko\'ring';
      } else if (errorMessage) {
        uzbekMessage = errorMessage;
      } else {
        uzbekMessage = 'Ro\'yxatdan o\'tish amalga oshmadi. Qaytadan urinib ko\'ring';
      }
      
      setError(uzbekMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 py-12">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all z-10"
        aria-label="Rejim almashtirish"
      >
        {resolvedTheme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-600" />
        ) : (
          <Sun className="w-5 h-5 text-gray-300" />
        )}
      </button>

      {/* Back to Home */}
      <Link
        to="/"
        className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all flex items-center space-x-2 z-10"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Orqaga</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img
                src="/photo_2026-06-12_11-17-02.jpg"
                alt="EduFlow CRM"
                className="h-16 w-16 rounded-2xl object-cover shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Ro'yxatdan o'tish
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              O'quv markazingizni boshqarish uchun ro'yxatdan o'ting
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Center Name */}
            <div>
              <label
                htmlFor="centerName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                O'quv markaz nomi
              </label>
              <Input
                id="centerName"
                type="text"
                placeholder="Masalan: Billur Academy"
                {...register('centerName')}
                error={errors.centerName?.message}
              />
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Ism familya
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Masalan: Alisher Navoiy"
                {...register('fullName')}
                error={errors.fullName?.message}
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Telefon raqam
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="+998 91 405 84 81"
                defaultValue="+998 "
                {...register('phone')}
                error={errors.phone?.message}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^\d+]/g, '');
                  
                  // Ensure it starts with +998
                  if (!value.startsWith('+998')) {
                    value = '+998';
                  }
                  
                  // Format: +998 XX XXX XX XX
                  if (value.length > 4) {
                    const digits = value.substring(4);
                    let formatted = '';
                    
                    // First 2 digits
                    if (digits.length > 0) {
                      formatted += digits.substring(0, 2);
                    }
                    // Next 3 digits
                    if (digits.length > 2) {
                      formatted += ' ' + digits.substring(2, 5);
                    }
                    // Next 2 digits
                    if (digits.length > 5) {
                      formatted += ' ' + digits.substring(5, 7);
                    }
                    // Last 2 digits
                    if (digits.length > 7) {
                      formatted += ' ' + digits.substring(7, 9);
                    }
                    
                    value = '+998 ' + formatted;
                  }
                  
                  e.target.value = value.substring(0, 17); // Max length: +998 XX XXX XX XX
                }}
                onFocus={(e) => {
                  if (e.target.value === '' || e.target.value === '+998') {
                    e.target.value = '+998 ';
                  }
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Parol
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Kuchli parol yarating"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Kamida 8 ta belgi
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Parolni qayta kiriting"
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Ro\'yxatdan o\'tmoqda...' : 'Ro\'yxatdan o\'tish'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hisobingiz bormi?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Kirish
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          © {new Date().getFullYear()} EduFlow CRM. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}
