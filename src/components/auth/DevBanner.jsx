import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { isSecurityEnabled } from './DevConfig';

export default function DevBanner() {
  if (isSecurityEnabled()) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-1 text-center">
      <div className="flex items-center justify-center gap-2 text-xs font-medium">
        <AlertTriangle className="w-3 h-3" />
        <span>MODO DESENVOLVIMENTO ATIVO - Autenticação desabilitada temporariamente</span>
      </div>
    </div>
  );
}