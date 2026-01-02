import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, CheckCircle2, Eye, EyeOff, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { analisarTexto, validarSubmissao, sugerirReformulacao } from './PrivacyFilter';

const especialidades = [
  { value: 'cardiologia', label: 'Cardiologia' },
  { value: 'emergencia', label: 'Emergência / Plantão' },
  { value: 'clinica_medica', label: 'Clínica Médica' },
  { value: 'neurologia', label: 'Neurologia' },
  { value: 'pediatria', label: 'Pediatria' },
  { value: 'ginecologia', label: 'Ginecologia / Obstetrícia' },
  { value: 'exames_diagnostico', label: 'Exames & Diagnóstico' },
  { value: 'infectologia', label: 'Infectologia' },
  { value: 'cirurgia', label: 'Cirurgia' },
  { value: 'psiquiatria', label: 'Psiquiatria' },
  { value: 'outros', label: 'Outros' }
];

const ambientes = [
  { value: 'ubs', label: 'UBS' },
  { value: 'upa', label: 'UPA' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'pronto_socorro', label: 'Pronto Socorro' },
  { value: 'ambulatorio', label: 'Ambulatório' },
  { value: 'uti', label: 'UTI' }
];

export default function PostCreator({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    titulo: '',
    especialidade: '',
    afeccao: '',
    ambiente: '',
    conteudo: '',
    pergunta: '',
    evolucao: ''
  });

  const [analiseAtual, setAnaliseAtual] = useState({ seguro: true, avisos: [], bloqueios: [] });
  const [mostrarDicas, setMostrarDicas] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);

  // Analisar texto em tempo real
  useEffect(() => {
    const textoCompleto = `${formData.titulo} ${formData.conteudo} ${formData.pergunta}`;
    const analise = analisarTexto(textoCompleto);
    setAnaliseAtual(analise);
  }, [formData.titulo, formData.conteudo, formData.pergunta]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termosAceitos) {
      toast.error('Aceite os termos para continuar');
      return;
    }

    // Validação final
    const validacao = validarSubmissao(formData);
    
    if (!validacao.valido) {
      toast.error('Conteúdo bloqueado: dados identificáveis detectados');
      return;
    }

    if (validacao.avisos.length > 3) {
      if (!confirm('Detectamos vários avisos de privacidade. Deseja continuar mesmo assim?')) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem('supmed_doctor') || '{}');

      await base44.entities.CommunityPost.create({
        ...formData,
        autor_nome: user.full_name || user.fullName || 'Anônimo',
        autor_profissao: user.profissao || 'Profissional de saúde',
        autor_crm: user.registro || null,
        status: validacao.avisos.length > 2 ? 'pendente' : 'ativo',
        likes: 0,
        visualizacoes: 0,
        respostas_count: 0,
        tags: [formData.especialidade, formData.afeccao].filter(Boolean)
      });

      // Log de auditoria se houver avisos
      if (validacao.avisos.length > 0) {
        await base44.entities.ModerationLog.create({
          tipo_acao: 'bloqueio_automatico',
          motivo: 'Avisos de privacidade detectados',
          conteudo_tipo: 'post',
          automatico: true,
          termos_detectados: validacao.avisos.map(a => a.mensagem),
          severidade: validacao.avisos.length > 2 ? 'media' : 'baixa'
        });
      }

      toast.success(validacao.avisos.length > 2 
        ? 'Post enviado para moderação (avisos de privacidade)' 
        : 'Post publicado com sucesso!'
      );

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao publicar post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alerta de Privacidade */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Proteção de Privacidade Ativa</h3>
              <p className="text-xs text-blue-700">
                Evite qualquer dado identificável do paciente. Casos devem ser educacionais e anônimos.
              </p>
              <button
                onClick={() => setMostrarDicas(!mostrarDicas)}
                className="text-xs text-blue-600 underline mt-1 flex items-center gap-1"
              >
                {mostrarDicas ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {mostrarDicas ? 'Ocultar' : 'Ver'} orientações
              </button>
            </div>
          </div>

          {mostrarDicas && (
            <div className="mt-3 p-3 bg-white rounded border border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-2">✅ PERMITIDO:</p>
              <ul className="text-xs text-blue-700 space-y-0.5 mb-3">
                <li>• Idade, sexo, achados clínicos</li>
                <li>• "Paciente masculino, 45 anos"</li>
                <li>• Contexto clínico genérico</li>
              </ul>
              <p className="text-xs font-semibold text-red-900 mb-2">❌ PROIBIDO:</p>
              <ul className="text-xs text-red-700 space-y-0.5">
                <li>• Nome, CPF, RG, prontuário</li>
                <li>• Endereço, telefone, e-mail</li>
                <li>• Fotos identificáveis</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Indicador de Análise em Tempo Real */}
      {(analiseAtual.avisos.length > 0 || analiseAtual.bloqueios.length > 0) && (
        <Card className={analiseAtual.bloqueios.length > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}>
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 mt-0.5 ${analiseAtual.bloqueios.length > 0 ? 'text-red-600' : 'text-amber-600'}`} />
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1">
                  {analiseAtual.bloqueios.length > 0 ? 'Bloqueio Detectado' : 'Avisos de Privacidade'}
                </p>
                {analiseAtual.bloqueios.map((b, i) => (
                  <p key={i} className="text-xs text-red-700">🚫 {b.mensagem}</p>
                ))}
                {analiseAtual.avisos.slice(0, 3).map((a, i) => (
                  <p key={i} className="text-xs text-amber-700">⚠️ {a.mensagem}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-4 space-y-3">
            {/* Título */}
            <div>
              <Label className="text-xs text-slate-600">Título do caso *</Label>
              <Input
                placeholder="Ex: Paciente com dor torácica atípica"
                className="h-9 text-sm mt-1"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
            </div>

            {/* Especialidade e Ambiente */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-600">Especialidade *</Label>
                <Select value={formData.especialidade} onValueChange={(v) => setFormData({...formData, especialidade: v})}>
                  <SelectTrigger className="h-9 text-sm mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {especialidades.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-600">Ambiente *</Label>
                <Select value={formData.ambiente} onValueChange={(v) => setFormData({...formData, ambiente: v})}>
                  <SelectTrigger className="h-9 text-sm mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ambientes.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Afecção */}
            <div>
              <Label className="text-xs text-slate-600">Afecção / Condição</Label>
              <Input
                placeholder="Ex: Síndrome Coronariana Aguda"
                className="h-9 text-sm mt-1"
                value={formData.afeccao}
                onChange={(e) => setFormData({...formData, afeccao: e.target.value})}
              />
            </div>

            {/* Descrição do Caso */}
            <div>
              <Label className="text-xs text-slate-600">Descrição do caso *</Label>
              <Textarea
                placeholder="Descreva o caso clínico sem dados identificáveis..."
                className="text-sm mt-1 h-32"
                value={formData.conteudo}
                onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                required
              />
            </div>

            {/* Pergunta Principal */}
            <div>
              <Label className="text-xs text-slate-600">Pergunta principal *</Label>
              <Input
                placeholder="Ex: Como vocês conduziriam esse caso?"
                className="h-9 text-sm mt-1"
                value={formData.pergunta}
                onChange={(e) => setFormData({...formData, pergunta: e.target.value})}
                required
              />
            </div>

            {/* Evolução (opcional) */}
            <div>
              <Label className="text-xs text-slate-600">Evolução clínica (opcional)</Label>
              <Textarea
                placeholder="Descreva a evolução se já houver..."
                className="text-sm mt-1 h-20"
                value={formData.evolucao}
                onChange={(e) => setFormData({...formData, evolucao: e.target.value})}
              />
            </div>

            {/* Termos */}
            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded">
              <input
                type="checkbox"
                id="termos"
                checked={termosAceitos}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="mt-0.5"
              />
              <label htmlFor="termos" className="text-xs text-slate-600 cursor-pointer">
                Declaro que este caso é educacional, não contém dados identificáveis e respeita a LGPD e o Código de Ética Médica
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" className="flex-1 h-9 text-sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || analiseAtual.bloqueios.length > 0 || !termosAceitos}
            className="flex-1 h-9 text-sm bg-blue-900 hover:bg-blue-800"
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Caso'}
          </Button>
        </div>
      </form>
    </div>
  );
}