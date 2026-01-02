// POLÍTICA DE CONFIANÇA DE FONTES - SUPMED
// Este arquivo define as regras de whitelist/blacklist e cálculo de trust score

// ========================
// WHITELIST - FONTES CONFIÁVEIS
// ========================

export const WHITELIST_SOCIEDADES = [
  // Internacionais
  { sigla: 'AHA', nome: 'American Heart Association', trust_score: 100, especialidade: 'cardiologia' },
  { sigla: 'ESC', nome: 'European Society of Cardiology', trust_score: 100, especialidade: 'cardiologia' },
  { sigla: 'ACC', nome: 'American College of Cardiology', trust_score: 100, especialidade: 'cardiologia' },
  { sigla: 'IDSA', nome: 'Infectious Diseases Society of America', trust_score: 100, especialidade: 'infectologia' },
  { sigla: 'WHO', nome: 'World Health Organization', trust_score: 100, especialidade: 'geral' },
  { sigla: 'CDC', nome: 'Centers for Disease Control', trust_score: 100, especialidade: 'geral' },
  { sigla: 'ASH', nome: 'American Society of Hematology', trust_score: 100, especialidade: 'hematologia' },
  { sigla: 'ERS', nome: 'European Respiratory Society', trust_score: 100, especialidade: 'pneumologia' },
  { sigla: 'ATS', nome: 'American Thoracic Society', trust_score: 100, especialidade: 'pneumologia' },
  { sigla: 'ADA', nome: 'American Diabetes Association', trust_score: 100, especialidade: 'endocrinologia' },
  { sigla: 'NICE', nome: 'National Institute for Health and Care Excellence', trust_score: 100, especialidade: 'geral' },
  { sigla: 'EASL', nome: 'European Association for the Study of the Liver', trust_score: 100, especialidade: 'gastro' },
  { sigla: 'ACS', nome: 'American College of Surgeons', trust_score: 100, especialidade: 'cirurgia' },
  // Brasileiras
  { sigla: 'SBC', nome: 'Sociedade Brasileira de Cardiologia', trust_score: 98, especialidade: 'cardiologia' },
  { sigla: 'SBI', nome: 'Sociedade Brasileira de Infectologia', trust_score: 98, especialidade: 'infectologia' },
  { sigla: 'SBP', nome: 'Sociedade Brasileira de Pediatria', trust_score: 98, especialidade: 'pediatria' },
  { sigla: 'FEBRASGO', nome: 'Federação Brasileira de Ginecologia e Obstetrícia', trust_score: 98, especialidade: 'ginecologia' },
  { sigla: 'SBIM', nome: 'Sociedade Brasileira de Imunizações', trust_score: 98, especialidade: 'imunologia' },
  { sigla: 'ABN', nome: 'Academia Brasileira de Neurologia', trust_score: 98, especialidade: 'neurologia' },
  { sigla: 'SBPT', nome: 'Sociedade Brasileira de Pneumologia e Tisiologia', trust_score: 98, especialidade: 'pneumologia' },
  { sigla: 'SBD', nome: 'Sociedade Brasileira de Diabetes', trust_score: 98, especialidade: 'endocrinologia' },
  { sigla: 'SBN', nome: 'Sociedade Brasileira de Nefrologia', trust_score: 98, especialidade: 'nefrologia' },
  { sigla: 'PCDT', nome: 'Protocolos Clínicos e Diretrizes Terapêuticas - MS', trust_score: 98, especialidade: 'geral' },
  { sigla: 'ANVISA', nome: 'Agência Nacional de Vigilância Sanitária', trust_score: 95, especialidade: 'geral' },
  { sigla: 'MS', nome: 'Ministério da Saúde do Brasil', trust_score: 95, especialidade: 'geral' }
];

