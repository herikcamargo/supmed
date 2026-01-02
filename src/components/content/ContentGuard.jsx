/**
 * ContentGuard - Bloqueio técnico de fetch externo em telas clínicas
 * 
 * REGRA ABSOLUTA:
 * Nenhum módulo clínico pode fazer fetch direto na internet para exibir conteúdo ao usuário
 */

const CLINICAL_MODULES = [
  'plantonista',
  'ceatox',
  'procedimentos',
  'ecg',
  'imagens',
  'scores',
  'guidelines',
  'bulario',
  'protocolos',
  'comunicacao_dificil',
  'pediatria',
  'ginecologia',
  'infectologia',
  'dermatologia',
  'interacoes'
];

class ContentGuard {
  constructor() {
    this.violations = [];
    this.enabled = true;
  }

  /**
   * Verifica se um módulo é clínico
   */
  isClinicalModule(moduleName) {
    return CLINICAL_MODULES.includes(moduleName?.toLowerCase());
  }

  /**
   * Registra violação de fetch externo
   */
  logViolation(moduleName, url) {
    const violation = {
      module: moduleName,
      url,
      timestamp: new Date().toISOString(),
      stackTrace: new Error().stack
    };

    this.violations.push(violation);
    
    console.error(
      `[ContentGuard] ❌ VIOLAÇÃO DETECTADA\n` +
      `Módulo: ${moduleName}\n` +
      `URL: ${url}\n` +
      `REGRA: Módulos clínicos devem usar ContentManager, não fetch direto\n`,
      violation
    );

    // Em desenvolvimento, lançar erro para forçar correção
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        `ContentGuard: Fetch externo bloqueado em módulo clínico "${moduleName}". ` +
        `Use ContentManager.get() ao invés de fetch direto.`
      );
    }
  }

  /**
   * Verifica se uma chamada deve ser bloqueada
   */
  shouldBlock(moduleName, url) {
    if (!this.enabled) return false;
    
    // Bloquear apenas se for módulo clínico E fetch externo para conteúdo
    const isExternal = url.includes('http') || url.includes('api');
    const isClinical = this.isClinicalModule(moduleName);
    
    return isClinical && isExternal;
  }

  /**
   * Retorna relatório de violações
   */
  getViolationsReport() {
    return {
      total: this.violations.length,
      violations: this.violations,
      modules: [...new Set(this.violations.map(v => v.module))]
    };
  }

  /**
   * Limpa histórico de violações
   */
  clearViolations() {
    this.violations = [];
  }
}

export const contentGuard = new ContentGuard();