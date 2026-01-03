'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Globe, FileText, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  city?: string;
  country?: string;
  avatarUrl?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    country: '',
    additionalInfo: '',
    avatarUrl: '',
  });

  // Form errors
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    // Validate avatar URL if provided
    if (formData.avatarUrl && !/^https?:\/\/.+\..+/.test(formData.avatarUrl)) {
      newErrors.avatarUrl = 'Please enter a valid URL (e.g., https://example.com/image.jpg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // Call signUp with all user data
      await signUp(
        formData.email,
        formData.password,
        fullName,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          city: formData.city,
          country: formData.country,
          avatarUrl: formData.avatarUrl || undefined,
          additionalInfo: formData.additionalInfo || undefined,
        }
      );
      
      toast.success('Registration successful!');
      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get initials for default avatar
  const getInitials = () => {
    const first = formData.firstName.charAt(0).toUpperCase() || '';
    const last = formData.lastName.charAt(0).toUpperCase() || '';
    return first + last || 'U';
  };

  // Use avatar URL if provided, otherwise show initials
  const avatarDisplay = formData.avatarUrl || null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://imgs.search.brave.com/J5OOpfPIjI6M8ddV4QumZoTlYadze7liip9ADoWEkPI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJhY2Nlc3Mu/Y29tL2Z1bGwvMTE5/MjA5Mi5qcGc')`
        }}
      />
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="backdrop-blur-xl bg-white/60 border-white/30 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <CardContent className="p-8">
            {/* Circular Avatar with URL Input (Optional) */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex flex-col items-center mb-6"
            >
              <Avatar className="h-24 w-24 border-4 border-white/50 shadow-lg ring-2 ring-blue-200/50">
                {avatarDisplay && (
                  <AvatarImage 
                    src={avatarDisplay} 
                    alt="Profile preview"
                    onError={(e) => {
                      // If image fails to load, show fallback
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white text-3xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <p className="text-center mt-3 text-sm text-gray-600">Profile Photo (Optional)</p>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join GlobeTrotter</h1>
              <p className="text-gray-600">Create your account and start your adventure</p>
            </motion.div>

            {/* Registration Form */}
            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
              onSubmit={handleSubmit}
            >
              {/* First Name and Last Name - Grid on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="John"
                      className={`pl-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                        errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Doe"
                      className={`pl-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                        errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </motion.div>
              </div>

              {/* Email Address */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john.doe@example.com"
                    className={`pl-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </motion.div>

              {/* Phone Number */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700 font-medium">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={`pl-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                )}
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="Enter your password"
                    className={`pl-10 pr-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
              </motion.div>

              {/* City and Country - Grid on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700 font-medium">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="New York"
                      className={`pl-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                        errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.city && (
                    <p className="text-sm text-red-500 mt-1">{errors.city}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label htmlFor="country" className="text-gray-700 font-medium">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="country"
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="United States"
                      className={`pl-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 ${
                        errors.country ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.country && (
                    <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                  )}
                </motion.div>
              </div>

              {/* Profile Photo URL (Optional) */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-gray-700 font-medium">
                  Profile Photo URL (Optional)
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="avatarUrl"
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => handleChange('avatarUrl', e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className={`pl-10 h-11 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 font-mono text-sm ${
                      errors.avatarUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.avatarUrl && (
                  <p className="text-sm text-red-500 mt-1">{errors.avatarUrl}</p>
                )}
                {!errors.avatarUrl && (
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use default avatar with your initials</p>
                )}
              </motion.div>

              {/* Additional Information */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="additionalInfo" className="text-gray-700 font-medium">
                  Additional Information (Optional)
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                  <Textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => handleChange('additionalInfo', e.target.value)}
                    placeholder="Tell us about yourself, your travel preferences, or anything else you'd like to share..."
                    className="pl-10 min-h-[120px] bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-blue-400 resize-none"
                  />
                </div>
              </motion.div>

              {/* Register Button */}
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="pt-2"
              >
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-base shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : 'Register'}
                </Button>
              </motion.div>
            </motion.form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-blue-500 hover:text-blue-600 transition-colors underline-offset-4 hover:underline"
                >
                  Login
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

