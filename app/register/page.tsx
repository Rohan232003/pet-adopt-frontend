'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Heart, ArrowLeft, Eye, EyeOff, User, Shield, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface Shelter {
  id: number;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'ADOPTER' as 'ADOPTER' | 'STAFF' | 'ADMIN',
    shelterId: '',
    invitationCode: '',
  });
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const response = await api.getShelters();
        setShelters(response.shelters);
      } catch (error) {
        console.error('Failed to fetch shelters', error);
      }
    };

    fetchShelters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.role === 'STAFF' && !formData.shelterId) {
      setError('Please select a shelter');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        shelterId: formData.role === 'STAFF' ? parseInt(formData.shelterId) : undefined,
        invitationCode: formData.invitationCode,
      });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADOPTER':
        return <User className="h-4 w-4" />;
      case 'STAFF':
        return <Users className="h-4 w-4" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADOPTER':
        return 'Browse and adopt pets';
      case 'STAFF':
        return 'Manage pets and applications';
      case 'ADMIN':
        return 'Full system access';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join PetAdopt
          </h1>
          <p className="text-gray-600 mt-2">Create your account to start your adoption journey</p>
        </div>

        {/* Registration Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Fill in your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

                             <div>
                 <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                   Account Type
                 </label>
                 <div className="grid grid-cols-3 gap-2">
                   {(['ADOPTER', 'STAFF', 'ADMIN'] as const).map((role) => (
                     <button
                       key={role}
                       type="button"
                       onClick={() => handleInputChange('role', role)}
                       className={`p-3 rounded-lg border-2 transition-all ${
                         formData.role === role
                           ? 'border-blue-500 bg-blue-50 text-blue-700'
                           : 'border-gray-200 hover:border-gray-300'
                       }`}
                     >
                       <div className="flex flex-col items-center space-y1">
                         {getRoleIcon(role)}
                         <span className="text-xs font-medium">{role}</span>
                         <span className="text-xs text-gray-500">{getRoleDescription(role)}</span>
                       </div>
                     </button>
                   ))}
                 </div>
                 {formData.role === 'STAFF' && (
                    <div className="mt-4">
                      <label htmlFor="shelter" className="block text-sm font-medium text-gray-700 mb-2">
                        Shelter
                      </label>
                      <select
                        id="shelter"
                        value={formData.shelterId}
                        onChange={(e) => handleInputChange('shelterId', e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a shelter</option>
                        {shelters.map((shelter) => (
                          <option key={shelter.id} value={shelter.id}>
                            {shelter.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {(formData.role === 'STAFF' || formData.role === 'ADMIN') && (
                    <div className="mt-4">
                      <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Invitation Code
                      </label>
                      <input
                        id="invitationCode"
                        type="text"
                        value={formData.invitationCode}
                        onChange={(e) => handleInputChange('invitationCode', e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your invitation code"
                      />
                    </div>
                  )}
               </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                    className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

                             <div>
                 <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                   Confirm Password
                 </label>
                 <div className="relative">
                   <input
                     id="confirmPassword"
                     type={showConfirmPassword ? 'text' : 'password'}
                     value={formData.confirmPassword}
                     onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                     required
                     className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="Confirm your password"
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                   >
                     {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                   </button>
                 </div>
               </div>


              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}