export const WHITELIST_LIVROS = [
  // Clínica Médica
  { nome: 'Harrison - Medicina Interna', tipo: 'livro', trust_score: 98, especialidade: 'geral' },
  { nome: 'Cecil Medicine', tipo: 'livro', trust_score: 98, especialidade: 'geral' },
  { nome: 'Goldman-Cecil Medicine', tipo: 'livro', trust_score: 98, especialidade: 'geral' },
  { nome: 'Current Medical Diagnosis & Treatment (CMDT)', tipo: 'livro', trust_score: 95, especialidade: 'geral' },
  // Emergência
  { nome: 'Tintinalli - Medicina de Emergência', tipo: 'livro', trust_score: 98, especialidade: 'emergencia' },
  { nome: "Rosen's Emergency Medicine", tipo: 'livro', trust_score: 98, especialidade: 'emergencia' },
  { nome: 'ATLS - Advanced Trauma Life Support', tipo: 'livro', trust_score: 100, especialidade: 'emergencia' },
  { nome: 'ACLS Guidelines', tipo: 'livro', trust_score: 100, especialidade: 'emergencia' },
  { nome: 'PALS Guidelines', tipo: 'livro', trust_score: 100, especialidade: 'pediatria' },
  // Farmacologia
  { nome: 'Goodman & Gilman - Bases Farmacológicas', tipo: 'livro', trust_score: 98, especialidade: 'farmacologia' },
  { nome: 'Katzung - Farmacologia Básica e Clínica', tipo: 'livro', trust_score: 96, especialidade: 'farmacologia' },
  { nome: 'Rang & Dale - Farmacologia', tipo: 'livro', trust_score: 96, especialidade: 'farmacologia' },
  // Infectologia
  { nome: 'Mandell - Doenças Infecciosas', tipo: 'livro', trust_score: 98, especialidade: 'infectologia' },
  { nome: 'Sanford Guide', tipo: 'livro', trust_score: 98, especialidade: 'infectologia' },
  // Cardiologia
  { nome: 'Braunwald - Tratado de Cardiologia', tipo: 'livro', trust_score: 98, especialidade: 'cardiologia' },
  // Cirurgia
  { nome: 'Sabiston Textbook of Surgery', tipo: 'livro', trust_score: 98, especialidade: 'cirurgia' },
  { nome: 'Schwartz - Princípios da Cirurgia', tipo: 'livro', trust_score: 96, especialidade: 'cirurgia' },
  // Pediatria
  { nome: 'Nelson Textbook of Pediatrics', tipo: 'livro', trust_score: 98, especialidade: 'pediatria' },
  // GO
  { nome: 'Williams Obstetrics', tipo: 'livro', trust_score: 98, especialidade: 'ginecologia' },
  // Neurologia
  { nome: 'Adams & Victor - Neurologia', tipo: 'livro', trust_score: 98, especialidade: 'neurologia' },
  // Fisiologia/Patologia
  { nome: 'Guyton & Hall - Fisiologia Médica', tipo: 'livro', trust_score: 98, especialidade: 'geral' },
  { nome: 'Robbins - Patologia', tipo: 'livro', trust_score: 98, especialidade: 'geral' },
  // Propedêutica
  { nome: 'Bates - Propedêutica Médica', tipo: 'livro', trust_score: 96, especialidade: 'geral' },
  // Psiquiatria
  { nome: 'Kaplan & Sadock - Psiquiatria', tipo: 'livro', trust_score: 98, especialidade: 'psiquiatria' },
  { nome: 'DSM-5-TR', tipo: 'livro', trust_score: 100, especialidade: 'psiquiatria' }
];

export const WHITELIST_ATLAS = [
  { nome: 'Netter - Atlas de Anatomia Humana', tipo: 'atlas', trust_score: 98, especialidade: 'anatomia' },
  { nome: 'Sobotta - Atlas de Anatomia Humana', tipo: 'atlas', trust_score: 98, especialidade: 'anatomia' },
  { nome: "Gray's Anatomy", tipo: 'atlas', trust_score: 98, especialidade: 'anatomia' },
  { nome: "Grant's Atlas of Anatomy", tipo: 'atlas', trust_score: 96, especialidade: 'anatomia' },
  { nome: 'Moore - Anatomia Orientada para a Clínica', tipo: 'atlas', trust_score: 96, especialidade: 'anatomia' },
  { nome: 'Rohen - Atlas de Anatomia', tipo: 'atlas', trust_score: 95, especialidade: 'anatomia' }
];

export const WHITELIST_PLATAFORMAS = [
  { nome: 'UpToDate', tipo: 'plataforma', trust_score: 98, licenca: 'comercial', nota: 'Requer licença' },
  { nome: 'DynaMed', tipo: 'plataforma', trust_score: 96, licenca: 'comercial', nota: 'Requer licença' },
  { nome: 'BMJ Best Practice', tipo: 'plataforma', trust_score: 96, licenca: 'comercial', nota: 'Requer licença' },
  { nome: 'Micromedex', tipo: 'plataforma', trust_score: 96, licenca: 'comercial', nota: 'Requer licença' },
  { nome: 'Lexicomp', tipo: 'plataforma', trust_score: 95, licenca: 'comercial', nota: 'Requer licença' },
  { nome: 'PubMed/NCBI', tipo: 'plataforma', trust_score: 90, licenca: 'open', nota: 'Apenas estudos revisados por pares' }
];

// ========================
// BLACKLIST - FONTES PROIBIDAS
// ========================

