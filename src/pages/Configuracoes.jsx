import React, { useState, useEffect } from 'react';
import AdaptiveSidebar from '../components/dashboard/AdaptiveSidebar';
import ProfileSelector from '../components/profile/ProfileSelector';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import {
  Settings,
  User,
  Building,
  Mail,
  Lock,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Sun,
  Moon,
  Monitor,
  Type,
  Database,
  Trash2,
  Download,
  Shield,
  Fingerprint,
  Clock,
  FileText,
  Info,
  ExternalLink,
  LogOut,
  ChevronRight,
  Check,
  HardDrive,
  Smartphone,
  SpellCheck,
  BookOpen
} from 'lucide-react';
import { getSpellCheckSettings, saveSpellCheckSettings } from '../components/spellcheck/SpellCheckSettings';
import { loadUserDictionary } from '../components/spellcheck/MedicalDictionary';

export default function Configuracoes() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [spellCheck, setSpellCheck] = useState(getSpellCheckSettings());
  const [userDictionary, setUserDictionary] = useState([]);

  // Configurações
  const [config, setConfig] = useState({
    // Modo de operação
    modoOperacao: 'online',
    ultimaSincronizacao: new Date().toISOString(),
    // Notificações
    notifGuidelines: true,
    notifJornal: true,
    notifInteracoes: true,
    notifEventos: true,
    notifSaudePublica: true,
    // Aparência
    tema: 'auto',
    tamanhoFonte: 'medio',
    // Segurança
    biometria: false,
    tempoSessao: '30',
    // Dados
    cacheSize: '45.2 MB',
    dbVersion: '2.1.0'
  });

  // Dados editáveis do perfil
  const [perfilEdit, setPerfilEdit] = useState({
    fullName: '',
    email: '',
    profissao: '',
    registro: '',
    instituicao: '',
    celular: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('supmed_doctor');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setPerfilEdit({
        fullName: user.fullName || '',
        email: user.email || '',
        profissao: user.profissao || '',
        registro: user.registro || '',
        instituicao: user.instituicao || '',
        celular: user.celular || ''
      });
    }

    const savedConfig = localStorage.getItem('supmed_config');
    if (savedConfig) {
      setConfig({ ...config, ...JSON.parse(savedConfig) });
    }

    setUserDictionary(loadUserDictionary());
  }, []);

  const salvarConfig = (novaConfig) => {
    setConfig(novaConfig);
    localStorage.setItem('supmed_config', JSON.stringify(novaConfig));
  };

  const salvarPerfil = () => {
    const users = JSON.parse(localStorage.getItem('supmed_users') || '[]');
    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, ...perfilEdit } : u);
    localStorage.setItem('supmed_users', JSON.stringify(updatedUsers));
    
    const updatedUser = { ...currentUser, ...perfilEdit };
    localStorage.setItem('supmed_doctor', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setEditMode(false);
    toast.success('Perfil atualizado!');
  };

  const sincronizar = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    salvarConfig({ ...config, ultimaSincronizacao: new Date().toISOString() });
    setIsSyncing(false);
    toast.success('Sincronização concluída!');
  };

  const limparCache = () => {
    if (confirm('Isso irá limpar todos os dados em cache. Continuar?')) {
      toast.success('Cache limpo com sucesso!');
    }
  };

  const salvarSpellCheck = (novoConfig) => {
    setSpellCheck(novoConfig);
    saveSpellCheckSettings(novoConfig);
    toast.success('Configurações de revisão ortográfica salvas!');
  };

  const removerDoDict = (word) => {
    const newDict = userDictionary.filter(w => w !== word);
    localStorage.setItem('supmed_user_dictionary', JSON.stringify(newDict));
    setUserDictionary(newDict);
    toast.success('Termo removido do dicionário');
  };

  const handleLogout = () => {
    localStorage.removeItem('supmed_doctor');
    localStorage.removeItem('supmed_attention');
    window.location.href = createPageUrl('AcessoMedico');
  };

  const formatarData = (iso) => {
    return new Date(iso).toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <AdaptiveSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className={`transition-all duration-200 ${sidebarCollapsed ? 'ml-16' : 'ml-56'}`}>
        <div className="p-4 md:p-6 max-w-3xl">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Configurações</h1>
              <p className="text-xs text-slate-500">Gerencie suas preferências e privacidade</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. CONTA E PERFIL */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" /> Conta e Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {editMode ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Nome Completo</Label>
                        <Input className="h-8 text-sm" value={perfilEdit.fullName} onChange={(e) => setPerfilEdit({...perfilEdit, fullName: e.target.value})} />
                      </div>
                      <div>
                        <Label className="text-xs">E-mail</Label>
                        <Input className="h-8 text-sm" value={perfilEdit.email} onChange={(e) => setPerfilEdit({...perfilEdit, email: e.target.value})} />
                      </div>
                      <div>
                        <Label className="text-xs">Profissão</Label>
                        <Input className="h-8 text-sm" value={perfilEdit.profissao} onChange={(e) => setPerfilEdit({...perfilEdit, profissao: e.target.value})} />
                      </div>
                      <div>
                        <Label className="text-xs">Registro (CRM/COREN)</Label>
                        <Input className="h-8 text-sm" value={perfilEdit.registro} onChange={(e) => setPerfilEdit({...perfilEdit, registro: e.target.value})} />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Instituição</Label>
                        <Input className="h-8 text-sm" value={perfilEdit.instituicao} onChange={(e) => setPerfilEdit({...perfilEdit, instituicao: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 text-xs" onClick={salvarPerfil}>Salvar</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditMode(false)}>Cancelar</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">{currentUser?.fullName?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{currentUser?.fullName}</p>
                          <p className="text-[10px] text-slate-500">{currentUser?.email}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditMode(true)}>Editar</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building className="w-3 h-3" /> {currentUser?.instituicao || 'Não informado'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="w-3 h-3" /> {currentUser?.registro || 'Não informado'}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-xs w-full">
                      <Lock className="w-3 h-3 mr-1" /> Alterar Senha
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 2. MODO DE OPERAÇÃO */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {config.modoOperacao === 'online' ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-amber-600" />}
                  Modo de Operação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <RadioGroup value={config.modoOperacao} onValueChange={(v) => salvarConfig({...config, modoOperacao: v})} className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online" className="text-xs cursor-pointer">Modo Online (IA + dados em tempo real)</Label>
                    </div>
                    {config.modoOperacao === 'online' && <Badge className="text-[8px] bg-green-100 text-green-700">Ativo</Badge>}
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="offline" id="offline" />
                      <Label htmlFor="offline" className="text-xs cursor-pointer">Modo Offline (dados salvos)</Label>
                    </div>
                    {config.modoOperacao === 'offline' && <Badge className="text-[8px] bg-amber-100 text-amber-700">Ativo</Badge>}
                  </div>
                </RadioGroup>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Última sincronização: {formatarData(config.ultimaSincronizacao)}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={sincronizar} disabled={isSyncing}>
                    <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 3. NOTIFICAÇÕES */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-600" /> Notificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { key: 'notifGuidelines', label: 'Atualizações de guidelines' },
                  { key: 'notifJornal', label: 'Novas edições do Modo Jornal' },
                  { key: 'notifInteracoes', label: 'Alertas de interações medicamentosas' },
                  { key: 'notifEventos', label: 'Eventos e congressos' },
                  { key: 'notifSaudePublica', label: 'Alertas de saúde pública' }
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-1">
                    <Label className="text-xs text-slate-600">{item.label}</Label>
                    <Switch checked={config[item.key]} onCheckedChange={(v) => salvarConfig({...config, [item.key]: v})} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 4. REVISÃO ORTOGRÁFICA */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <SpellCheck className="w-4 h-4 text-indigo-600" /> Revisão Ortográfica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-xs text-slate-600">Ativar revisão ortográfica</Label>
                    <p className="text-[10px] text-slate-400">Correção de erros de digitação</p>
                  </div>
                  <Switch 
                    checked={spellCheck.enabled} 
                    onCheckedChange={(v) => salvarSpellCheck({...spellCheck, enabled: v})} 
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-xs text-slate-600">Correção automática</Label>
                    <p className="text-[10px] text-slate-400">Corrige automaticamente erros óbvios</p>
                  </div>
                  <Switch 
                    checked={spellCheck.autoCorrect} 
                    onCheckedChange={(v) => salvarSpellCheck({...spellCheck, autoCorrect: v})} 
                    disabled={!spellCheck.enabled}
                  />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label className="text-xs text-slate-600">Usar dicionário médico</Label>
                    <p className="text-[10px] text-slate-400">Respeita termos médicos e medicamentos</p>
                  </div>
                  <Switch 
                    checked={spellCheck.useMedicalDictionary} 
                    onCheckedChange={(v) => salvarSpellCheck({...spellCheck, useMedicalDictionary: v})} 
                    disabled={!spellCheck.enabled}
                  />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-slate-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Dicionário Personalizado
                    </Label>
                    <Badge variant="outline" className="text-[8px]">
                      {userDictionary.length} termos
                    </Badge>
                  </div>
                  
                  {userDictionary.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-slate-50 rounded border border-slate-100">
                      {userDictionary.map((word, i) => (
                        <div key={i} className="flex items-center justify-between bg-white px-2 py-1 rounded text-xs">
                          <span className="text-slate-700">{word}</span>
                          <button 
                            onClick={() => removerDoDict(word)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 italic p-2 bg-slate-50 rounded">
                      Nenhum termo adicionado. Use o menu de contexto (botão direito) durante a digitação para adicionar palavras.
                    </p>
                  )}
                </div>

                <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <p className="text-[10px] text-blue-700">
                    💡 <strong>Como usar:</strong> Clique com o botão direito em palavras sublinhadas para ver sugestões ou adicionar ao dicionário.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 5. APARÊNCIA */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sun className="w-4 h-4 text-yellow-600" /> Aparência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-500 mb-2 block">Tema</Label>
                  <div className="flex gap-2">
                    {[
                      { value: 'light', icon: Sun, label: 'Claro' },
                      { value: 'dark', icon: Moon, label: 'Escuro' },
                      { value: 'auto', icon: Monitor, label: 'Automático' }
                    ].map(t => (
                      <Button
                        key={t.value}
                        size="sm"
                        variant={config.tema === t.value ? 'default' : 'outline'}
                        className={`h-8 text-xs flex-1 ${config.tema === t.value ? 'bg-slate-800' : ''}`}
                        onClick={() => salvarConfig({...config, tema: t.value})}
                      >
                        <t.icon className="w-3 h-3 mr-1" /> {t.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-500 mb-2 block">Tamanho da Fonte</Label>
                  <Select value={config.tamanhoFonte} onValueChange={(v) => salvarConfig({...config, tamanhoFonte: v})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeno</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 6. DADOS E SINCRONIZAÇÃO */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-600" /> Dados e Sincronização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-700">Espaço utilizado</p>
                      <p className="text-[10px] text-slate-500">{config.cacheSize}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs w-full">
                  <Download className="w-3 h-3 mr-1" /> Baixar dados offline
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs w-full text-red-600 hover:text-red-700" onClick={limparCache}>
                  <Trash2 className="w-3 h-3 mr-1" /> Limpar cache
                </Button>
              </CardContent>
            </Card>

            {/* 7. SEGURANÇA E PRIVACIDADE */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" /> Segurança e Privacidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-slate-500" />
                    <Label className="text-xs">Biometria / Face ID</Label>
                  </div>
                  <Switch checked={config.biometria} onCheckedChange={(v) => salvarConfig({...config, biometria: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <Label className="text-xs">Tempo de sessão</Label>
                  </div>
                  <Select value={config.tempoSessao} onValueChange={(v) => salvarConfig({...config, tempoSessao: v})}>
                    <SelectTrigger className="h-7 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="0">Nunca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <Button variant="ghost" size="sm" className="h-8 text-xs w-full justify-between">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Política de Privacidade</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs w-full justify-between">
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Termos de Uso</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>

            {/* 8. SOBRE O APLICATIVO */}
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" /> Sobre o Aplicativo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-500">Versão do App</p>
                    <p className="font-medium text-slate-700">2.0.0</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-500">Banco Offline</p>
                    <p className="font-medium text-slate-700">{config.dbVersion}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded col-span-2">
                    <p className="text-slate-500">Última atualização</p>
                    <p className="font-medium text-slate-700">04/12/2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs w-full justify-between">
                  <span>O que há de novo</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs w-full justify-between">
                  <span>Créditos e fontes científicas</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs w-full justify-between">
                  <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Contato / Suporte</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>

            {/* 9. SAIR */}
            <Card className="bg-white border-slate-200">
              <CardContent className="p-3">
                <Button variant="destructive" size="sm" className="w-full h-10 text-sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Encerrar Sessão
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}