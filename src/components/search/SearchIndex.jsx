// Sistema de Indexação de Busca Local
// Performance target: <200ms

// Normalizar texto para busca
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

// Tokenizar texto em termos de busca
export function tokenize(text) {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter(t => t.length >= 2);
}

// Criar índice invertido (termo -> [documentos])
export function buildIndex(documents, fields) {
  const index = {};
  
  documents.forEach((doc, docId) => {
    const tokens = new Set();
    
    fields.forEach(field => {
      const value = doc[field];
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => tokenize(v).forEach(t => tokens.add(t)));
        } else {
          tokenize(value).forEach(t => tokens.add(t));
        }
      }
    });
    
    tokens.forEach(token => {
      if (!index[token]) {
        index[token] = [];
      }
      index[token].push({
        id: docId,
        score: 1,
        title: doc.title || doc.nome || doc.nome_patologia || doc.titulo
      });
    });
  });
  
  return index;
}

// Buscar no índice (retorna apenas IDs e metadados)
export function searchIndex(index, query, maxResults = 20) {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  
  const scores = {};
  const titles = {};
  
  tokens.forEach(token => {
    // Busca exata
    if (index[token]) {
      index[token].forEach(item => {
        scores[item.id] = (scores[item.id] || 0) + 2;
        titles[item.id] = item.title;
      });
    }
    
    // Busca prefixo (começa com)
    Object.keys(index).forEach(indexToken => {
      if (indexToken.startsWith(token) && indexToken !== token) {
        index[indexToken].forEach(item => {
          scores[item.id] = (scores[item.id] || 0) + 1;
          titles[item.id] = item.title;
        });
      }
    });
  });
  
  // Ordenar por score
  const results = Object.keys(scores)
    .map(id => ({
      id: parseInt(id),
      score: scores[id],
      title: titles[id]
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  
  return results;
}

// Gerenciador de Índices por Tipo
class SearchIndexManager {
  constructor() {
    this.indices = {};
    this.cache = {};
    this.cacheSize = 100;
  }
  
  // Criar índice para um tipo de conteúdo
  createIndex(type, documents, fields) {
    console.time(`Index ${type}`);
    this.indices[type] = buildIndex(documents, fields);
    console.timeEnd(`Index ${type}`);
    
    // Salvar no localStorage para persistência
    try {
      localStorage.setItem(`supmed_index_${type}`, JSON.stringify({
        timestamp: Date.now(),
        index: this.indices[type]
      }));
    } catch (e) {
      console.warn('Failed to cache index:', e);
    }
  }
  
  // Carregar índice do localStorage
  loadIndex(type, maxAge = 3600000) { // 1h
    try {
      const saved = localStorage.getItem(`supmed_index_${type}`);
      if (saved) {
        const { timestamp, index } = JSON.parse(saved);
        if (Date.now() - timestamp < maxAge) {
          this.indices[type] = index;
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to load index:', e);
    }
    return false;
  }
  
  // Buscar em um ou mais tipos
  search(query, types = [], maxResults = 20) {
    if (query.length < 2) return [];
    
    // Cache check
    const cacheKey = `${query}_${types.join(',')}`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }
    
    console.time('Search');
    
    let allResults = [];
    
    if (types.length === 0) {
      types = Object.keys(this.indices);
    }
    
    types.forEach(type => {
      if (this.indices[type]) {
        const results = searchIndex(this.indices[type], query, maxResults);
        results.forEach(r => {
          allResults.push({
            ...r,
            type
          });
        });
      }
    });
    
    // Ordenar por score global
    allResults.sort((a, b) => b.score - a.score);
    allResults = allResults.slice(0, maxResults);
    
    console.timeEnd('Search');
    
    // Cache result
    this.cache[cacheKey] = allResults;
    
    // Limitar tamanho do cache
    const cacheKeys = Object.keys(this.cache);
    if (cacheKeys.length > this.cacheSize) {
      delete this.cache[cacheKeys[0]];
    }
    
    return allResults;
  }
  
  // Limpar cache
  clearCache() {
    this.cache = {};
  }
}

// Instância global
export const searchManager = new SearchIndexManager();

// Inicializar índices
export async function initializeSearchIndices() {
  console.log('Initializing search indices...');
  
  // Índice de patologias clínicas
  const patologias = [
    { id: 0, title: 'IAM', nome: 'Infarto Agudo do Miocárdio', tags: ['iam', 'infarto', 'miocardio', 'ima', 'ima com supra', 'stemi'], categoria: 'cardiologia' },
    { id: 1, title: 'Sepse', nome: 'Sepse e Choque Séptico', tags: ['sepse', 'choque', 'septico', 'infeccao', 'sofa', 'qsofa'], categoria: 'infectologia' },
    { id: 2, title: 'TEP', nome: 'Tromboembolismo Pulmonar', tags: ['tep', 'embolia', 'pulmonar', 'tvp', 'wells', 'dispneia'], categoria: 'pneumologia' },
    { id: 3, title: 'AVC', nome: 'Acidente Vascular Cerebral', tags: ['avc', 'ave', 'derrame', 'isquemico', 'hemorragico', 'nihss'], categoria: 'neurologia' },
    { id: 4, title: 'Pneumonia', nome: 'Pneumonia Comunitária', tags: ['pneumonia', 'pac', 'tosse', 'febre', 'consolidacao', 'curb65'], categoria: 'pneumologia' },
    { id: 5, title: 'ICC', nome: 'Insuficiência Cardíaca Congestiva', tags: ['icc', 'insuficiencia', 'cardiaca', 'edema', 'dispneia', 'ortopneia'], categoria: 'cardiologia' },
    { id: 6, title: 'Arritmias', nome: 'Arritmias Cardíacas', tags: ['arritmia', 'fa', 'fibrilacao', 'taquicardia', 'bradicardia'], categoria: 'cardiologia' },
    { id: 7, title: 'DPOC', nome: 'Doença Pulmonar Obstrutiva Crônica', tags: ['dpoc', 'enfisema', 'bronquite', 'exacerbacao', 'dispneia'], categoria: 'pneumologia' },
    { id: 8, title: 'Diabetes', nome: 'Diabetes Mellitus e Complicações', tags: ['diabetes', 'hiperglicemia', 'hipoglicemia', 'cetoacidose', 'ehh'], categoria: 'endocrinologia' },
    { id: 9, title: 'HAS', nome: 'Hipertensão Arterial Sistêmica', tags: ['has', 'hipertensao', 'pressao', 'alta', 'crise', 'hipertensiva'], categoria: 'cardiologia' }
  ];
  
  searchManager.createIndex('patologias', patologias, ['nome', 'tags', 'categoria']);
  
  console.log('Search indices ready');
}