# Sistema de Gestão de Conteúdo Persistido - ContentManager

## Visão Geral

Sistema centralizado de gerenciamento de conteúdo clínico que garante:
- 📦 **Banco interno como fonte da verdade**
- 🌐 **Internet apenas para atualizações**
- 🧠 **Conteúdo não muda silenciosamente**
- ⚡ **Modo offline rápido**
- 🔄 **Atualizações controladas e versionadas**

## Regra Absoluta

**NENHUM módulo clínico pode fazer fetch direto na internet para exibir conteúdo ao usuário.**

## Arquitetura

### ContentManager.js
Núcleo do sistema. Responsável por:
- Buscar conteúdo de fontes confiáveis
- Normalizar e estruturar dados
- Versionar cada atualização
- Salvar no banco interno (ConteudoClinico)
- Verificar atualizações em background
- Expor API única para leitura

### ContentVersionBadge.js
Componente UI que exibe:
- Versão do conteúdo
- Data da última atualização
- Fonte primária
- Status de atualização (recente/moderado/antigo)

### OfflineIndicator.js
Indicador de status online/offline para o usuário

### ContentGuard.js
Sistema de bloqueio técnico que:
- Detecta fetches externos em módulos clínicos
- Registra violações
- Bloqueia em desenvolvimento (força correção)

### usePersistedContent.js
Hook React para consumir conteúdo persistido facilmente

## Módulos Integrados

### ✅ Aplicado com ContentManager
- **Plantonista** - Ações clínicas e guidelines
- **Ceatox** - Informações toxicológicas
- **Guidelines** - Diretrizes médicas
- **Bulário** - Informações de medicamentos
- **Ginecologia** - Medicamentos em gestação/lactação

### ✅ Conteúdo Estático (não precisa ContentManager)
- **Pediatria** - Doses, PALS, desenvolvimento (cálculos e dados fixos)
- **Dermatologia** - Atlas de lesões (dados estáticos)
- **Infectologia** - Síndromes infecciosas (dados de referência estáticos)
- **Comunicação Difícil** - Protocolos e scripts (conteúdo fixo)
- **Procedimentos** - Usa entidade Procedimento
- **Diluição** - Usa entidade DiluicaoMedicamento
- **ECG** - Atlas estático
- **Imagens** - Atlas estático
- **Scores** - Calculadoras (algoritmos fixos)
- **Protocolos** - PALS, ACLS, ATLS (protocolos fixos)
- **Jornal** - Usa entidade JornalEdicao
- **Modelos** - Templates salvos localmente

## Como Usar

### Para desenvolvedores

**Consumir conteúdo persistido:**
```javascript
import { contentManager } from '../components/content/ContentManager';

// Em uma função async
const content = await contentManager.get(slug, {
  modulo: 'plantonista',
  tipo: 'guideline'
});

// Rastrear acesso
contentManager.trackAccess(slug);

// Usar conteúdo
const clinicalData = content.conteudo;
```

**Usar hook React:**
```javascript
import { usePersistedContent } from '../components/content/usePersistedContent';

function MeuComponente() {
  const { content, isLoading, error } = usePersistedContent(
    'asma-gina-2025', 
    'plantonista', 
    'guideline'
  );
  
  if (isLoading) return <Loader />;
  if (error) return <Error />;
  
  return <div>{content.conteudo.definicao}</div>;
}
```

**Exibir badges de versão:**
```javascript
import ContentVersionBadge from '../components/content/ContentVersionBadge';
import OfflineIndicator from '../components/content/OfflineIndicator';

<OfflineIndicator />
<ContentVersionBadge content={conteudo} variant="compact" />
<ContentVersionBadge content={conteudo} variant="detailed" />
```

## Fluxo de Funcionamento

