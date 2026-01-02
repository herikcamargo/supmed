// LogService - Sistema de logs estruturados
// Simula integração com ElasticSearch para auditoria e métricas

const LOG_STORAGE_KEY = 'supmed_logs';
const MAX_LOCAL_LOGS = 500;

export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  AUDIT: 'audit',
  METRIC: 'metric'
};

export const LogCategory = {
  AUTH: 'auth',
  NAVIGATION: 'navigation',
  CLINICAL: 'clinical',
  PRESCRIPTION: 'prescription',
  DIAGNOSIS: 'diagnosis',
  SEARCH: 'search',
  ERROR: 'error',
  PERFORMANCE: 'performance',
  USER_ACTION: 'user_action'
};

class LogService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.attentionLevel = null;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUser(userId, attentionLevel) {
    this.userId = userId;
    this.attentionLevel = attentionLevel;
  }

  createLogEntry(level, category, message, metadata = {}) {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      sessionId: this.sessionId,
      userId: this.userId,
      attentionLevel: this.attentionLevel,
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata: {
        ...metadata,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        online: navigator.onLine
      }
    };
  }

  saveLog(entry) {
    const logs = this.getLogs();
    logs.unshift(entry);
    
    // Manter apenas os últimos MAX_LOCAL_LOGS
    if (logs.length > MAX_LOCAL_LOGS) {
      logs.splice(MAX_LOCAL_LOGS);
    }
    
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    
    // Em produção, enviar para ElasticSearch
    this.sendToElastic(entry);
  }

  async sendToElastic(entry) {
    // Placeholder para envio ao ElasticSearch
    // Em produção: POST para endpoint do Elastic
    if (process.env.NODE_ENV === 'production') {
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
    }
    console.log(`[${entry.level.toUpperCase()}] ${entry.category}: ${entry.message}`, entry.metadata);
  }

  getLogs() {
    return JSON.parse(localStorage.getItem(LOG_STORAGE_KEY) || '[]');
  }

  getLogsByCategory(category, limit = 50) {
    return this.getLogs()
      .filter(log => log.category === category)
      .slice(0, limit);
  }

  getLogsByLevel(level, limit = 50) {
    return this.getLogs()
      .filter(log => log.level === level)
      .slice(0, limit);
  }

  clearLogs() {
    localStorage.removeItem(LOG_STORAGE_KEY);
  }

  // Métodos de conveniência
  debug(category, message, metadata = {}) {
    this.saveLog(this.createLogEntry(LogLevel.DEBUG, category, message, metadata));
  }

  info(category, message, metadata = {}) {
    this.saveLog(this.createLogEntry(LogLevel.INFO, category, message, metadata));
  }

  warn(category, message, metadata = {}) {
    this.saveLog(this.createLogEntry(LogLevel.WARN, category, message, metadata));
  }

  error(category, message, metadata = {}) {
    this.saveLog(this.createLogEntry(LogLevel.ERROR, category, message, metadata));
  }

  // Auditoria específica
  audit(action, details = {}) {
    this.saveLog(this.createLogEntry(LogLevel.AUDIT, LogCategory.CLINICAL, action, {
      auditType: 'clinical_action',
      ...details
    }));
  }

  // Métricas de performance
  metric(name, value, unit = 'ms') {
    this.saveLog(this.createLogEntry(LogLevel.METRIC, LogCategory.PERFORMANCE, name, {
      value,
      unit,
      metricType: 'performance'
    }));
  }

  // Rastreamento de erros
  trackError(error, context = {}) {
    this.saveLog(this.createLogEntry(LogLevel.ERROR, LogCategory.ERROR, error.message || error, {
      stack: error.stack,
      ...context
    }));
  }

  // Métricas clínicas
  trackClinicalAction(action, patientContext = {}) {
    this.saveLog(this.createLogEntry(LogLevel.AUDIT, LogCategory.CLINICAL, action, {
      ...patientContext,
      timestamp: new Date().toISOString()
    }));
  }

  // Métricas de uso de módulo
  trackModuleUsage(moduleName, duration) {
    this.saveLog(this.createLogEntry(LogLevel.METRIC, LogCategory.USER_ACTION, `Uso do módulo: ${moduleName}`, {
      module: moduleName,
      duration,
      metricType: 'module_usage'
    }));
  }

  // Obter estatísticas
  getStats() {
    const logs = this.getLogs();
    const now = new Date();
    const today = logs.filter(l => new Date(l.timestamp).toDateString() === now.toDateString());
    
    return {
      total: logs.length,
      today: today.length,
      byLevel: {
        error: logs.filter(l => l.level === LogLevel.ERROR).length,
        warn: logs.filter(l => l.level === LogLevel.WARN).length,
        audit: logs.filter(l => l.level === LogLevel.AUDIT).length
      },
      byCategory: Object.values(LogCategory).reduce((acc, cat) => {
        acc[cat] = logs.filter(l => l.category === cat).length;
        return acc;
      }, {})
    };
  }
}

export const logService = new LogService();
export default logService;