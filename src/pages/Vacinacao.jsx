import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import { Card, CardContent } from "@/components/ui/card";
import { Syringe } from 'lucide-react';
import CalendarioVacinalCompleto from '../components/vacinas/CalendarioVacinalCompleto';

export default function Vacinacao() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Syringe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Calendário Vacinal</h1>
                <p className="text-sm text-slate-500">Programa Nacional de Imunizações (PNI 2025)</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <CalendarioVacinalCompleto />
        </div>
      </main>
    </div>
  );
}