import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, FileText, ExternalLink, Copy, Check, Bell } from 'lucide-react';
import { toast } from 'sonner';

// Lista de doenças de notificação compulsória (Portaria MS)
export const DOENCAS_NOTIFICACAO_COMPULSORIA = {
  // Imediata (até 24h)
  imediata: [
    { nome: 'Botulismo', cid: 'A05.1', sinan: true },
    { nome: 'Carbúnculo (Antraz)', cid: 'A22', sinan: true },
    { nome: 'Cólera', cid: 'A00', sinan: true },
    { nome: 'COVID-19', cid: 'U07.1', sinan: true },
    { nome: 'Dengue (óbito)', cid: 'A90', sinan: true },
    { nome: 'Difteria', cid: 'A36', sinan: true },
    { nome: 'Doença de Chagas Aguda', cid: 'B57.1', sinan: true },
    { nome: 'Doença Meningocócica', cid: 'A39', sinan: true },
    { nome: 'Ebola', cid: 'A98.4', sinan: true },
    { nome: 'Febre Amarela', cid: 'A95', sinan: true },
    { nome: 'Febre Maculosa', cid: 'A77.0', sinan: true },
    { nome: 'Hantavirose', cid: 'A98.5', sinan: true },
    { nome: 'Influenza (SRAG)', cid: 'J09', sinan: true },
    { nome: 'Malária (área não endêmica)', cid: 'B50-B54', sinan: true },
    { nome: 'Meningite', cid: 'G00-G03', sinan: true },
    { nome: 'Monkeypox/Mpox', cid: 'B04', sinan: true },
    { nome: 'Paralisia Flácida Aguda', cid: 'G82.0', sinan: true },
    { nome: 'Peste', cid: 'A20', sinan: true },
    { nome: 'Poliomielite', cid: 'A80', sinan: true },
    { nome: 'Raiva Humana', cid: 'A82', sinan: true },
    { nome: 'Rubéola', cid: 'B06', sinan: true },
    { nome: 'Sarampo', cid: 'B05', sinan: true },
    { nome: 'Síndrome Respiratória Aguda Grave', cid: 'J80', sinan: true },
    { nome: 'Tétano', cid: 'A33-A35', sinan: true },
    { nome: 'Varíola', cid: 'B03', sinan: true },
    { nome: 'Zika (gestantes/microcefalia)', cid: 'A92.8', sinan: true }
  ],
  // Semanal
  semanal: [
    { nome: 'AIDS/HIV', cid: 'B20-B24', sinan: true },
    { nome: 'Coqueluche', cid: 'A37', sinan: true },
    { nome: 'Dengue', cid: 'A90', sinan: true },
    { nome: 'Chikungunya', cid: 'A92.0', sinan: true },
    { nome: 'Esquistossomose', cid: 'B65', sinan: true },
    { nome: 'Hanseníase', cid: 'A30', sinan: true },
    { nome: 'Hepatite A', cid: 'B15', sinan: true },
    { nome: 'Hepatite B', cid: 'B16', sinan: true },
    { nome: 'Hepatite C', cid: 'B17.1', sinan: true },
    { nome: 'Leishmaniose Tegumentar', cid: 'B55.1', sinan: true },
    { nome: 'Leishmaniose Visceral', cid: 'B55.0', sinan: true },
    { nome: 'Leptospirose', cid: 'A27', sinan: true },
    { nome: 'Sífilis (todas as formas)', cid: 'A50-A53', sinan: true },
    { nome: 'Tuberculose', cid: 'A15-A19', sinan: true },
    { nome: 'Violência (doméstica/sexual)', cid: 'Y07', sinan: true }
  ]
};

