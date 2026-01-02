
import React from 'react';
import { ProfileProvider } from './components/profile/ProfileContext';

export default function Layout({ children }) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
}
