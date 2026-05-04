import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../lib/types';
import { userService, companyService } from '../api/services';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../api/config';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session and validate with API
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        
        if (storedUser && token) {
          // First, restore user from localStorage immediately (for fast UI)
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (parseError) {
            console.error('Failed to parse stored user:', parseError);
          }

          // Then, try to validate token with API in background
          try {
            const currentUser = await userService.getProfile();
            
            // If user is RECRUITER and doesn't have companyMember in response,
            // try to fetch it by getting company members
            if (currentUser.role === UserRole.RECRUITER && !currentUser.companyMember) {
              try {
                // Try to get company members for all companies the user might belong to
                // Since we don't know companyId, we'll need to check if API returns it
                // For now, if companyMember is not in response, we'll leave it as is
                // The pages will handle fetching it when needed
              } catch (memberError) {
                console.warn('Failed to fetch company member:', memberError);
              }
            }
            
            // Update with fresh data from API
            setUser(currentUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
          } catch (error) {
            // API validation failed, but keep using stored user
            // Only clear if it's a 401 (unauthorized) error
            console.warn('Failed to validate session with API, using stored user:', error);
            
            // Check if it's a 401 error (unauthorized)
            const errorMessage = (error as any)?.message || '';
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('token')) {
              // Token is invalid, clear everything
              localStorage.removeItem(TOKEN_STORAGE_KEY);
              localStorage.removeItem(USER_STORAGE_KEY);
              setUser(null);
            }
            // Otherwise, keep using stored user (might be network issue, etc.)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await userService.login({ email, password });
      const loggedInUser = response.user as User;

      // If user is RECRUITER, try to fetch company member info if not in response
      if (loggedInUser.role === UserRole.RECRUITER && !loggedInUser.companyMember) {
        try {
          // Get fresh profile which might include companyMember
          const userProfile = await userService.getProfile();
          if (userProfile.companyMember) {
            loggedInUser.companyMember = userProfile.companyMember;
            // Update localStorage with companyMember data
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
          }
        } catch (profileError) {
          console.warn('Failed to fetch user profile with company member:', profileError);
        }
      }

      setUser(loggedInUser);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = (error as any)?.message || 'Email hoặc mật khẩu không đúng';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await userService.register({
        email,
        password,
        fullName,
        role,
      });

      // After registration, automatically login
      const loginResponse = await userService.login({ email, password });
      setUser(loginResponse.user as User);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = (error as any)?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    userService.logout();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error('User not found. Please login again.');
    }

    try {
      // Convert User updates to UpdateProfileRequest format
      const profileUpdates: {
        fullName?: string;
        phoneNumber?: string;
        gender?: 'MALE' | 'FEMALE' | 'OTHER';
        dateOfBirth?: string;
        location?: string;
        bio?: string;
        openForOpportunities?: boolean;
        avatarUrl?: string;
      } = {};
      
      if (updates.fullName !== undefined) profileUpdates.fullName = updates.fullName || undefined;
      if (updates.phoneNumber !== undefined) profileUpdates.phoneNumber = updates.phoneNumber || undefined;
      if (updates.gender !== undefined) profileUpdates.gender = updates.gender as 'MALE' | 'FEMALE' | 'OTHER' | undefined;
      if (updates.dateOfBirth !== undefined) profileUpdates.dateOfBirth = updates.dateOfBirth?.toISOString();
      // Note: location, bio, openForOpportunities may not be in User type, but API supports them
      if ('location' in updates && updates.location !== undefined) profileUpdates.location = (updates as any).location || undefined;
      if ('bio' in updates && updates.bio !== undefined) profileUpdates.bio = (updates as any).bio || undefined;
      if ('openForOpportunities' in updates && updates.openForOpportunities !== undefined) profileUpdates.openForOpportunities = (updates as any).openForOpportunities;
      if (updates.avatarUrl !== undefined) profileUpdates.avatarUrl = updates.avatarUrl || undefined;
      
      // Pass user ID to updateProfile
      const updatedUser = await userService.updateProfile(profileUpdates, user.id);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}