// Verifica se uma doença é de notificação compulsória
export function verificarNotificacaoCompulsoria(doenca) {
  const normalizado = doenca.toLowerCase().trim();
  
  // Busca nas listas
  for (const d of DOENCAS_NOTIFICACAO_COMPULSORIA.imediata) {
    if (d.nome.toLowerCase().includes(normalizado) || normalizado.includes(d.nome.toLowerCase())) {
      return { ...d, tipo: 'imediata', prazo: 'Até 24 horas' };
    }
  }
  
  for (const d of DOENCAS_NOTIFICACAO_COMPULSORIA.semanal) {
    if (d.nome.toLowerCase().includes(normalizado) || normalizado.includes(d.nome.toLowerCase())) {
      return { ...d, tipo: 'semanal', prazo: 'Semanal' };
    }
  }
  
  // Busca por palavras-chave
  const keywords = {
    'meningite': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome === 'Meningite'),
    'dengue': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome === 'Dengue'),
    'covid': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome === 'COVID-19'),
    'tuberculose': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome === 'Tuberculose'),
    'sifilis': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome.includes('Sífilis')),
    'hepatite': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome.includes('Hepatite')),
    'hiv': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome.includes('AIDS')),
    'aids': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome.includes('AIDS')),
    'sarampo': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome === 'Sarampo'),
    'raiva': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome.includes('Raiva')),
    'tetano': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome.includes('Tétano')),
    'leptospirose': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome === 'Leptospirose'),
    'hanseniase': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome === 'Hanseníase'),
    'coqueluche': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome === 'Coqueluche'),
    'febre amarela': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome === 'Febre Amarela'),
    'malaria': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome.includes('Malária')),
    'chagas': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome.includes('Chagas')),
    'zika': DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.find(d => d.nome.includes('Zika')),
    'chikungunya': DOENCAS_NOTIFICACAO_COMPULSORIA.semanal.find(d => d.nome === 'Chikungunya')
  };
  
  for (const [key, value] of Object.entries(keywords)) {
    if (normalizado.includes(key) && value) {
      const tipo = DOENCAS_NOTIFICACAO_COMPULSORIA.imediata.includes(value) ? 'imediata' : 'semanal';
      return { ...value, tipo, prazo: tipo === 'imediata' ? 'Até 24 horas' : 'Semanal' };
    }
  }
  
  return null;
}

// Badge de alerta para notificação compulsória
export function NotificacaoCompulsoriaBadge({ doenca, onClick }) {
  const notificacao = verificarNotificacaoCompulsoria(doenca);
  
  if (!notificacao) return null;
  
  return (
    <Badge 
      className={`cursor-pointer text-[9px] gap-1 ${
        notificacao.tipo === 'imediata' 
          ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
          : 'bg-amber-600 hover:bg-amber-700'
      }`}
      onClick={onClick}
    >
      <Bell className="w-2.5 h-2.5" />
      NOTIFICAÇÃO {notificacao.tipo === 'imediata' ? 'IMEDIATA' : 'COMPULSÓRIA'}
    </Badge>
  );
}

