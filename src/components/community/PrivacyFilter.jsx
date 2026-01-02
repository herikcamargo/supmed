// Sistema de filtragem automática de privacidade
// Detecta e bloqueia dados identificáveis de pacientes

const PATTERNS_PROIBIDOS = {
  cpf: {
    regex: /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g,
    mensagem: 'CPF detectado'
  },
  telefone: {
    regex: /\(?\d{2}\)?\s?\d{4,5}-?\d{4}/g,
    mensagem: 'Telefone detectado'
  },
  email: {
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    mensagem: 'E-mail detectado'
  },
  prontuario: {
    regex: /prontu[aá]rio:?\s*\d+/gi,
    mensagem: 'Número de prontuário'
  },
  rg: {
    regex: /RG:?\s*\d+/gi,
    mensagem: 'RG detectado'
  },
  cns: {
    regex: /CNS:?\s*\d{15}/gi,
    mensagem: 'CNS detectado'
  },
  endereco: {
    regex: /(rua|av\.|avenida|travessa)\s+[a-záàâãéèêíïóôõöúçñ\s]+,?\s*\d+/gi,
    mensagem: 'Endereço detectado'
  }
};

// Termos que indicam identificação de paciente
const TERMOS_SENSIBILIDADE_ALTA = [
  'nome completo',
  'identificação',
  'documento',
  'carteira de identidade',
  'registro geral',
  'paciente chama-se',
  'paciente chamado',
  'senhor',
  'senhora',
  'sr.',
  'sra.'
];

// Análise de texto em tempo real
export const analisarTexto = (texto) => {
  if (!texto || texto.trim().length === 0) {
    return { seguro: true, avisos: [], bloqueios: [] };
  }

  const avisos = [];
  const bloqueios = [];
  let seguro = true;

  // Verificar padrões regex
  Object.entries(PATTERNS_PROIBIDOS).forEach(([tipo, config]) => {
    const matches = texto.match(config.regex);
    if (matches && matches.length > 0) {
      bloqueios.push({
        tipo,
        mensagem: config.mensagem,
        exemplos: matches.slice(0, 3) // Mostrar até 3 exemplos
      });
      seguro = false;
    }
  });

  // Verificar termos sensíveis
  const textoLower = texto.toLowerCase();
  TERMOS_SENSIBILIDADE_ALTA.forEach(termo => {
    if (textoLower.includes(termo)) {
      avisos.push({
        tipo: 'termo_sensivel',
        mensagem: `Termo sensível detectado: "${termo}"`
      });
    }
  });

  // Verificar nomes próprios (heurística simples)
  const palavras = texto.split(/\s+/);
  const possivelNome = palavras.find(p => 
    p.length > 2 && 
    p[0] === p[0].toUpperCase() && 
    p.slice(1) === p.slice(1).toLowerCase() &&
    !['Paciente', 'Sr', 'Sra', 'Dr', 'Dra'].includes(p)
  );

  if (possivelNome) {
    avisos.push({
      tipo: 'possivel_nome',
      mensagem: `Possível nome próprio: "${possivelNome}"`
    });
  }

  return { seguro, avisos, bloqueios };
};

// Validação final antes de submissão
export const validarSubmissao = (dados) => {
  const resultado = {
    valido: true,
    erros: [],
    avisos: []
  };

  // Validar título
  const tituloAnalise = analisarTexto(dados.titulo);
  if (!tituloAnalise.seguro) {
    resultado.valido = false;
    resultado.erros.push(...tituloAnalise.bloqueios.map(b => `Título: ${b.mensagem}`));
  }
  resultado.avisos.push(...tituloAnalise.avisos);

  // Validar conteúdo
  const conteudoAnalise = analisarTexto(dados.conteudo);
  if (!conteudoAnalise.seguro) {
    resultado.valido = false;
    resultado.erros.push(...conteudoAnalise.bloqueios.map(b => `Descrição: ${b.mensagem}`));
  }
  resultado.avisos.push(...conteudoAnalise.avisos);

  // Validar pergunta
  const perguntaAnalise = analisarTexto(dados.pergunta);
  if (!perguntaAnalise.seguro) {
    resultado.valido = false;
    resultado.erros.push(...perguntaAnalise.bloqueios.map(b => `Pergunta: ${b.mensagem}`));
  }
  resultado.avisos.push(...perguntaAnalise.avisos);

  return resultado;
};

// Sugestões de reformulação segura
export const sugerirReformulacao = (textoProblematico) => {
  return {
    dicas: [
      'Use apenas idade, sexo e contexto clínico',
      'Evite nomes, documentos e endereços',
      'Foque em achados clínicos objetivos',
      'Use termos genéricos: "Paciente de 45 anos"'
    ],
    exemplos: [
      {
        errado: 'João Silva, 45 anos, CPF 123.456.789-00',
        correto: 'Paciente masculino, 45 anos'
      },
      {
        errado: 'Paciente reside na Rua das Flores, 123',
        correto: 'Paciente atendido em UPA periférica'
      }
    ]
  };
};