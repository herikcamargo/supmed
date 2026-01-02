import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import PlantonistaComDificil from '../components/plantonista/PlantonistaComDificil';
import { createPageUrl } from '@/utils';

export default function ComunicacaoDificil() {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const storedDoctor = localStorage.getItem('supmed_doctor');
    if (!storedDoctor) {
      navigate(createPageUrl('AcessoMedico'));
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-slate-800">Comunicação Difícil</h1>
            <p className="text-xs text-slate-500">Más notícias, agressividade e comunicação de risco</p>
          </div>

          <PlantonistaComDificil />
        </div>
      </main>
    </div>
  );
}