export const BLACKLIST = [
  { tipo: 'blog', motivo: 'Blogs pessoais sem revisão científica' },
  { tipo: 'rede_social', motivo: 'Conteúdo de redes sociais (Instagram, TikTok, YouTube não validado)' },
  { tipo: 'preprint_nao_revisado', motivo: 'Artigos preprint sem revisão por pares (medRxiv, bioRxiv)' },
  { tipo: 'pseudociencia', motivo: 'Sites de opinião ou pseudociência' },
  { tipo: 'noticia_sem_fonte', motivo: 'Notícias sem referência científica' },
  { tipo: 'conflito_interesse', motivo: 'Estudos com conflitos de interesse não declarados' },
  { tipo: 'ia_nao_validada', motivo: 'Conteúdo gerado por IA sem validação médica humana' },
  { tipo: 'anonimo', motivo: 'Repositórios anônimos ou sem autoria' }
];

// ========================
// NÍVEIS DE EVIDÊNCIA
// ========================

export const NIVEIS_EVIDENCIA = {
  A: {
    label: 'Nível A',
    descricao: 'Diretriz/consenso de sociedades com revisão por pares e aprovação formal',
    trust_min: 90
  },
  B: {
    label: 'Nível B',
    descricao: 'Revisões sistemáticas / meta-análises de alto padrão',
    trust_min: 80
  },
  C: {
    label: 'Nível C',
    descricao: 'Estudos clínicos randomizados relevantes',
    trust_min: 70
  },
  D: {
    label: 'Nível D',
    descricao: 'Estudos observacionais, séries de caso',
    trust_min: 50
  },
  P: {
    label: 'Provisório',
    descricao: 'Preprint não revisado - NUNCA aplicar automaticamente em condutas',
    trust_min: 0,
    bloqueado: true
  }
};

// ========================
// FORÇA DE RECOMENDAÇÃO
// ========================

export const FORCA_RECOMENDACAO = {
  I: { label: 'Classe I', descricao: 'Benefício >>> Risco. DEVE ser realizado' },
  IIa: { label: 'Classe IIa', descricao: 'Benefício >> Risco. É RAZOÁVEL realizar' },
  IIb: { label: 'Classe IIb', descricao: 'Benefício ≥ Risco. PODE ser considerado' },
  III: { label: 'Classe III', descricao: 'Sem benefício ou risco. NÃO deve ser realizado' }
};

// ========================
// FUNÇÕES DE VALIDAÇÃO
// ========================

export function calcularTrustScore(fonte) {
  // Verifica se está na whitelist
  const sociedade = WHITELIST_SOCIEDADES.find(s => 
    s.sigla === fonte.sigla || s.nome.toLowerCase().includes(fonte.nome?.toLowerCase())
  );
  if (sociedade) return sociedade.trust_score;

  const livro = WHITELIST_LIVROS.find(l => 
    l.nome.toLowerCase().includes(fonte.nome?.toLowerCase())
  );
  if (livro) return livro.trust_score;

  const atlas = WHITELIST_ATLAS.find(a => 
    a.nome.toLowerCase().includes(fonte.nome?.toLowerCase())
  );
  if (atlas) return atlas.trust_score;

  const plataforma = WHITELIST_PLATAFORMAS.find(p => 
    p.nome.toLowerCase().includes(fonte.nome?.toLowerCase())
  );
  if (plataforma) return plataforma.trust_score;

  // Se não está em nenhuma whitelist
  if (fonte.tipo === 'preprint') return 25;
  if (fonte.tipo === 'blog' || fonte.tipo === 'rede_social') return 0;
  
  return 50; // Score padrão para fontes não classificadas
}

export function verificarBlacklist(fonte) {
  return BLACKLIST.some(b => b.tipo === fonte.tipo);
}

export function isProvisorio(conteudo) {
  return conteudo.nivel_evidencia === 'P' || 
         conteudo.status === 'provisorio' ||
         conteudo.trust_score < 50;
}

export function podeSerPublicado(conteudo) {
  if (verificarBlacklist(conteudo)) return false;
  if (conteudo.blacklisted) return false;
  if (!conteudo.fonte_nome) return false;
  return true;
}

export function getTodasFontesWhitelist() {
  return [
    ...WHITELIST_SOCIEDADES.map(s => ({ ...s, tipo: 'sociedade' })),
    ...WHITELIST_LIVROS,
    ...WHITELIST_ATLAS,
    ...WHITELIST_PLATAFORMAS
  ];
}

export default {
  WHITELIST_SOCIEDADES,
  WHITELIST_LIVROS,
  WHITELIST_ATLAS,
  WHITELIST_PLATAFORMAS,
  BLACKLIST,
  NIVEIS_EVIDENCIA,
  FORCA_RECOMENDACAO,
  calcularTrustScore,
  verificarBlacklist,
  isProvisorio,
  podeSerPublicado,
  getTodasFontesWhitelist
};