import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  X, 
  FileText, 
  AlertTriangle,
  Baby,
  Heart,
  Bug,
  Stethoscope,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

const NOTIFICATIONS_KEY = 'supmed_guideline_notifications';

// Notificações de exemplo (em produção viriam do backend)
const notificacoesExemplo = [
  {
    id: 'n1',
    tipo: 'nova_versao',
    icone: '⚕️',
    titulo: 'Novo protocolo de Sepse 2025 disponível',
    descricao: 'Surviving Sepsis Campaign atualizou recomendações de ressuscitação',
    fonte: 'SSC/ESICM',
    prioridade: 'alta',
    categoria: 'infectologia',
    data: new Date().toISOString(),
    lida: false
  },
  {
    id: 'n2',
    tipo: 'atualizacao',
    icone: '🚨',
    titulo: 'Atualização ACLS 2024 – drogas revisadas',
    descricao: 'Alterações nas doses de adrenalina e amiodarona',
    fonte: 'AHA',
    prioridade: 'critica',
    categoria: 'emergencia',
    data: new Date(Date.now() - 86400000).toISOString(),
    lida: false
  },
  {
    id: 'n3',
    tipo: 'revisao',
    icone: '👶',
    titulo: 'Revisão do protocolo de febre na pediatria',
    descricao: 'SBP publicou novas recomendações sobre manejo de febre',
    fonte: 'SBP',
    prioridade: 'media',
    categoria: 'pediatria',
    data: new Date(Date.now() - 172800000).toISOString(),
    lida: true
  },
  {
    id: 'n4',
    tipo: 'nova_versao',
    icone: '❤️',
    titulo: 'ESC Guideline ICC 2024',
    descricao: 'Novas recomendações para insuficiência cardíaca',
    fonte: 'ESC',
    prioridade: 'alta',
    categoria: 'cardiologia',
    data: new Date(Date.now() - 259200000).toISOString(),
    lida: true
  }
];

export default function GuidelineNotifications({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    // Carregar notificações
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      setNotifications(notificacoesExemplo);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notificacoesExemplo));
    }
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, lida: true } : n
    );
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, lida: true }));
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  const dismissNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  const filteredNotifications = filter === 'todas' 
    ? notifications 
    : filter === 'nao_lidas'
    ? notifications.filter(n => !n.lida)
    : notifications.filter(n => n.prioridade === filter);

  const unreadCount = notifications.filter(n => !n.lida).length;

  const prioridadeStyle = {
    baixa: 'border-l-slate-400',
    media: 'border-l-blue-500',
    alta: 'border-l-amber-500',
    critica: 'border-l-red-500'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden bg-white animate-in slide-in-from-right">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-semibold">Atualizações de Guidelines</h2>
              {unreadCount > 0 && (
                <Badge className="text-[9px] bg-red-500">{unreadCount}</Badge>
              )}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtros */}
          <div className="p-2 border-b border-slate-100 flex gap-1 overflow-x-auto">
            {[
              { id: 'todas', label: 'Todas' },
              { id: 'nao_lidas', label: 'Não lidas' },
              { id: 'critica', label: '🔴 Críticas' },
              { id: 'alta', label: '🟡 Alta' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2 py-1 rounded text-[10px] whitespace-nowrap transition-colors ${
                  filter === f.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={markAllAsRead}
              className="px-2 py-1 rounded text-[10px] whitespace-nowrap bg-slate-50 text-slate-500 hover:bg-slate-100 ml-auto"
            >
              <CheckCircle2 className="w-3 h-3 inline mr-0.5" /> Marcar todas
            </button>
          </div>

          {/* Lista */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-3 border-l-4 ${prioridadeStyle[notif.prioridade]} ${
                      !notif.lida ? 'bg-blue-50/50' : 'bg-white'
                    } hover:bg-slate-50 cursor-pointer transition-colors`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{notif.icone}</span>
                          <span className="text-xs font-medium text-slate-800">{notif.titulo}</span>
                          {!notif.lida && (
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-600 mb-1">{notif.descricao}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[8px]">{notif.fonte}</Badge>
                          <span className="text-[9px] text-slate-400">
                            {new Date(notif.data).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notif.id);
                        }}
                        className="p-1 text-slate-300 hover:text-slate-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhuma notificação</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de badge para mostrar no header
export function NotificationBadge({ onClick }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      const notifs = JSON.parse(stored);
      setUnread(notifs.filter(n => !n.lida).length);
    }
  }, []);

  return (
    <button 
      onClick={onClick}
      className="relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <Bell className="w-5 h-5 text-slate-500" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
          {unread}
        </span>
      )}
    </button>
  );
}