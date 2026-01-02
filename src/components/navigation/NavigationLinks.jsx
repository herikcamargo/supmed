// Sistema de rotas centralizado para o SUPMED
// Este arquivo define TODAS as rotas do aplicativo

export const SUPMED_ROUTES = {
  // Autenticação
  LOGIN: 'AcessoMedico',
  ATTENTION_SELECT: 'AttentionSelect',
  
  // Dashboard
  DASHBOARD: 'Dashboard',
  
  // Plantonista (modo com abas internas)
  PLANTONISTA: 'Plantonista',
  PLANTONISTA_PESQUISA: 'Plantonista?tab=pesquisa',
  PLANTONISTA_MODELOS: 'Plantonista?tab=modelos',
  PLANTONISTA_PRESCRICAO: 'Plantonista?tab=prescricao',
  PLANTONISTA_EXAMES_LAB: 'Plantonista?tab=exames-lab',
  PLANTONISTA_EXAMES_IMAGEM: 'Plantonista?tab=exames-imagem',
  PLANTONISTA_ECG: 'Plantonista?tab=ecg',
  PLANTONISTA_DILUICAO: 'Plantonista?tab=diluicao',
  
  // Outros módulos
  CEATOX: 'Ceatox',
  GUIDELINES: 'Guidelines',
  PEDIATRIA: 'Pediatria',
  GINECOLOGIA: 'Ginecologia',
  DERMATOLOGIA: 'Dermatologia',
  INFECTOLOGIA: 'Infectologia',
  PROCEDIMENTOS: 'Procedimentos',
  SCORES: 'Calculadoras',
  PROTOCOLOS: 'Protocolos',
  BULARIO: 'Bulario',
  COMUNIDADE: 'Comunidade',
  EDUCACIONAL: 'ModoEducacional',
  JORNAL: 'Jornal',
  PLANTOES: 'CalendarioPlantoes',
  CONFIGURACOES: 'Configuracoes',
  ADMIN: 'AdminPanel',
};

// Criar URL para navegação
export const createNavigationUrl = (baseRoute, params = {}) => {
  const basePath = baseRoute.split('?')[0];
  const baseParams = baseRoute.includes('?') ? baseRoute.split('?')[1] : '';
  
  const allParams = new URLSearchParams(baseParams);
  Object.entries(params).forEach(([key, value]) => {
    allParams.set(key, value);
  });
  
  const queryString = allParams.toString();
  return queryString ? `/${basePath}?${queryString}` : `/${basePath}`;
};

// Helper para obter parâmetros da URL atual
export const getCurrentUrlParams = () => {
  return new URLSearchParams(window.location.search);
};

// Helper para obter um parâmetro específico
export const getUrlParam = (name) => {
  return getCurrentUrlParams().get(name);
};

// Navegação programática
export const navigateToPlantonista = (navigate, tab = 'pesquisa') => {
  navigate(createNavigationUrl(SUPMED_ROUTES.PLANTONISTA, { tab }));
};

export const navigateToScore = (navigate, scoreId) => {
  navigate(createNavigationUrl(SUPMED_ROUTES.SCORES, { score: scoreId }));
};