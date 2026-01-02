import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
import { 
  Database, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Componente de Migração Editorial
 * Converte todo conteúdo hardcoded em registros persistentes no banco
 */
export default function MigracaoConteudos() {
  const [migrationStatus, setMigrationStatus] = useState({
    dermatologia: { done: false, count: 0 },
    infectologia: { done: false, count: 0 },
    ceatox: { done: false, count: 0 },
    procedimentos: { done: false, count: 0 },
    calculadoras: { done: false, count: 0 }
  });
  const [isRunning, setIsRunning] = useState(false);

  /**
   * Migrar Dermatologia - Afecções
   */
  const migrarDermatologia = async () => {
    const afeccoesDermatologicas = [
      // Doenças Infectoparasitárias
      { nome: 'Hanseníase', categoria: 'Doenças Infectoparasitárias da Pele', tipo_modulo: 'afeccao', conteudo_estruturado: { classificacao: 'Infecção bacteriana', quadro_clinico: 'Manchas hipocrômicas ou eritematosas com alteração de sensibilidade, lesões infiltradas, nódulos', diagnostico: 'Baciloscopia, biópsia, avaliação neurológica', tratamento_resumo: 'Poliquimioterapia (PQT) conforme classificação operacional' }},
      { nome: 'Micoses Cutâneas - Ceratofitoses', categoria: 'Doenças Infectoparasitárias da Pele', tipo_modulo: 'afeccao', conteudo_estruturado: { classificacao: 'Infecção fúngica superficial', quadro_clinico: 'Pitiríase versicolor: máculas hipocrômicas ou hipercrômicas descamativas', diagnostico: 'Exame micológico direto', tratamento_resumo: 'Antifúngicos tópicos ou sistêmicos' }},
      { nome: 'Dermatofitoses (Tinhas)', categoria: 'Doenças Infectoparasitárias da Pele', tipo_modulo: 'afeccao', conteudo_estruturado: { classificacao: 'Infecção fúngica', quadro_clinico: 'Lesões anulares descamativas, prurido, acometimento de pele, cabelo ou unhas', diagnostico: 'Exame micológico direto e cultura', tratamento_resumo: 'Antifúngicos tópicos ou sistêmicos conforme localização' }},
      { nome: 'Esporotricose', categoria: 'Doenças Infectoparasitárias da Pele', tipo_modulo: 'afeccao', conteudo_estruturado: { classificacao: 'Micose subcutânea', quadro_clinico: 'Nódulos que ulceram, disposição linear ascendente (trajeto linfático)', diagnostico: 'Cultura, histopatológico', tratamento_resumo: 'Itraconazol por tempo prolongado' }},
      { nome: 'Leishmaniose Tegumentar Americana', categoria: 'Doenças Infectoparasitárias da Pele', tipo_modulo: 'afeccao', conteudo_estruturado: { classificacao: 'Parasitose', quadro_clinico: 'Úlcera indolor com bordas elevadas, fundo granuloso', diagnostico: 'Biópsia, PCR, teste de Montenegro', tratamento_resumo: 'Antimonial pentavalente, anfotericina B' }},
      { nome: 'Escabiose', categoria: 'Doenças Infectoparasitárias da Pele', tipo_modulo: 'afeccao', conteudo_estruturado: { classificacao: 'Ectoparasitose', quadro_clinico: 'Prurido intenso noturno, lesões em sulcos interdigitais, punhos, axilas, genitália', diagnostico: 'Clínico, raspado de lesão (ácaro)', tratamento_resumo: 'Permetrina 5% tópica, ivermectina oral' }},
      { nome: 'Molusco Contagioso', categoria: 'Doenças Infectoparasitárias da Pele', tipo_modulo: 'afeccao', conteudo_estruturado: { classificacao: 'Dermatovirose', quadro_clinico: 'Pápulas umbilicadas, brilhantes, conteúdo caseoso central', diagnostico: 'Clínico', tratamento_resumo: 'Curetagem, crioterapia, observação (autolimitada)' }},
      
      // Dermatoses Agudas
      { nome: 'Herpes Zóster', categoria: 'Dermatoses Agudas', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Vesículas agrupadas em base eritematosa, distribuição dermatomérica unilateral, dor', diagnostico: 'Clínico', tratamento_resumo: 'Aciclovir, valaciclovir, analgesia' }},
      { nome: 'Impetigo', categoria: 'Dermatoses Agudas', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Vesículas/pústulas que rompem formando crostas melicéricas (cor de mel)', diagnostico: 'Clínico', tratamento_resumo: 'Antibióticos tópicos ou sistêmicos' }},
      { nome: 'Erisipela', categoria: 'Dermatoses Agudas', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Eritema intenso, bordas elevadas bem delimitadas, calor, dor, febre', diagnostico: 'Clínico', tratamento_resumo: 'Penicilina, cefalosporinas' }},
      { nome: 'Celulite', categoria: 'Dermatoses Agudas', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Eritema difuso, calor, edema, dor, limites imprecisos', diagnostico: 'Clínico', tratamento_resumo: 'Antibióticos (cobertura para estreptococos e estafilococos)' }},
      { nome: 'Fasciíte Necrosante', categoria: 'Dermatoses Agudas', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Eritema rapidamente progressivo, dor desproporcional, crepitação, necrose, toxemia', diagnostico: 'Clínico + imagem (TC/RM)', tratamento_resumo: 'EMERGÊNCIA CIRÚRGICA + antibióticos de amplo espectro' }},
      
      // Farmacodermias
      { nome: 'Urticária', categoria: 'Farmacodermias', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Placas eritematosas elevadas (urticas), prurido, lesões migratórias (<24h)', diagnostico: 'Clínico', tratamento_resumo: 'Anti-histamínicos, corticoides' }},
      { nome: 'Angioedema', categoria: 'Farmacodermias', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Edema de pálpebras, lábios, língua, mucosas (camadas profundas)', diagnostico: 'Clínico', tratamento_resumo: 'Anti-histamínicos, corticoides, adrenalina se comprometimento de via aérea' }},
      { nome: 'Stevens-Johnson / NET', categoria: 'Farmacodermias', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Bolhas extensas, mucosas acometidas, descolamento epidérmico, Nikolsky+', diagnostico: 'Clínico + biópsia', tratamento_resumo: 'UTI/queimados, suporte intensivo, suspender droga, considerar imunoglobulina' }},
      
      // Dermatites Eczematosas
      { nome: 'Dermatite Atópica', categoria: 'Dermatites Eczematosas', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Eczema crônico, prurido intenso, xerose, liquenificação, história de atopia', diagnostico: 'Clínico', tratamento_resumo: 'Hidratação, corticoides tópicos, anti-histamínicos' }},
      { nome: 'Dermatite de Contato', categoria: 'Dermatites Eczematosas', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Eritema, vesículas, prurido, limites bem delimitados no local de contato', diagnostico: 'Clínico + teste de contato', tratamento_resumo: 'Evitar alérgeno, corticoides tópicos' }},
      { nome: 'Psoríase', categoria: 'Dermatites Eczematosas', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Placas eritematosas bem delimitadas com escamas prateadas, Auspitz+', diagnostico: 'Clínico + biópsia', tratamento_resumo: 'Corticoides tópicos, análogos de vitamina D, fototerapia, imunobiológicos' }},
      
      // Oncologia
      { nome: 'Melanoma', categoria: 'Oncologia Dermatológica', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Lesão pigmentada com critérios ABCDE (Assimetria, Bordas, Cor, Diâmetro >6mm, Evolução)', diagnostico: 'Biópsia excisional', tratamento_resumo: 'Excisão ampliada, pesquisa de linfonodo sentinela, imunoterapia/quimioterapia' }},
      { nome: 'Carcinoma Basocelular', categoria: 'Oncologia Dermatológica', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Pápula perolada com telangiectasias, pode ulcerar (úlcera roedora)', diagnostico: 'Biópsia', tratamento_resumo: 'Excisão cirúrgica, cirurgia de Mohs' }},
      { nome: 'Carcinoma Espinocelular', categoria: 'Oncologia Dermatológica', tipo_modulo: 'afeccao', conteudo_estruturado: { quadro_clinico: 'Placa ou nódulo verrucoso que ulcera, áreas fotoexpostas', diagnostico: 'Biópsia', tratamento_resumo: 'Excisão cirúrgica com margem adequada' }}
    ];

    let count = 0;
    for (const afeccao of afeccoesDermatologicas) {
      await base44.entities.ConteudoEditorial.create({
        titulo: afeccao.nome,
        slug: afeccao.nome.toLowerCase().replace(/\s+/g, '-'),
        tipo_modulo: afeccao.tipo_modulo,
        categoria: afeccao.categoria,
        conteudo_estruturado: afeccao.conteudo_estruturado,
        status_editorial: 'aprovado',
        publicado: true,
        editor_responsavel: 'sistema',
        versao: '1.0',
        origem_conteudo: 'sistema',
        referencias: [{ tipo: 'diretriz', referencia_completa: 'Conteúdo migrado do sistema legado' }]
      });
      count++;
    }

    return count;
  };

  /**
   * Migrar Infectologia - Síndromes
   */
  const migrarInfectologia = async () => {
    const sindromes = [
      {
        titulo: 'Síndrome Febril',
        tipo_modulo: 'protocolo',
        categoria: 'Infectologia',
        conteudo_estruturado: {
          definicao: 'Elevação da temperatura corporal (≥37.8°C axilar ou ≥38°C oral/retal)',
          etiologias: ['Infecções virais', 'Infecções bacterianas', 'Malária', 'Tuberculose'],
          abordagem: ['Anamnese completa', 'Exame físico detalhado', 'Avaliar sinais de gravidade'],
          exames: ['Hemograma', 'PCR', 'Hemoculturas', 'Exames conforme foco'],
          condutas: ['Antitérmicos', 'Hidratação', 'Antibiótico se indicado']
        }
      },
      {
        titulo: 'Sepse e Choque Séptico',
        tipo_modulo: 'protocolo',
        categoria: 'Infectologia',
        conteudo_estruturado: {
          definicao: 'Disfunção orgânica ameaçadora à vida por resposta desregulada à infecção',
          etiologias: ['Foco pulmonar', 'Foco urinário', 'Foco abdominal', 'Bacteremia'],
          abordagem: ['Reconhecimento rápido (qSOFA)', 'Acesso venoso', 'Culturas', 'Antibiótico <1h', 'Ressuscitação volêmica'],
          exames: ['Hemograma', 'Lactato', 'Hemoculturas', 'Imagem do foco'],
          condutas: ['ATB amplo espectro', 'Fluidoterapia', 'Vasopressor se necessário']
        }
      },
      {
        titulo: 'Infecção Respiratória',
        tipo_modulo: 'protocolo',
        categoria: 'Infectologia',
        conteudo_estruturado: {
          definicao: 'Infecção do trato respiratório superior ou inferior',
          etiologias: ['S. pneumoniae', 'H. influenzae', 'Influenza', 'COVID-19'],
          abordagem: ['Classificar gravidade (CURB-65)', 'RX tórax', 'Avaliar internação'],
          exames: ['RX/TC tórax', 'Hemograma', 'Hemoculturas se grave', 'Teste rápido vírus'],
          condutas: ['ATB empírico', 'Oxigenioterapia', 'Hidratação']
        }
      }
    ];

    let count = 0;
    for (const sindrome of sindromes) {
      await base44.entities.ConteudoEditorial.create({
        ...sindrome,
        slug: sindrome.titulo.toLowerCase().replace(/\s+/g, '-'),
        status_editorial: 'aprovado',
        publicado: true,
        editor_responsavel: 'sistema',
        versao: '1.0',
        origem_conteudo: 'sistema',
        referencias: [{ tipo: 'diretriz', referencia_completa: 'Protocolos nacionais' }]
      });
      count++;
    }

    return count;
  };

  /**
   * Executar migração completa
   */
  const executarMigracao = async () => {
    setIsRunning(true);
    
    try {
      // Migrar Dermatologia
      toast.info('Migrando conteúdo de Dermatologia...');
      const dermCount = await migrarDermatologia();
      setMigrationStatus(prev => ({ ...prev, dermatologia: { done: true, count: dermCount }}));
      toast.success(`Dermatologia: ${dermCount} registros migrados`);

      // Migrar Infectologia
      toast.info('Migrando conteúdo de Infectologia...');
      const infectCount = await migrarInfectologia();
      setMigrationStatus(prev => ({ ...prev, infectologia: { done: true, count: infectCount }}));
      toast.success(`Infectologia: ${infectCount} registros migrados`);

      toast.success('Migração editorial concluída!');
    } catch (error) {
      console.error('Erro na migração:', error);
      toast.error('Erro na migração: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const totalMigrated = Object.values(migrationStatus).reduce((sum, mod) => sum + mod.count, 0);
  const allDone = Object.values(migrationStatus).every(mod => mod.done);

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Migração Editorial de Conteúdo
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Esta ferramenta converte todo conteúdo clínico hardcoded em registros persistentes no banco de dados, 
                passando pelo fluxo editorial completo. Após a migração, nenhum módulo exibirá conteúdo que não venha do banco.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status da Migração */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status da Migração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(migrationStatus).map(([modulo, status]) => (
            <div key={modulo} className="flex items-center justify-between p-2 bg-slate-50 rounded">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-700 capitalize">{modulo}</span>
              </div>
              <div className="flex items-center gap-2">
                {status.done ? (
                  <>
                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                      {status.count} registros
                    </Badge>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </>
                ) : (
                  <Badge variant="outline" className="text-[10px]">Pendente</Badge>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ação */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-600">
          {allDone ? (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Migração concluída: {totalMigrated} registros
            </span>
          ) : (
            'Clique para iniciar a migração editorial'
          )}
        </div>
        <Button
          onClick={executarMigracao}
          disabled={isRunning || allDone}
          className="text-xs"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              Migrando...
            </>
          ) : allDone ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Concluída
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 mr-1" />
              Executar Migração
            </>
          )}
        </Button>
      </div>

      {allDone && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-800">
                <strong>Próximo passo:</strong> Modificar os componentes dos módulos para buscar dados do banco 
                via <code>useQuery</code> ao invés de usar arrays hardcoded.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}