import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para o fluxo de login: Login → Seleção → App
    const storedDoctor = localStorage.getItem('supmed_doctor');
    const storedAttention = localStorage.getItem('supmed_attention');

    if (!storedDoctor) {
      navigate(createPageUrl('AcessoMedico'));
    } else if (!storedAttention) {
      navigate(createPageUrl('AttentionSelect'));
    } else {
      navigate(createPageUrl('Dashboard'));
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}