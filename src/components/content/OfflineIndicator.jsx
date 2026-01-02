import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Indicador de status online/offline
 */
export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <Badge variant="outline" className="text-[9px] bg-green-50 border-green-200 text-green-700">
        <Wifi className="w-2.5 h-2.5 mr-1" />
        Online
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-[9px] bg-amber-50 border-amber-200 text-amber-700">
      <WifiOff className="w-2.5 h-2.5 mr-1" />
      Modo Offline
    </Badge>
  );
}