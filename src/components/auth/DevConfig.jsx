/**
 * ⚠️ CONFIGURAÇÃO DE DESENVOLVIMENTO - TEMPORÁRIA
 * 
 * SECURITY_ENABLED = false
 * → Desativa completamente autenticação e RBAC
 * → Injeta usuário mock automático
 * → Permite acesso livre a todas as funcionalidades
 * 
 * Para reativar segurança:
 * → Mudar SECURITY_ENABLED para true
 * → Reiniciar o app
 */

export const DEV_CONFIG = {
  // 🎭 MODO DEMONSTRATIVO - SEGURANÇA DESATIVADA
  SECURITY_ENABLED: false,
  DEMO_MODE: true,
  
  // Usuário automático para modo demo
  AUTO_USER: {
    id: "demo-user",
    full_name: "Usuário Demonstrativo",
    fullName: "Usuário Demonstrativo",
    email: "demo@supmed.com.br",
    role: "admin",
    papel_editorial: "corpo_clinico",
    profissao: "medico",
    pronoun: "Dr.",
    acessos: ["*"],
    restricoes: [],
    created_date: new Date().toISOString()
  },
  
  // Usuário mock injetado automaticamente quando segurança está desabilitada
  MOCK_USER: {
    id: "dev-user-mock",
    full_name: "Desenvolvedor SUPMED",
    fullName: "Desenvolvedor SUPMED",
    email: "dev@supmed.local",
    role: "admin",
    papel_editorial: "corpo_clinico",
    profissao: "medico",
    perfil_profissional: "MEDICO",
    status: "ativo",
    pronoun: "Dr.",
    perfilData: {
      label: "Administrador",
      acessos: ["*"],
      descricao: "Acesso total ao sistema"
    },
    acessos: ["*"],
    restricoes: [],
    atalhos_personalizados: [],
    settings: {
      idioma: "pt-BR",
      tema: "light",
      notificacoes: true
    },
    created_date: new Date().toISOString(),
    loginTime: new Date().toISOString(),
    sessionId: "dev-mock-session"
  }
};

/**
 * Verifica se a segurança está habilitada
 */
export function isSecurityEnabled() {
  return DEV_CONFIG.SECURITY_ENABLED === true;
}

/**
 * Verifica se está em modo demonstrativo
 */
export function isDemoMode() {
  return DEV_CONFIG.DEMO_MODE === true;
}

/**
 * Retorna usuário automático para modo demo
 */
export function getAutoUser() {
  return DEV_CONFIG.AUTO_USER || DEV_CONFIG.MOCK_USER;
}

/**
 * Retorna o usuário mock (apenas quando segurança está desabilitada)
 */
export function getMockUser() {
  if (!isSecurityEnabled()) {
    return DEV_CONFIG.MOCK_USER;
  }
  return null;
}

/**
 * Injeta usuário mock no localStorage (modo dev)
 */
export function injectMockUser() {
  if (!isSecurityEnabled()) {
    localStorage.setItem('supmed_doctor', JSON.stringify(DEV_CONFIG.MOCK_USER));
    localStorage.setItem('supmed_attention', 'terciaria');
    console.log('🔓 MODO DESENVOLVIMENTO: Usuário mock injetado');
    console.log('👤 User:', DEV_CONFIG.MOCK_USER.email, '| Role:', DEV_CONFIG.MOCK_USER.role);
  }
}