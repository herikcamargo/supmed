import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Shield, Database, Save } from 'lucide-react';
import { toast } from 'sonner';
import { addAdminLog } from './AdminLogs';

export default function GlobalSettings({ currentUser }) {
  const [settings, setSettings] = useState({
    offlineVersion: '1.0',
    maxLoginAttempts: 5,
    sessionTimeout: 60,
    maintenanceMode: false,
    maintenanceMessage: '',
    experimentalFeatures: false,
    notificationsEnabled: true,
    autoBackup: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const stored = JSON.parse(localStorage.getItem('supmed_global_settings') || '{}');
    setSettings({ ...settings, ...stored });
  };

  const saveSettings = () => {
    const previous = JSON.parse(localStorage.getItem('supmed_global_settings') || '{}');
    localStorage.setItem('supmed_global_settings', JSON.stringify(settings));
    
    addAdminLog(
      currentUser.id,
      currentUser.fullName,
      'settings_changed',
      'Configurações globais do sistema atualizadas',
      previous,
      settings
    );
    
    toast.success('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Sistema */}
        <Card className="bg-white/80 border border-slate-200/50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" /> Sistema
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Versão Base Offline</Label>
                <Input
                  className="h-8 text-sm"
                  value={settings.offlineVersion}
                  onChange={(e) => setSettings({...settings, offlineVersion: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="text-xs font-medium text-slate-700">Modo Manutenção</p>
                  <p className="text-[10px] text-slate-500">Bloqueia acesso ao sistema</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(v) => setSettings({...settings, maintenanceMode: v})}
                />
              </div>

              {settings.maintenanceMode && (
                <div>
                  <Label className="text-xs">Mensagem de Manutenção</Label>
                  <Textarea
                    className="text-sm h-20"
                    value={settings.maintenanceMessage}
                    onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                    placeholder="Sistema em manutenção. Voltamos em breve."
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="text-xs font-medium text-slate-700">Recursos Experimentais</p>
                  <p className="text-[10px] text-slate-500">Beta features</p>
                </div>
                <Switch
                  checked={settings.experimentalFeatures}
                  onCheckedChange={(v) => setSettings({...settings, experimentalFeatures: v})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="bg-white/80 border border-slate-200/50">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Segurança
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Máx. Tentativas de Login</Label>
                <Input
                  type="number"
                  className="h-8 text-sm"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label className="text-xs">Timeout de Sessão (min)</Label>
                <Input
                  type="number"
                  className="h-8 text-sm"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="text-xs font-medium text-slate-700">Notificações</p>
                  <p className="text-[10px] text-slate-500">Alertas do sistema</p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(v) => setSettings({...settings, notificationsEnabled: v})}
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div>
                  <p className="text-xs font-medium text-slate-700">Backup Automático</p>
                  <p className="text-[10px] text-slate-500">Backup diário</p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(v) => setSettings({...settings, autoBackup: v})}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={saveSettings} className="w-full h-9 text-sm bg-blue-900">
        <Save className="w-4 h-4 mr-2" /> Salvar Configurações
      </Button>
    </div>
  );
}