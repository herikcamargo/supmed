/**
 * CeatoxValidator - Garante que TODAS as substâncias sigam o template da Digoxina
 * 
 * REGRA ABSOLUTA: Nenhuma seção pode ficar vazia
 * Se dado não existe → exibir "Não aplicável para esta substância"
 */

const TEMPLATE_SECTIONS = [
  'agent_name',
  'drug_class',
  'commercial_names',
  'mechanism',
  'toxic_dose',
  'lethal_dose',
  'onset_time',
  'symptoms_by_system',
  'red_flags',
  'initial_stabilization',
  'decontamination',
  'antidote',
  'supportive_care',
  'recommended_labs',
  'icu_criteria',
  'prognosis'
];

export function normalizeCeatoxData(data) {
  if (!data) return getEmptyTemplate();
  
  // Normalizar estrutura (suportar tanto formato inglês quanto português)
  const normalized = {
    agent_name: data.agent_name || data.titulo || 'Não especificado',
    drug_class: data.drug_class || data.classe_toxicologica || 'Não especificado',
    commercial_names: data.commercial_names || data.nomes_comerciais || [],
    mechanism: data.mechanism || data.mecanismo_toxicidade || 'Não especificado',
    toxic_dose: data.toxic_dose || data.dose_toxica || 'Não especificado',
    lethal_dose: data.lethal_dose || data.dose_letal || 'Não especificado',
    onset_time: data.onset_time || data.tempo_inicio_sintomas || 'Não especificado',
    symptoms_by_system: normalizeSymptoms(data.symptoms_by_system || data.manifestacoes_clinicas),
    red_flags: Array.isArray(data.red_flags) ? data.red_flags : (Array.isArray(data.sinais_alarme) ? data.sinais_alarme : ['Não especificado']),
    initial_stabilization: Array.isArray(data.initial_stabilization) ? data.initial_stabilization : (Array.isArray(data.estabilizacao_inicial) ? data.estabilizacao_inicial : ['Não especificado']),
    decontamination: normalizeDecontamination(data.decontamination || data.descontaminacao),
    antidote: normalizeAntidote(data.antidote || data.antidoto),
    supportive_care: Array.isArray(data.supportive_care) ? data.supportive_care : (Array.isArray(data.suporte_clinico) ? data.suporte_clinico : ['Não especificado']),
    recommended_labs: Array.isArray(data.recommended_labs) ? data.recommended_labs : (Array.isArray(data.exames_diagnosticos) ? data.exames_diagnosticos : ['Não especificado']),
    icu_criteria: Array.isArray(data.icu_criteria) ? data.icu_criteria : (Array.isArray(data.criterios_uti) ? data.criterios_uti : ['Não especificado']),
    prognosis: data.prognosis || data.prognostico || 'Não especificado',
    _metadata: data._metadata
  };

  return normalized;
}

function normalizeSymptoms(symptoms) {
  if (!symptoms) {
    return [
      { system: 'SNC', symptoms: ['Não especificado'] },
      { system: 'Cardiovascular', symptoms: ['Não especificado'] },
      { system: 'Respiratório', symptoms: ['Não especificado'] },
      { system: 'Gastrointestinal', symptoms: ['Não especificado'] }
    ];
  }

  if (Array.isArray(symptoms)) {
    return symptoms.length > 0 ? symptoms : [{ system: 'Geral', symptoms: ['Não especificado'] }];
  }

  if (typeof symptoms === 'object') {
    return Object.entries(symptoms).map(([system, symps]) => ({
      system: system.replace(/_/g, ' '),
      symptoms: Array.isArray(symps) ? symps : [symps || 'Não especificado']
    }));
  }

  return [{ system: 'Geral', symptoms: ['Não especificado'] }];
}

function normalizeDecontamination(decon) {
  if (!decon || typeof decon !== 'object') {
    return {
      method: 'Não especificado',
      metodo: 'Não especificado',
      dose: 'Não especificado',
      indications: ['Não aplicável'],
      indicacoes: ['Não aplicável'],
      contraindications: ['Não aplicável'],
      contraindicacoes: ['Não aplicável']
    };
  }

  return {
    method: decon.method || decon.metodo || 'Não especificado',
    metodo: decon.metodo || decon.method || 'Não especificado',
    dose: decon.dose || 'Não especificado',
    indications: decon.indications || decon.indicacoes || ['Não aplicável'],
    indicacoes: decon.indicacoes || decon.indications || ['Não aplicável'],
    contraindications: decon.contraindications || decon.contraindicacoes || ['Não aplicável'],
    contraindicacoes: decon.contraindicacoes || decon.contraindications || ['Não aplicável']
  };
}

function normalizeAntidote(antidote) {
  if (!antidote || typeof antidote !== 'object') {
    return {
      name: 'Não existe antídoto específico',
      nome: 'Não existe antídoto específico',
      mechanism: 'Não aplicável',
      mecanismo: 'Não aplicável',
      dose: 'Não aplicável',
      route: 'Não aplicável',
      via: 'Não aplicável'
    };
  }

  return {
    name: antidote.name || antidote.nome || 'Não existe antídoto específico',
    nome: antidote.nome || antidote.name || 'Não existe antídoto específico',
    mechanism: antidote.mechanism || antidote.mecanismo || 'Não aplicável',
    mecanismo: antidote.mecanismo || antidote.mechanism || 'Não aplicável',
    dose: antidote.dose || 'Não aplicável',
    route: antidote.route || antidote.via || 'Não aplicável',
    via: antidote.via || antidote.route || 'Não aplicável'
  };
}

function getEmptyTemplate() {
  return {
    agent_name: 'Dados não disponíveis',
    drug_class: 'Não especificado',
    commercial_names: [],
    mechanism: 'Não especificado',
    toxic_dose: 'Não especificado',
    lethal_dose: 'Não especificado',
    onset_time: 'Não especificado',
    symptoms_by_system: [{ system: 'Geral', symptoms: ['Não especificado'] }],
    red_flags: ['Não especificado'],
    initial_stabilization: ['Não especificado'],
    decontamination: {
      method: 'Não especificado',
      indications: ['Não aplicável'],
      contraindications: ['Não aplicável']
    },
    antidote: {
      name: 'Não existe antídoto específico',
      mechanism: 'Não aplicável',
      dose: 'Não aplicável',
      route: 'Não aplicável'
    },
    supportive_care: ['Não especificado'],
    recommended_labs: ['Não especificado'],
    icu_criteria: ['Não especificado'],
    prognosis: 'Não especificado'
  };
}

export function validateCeatoxData(data) {
  const errors = [];
  
  TEMPLATE_SECTIONS.forEach(section => {
    if (!data[section] || 
        (Array.isArray(data[section]) && data[section].length === 0) ||
        (typeof data[section] === 'string' && !data[section].trim())) {
      errors.push(`Seção ausente ou vazia: ${section}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    needsUpdate: errors.length > 5 // Se >5 campos faltando, precisa atualizar
  };
}

export function shouldForceUpdate(data) {
  const validation = validateCeatoxData(data);
  return validation.needsUpdate;
}