### 1. Primeiro Acesso
```
Usuário → abre tela
  ↓
ContentManager.get(slug)
  ↓
Não existe localmente?
  ↓
Busca da internet (primeira vez)
  ↓
Normaliza dados
  ↓
Salva no banco (v1.0)
  ↓
Retorna para usuário
  ↓
Agenda verificação em background
```

### 2. Acessos Subsequentes
```
Usuário → abre tela
  ↓
ContentManager.get(slug)
  ↓
SEMPRE busca do banco primeiro (rápido!)
  ↓
Retorna conteúdo local
  ↓
Em background (não bloqueia):
  - Verifica se passou >7 dias
  - Se sim, busca nova versão
  - Compara hash
  - Se diferente, atualiza versão
  - Se igual, mantém
```

### 3. Modo Offline
```
Usuário → sem internet
  ↓
ContentManager.get(slug)
  ↓
Busca do banco local
  ↓
Retorna última versão salva
  ↓
Exibe badge "Offline"
  ↓
Nenhum erro, nenhum travamento
```

## Versionamento

- Versão inicial: `1.0`
- Atualizações: `1.1`, `1.2`, `1.3`...
- Hash MD5 detecta mudanças reais no conteúdo
- Changelog implícito via `ultima_atualizacao`

## Entidade ConteudoClinico

Todos os conteúdos clínicos são salvos nesta entidade:

```json
{
  "titulo": "Asma - GINA 2025",
  "slug": "asma-gina-2025",
  "categoria": "respiratorio",
  "tipo_conteudo": "guideline",
  "conteudo": { /* objeto estruturado */ },
  "versao": "1.2",
  "hash_conteudo": "a3f8d9e2",
  "data_download": "2025-01-15T10:00:00Z",
  "ultima_verificacao": "2025-01-20T15:30:00Z",
  "ultima_atualizacao": "2025-01-18T12:00:00Z",
  "status": "ativo",
  "fonte_primaria": "GINA 2025",
  "diretrizes": [...],
  "acessos_count": 42
}
```

## Prompts Especializados

Cada módulo tem um prompt específico no ContentManager:
- `buildPlantonistaPrompt()` - Diretrizes clínicas 2024-2025
- `buildCeatoxPrompt()` - Toxicologia estruturada
- `buildBularioPrompt()` - Bulário completo
- `buildGuidelinePrompt()` - Guidelines com evidências
- `buildGinecologiaPrompt()` - Segurança gestação/lactação
- `buildProcedimentoPrompt()` - Procedimentos passo a passo

## Benefícios

### Para Usuários
- ✅ Conteúdo sempre disponível (offline)
- ✅ Carregamento instantâneo
- ✅ Informações consistentes
- ✅ Transparência (versão, fonte, data)

### Para Sistema
- ✅ Menos requisições à IA
- ✅ Redução de custos
- ✅ Maior confiabilidade
- ✅ Auditoria completa
- ✅ Escalabilidade

### Para Segurança Clínica
- ✅ Conteúdo versionado e rastreável
- ✅ Fontes documentadas
- ✅ Mudanças controladas
- ✅ Não há "variação" no conteúdo

## Monitoramento

Use `ContentGuard` para detectar violações:

```javascript
import { contentGuard } from '../components/content/ContentGuard';

// Ver relatório de violações
const report = contentGuard.getViolationsReport();
console.log(`Total de violações: ${report.total}`);
console.log(`Módulos com problemas:`, report.modules);
```

## Manutenção

### Forçar atualização de conteúdo
```javascript
await contentManager.checkAndUpdate(slug, modulo, tipo);
```

### Limpar cache
```javascript
// Deletar conteúdo específico
await base44.entities.ConteudoClinico.delete(id);

// Marcar como obsoleto
await base44.entities.ConteudoClinico.update(id, { status: 'obsoleto' });
```

## Roadmap

- [ ] Painel admin para gerenciar versões
- [ ] Notificações de atualizações importantes
- [ ] Diff visual entre versões
- [ ] Export/import de conteúdo
- [ ] Aprovação manual de updates críticos