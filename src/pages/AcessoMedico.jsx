import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDemoMode, getAutoUser } from '../components/auth/DevConfig';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Stethoscope, 
  Lock, 
  User, 
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  Mail,
  Phone,
  Building,
  FileText,
  ChevronRight,
  UserPlus,
  LogIn
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { AuthService } from '../components/auth/AuthService';
import { useAuthInit } from '../components/auth/AuthInit';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const profissoes = [
  { value: 'medico', label: 'Médico', registro: 'CRM' },
  { value: 'enfermeiro', label: 'Enfermeiro', registro: 'COREN' },
  { value: 'tecnico', label: 'Técnico de Enfermagem', registro: 'COREN' },
  { value: 'estudante', label: 'Estudante', registro: 'RA' },
  { value: 'residente', label: 'Residente', registro: 'CRM' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta', registro: 'CREFITO' },
  { value: 'nutricionista', label: 'Nutricionista', registro: 'CRN' },
  { value: 'gestor', label: 'Gestor', registro: 'CPF' }
];

const comoConheceu = [
  'Indicação de colega',
  'Redes sociais',
  'Google',
  'Evento/Congresso',
  'Instituição de ensino',
  'Outro'
];

const pronomes = [
  { value: 'Dr.', label: 'Dr.' },
  { value: 'Dra.', label: 'Dra.' },
  { value: 'Enf.', label: 'Enf.' },
  { value: 'Téc.', label: 'Téc.' },
  { value: 'Ft.', label: 'Ft.' },
  { value: 'Nut.', label: 'Nut.' },
  { value: 'Sr.', label: 'Sr.' },
  { value: 'Sra.', label: 'Sra.' }
];

// Perfis de acesso com permissões
const perfisAcesso = {
  medico: {
    label: 'Médico',
    acessos: ['*'],
    descricao: 'Acesso completo a todos os módulos'
  },
  residente: {
    label: 'Residente',
    acessos: ['plantonista', 'diagnostico', 'prescricoes', 'ceatox', 'guidelines', 'pediatria', 'ginecologia', 'dermatologia', 'infectologia', 'exames', 'imagem', 'ecg', 'diluicao', 'procedimentos', 'scores', 'interacoes', 'protocolos', 'bulario', 'comunidade', 'casos'],
    restricoes: ['laudos_definitivos'],
    descricao: 'Acesso a 95% dos módulos'
  },
  estudante: {
    label: 'Estudante',
    acessos: ['plantonista', 'guidelines', 'pediatria', 'ginecologia', 'dermatologia', 'infectologia', 'ecg', 'scores', 'protocolos', 'bulario', 'comunidade', 'casos'],
    restricoes: ['ia_avancada', 'exames_complexos'],
    descricao: 'Acesso básico'
  },
  enfermeiro: {
    label: 'Enfermeiro(a)',
    acessos: ['plantonista', 'procedimentos', 'diluicao', 'scores', 'protocolos', 'comunidade'],
    descricao: 'Plantonista, procedimentos e diluições'
  },
  tecnico: {
    label: 'Técnico(a)',
    acessos: ['diluicao', 'procedimentos', 'protocolos'],
    descricao: 'Diluições e procedimentos'
  },
  fisioterapeuta: {
    label: 'Fisioterapeuta',
    acessos: ['plantonista', 'exames', 'ecg', 'scores', 'protocolos', 'comunidade'],
    descricao: 'Gasometria e protocolos'
  },
  nutricionista: {
    label: 'Nutricionista',
    acessos: ['exames', 'scores', 'protocolos', 'comunidade'],
    descricao: 'Exames metabólicos'
  },
  gestor: {
    label: 'Gestor',
    acessos: ['dashboard', 'estatisticas', 'comunidade', 'admin'],
    descricao: 'Administração do sistema'
  }
};

export default function AcessoMedico() {
  const navigate = useNavigate();
  
  useAuthInit(); // Inicializar sistema de autenticação
  
  // Carregar logo customizado
  const { data: logoCustomizado } = useQuery({
    queryKey: ['logo-customizado'],
    queryFn: async () => {
      const icones = await base44.entities.IconeCustomizado.list();
      return icones.find(ic => ic.modulo_id === 'logo' && ic.ativo);
    },
    initialData: null
  });
  
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Cadastro form - COMPLETO
  const [cadastroData, setCadastroData] = useState({
    fullName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    profissao: '',
    registro: '',
    comoConheceu: '',
    termosUso: false,
    politicaPrivacidade: false
  });

  // Debug: mostrar dados do localStorage
  React.useEffect(() => {
    const users = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
    const hashes = JSON.parse(localStorage.getItem('supmed_password_hashes') || '{}');
    console.log('📊 Total usuários:', users.length);
    console.log('🔑 Total senhas:', Object.keys(hashes).length);
    console.log('👥 Usuários:', users.map(u => `${u.email} (${u.role})`));
  }, []);

  // Garantir que a página de login sempre apareça (sem auto-redirect)
  React.useEffect(() => {
    // Limpar qualquer redirecionamento automático - sempre mostrar login
    const storedDoctor = localStorage.getItem('supmed_doctor');
    const storedAttention = localStorage.getItem('supmed_attention');
    
    // Se tiver dados mas veio para esta página, limpar tudo
    if (window.location.pathname.includes('AcessoMedico')) {
      if (storedDoctor || storedAttention) {
        localStorage.removeItem('supmed_doctor');
        localStorage.removeItem('supmed_attention');
      }
    }
  }, []);

  // Timer de bloqueio
  React.useEffect(() => {
    let interval;
    if (isBlocked && blockTimer > 0) {
      interval = setInterval(() => {
        setBlockTimer(t => {
          if (t <= 1) {
            setIsBlocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, blockTimer]);

  // LOGIN - Backend Real ou Demo
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (isBlocked) return;
    
    setIsLoading(true);

    try {
      if (isDemoMode()) {
        if (!loginData.email || !loginData.password) {
          toast.error('Preencha e-mail e senha');
          return;
        }
        const user = {
          ...getAutoUser(),
          full_name: loginData.email.split('@')[0] || 'Usuário',
          email: loginData.email
        };
        localStorage.setItem('supmed_doctor', JSON.stringify(user));
        toast.success(`Bem-vindo(a), ${user.full_name}!`);
        setLoginAttempts(0);
        setTimeout(() => navigate(createPageUrl('AttentionSelect')), 500);
        setIsLoading(false);
        return;
      }

      const result = await AuthService.login(loginData.email, loginData.password);
      
      if (result.success) {
        toast.success(`Bem-vindo(a), ${result.user.full_name}!`);
        setLoginAttempts(0);
        
        setTimeout(() => {
          navigate(createPageUrl('AttentionSelect'));
        }, 500);
      }
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setBlockTimer(30);
        toast.error('Muitas tentativas. Aguarde 30 segundos.');
      } else {
        toast.error(error.message || 'Credenciais inválidas');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // CADASTRO - BACKEND REAL ou DEMO
  const handleCadastro = async (e) => {
    e.preventDefault();

    // Validações básicas
    if (!cadastroData.fullName.trim() || cadastroData.fullName.trim().length < 3) {
      toast.error('Nome completo é obrigatório (mínimo 3 caracteres)');
      return;
    }
    if (!cadastroData.email.trim() || !cadastroData.email.includes('@')) {
      toast.error('E-mail inválido');
      return;
    }
    if (cadastroData.email.toLowerCase() !== cadastroData.confirmEmail.toLowerCase()) {
      toast.error('Os e-mails não conferem');
      return;
    }
    if (cadastroData.password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (cadastroData.password !== cadastroData.confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }
    if (!cadastroData.profissao) {
      toast.error('Selecione sua profissão');
      return;
    }
    if (!cadastroData.registro.trim()) {
      toast.error('CRM, COREN ou RA é obrigatório');
      return;
    }
    if (!cadastroData.comoConheceu) {
      toast.error('Informe como conheceu o aplicativo');
      return;
    }
    if (!cadastroData.termosUso || !cadastroData.politicaPrivacidade) {
      toast.error('É necessário aceitar os termos de uso e política de privacidade');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isDemoMode()) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        setCadastroData({
          fullName: '',
          email: '',
          confirmEmail: '',
          password: '',
          confirmPassword: '',
          profissao: '',
          registro: '',
          comoConheceu: '',
          termosUso: false,
          politicaPrivacidade: false
        });
        setActiveTab('login');
        setLoginData({ email: cadastroData.email.toLowerCase(), password: '' });
        setIsLoading(false);
        return;
      }

      const result = await AuthService.register(cadastroData);
      
      if (result.success) {
        toast.success('Conta criada com sucesso! Faça login para continuar.');
        setCadastroData({
          fullName: '',
          email: '',
          confirmEmail: '',
          password: '',
          confirmPassword: '',
          profissao: '',
          registro: '',
          comoConheceu: '',
          termosUso: false,
          politicaPrivacidade: false
        });
        setActiveTab('login');
        setLoginData({ email: cadastroData.email.toLowerCase(), password: '' });
      }
      
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const isLoginValid = loginData.email && loginData.password;
  const isCadastroValid = cadastroData.fullName && 
    cadastroData.email && 
    cadastroData.confirmEmail && 
    cadastroData.password && 
    cadastroData.confirmPassword && 
    cadastroData.profissao &&
    cadastroData.registro &&
    cadastroData.comoConheceu &&
    cadastroData.termosUso && 
    cadastroData.politicaPrivacidade;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          {logoCustomizado ? (
            <img 
              src={logoCustomizado.icone_url} 
              alt="Logo SUPMED"
              className="w-24 h-24 mx-auto object-contain mb-3"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-900 rounded-xl mb-3">
              <Stethoscope className="w-11 h-11 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-semibold text-slate-800 mb-1" translate="no">SUPMED</h1>
          <p className="text-sm text-slate-500">Sistema Unificado de Prática Médica</p>
        </div>



        {/* Alerta de Bloqueio */}
        {isBlocked && (
          <Card className="bg-red-50 border-red-200 mb-4">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-700">Muitas tentativas. Aguarde <strong>{blockTimer}s</strong></p>
            </CardContent>
          </Card>
        )}

        {/* Card Principal */}
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 p-1 bg-slate-100">
              <TabsTrigger value="login" className="text-xs gap-1">
                <LogIn className="w-3.5 h-3.5" /> Entrar
              </TabsTrigger>
              <TabsTrigger value="cadastro" className="text-xs gap-1">
                <UserPlus className="w-3.5 h-3.5" /> Criar Conta
              </TabsTrigger>
            </TabsList>

            {/* ABA LOGIN */}
            <TabsContent value="login" className="p-4">
              <div className="text-center mb-4">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" /> Acesso Seguro
                </h2>
                <p className="text-[10px] text-slate-500">Criptografia AES-256 • Tokens JWT</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      disabled={isBlocked}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-600">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-9 pr-9 h-9 text-sm bg-slate-50 border-slate-200"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      disabled={isBlocked}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {loginAttempts > 0 && !isBlocked && (
                    <p className="text-[10px] text-amber-600">{5 - loginAttempts} tentativas restantes</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button type="button" className="text-[10px] text-blue-600 hover:underline">
                    Esqueceu sua senha?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={!isLoginValid || isLoading || isBlocked}
                  className="w-full h-10 bg-blue-900 hover:bg-blue-800 text-white text-sm"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Entrando...
                    </div>
                  ) : isBlocked ? `Bloqueado (${blockTimer}s)` : 'Entrar'}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  Não tem conta? <button type="button" onClick={() => setActiveTab('cadastro')} className="text-blue-600 hover:underline font-medium">Criar conta</button>
                </p>
              </form>
            </TabsContent>

            {/* ABA CADASTRO COMPLETO */}
            <TabsContent value="cadastro" className="p-4">
              <div className="text-center mb-4">
                <h2 className="text-sm font-semibold text-slate-800">Criar Conta no SUPMED</h2>
                <p className="text-[10px] text-slate-500">Cadastro profissional</p>
              </div>

              <form onSubmit={handleCadastro} className="space-y-3">
                {/* Nome Completo */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Nome completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="Seu nome completo"
                      className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                      value={cadastroData.fullName}
                      onChange={(e) => setCadastroData({...cadastroData, fullName: e.target.value})}
                    />
                  </div>
                </div>

                {/* Profissão */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Profissão *</Label>
                  <Select value={cadastroData.profissao} onValueChange={(value) => setCadastroData({...cadastroData, profissao: value})}>
                    <SelectTrigger className="h-9 text-sm bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Selecione sua profissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Médico(a)</SelectItem>
                      <SelectItem value="enfermeiro">Enfermeiro(a)</SelectItem>
                      <SelectItem value="tecnico">Técnico(a) de Enfermagem</SelectItem>
                      <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
                      <SelectItem value="estudante">Estudante</SelectItem>
                      <SelectItem value="residente">Residente</SelectItem>
                      <SelectItem value="nutricionista">Nutricionista</SelectItem>
                      <SelectItem value="gestor">Gestor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Registro Profissional */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">
                    {cadastroData.profissao === 'estudante' ? 'RA (Registro Acadêmico) *' : 'CRM / COREN / CREFITO *'}
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder={cadastroData.profissao === 'estudante' ? 'Ex: 202312345' : 'Ex: CRM 12345/SP'}
                      className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                      value={cadastroData.registro}
                      onChange={(e) => setCadastroData({...cadastroData, registro: e.target.value})}
                    />
                  </div>
                </div>

                {/* E-mail */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">E-mail profissional *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9 h-9 text-sm bg-slate-50 border-slate-200"
                      value={cadastroData.email}
                      onChange={(e) => setCadastroData({...cadastroData, email: e.target.value})}
                    />
                  </div>
                </div>

                {/* Confirmar E-mail */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Confirmar e-mail *</Label>
                  <Input
                    type="email"
                    placeholder="Confirme seu e-mail"
                    className="h-9 text-sm bg-slate-50 border-slate-200"
                    value={cadastroData.confirmEmail}
                    onChange={(e) => setCadastroData({...cadastroData, confirmEmail: e.target.value})}
                  />
                </div>

                {/* Senha */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-9 pr-9 h-9 text-sm bg-slate-50 border-slate-200"
                      value={cadastroData.password}
                      onChange={(e) => setCadastroData({...cadastroData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Confirmar senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      className="pl-9 pr-9 h-9 text-sm bg-slate-50 border-slate-200"
                      value={cadastroData.confirmPassword}
                      onChange={(e) => setCadastroData({...cadastroData, confirmPassword: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Como Conheceu */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Como conheceu o SUPMED? *</Label>
                  <Select value={cadastroData.comoConheceu} onValueChange={(value) => setCadastroData({...cadastroData, comoConheceu: value})}>
                    <SelectTrigger className="h-9 text-sm bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indicação de colega">Indicação de colega</SelectItem>
                      <SelectItem value="Redes sociais">Redes sociais</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Evento/Congresso">Evento/Congresso</SelectItem>
                      <SelectItem value="Instituição de ensino">Instituição de ensino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Termos */}
                <div className="space-y-2 p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="termos"
                      checked={cadastroData.termosUso}
                      onCheckedChange={(checked) => setCadastroData({...cadastroData, termosUso: checked})}
                    />
                    <label htmlFor="termos" className="text-[10px] text-slate-600 cursor-pointer leading-tight">
                      Li e concordo com os <span className="text-blue-600 underline">termos de uso</span> *
                    </label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="privacidade"
                      checked={cadastroData.politicaPrivacidade}
                      onCheckedChange={(checked) => setCadastroData({...cadastroData, politicaPrivacidade: checked})}
                    />
                    <label htmlFor="privacidade" className="text-[10px] text-slate-600 cursor-pointer leading-tight">
                      Li e concordo com a <span className="text-blue-600 underline">política de privacidade</span> *
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isCadastroValid || isLoading}
                  className="w-full h-10 bg-blue-900 hover:bg-blue-800 text-white text-sm"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Criando conta...
                    </div>
                  ) : 'Criar conta'}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  Já possui cadastro? <button type="button" onClick={() => setActiveTab('login')} className="text-blue-600 hover:underline font-medium">Entrar</button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-[10px]">© 2024 SUPMED • Versão 2.0 • LGPD • RBAC</p>
        </div>
      </div>
    </div>
  );
}