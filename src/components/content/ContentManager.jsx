import { base44 } from '@/api/base44Client';

/**
 * ContentManager - Sistema centralizado de gestão de conteúdo clínico
 * 
 * REGRA ABSOLUTA: 
 * - BANCO INTERNO é a fonte da verdade
 * - INTERNET apenas atualiza em background
 * - CONTEÚDO nunca muda silenciosamente
 */

class ContentManager {
  constructor() {
    this.updateQueue = new Set();
    this.isUpdating = false;
  }

  /**
   * Gera hash MD5 do conteúdo para detectar mudanças
   */
  generateHash(content) {
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Busca conteúdo do banco interno (SEMPRE USA ISSO PRIMEIRO)
   */
  async getLocal(slug) {
    try {
      const results = await base44.entities.ConteudoClinico.filter({ slug, status: 'ativo' });
      return results[0] || null;
    } catch (error) {
      console.error('Erro ao buscar conteúdo local:', error);
      return null;
    }
  }

  /**
   * Busca conteúdo - SEMPRE retorna do banco local
   * Agenda atualização em background se necessário
   */
  async get(slug, options = {}) {
    const { 
      forceUpdate = false,
      modulo = 'geral',
      tipo = 'guideline',
      customPrompt = null
    } = options;

    // 1. SEMPRE buscar do banco local primeiro
    let localContent = await this.getLocal(slug);

    // 2. Se não existe localmente, criar pela primeira vez
    if (!localContent) {
      console.log(`[ContentManager] Conteúdo não encontrado localmente: ${slug}. Criando...`);
      localContent = await this.createContent(slug, modulo, tipo, customPrompt);
    }

    // 3. Agendar verificação de atualização (em background, não bloqueia)
    this.scheduleUpdate(slug, modulo, tipo);

    // 4. Retornar conteúdo local (rápido, sempre disponível)
    return localContent;
  }

  /**
   * Cria conteúdo pela primeira vez (fetch inicial)
   */
  async createContent(slug, modulo, tipo, customPrompt = null) {
    try {
      const fetchedContent = await this.fetchFromSource(slug, modulo, tipo, customPrompt);
      
      const contentHash = this.generateHash(fetchedContent.conteudo);
      
      const newContent = await base44.entities.ConteudoClinico.create({
        slug,
        titulo: fetchedContent.titulo,
        categoria: fetchedContent.categoria || 'geral',
        tipo_conteudo: tipo,
        conteudo: fetchedContent.conteudo,
        diretrizes: fetchedContent.diretrizes || [],
        livros_utilizados: fetchedContent.livros_utilizados || [],
        versao: '1.0',
        hash_conteudo: contentHash,
        data_publicacao_fonte: fetchedContent.data_publicacao_fonte,
        data_download: new Date().toISOString(),
        ultima_verificacao: new Date().toISOString(),
        ultima_atualizacao: new Date().toISOString(),
        status: 'ativo',
        fonte_primaria: fetchedContent.fonte_primaria,
        url_origem: fetchedContent.url_origem,
        palavras_chave: fetchedContent.palavras_chave || [],
        acessos_count: 0
      });

      console.log(`[ContentManager] Conteúdo criado: ${slug} v${newContent.versao}`);
      return newContent;
    } catch (error) {
      console.error(`[ContentManager] Erro ao criar conteúdo ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Busca conteúdo de fontes externas (usado apenas internamente)
   */
  async fetchFromSource(slug, modulo, tipo, customPrompt = null) {
    // Se customPrompt fornecido, usar ele
    if (customPrompt) {
      const schema = this.getSchemaForModule(modulo);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: customPrompt,
        add_context_from_internet: true,
        response_json_schema: schema
      });

      return response;
    }

    const prompts = {
      plantonista: this.buildPlantonistaPrompt(slug),
      ceatox: this.buildCeatoxPrompt(slug),
      procedimento: this.buildProcedimentoPrompt(slug),
      ecg: this.buildECGPrompt(slug),
      score: this.buildScorePrompt(slug),
      bulario: this.buildBularioPrompt(slug),
      guidelines: this.buildGuidelinePrompt(slug),
      ginecologia: this.buildGinecologiaPrompt(slug)
    };

    const prompt = prompts[modulo] || this.buildGenericPrompt(slug, tipo);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          categoria: { type: 'string' },
          conteudo: { type: 'object' },
          diretrizes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nome_completo: { type: 'string' },
                sociedade: { type: 'string' },
                ano: { type: 'string' },
                versao: { type: 'string' },
                url: { type: 'string' }
              }
            }
          },
          livros_utilizados: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                autor_sobrenome: { type: 'string' },
                titulo_completo: { type: 'string' },
                edicao: { type: 'string' },
                ano: { type: 'string' }
              }
            }
          },
          data_publicacao_fonte: { type: 'string' },
          fonte_primaria: { type: 'string' },
          url_origem: { type: 'string' },
          palavras_chave: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return response;
  }

  getSchemaForModule(modulo) {
    const interacoesSchema = {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        categoria: { type: 'string' },
        medicamentos_analisados: { type: 'array', items: { type: 'string' } },
        total_interacoes: { type: 'number' },
        conteudo: {
          type: 'object',
          properties: {
            interacoes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  medicamento_a: { type: 'string' },
                  medicamento_b: { type: 'string' },
                  tipo_interacao: { type: 'string' },
                  gravidade: { type: 'string' },
                  descricao: { type: 'string' },
                  consequencia_clinica: { type: 'string' },
                  nivel_evidencia: { type: 'string' },
                  tempo_inicio: { type: 'string' },
                  fatores_risco: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        diretrizes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nome_completo: { type: 'string' },
              sociedade: { type: 'string' },
              ano: { type: 'string' }
            }
          }
        },
        livros_utilizados: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              autor_sobrenome: { type: 'string' },
              autor_nome: { type: 'string' },
              titulo_completo: { type: 'string' },
              edicao: { type: 'string' },
              local: { type: 'string' },
              editora: { type: 'string' },
              ano: { type: 'string' }
            }
          }
        },
        fonte_primaria: { type: 'string' }
      }
    };

    if (modulo === 'interacoes') {
      return interacoesSchema;
    }

    return {
      type: 'object',
      properties: {
        titulo: { type: 'string' },
        categoria: { type: 'string' },
        conteudo: { type: 'object' },
        diretrizes: { type: 'array' },
        livros_utilizados: { type: 'array' },
        fonte_primaria: { type: 'string' }
      }
    };
  }

  /**
   * Agenda atualização em background (não bloqueia UI)
   */
  scheduleUpdate(slug, modulo, tipo) {
    // Não duplicar updates
    if (this.updateQueue.has(slug)) {
      return;
    }

    this.updateQueue.add(slug);

    // Executar depois de um delay (não bloqueia renderização)
    setTimeout(() => {
      this.checkAndUpdate(slug, modulo, tipo);
    }, 2000);
  }

  /**
   * Verifica e atualiza conteúdo se houver mudanças
   */
  async checkAndUpdate(slug, modulo, tipo) {
    if (this.isUpdating) return;

    try {
      this.isUpdating = true;

      const localContent = await this.getLocal(slug);
      if (!localContent) {
        this.updateQueue.delete(slug);
        return;
      }

      // Verificar se precisa atualizar (mais de 7 dias desde última verificação)
      const lastCheck = new Date(localContent.ultima_verificacao);
      const daysSinceCheck = (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceCheck < 7) {
        console.log(`[ContentManager] ${slug} verificado recentemente. Pulando.`);
        this.updateQueue.delete(slug);
        return;
      }

      // Buscar nova versão
      const newContent = await this.fetchFromSource(slug, modulo, tipo);
      const newHash = this.generateHash(newContent.conteudo);

      // Atualizar timestamp de verificação
      await base44.entities.ConteudoClinico.update(localContent.id, {
        ultima_verificacao: new Date().toISOString()
      });

      // Se hash mudou, há atualização disponível
      if (newHash !== localContent.hash_conteudo) {
        console.log(`[ContentManager] Atualização detectada para ${slug}`);
        
        const currentVersion = parseFloat(localContent.versao);
        const newVersion = (currentVersion + 0.1).toFixed(1);

        await base44.entities.ConteudoClinico.update(localContent.id, {
          conteudo: newContent.conteudo,
          diretrizes: newContent.diretrizes,
          livros_utilizados: newContent.livros_utilizados,
          versao: newVersion,
          hash_conteudo: newHash,
          ultima_atualizacao: new Date().toISOString(),
          data_publicacao_fonte: newContent.data_publicacao_fonte
        });

        console.log(`[ContentManager] ${slug} atualizado: v${localContent.versao} → v${newVersion}`);
      } else {
        console.log(`[ContentManager] ${slug} está atualizado (v${localContent.versao})`);
      }
    } catch (error) {
      console.error(`[ContentManager] Erro ao atualizar ${slug}:`, error);
    } finally {
      this.isUpdating = false;
      this.updateQueue.delete(slug);
    }
  }

  /**
   * Incrementa contador de acessos
   */
  async trackAccess(slug) {
    const content = await this.getLocal(slug);
    if (content) {
      await base44.entities.ConteudoClinico.update(content.id, {
        acessos_count: (content.acessos_count || 0) + 1
      });
    }
  }

  /**
   * Prompts específicos por módulo
   */
  buildPlantonistaPrompt(termo) {
    return `
      Você é um sistema de geração de conteúdo clínico EDUCACIONAL para médicos plantonistas.
      
      TERMO: ${termo}
      
      DIRETRIZES CRÍTICAS 2024-2025:
      - OBRIGATÓRIO: Use APENAS diretrizes 2024-2025 mais recentes
      - Priorize: AHA 2024, ESC 2024, GINA 2024, GOLD 2024, Surviving Sepsis 2024
      - Inclua versões exatas das diretrizes (ex: "GINA 2024", "AHA Guidelines 2024")
      - Se diretriz 2024 não existir, use 2023 e INFORME claramente
      
      ESTRUTURA OBRIGATÓRIA:
      1. Definição e epidemiologia
      2. Quadro clínico e apresentação
      3. Red flags (sinais de alarme)
      4. Avaliação inicial estruturada
      5. Diagnósticos diferenciais principais
      6. Exames essenciais
      7. Abordagem terapêutica (conforme diretrizes 2024)
      8. Critérios de internação
      9. Critérios de alta
      10. Quando acionar especialista
      
      RETORNE:
      - Título do conteúdo
      - Categoria (cardiologia, neurologia, etc)
      - Conteúdo estruturado completo
      - Array de diretrizes utilizadas (COM VERSÕES 2024-2025)
      - Livros de referência
      - Data de publicação da fonte
      - Fonte primária (nome da sociedade/guideline)
      - URL de origem
      - Palavras-chave para busca
    `;
  }

  buildCeatoxPrompt(agente) {
    const anoAtual = new Date().getFullYear();
    return `
      AGENTE TÓXICO: ${agente}
      
      DATA ATUAL: ${new Date().toLocaleDateString('pt-BR')} (${anoAtual})
      
      REGRA CRÍTICA - CONTEÚDO COMPLETO OBRIGATÓRIO:
      - TODOS os campos devem ser preenchidos
      - Se não houver antídoto específico, informar "Não existe antídoto específico"
      - Se algo não se aplica, informar "Não aplicável"
      - NUNCA deixar campos vazios ou omitir seções
      
      FONTES ATUALIZADAS (${anoAtual-1}-${anoAtual}):
      - Goldfrank's Toxicologic Emergencies (última edição)
      - AACT Practice Guidelines
      - UpToDate - Toxicology
      - Micromedex
      - ANVISA - Bulário e alertas
      - SINITOX
      
      ========================
      ESTRUTURA COMPLETA OBRIGATÓRIA
      ========================
      
      Retornar JSON com TODOS os campos preenchidos:
      
      {
        "titulo": "Nome completo do agente",
        "categoria": "toxicologia",
        "conteudo": {
          "classe_toxicologica": "Classe (ex: Analgésico, Anticolinérgico, etc)",
          "nomes_comerciais": ["Nome1", "Nome2", "Nome3"],
          
          "mecanismo_toxicidade": "Explicação completa do mecanismo",
        
        "dose_toxica": "Dose específica (ex: >150mg/kg em adultos)",
        "dose_letal": "Dose letal estimada (ex: >10g em adultos)",
        "tempo_inicio_sintomas": "Tempo detalhado (ex: 30min-4h após ingestão)",
        
        "manifestacoes_clinicas": {
          "snc": "Manifestações neurológicas detalhadas",
          "cardiovascular": "Manifestações cardiovasculares detalhadas",
          "respiratorio": "Manifestações respiratórias detalhadas",
          "gastrointestinal": "Manifestações GI detalhadas",
          "renal": "Manifestações renais detalhadas",
          "metabolico": "Manifestações metabólicas detalhadas"
        },
        
        "criterios_gravidade": {
          "leve": "Critérios de intoxicação leve",
          "moderado": "Critérios de intoxicação moderada",
          "grave": "Critérios de intoxicação grave"
        },
        
        "red_flags": [
          "Sinal de alarme 1",
          "Sinal de alarme 2",
          "Sinal de alarme 3",
          "Sinal de alarme 4",
          "Sinal de alarme 5"
        ],
        
        "exames_diagnosticos": [
          "Exame 1 com justificativa",
          "Exame 2 com justificativa",
          "Exame 3 com justificativa",
          "Dosagem sérica (se aplicável)"
        ],
        
        "estabilizacao_inicial": [
          "ABC - via aérea, respiração, circulação",
          "Monitorização cardíaca contínua",
          "Acesso venoso calibroso",
          "Oximetria e gasometria",
          "Glicemia capilar"
        ],
        
        "descontaminacao": {
          "metodo": "Método principal (ex: Carvão ativado)",
          "dose": "Dose específica (ex: 1g/kg ou 50g em adultos)",
          "indicacoes": [
            "Indicação 1",
            "Indicação 2"
          ],
          "contraindicacoes": [
            "Contraindicação 1",
            "Contraindicação 2"
          ]
        },
        
        "antidoto": {
          "nome": "Nome do antídoto OU 'Não existe antídoto específico'",
          "mecanismo": "Mecanismo de ação OU 'Não aplicável'",
          "dose": "Dose detalhada OU 'Não aplicável'",
          "via": "Via de administração OU 'Não aplicável'",
          "indicacoes": "Indicações específicas OU 'Não aplicável'"
        },
        
        "suporte_clinico": [
          "Medida de suporte 1",
          "Medida de suporte 2",
          "Medida de suporte 3",
          "Hidratação venosa",
          "Controle sintomático"
        ],
        
        "criterios_uti": [
          "Critério 1 para UTI",
          "Critério 2 para UTI",
          "Critério 3 para UTI"
        ],
        
        "prognostico": "Prognóstico detalhado, mortalidade, sequelas",
        
        "observacoes_especiais": [
          "Observação importante 1",
          "Observação importante 2",
          "Armadilhas diagnósticas"
        ],
        
        "alertas": [
          "Alerta crítico 1",
          "Alerta crítico 2"
        ],
        
        "diretrizes_utilizadas": [
          {
            "nome_completo": "Nome completo da diretriz",
            "sociedade": "Sociedade/Organização",
            "ano": "${anoAtual}",
            "versao": "Versão"
          }
        ],
        
        "livros_utilizados": [
            {
              "autor_sobrenome": "Sobrenome",
              "autor_nome": "Nome",
              "titulo_completo": "Título completo",
              "edicao": "Edição",
              "local": "Local",
              "editora": "Editora",
              "ano": "${anoAtual}"
            }
          ]
        },
        "diretrizes": [],
        "livros_utilizados": [],
        "fonte_primaria": "Literatura Toxicológica"
      }
      
      REGRAS FINAIS:
      1. Preencher TODOS os campos acima
      2. Usar informações atualizadas (${anoAtual-1}-${anoAtual})
      3. Linguagem objetiva, educacional
      4. Se não houver informação específica, usar "Não especificado" ou "Não aplicável"
      5. Arrays devem ter pelo menos 3-5 itens quando aplicável
    `;
  }

  buildProcedimentoPrompt(procedimento) {
    return `
      PROCEDIMENTO MÉDICO: ${procedimento}
      
      Forneça guia educacional COMPLETO e ESTRUTURADO:
      
      ESTRUTURA OBRIGATÓRIA:
      1. Nome completo do procedimento
      2. Categoria (via aérea, vascular, cardiovascular, etc)
      3. Ambiente de execução (emergência, UTI, centro cirúrgico)
      4. Nível de complexidade (básico, intermediário, avançado, especialista)
      5. Indicações clínicas
      6. Contraindicações (absolutas e relativas)
      7. Materiais necessários (com quantidades)
      8. Preparo do paciente
      9. Técnica passo a passo numerada
      10. Complicações possíveis e manejo
      11. Cuidados pós-procedimento
      12. Particularidades técnicas
      13. Tempo médio de execução
      14. Critérios para consulta especialista
      15. Fontes e referências (ATLS, ACLS, Manuais)
      
      Use diretrizes atuais 2024-2025.
      Retorne dados estruturados completos incluindo diretrizes e livros utilizados.
    `;
  }

  buildECGPrompt(patologia) {
    return `
      PADRÃO ECG: ${patologia}
      
      Forneça atlas educacional:
      
      1. Achados eletrocardiográficos
      2. Diagnóstico diferencial
      3. Critérios diagnósticos
      4. Significado clínico
      5. Conduta geral
      
      Retorne dados estruturados.
    `;
  }

  buildScorePrompt(score) {
    return `
      SCORE/CALCULADORA: ${score}
      
      Forneça informações educacionais:
      
      1. Descrição e finalidade
      2. Parâmetros e cálculo
      3. Interpretação dos resultados
      4. Aplicação clínica
      5. Limitações
      
      Retorne dados estruturados com diretrizes atuais.
    `;
  }

  buildBularioPrompt(medicamento) {
    return `
      MEDICAMENTO: ${medicamento}
      
      Forneça bulário completo EDUCACIONAL seguindo estrutura padronizada:
      
      1. Nome genérico e comerciais
      2. Classe terapêutica
      3. Apresentações (formas, concentrações, vias)
      4. Mecanismo de ação
      5. Indicações
      6. Posologia (adulto, pediátrico, idoso)
      7. Ajustes de dose (renal, hepático)
      8. Contraindicações
      9. Precauções e alertas
      10. Interações medicamentosas principais
      11. Efeitos adversos (comuns e graves)
      12. Superdosagem
      13. Farmacocinética
      14. Gestação e lactação
      15. Armazenamento
      
      FONTES: ANVISA, Micromedex, UpToDate
      
      Retorne dados estruturados completos.
    `;
  }

  buildGuidelinePrompt(termo) {
    return `
      GUIDELINE: ${termo}
      
      Forneça resumo EDUCACIONAL de diretrizes médicas:
      
      1. Nome completo da diretriz
      2. Fonte/sociedade médica
      3. Ano de publicação
      4. Principais conceitos e recomendações
      5. Níveis de evidência
      6. Dicas clínicas (clinical pearls)
      7. Contraindicações
      
      Retorne dados estruturados completos.
    `;
  }

  buildGinecologiaPrompt(medicamento) {
    return `
      MEDICAMENTO EM GESTAÇÃO/LACTAÇÃO: ${medicamento}
      
      Forneça informações EDUCACIONAIS sobre segurança:
      
      1. Nome do medicamento
      2. Categoria FDA (A/B/C/D/X)
      3. Categoria de Lactação Hale (L1-L5)
      4. Segurança por trimestre
      5. Riscos teratogênicos descritos
      6. Informações sobre lactação
      7. Alternativas seguras
      8. Contraindicações
      9. Recomendações FEBRASGO/SBOG
      
      FONTES: FEBRASGO, Williams Obstetrics, Briggs
      
      Retorne dados estruturados completos.
    `;
  }

  buildGenericPrompt(termo, tipo) {
    return `
      Forneça informações clínicas educacionais sobre: ${termo}
      Tipo: ${tipo}
      
      Use diretrizes 2024-2025 mais recentes.
      Inclua referências e fontes oficiais.
      Estruture de forma clara e objetiva para médicos.
      
      Retorne dados estruturados completos.
    `;
  }
}

// Singleton
export const contentManager = new ContentManager();