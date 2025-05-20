import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  savedCount: number;
  watchedCount: number;
  listsCount: number;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
}

interface UserContextType {
  user: User;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (updates: Partial<User['preferences']>) => void;
}

const defaultUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  savedCount: 12,
  watchedCount: 45,
  listsCount: 3,
  preferences: {
    notifications: true,
    emailUpdates: false,
    language: 'en',
  },
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(defaultUser);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updatePreferences = (updates: Partial<User['preferences']>) => {
    setUser(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 