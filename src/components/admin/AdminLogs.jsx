import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User, Shield, Settings, Trash2, Edit, AlertTriangle, Search } from 'lucide-react';

// Adicionar log administrativo
export function addAdminLog(adminId, adminName, action, details, previousData = null, newData = null) {
  const logs = JSON.parse(localStorage.getItem('supmed_admin_logs') || '[]');
  
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    adminId,
    adminName,
    action,
    details,
    previousData,
    newData,
    timestamp: new Date().toISOString(),
    ip: null // Em produção, capturar IP real
  };
  
  logs.unshift(log);
  
  // Manter apenas os últimos 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }
  
  localStorage.setItem('supmed_admin_logs', JSON.stringify(logs));
}

const actionIcons = {
  'user_created': User,
  'user_updated': Edit,
  'user_deleted': Trash2,
  'user_blocked': AlertTriangle,
  'user_unblocked': Shield,
  'content_updated': FileText,
  'settings_changed': Settings,
  'guideline_updated': FileText,
  'default': FileText
};

const actionColors = {
  'user_created': 'bg-green-100 text-green-700',
  'user_updated': 'bg-blue-100 text-blue-700',
  'user_deleted': 'bg-red-100 text-red-700',
  'user_blocked': 'bg-orange-100 text-orange-700',
  'user_unblocked': 'bg-emerald-100 text-emerald-700',
  'content_updated': 'bg-purple-100 text-purple-700',
  'settings_changed': 'bg-slate-100 text-slate-700',
  'guideline_updated': 'bg-cyan-100 text-cyan-700',
  'default': 'bg-slate-100 text-slate-700'
};

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLogs(filtered);
    } else {
      setFilteredLogs(logs);
    }
  }, [searchTerm, logs]);

  const loadLogs = () => {
    const storedLogs = JSON.parse(localStorage.getItem('supmed_admin_logs') || '[]');
    setLogs(storedLogs);
    setFilteredLogs(storedLogs);
  };

  const Icon = selectedLog ? actionIcons[selectedLog.action] || actionIcons.default : FileText;

  return (
    <div className="space-y-4">
      {/* Header e Busca */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar logs por ação, admin ou detalhes..."
            className="pl-9 h-9 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="text-xs">{filteredLogs.length} logs</Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Lista de Logs */}
        <Card className="bg-white/80 border border-slate-200/50">
          <CardContent className="p-3">
            <h3 className="text-xs font-semibold text-slate-700 mb-3">Histórico de Ações</h3>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const LogIcon = actionIcons[log.action] || actionIcons.default;
                    const colorClass = actionColors[log.action] || actionColors.default;
                    
                    return (
                      <button
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`w-full p-2 rounded-lg text-left transition-colors ${
                          selectedLog?.id === log.id ? 'bg-slate-100 border border-slate-300' : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`w-7 h-7 rounded flex items-center justify-center ${colorClass}`}>
                            <LogIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{log.details}</p>
                            <p className="text-[10px] text-slate-500">por {log.adminName}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Nenhum log encontrado</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Detalhes do Log */}
        <Card className="bg-white/80 border border-slate-200/50">
          <CardContent className="p-3">
            <h3 className="text-xs font-semibold text-slate-700 mb-3">Detalhes da Ação</h3>
            {selectedLog ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded ${actionColors[selectedLog.action] || actionColors.default} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{selectedLog.details}</p>
                    <p className="text-[10px] text-slate-500">ID: {selectedLog.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-[10px] text-slate-500">Administrador</p>
                    <p className="font-medium text-slate-700">{selectedLog.adminName}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-[10px] text-slate-500">Data/Hora</p>
                    <p className="font-medium text-slate-700">
                      {new Date(selectedLog.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {selectedLog.previousData && (
                  <div className="p-2 bg-amber-50 rounded border border-amber-100">
                    <p className="text-[10px] font-semibold text-amber-700 mb-1">Dados Anteriores:</p>
                    <pre className="text-[9px] text-amber-700 whitespace-pre-wrap overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.previousData, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.newData && (
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                    <p className="text-[10px] font-semibold text-emerald-700 mb-1">Dados Novos:</p>
                    <pre className="text-[9px] text-emerald-700 whitespace-pre-wrap overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.newData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Selecione um log para ver detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}