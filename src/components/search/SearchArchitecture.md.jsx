# Arquitetura de Busca - SUPMED
## Performance Target: <200ms

## 1. ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE INTERFACE                       │
│  Input → Debounce (300ms) → Mínimo 2 caracteres            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE BUSCA RÁPIDA                    │
│  • Índice Invertido (termo → IDs)                          │
│  • Normalização (sem acentos, lowercase)                    │
│  • Cache LRU (100 últimas buscas)                           │
│  • Retorna: [{id, score, title, type}]                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE DADOS                           │
│  • localStorage: Índice pré-computado                       │
│  • Entities: Conteúdo completo (lazy load)                  │
│  • Base44 API: Sincronização                                │
└─────────────────────────────────────────────────────────────┘
```

## 2. ESTRUTURA DO ÍNDICE

### LocalStorage Schema
```json
{
  "supmed_index_patologias": {
    "timestamp": 1702742400000,
    "index": {
      "iam": [
        {"id": 0, "score": 1, "title": "Infarto Agudo do Miocárdio"}
      ],
      "infarto": [
        {"id": 0, "score": 1, "title": "Infarto Agudo do Miocárdio"}
      ],
      "sepse": [
        {"id": 1, "score": 1, "title": "Sepse e Choque Séptico"}
      ]
    }
  }
}
```

### Índice por Tipo de Conteúdo
- **patologias**: Doenças e condições clínicas
- **medicamentos**: Fármacos e doses
- **procedimentos**: Procedimentos médicos
- **scores**: Calculadoras e escalas
- **ecg**: Patologias eletrocardiográficas
- **imagens**: Achados em exames de imagem

## 3. FLUXO DE BUSCA PASSO A PASSO

### Fase 1: Input do Usuário (0ms)
```javascript
Usuario digita: "iam"
↓
```

### Fase 2: Debounce (0-300ms)
```javascript
Timer: 300ms (cancela busca anterior se nova entrada)
Se query.length < 2: return []
↓
```

### Fase 3: Normalização (1-5ms)
```javascript
"IAM" → normalize → "iam"
"Infarto Agudo" → "infarto agudo"
Tokenização: ["infarto", "agudo"]
↓
```

### Fase 4: Busca no Índice (5-50ms)
```javascript
Para cada token:
  1. Busca exata: index["infarto"] → [doc_ids]
  2. Busca prefixo: index.keys.filter(k => k.startsWith("infar"))
  3. Scoring: exato=2pts, prefixo=1pt
Ordenar por score descendente
Limitar a 20 resultados
↓
```

### Fase 5: Retorno (50-100ms)
```javascript
Return: [
  {id: 0, score: 4, title: "IAM", type: "patologias"},
  {id: 5, score: 2, title: "ICC", type: "patologias"}
]
↓
```

### Fase 6: Render UI (100-200ms)
```javascript
UI renderiza lista de resultados (só metadados)
Usuário clica em item
→ Carrega conteúdo completo (lazy)
→ IA só agora se necessário
```

## 4. OTIMIZAÇÕES PARA <200ms

### 4.1 Pré-computação
- ✅ Índice criado durante inicialização
- ✅ Persistido em localStorage
- ✅ Revalidado a cada 1h
- ❌ Nunca recriar durante busca

### 4.2 Normalização Eficiente
```javascript
// Rápido (10-30ms para 1000 docs)
text.toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
```

### 4.3 Cache LRU
```javascript
cache = {
  "iam_patologias": [...results],
  "sepse_patologias": [...results]
}
// Limite: 100 entradas
// Hit rate esperado: 60-70%
```

### 4.4 Lazy Loading
```javascript
// Busca: retorna apenas IDs e metadados (rápido)
search("iam") → [{id: 0, title: "IAM"}]

// Conteúdo: carrega sob demanda (quando clica)
loadContent(0) → {id: 0, ...fullContent}
```

### 4.5 Web Workers (Opcional)
```javascript
// Para índices >10MB
worker.postMessage({type: 'search', query: 'iam'})
worker.onmessage = (e) => setResults(e.data)
```

## 5. BOAS PRÁTICAS

### ✅ FAZER
1. Debounce de 300ms
2. Busca só após 2-3 caracteres
3. Normalizar termos (lowercase, sem acentos)
4. Cache de resultados frequentes
5. Índice pré-computado
6. Lazy load de conteúdo completo
7. Limitar resultados (20 max)
8. Tokenização simples (split por espaço)

### ❌ NÃO FAZER
1. ❌ Chamar IA durante digitação
2. ❌ Busca full-text em tempo real
3. ❌ Carregar todo conteúdo na listagem
4. ❌ Regex complexas
5. ❌ Busca sem debounce
6. ❌ Índice não normalizado
7. ❌ Queries SQL síncronas
8. ❌ Busca com <2 caracteres

## 6. ERROS COMUNS

### Erro 1: Busca muito abrangente
```javascript
// ❌ MAL
query.length === 1 → busca 10000 docs

// ✅ BOM
if (query.length < 2) return []
```

### Erro 2: Sem cache
```javascript
// ❌ MAL
Toda busca refaz tudo

// ✅ BOM
if (cache[query]) return cache[query]
```

### Erro 3: Carregar tudo
```javascript
// ❌ MAL
search() → return completeDocuments[]

// ✅ BOM
search() → return [{id, title}]
onClick(id) → load(id)
```

### Erro 4: IA síncrona
```javascript
// ❌ MAL
onChange={searchWithAI}

// ✅ BOM
onClick={openItem} → então pode usar IA
```

## 7. MÉTRICAS DE SUCESSO

### Performance
- Busca: <200ms (95th percentile)
- Debounce: 300ms
- Cache hit: >60%
- Índice size: <5MB

### Experiência
- Resultados enquanto digita
- Sem travamentos
- Funciona offline
- Feedback visual instantâneo

## 8. CONFORMIDADE

### ANVISA-Safe
- ✅ Não sugere diagnóstico
- ✅ Não sugere conduta
- ✅ Apenas recuperação de informação
- ✅ Decisão sempre humana

### LGPD
- ✅ Sem dados pessoais no índice
- ✅ Termos de busca não identificam usuário
- ✅ Cache local apenas
- ✅ Dados anônimos

## 9. ROADMAP FUTURO

### v1 (Atual)
- Índice local em localStorage
- Busca síncrona JavaScript
- Cache LRU básico

### v2 (Próximo)
- IndexedDB para índices grandes
- Web Workers para busca paralela
- Sinônimos clínicos automáticos

### v3 (Futuro)
- Backend FTS (PostgreSQL)
- Busca semântica offline
- Sugestões preditivas