// Dialog completo de instruções
export function NotificacaoCompulsoriaDialog({ doenca, open, onOpenChange }) {
  const [copied, setCopied] = useState(false);
  const notificacao = verificarNotificacaoCompulsoria(doenca);
  
  if (!notificacao) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const instrucoes = `
DOENÇA DE NOTIFICAÇÃO COMPULSÓRIA
=================================
Agravo: ${notificacao.nome}
CID-10: ${notificacao.cid}
Prazo: ${notificacao.prazo}
Tipo: ${notificacao.tipo === 'imediata' ? 'IMEDIATA (até 24h)' : 'SEMANAL'}

COMO NOTIFICAR:
1. Preencher Ficha de Notificação Individual (FIN)
2. Registrar no SINAN (Sistema de Informação de Agravos de Notificação)
3. Comunicar à Vigilância Epidemiológica municipal

DADOS OBRIGATÓRIOS:
- Nome completo do paciente
- Data de nascimento
- Sexo
- Endereço completo
- Data de início dos sintomas
- Data da notificação
- CID-10
- Unidade notificadora
- Médico responsável (CRM)

CONTATOS:
- Vigilância Epidemiológica local
- CVE (Centro de Vigilância Epidemiológica) estadual
- Disque Notifica: 0800-644-6645
  `.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${notificacao.tipo === 'imediata' ? 'text-red-600' : 'text-amber-600'}`} />
            Doença de Notificação Compulsória
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Alerta Principal */}
          <div className={`p-3 rounded-lg border ${
            notificacao.tipo === 'imediata' 
              ? 'bg-red-50 border-red-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-bold ${notificacao.tipo === 'imediata' ? 'text-red-700' : 'text-amber-700'}`}>
                {notificacao.nome}
              </span>
              <Badge variant="outline" className="text-[10px]">CID: {notificacao.cid}</Badge>
            </div>
            <p className={`text-xs ${notificacao.tipo === 'imediata' ? 'text-red-600' : 'text-amber-600'}`}>
              <strong>Prazo de notificação:</strong> {notificacao.prazo}
            </p>
          </div>

          {/* Como Notificar */}
          <Card className="border-slate-200">
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Como Notificar
              </h4>
              <ol className="space-y-1 text-[10px] text-slate-600">
                <li>1. Preencher <strong>Ficha de Notificação Individual (FIN)</strong></li>
                <li>2. Registrar no <strong>SINAN</strong> (Sistema de Informação de Agravos)</li>
                <li>3. Comunicar à <strong>Vigilância Epidemiológica</strong> municipal</li>
                {notificacao.tipo === 'imediata' && (
                  <li className="text-red-600 font-medium">4. Ligar imediatamente para o CVE!</li>
                )}
              </ol>
            </CardContent>
          </Card>

          {/* Dados Obrigatórios */}
          <Card className="border-slate-200">
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Dados Obrigatórios na Ficha</h4>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                <span>• Nome completo</span>
                <span>• Data de nascimento</span>
                <span>• Sexo</span>
                <span>• Endereço completo</span>
                <span>• Data início sintomas</span>
                <span>• Data da notificação</span>
                <span>• CID-10: {notificacao.cid}</span>
                <span>• Unidade notificadora</span>
                <span>• Médico (CRM)</span>
              </div>
            </CardContent>
          </Card>

          {/* Links Úteis */}
          <Card className="border-slate-200">
            <CardContent className="p-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Contatos e Links</h4>
              <div className="space-y-1 text-[10px]">
                <a 
                  href="https://portalsinan.saude.gov.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> Portal SINAN
                </a>
                <p className="text-slate-600">📞 Disque Notifica: <strong>0800-644-6645</strong></p>
                <p className="text-slate-600">📞 CVE (estadual): Consultar secretaria de saúde local</p>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 h-8 text-xs"
              onClick={() => handleCopy(instrucoes)}
            >
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? 'Copiado!' : 'Copiar Instruções'}
            </Button>
            <Button 
              size="sm" 
              className="flex-1 h-8 text-xs bg-blue-900"
              onClick={() => window.open('https://portalsinan.saude.gov.br', '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" /> Abrir SINAN
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente de alerta inline
export function NotificacaoCompulsoriaAlert({ doenca }) {
  const [showDialog, setShowDialog] = useState(false);
  const notificacao = verificarNotificacaoCompulsoria(doenca);
  
  if (!notificacao) return null;

  return (
    <>
      <div 
        className={`p-2 rounded-lg border cursor-pointer ${
          notificacao.tipo === 'imediata' 
            ? 'bg-red-50 border-red-300 animate-pulse' 
            : 'bg-amber-50 border-amber-300'
        }`}
        onClick={() => setShowDialog(true)}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${notificacao.tipo === 'imediata' ? 'text-red-600' : 'text-amber-600'}`} />
          <div className="flex-1">
            <p className={`text-xs font-semibold ${notificacao.tipo === 'imediata' ? 'text-red-700' : 'text-amber-700'}`}>
              DOENÇA DE NOTIFICAÇÃO COMPULSÓRIA
            </p>
            <p className={`text-[10px] ${notificacao.tipo === 'imediata' ? 'text-red-600' : 'text-amber-600'}`}>
              {notificacao.nome} • Prazo: {notificacao.prazo} • Clique para ver instruções
            </p>
          </div>
          <Badge className={`text-[8px] ${notificacao.tipo === 'imediata' ? 'bg-red-600' : 'bg-amber-600'}`}>
            {notificacao.tipo === 'imediata' ? 'IMEDIATA' : 'SEMANAL'}
          </Badge>
        </div>
      </div>
      <NotificacaoCompulsoriaDialog doenca={doenca} open={showDialog} onOpenChange={setShowDialog} />
    </>
  );
}

export default {
  DOENCAS_NOTIFICACAO_COMPULSORIA,
  verificarNotificacaoCompulsoria,
  NotificacaoCompulsoriaBadge,
  NotificacaoCompulsoriaDialog,
  NotificacaoCompulsoriaAlert
};