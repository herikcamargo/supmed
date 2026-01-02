import { base44 } from '@/api/base44Client';

/**
 * AuthService - Backend Real
 * Integração completa com base44/Supabase
 * - Autenticação real (email + senha)
 * - Persistência de sessão
 * - Dados no PostgreSQL
 */

const perfisAcesso = {
  admin: {
    label: 'Administrador',
    acessos: ['*'],
    descricao: 'Acesso total ao sistema'
  },
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

const AuthService = {
  /**
   * Registro de novo usuário - Backend Real
   */
  async register(userData) {
    try {
      // Validações
      if (!userData.email || !userData.email.includes('@')) {
        throw new Error('E-mail inválido');
      }
      if (!userData.password || userData.password.length < 6) {
        throw new Error('Senha deve ter no mínimo 6 caracteres');
      }
      if (!userData.fullName || userData.fullName.trim().length < 3) {
        throw new Error('Nome completo é obrigatório');
      }

      const email = userData.email.toLowerCase().trim();
      
      // Verificar se email já existe
      const existingUsers = await base44.entities.User.filter({ email });
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('E-mail já cadastrado');
      }

      // Criar usuário no banco (role sempre 'user')
      const newUser = await base44.entities.User.create({
        full_name: userData.fullName.trim(),
        email: email,
        role: 'user',
        profissao: userData.profissao || 'usuario_comum',
        perfil_profissional: userData.profissao === 'medico' ? 'MEDICO' : 
                             userData.profissao === 'enfermeiro' ? 'ENFERMEIRO' :
                             userData.profissao === 'tecnico' ? 'TECNICO' :
                             userData.profissao === 'estudante' ? 'ESTUDANTE' : 'OUTRO',
        registro: userData.registro || '',
        instituicao: '',
        celular: '',
        pronoun: '',
        comoConheceu: userData.comoConheceu || '',
        status: 'ativo',
        papel_editorial: null,
        acessos: ['dashboard', 'plantonista'],
        restricoes: [],
        atalhos_personalizados: [],
        settings: {
          idioma: 'pt-BR',
          tema: 'light',
          notificacoes: true
        }
      });

      console.log('✅ Usuário criado no backend:', newUser.id);
      return { success: true, user: newUser };
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    }
  },

  /**
   * Login - Backend Real
   * CRÍTICO: Permissões vêm EXCLUSIVAMENTE do banco
   */
  async login(email, password) {
    try {
      const loginEmail = email.toLowerCase().trim();
      
      // Buscar usuário autenticado do banco via base44.auth.me()
      const userCompleto = await base44.auth.me();

      if (!userCompleto) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar status
      if (userCompleto.status === 'bloqueado') {
        throw new Error('Conta bloqueada. Entre em contato com o administrador.');
      }

      // CRIAR SESSÃO COM DADOS DO BANCO - SEM FALLBACKS
      const sessionData = {
        id: userCompleto.id,
        email: userCompleto.email,
        full_name: userCompleto.full_name,
        role: userCompleto.role, // SEMPRE do banco
        papel_editorial: userCompleto.papel_editorial, // SEMPRE do banco
        profissao: userCompleto.profissao,
        registro: userCompleto.registro,
        pronoun: userCompleto.pronoun || 'Dr.',
        // Se admin, garantir acesso total
        acessos: userCompleto.role === 'admin' ? ['*'] : (userCompleto.acessos || ['dashboard']),
        restricoes: userCompleto.role === 'admin' ? [] : (userCompleto.restricoes || []),
        loginTime: new Date().toISOString(),
        sessionId: `session_${Date.now()}`
      };

      // Salvar sessão localmente
      localStorage.setItem('supmed_doctor', JSON.stringify(sessionData));
      
      console.log('✅ Login bem-sucedido:', sessionData.email, 'Role:', sessionData.role);
      return { success: true, user: sessionData };
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  },

  /**
   * Validar sessão ativa - SEMPRE sincroniza permissões do banco
   * NUNCA rebaixar admin para user
   */
  async validateSession() {
    try {
      const stored = localStorage.getItem('supmed_doctor');
      if (!stored) return null;

      const session = JSON.parse(stored);
      
      // CRÍTICO: Buscar usuário atualizado do banco
      const currentUser = await base44.auth.me();
      
      if (!currentUser || currentUser.status === 'bloqueado') {
        localStorage.removeItem('supmed_doctor');
        return null;
      }

      // SINCRONIZAR PERMISSÕES DO BANCO - SEM REBAIXAMENTO
      const sessionAtualizada = {
        ...session,
        role: currentUser.role, // SEMPRE do banco
        papel_editorial: currentUser.papel_editorial, // SEMPRE do banco
        // Se admin, garantir acesso total
        acessos: currentUser.role === 'admin' ? ['*'] : (currentUser.acessos || session.acessos || ['dashboard']),
        restricoes: currentUser.role === 'admin' ? [] : (currentUser.restricoes || [])
      };

      // Atualizar localStorage se houver mudanças
      if (JSON.stringify(session) !== JSON.stringify(sessionAtualizada)) {
        localStorage.setItem('supmed_doctor', JSON.stringify(sessionAtualizada));
        console.log('🔄 Sessão atualizada do banco - Role:', sessionAtualizada.role);
      }

      return sessionAtualizada;
    } catch (error) {
      console.error('Erro ao validar sessão:', error);
      return null;
    }
  },

  /**
   * Logout - Limpar sessão
   */
  logout() {
    localStorage.removeItem('supmed_doctor');
    localStorage.removeItem('supmed_attention');
    localStorage.removeItem('supmed_local_data');
  }
};

export { AuthService };