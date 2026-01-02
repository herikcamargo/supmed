
import React from 'react';
// NOTE: Layout.jsx lives in src/pages. Components live in src/components.
// In Linux (Vercel) builds, path resolution is strict, so we use the correct
// relative import.
import { ProfileProvider } from '../components/profile/ProfileContext';

export default function Layout({ children }) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
}
