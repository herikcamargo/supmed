import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUPMED_ROUTES, createNavigationUrl } from '@/components/navigation/NavigationLinks';
import { 
  Loader2, 
  AlertTriangle,
  Heart,
  Brain,
  Wind,
  Stethoscope,
  Baby,
  Pill,
  Activity,
  Droplets,
  Bug,
  Zap,
  Calculator,
  ExternalLink,
  Info,
  BookOpen,
  ChevronRight,
  Home,
  Scissors
} from 'lucide-react';
import DisclaimerFooter from '../compliance/DisclaimerFooter';
import { verificarNotificacaoCompulsoria } from '../clinical/NotificacaoCompulsoria';
import BlocoRastreabilidade from '../editorial/BlocoRastreabilidade';

// Mapeamento de nomes de scores para IDs na página Calculadoras
const scoreIdMap = {
  'timi': 'timi', 'grace': 'grace', 'heart': 'heart',
  'wells tep': 'wells_tep', 'wells tvp': 'wells_tvp', 'perc': 'perc',
  'geneva': 'geneva', 'spesi': 'pesi', 'pesi': 'pesi',
  'cha2ds2-vasc': 'chadsvasc', 'chadsvasc': 'chadsvasc', 'has-bled': 'hasbled', 'hasbled': 'hasbled',
  'curb-65': 'curb65', 'curb65': 'curb65', 'psi/port': 'psi', 'psi': 'psi',
  'gold': 'gold', 'mmrc': 'mmrc', 'berlin': 'berlin',
  'nihss': 'nihss', 'mrs': 'mrs', 'aspects': 'aspects',
  'hunt-hess': 'hunt_hess', 'fisher': 'fisher', 'stess': 'stess',
  'glasgow': 'glasgow', 'rts': 'rts', 'iss': 'iss', 'triss': 'triss',
  'qsofa': 'qsofa', 'sofa': 'sofa', 'sirs': 'sirs', 'news': 'news2', 'news2': 'news2',
  'apache ii': 'apache2', 'saps 3': 'saps3',
  'child-pugh': 'child_pugh', 'meld': 'meld', 'meld-na': 'meld',
  'glasgow-blatchford': 'blatchford', 'rockall': 'rockall',
  'ranson': 'ranson', 'bisap': 'bisap', 'alvarado': 'alvarado',
  'ciwa-ar': 'ciwa', 'cam-icu': 'cam_icu', 'rass': 'rass',
  'apgar': 'apgar', 'silverman': 'silverman', 'pram': 'pram',
  'wood-downes': 'wood_downes', 'wood-downes-ferrés': 'wood_downes',
  'bishop': 'bishop', 'meows': 'meows',
  'caprini': 'caprini', 'padua': 'padua', 'improve': 'improve',
  'eva': 'eva', 'nrs': 'nrs',
  'centor': 'centor', 'mcisaac': 'centor'
};

const getScoreId = (scoreName) => {
  const normalized = scoreName.toLowerCase().trim();
  return scoreIdMap[normalized] || null;
};

// Especialidades médicas e afecções do Modo Plantonista
const especialidadesPlantonista = [
  {
    categoria: 'Cardiologia',
    icon: Heart,
    color: 'bg-red-500',
    temas: [
      { nome: 'Dor torácica', escalas: ['HEART', 'TIMI', 'GRACE'], calculadoras: [] },
      { nome: 'Síndrome coronariana aguda', escalas: ['TIMI', 'GRACE', 'Killip'], calculadoras: ['Troponina'] },
      { nome: 'Angina estável', escalas: ['TIMI'], calculadoras: [] },
      { nome: 'Infarto com supra de ST', escalas: ['Killip', 'TIMI'], calculadoras: ['Tempo porta-agulha'] },
      { nome: 'Infarto sem supra de ST', escalas: ['GRACE', 'TIMI'], calculadoras: [] },
      { nome: 'Insuficiência cardíaca agudizada', escalas: ['NYHA', 'Stevenson'], calculadoras: ['BNP'] },
      { nome: 'Insuficiência cardíaca crônica', escalas: ['NYHA', 'Stevenson'], calculadoras: ['BNP'] },
      { nome: 'Edema agudo de pulmão', escalas: ['Killip'], calculadoras: [] },
      { nome: 'Arritmias supraventriculares', escalas: [], calculadoras: [] },
      { nome: 'Fibrilação atrial', escalas: ['CHA2DS2-VASc', 'HAS-BLED'], calculadoras: [] },
      { nome: 'Flutter atrial', escalas: [], calculadoras: [] },
      { nome: 'Taquicardia ventricular', escalas: [], calculadoras: [] },
      { nome: 'Bradicardia sintomática', escalas: [], calculadoras: [] },
      { nome: 'Bloqueios AV', escalas: [], calculadoras: [] },
      { nome: 'Crise hipertensiva', escalas: [], calculadoras: ['PAM'] },
      { nome: 'Hipertensão arterial sistêmica', escalas: [], calculadoras: ['PAM'] },
      { nome: 'Miocardite', escalas: [], calculadoras: [] },
      { nome: 'Pericardite', escalas: [], calculadoras: [] },
      { nome: 'Endocardite infecciosa', escalas: ['Duke'], calculadoras: [] },
      { nome: 'Síncope cardiogênica', escalas: ['San Francisco'], calculadoras: [] },
      { nome: 'Choque cardiogênico', escalas: ['Killip'], calculadoras: [] },
      { nome: 'Tromboembolismo pulmonar', escalas: ['Wells TEP', 'Geneva', 'PERC', 'PESI'], calculadoras: ['D-dímero'] },
      { nome: 'Doença arterial periférica', escalas: [], calculadoras: [] }
    ]
  },
  {
    categoria: 'Neurologia',
    icon: Brain,
    color: 'bg-purple-500',
    temas: [
      { nome: 'Acidente vascular cerebral isquêmico', escalas: ['NIHSS', 'mRS', 'ASPECTS'], calculadoras: ['Tempo porta-agulha'] },
      { nome: 'Acidente vascular cerebral hemorrágico', escalas: ['Glasgow', 'Hunt-Hess', 'Fisher'], calculadoras: [] },
      { nome: 'Ataque isquêmico transitório', escalas: ['ABCD2'], calculadoras: [] },
      { nome: 'Cefaleia aguda', escalas: [], calculadoras: [] },
      { nome: 'Cefaleia secundária', escalas: [], calculadoras: [] },
      { nome: 'Enxaqueca', escalas: [], calculadoras: [] },
      { nome: 'Crise convulsiva', escalas: ['Glasgow'], calculadoras: [] },
      { nome: 'Estado de mal epiléptico', escalas: ['STESS'], calculadoras: [] },
      { nome: 'Rebaixamento do nível de consciência', escalas: ['Glasgow'], calculadoras: [] },
      { nome: 'Delirium', escalas: ['CAM-ICU', 'RASS'], calculadoras: [] },
      { nome: 'Síncope neurológica', escalas: ['San Francisco'], calculadoras: [] },
      { nome: 'Déficit neurológico focal', escalas: ['NIHSS'], calculadoras: [] },
      { nome: 'Hemorragia subaracnoide', escalas: ['Hunt-Hess', 'Fisher'], calculadoras: [] },
      { nome: 'Hipertensão intracraniana', escalas: ['Glasgow'], calculadoras: ['PIC'] },
      { nome: 'Traumatismo cranioencefálico', escalas: ['Glasgow', 'Pupila', 'Marshall CT'], calculadoras: ['PIC'] },
      { nome: 'Meningite', escalas: ['Glasgow'], calculadoras: ['Índice liquórico'] },
      { nome: 'Encefalite', escalas: ['Glasgow'], calculadoras: [] },
      { nome: 'Síndrome de Guillain-Barré', escalas: [], calculadoras: [] },
      { nome: 'Miastenia gravis (crise miastênica)', escalas: [], calculadoras: [] }
    ]
  },
  {
    categoria: 'Respiratório',
    icon: Wind,
    color: 'bg-blue-500',
    temas: [
      { nome: 'Dispneia aguda', escalas: [], calculadoras: ['SpO2', 'PaO2/FiO2'] },
      { nome: 'Asma', escalas: ['GINA', 'Peak Flow'], calculadoras: ['Peak Flow %'] },
      { nome: 'Estado asmático', escalas: ['GINA'], calculadoras: [] },
      { nome: 'DPOC', escalas: ['GOLD', 'mMRC', 'CAT'], calculadoras: [] },
      { nome: 'Exacerbação de DPOC', escalas: ['GOLD'], calculadoras: ['PaO2/FiO2'] },
      { nome: 'Pneumonia comunitária', escalas: ['CURB-65', 'PSI/PORT'], calculadoras: [] },
      { nome: 'Pneumonia hospitalar', escalas: ['CPIS'], calculadoras: [] },
      { nome: 'Pneumonia associada à ventilação', escalas: ['CPIS'], calculadoras: [] },
      { nome: 'Tromboembolismo pulmonar', escalas: ['Wells TEP', 'Geneva', 'PERC', 'PESI'], calculadoras: ['D-dímero'] },
      { nome: 'Derrame pleural', escalas: ['Light'], calculadoras: [] },
      { nome: 'Pneumotórax', escalas: [], calculadoras: [] },
      { nome: 'Pneumotórax hipertensivo', escalas: [], calculadoras: [] },
      { nome: 'Síndrome do desconforto respiratório agudo (SDRA)', escalas: ['Berlin'], calculadoras: ['PaO2/FiO2'] },
      { nome: 'Insuficiência respiratória aguda', escalas: [], calculadoras: ['PaO2/FiO2'] },
      { nome: 'Insuficiência respiratória crônica', escalas: [], calculadoras: ['PaO2/FiO2'] },
      { nome: 'Hemoptise', escalas: [], calculadoras: [] },
      { nome: 'Bronquiolite (pediatria)', escalas: ['Wood-Downes'], calculadoras: [] }
    ]
  },
  {
    categoria: 'Infecções / Sepse',
    icon: Bug,
    color: 'bg-green-500',
    temas: [
      { nome: 'Sepse', escalas: ['qSOFA', 'SOFA', 'SIRS', 'NEWS'], calculadoras: ['Lactato'] },
      { nome: 'Choque séptico', escalas: ['SOFA', 'APACHE II'], calculadoras: ['PAM', 'Dose noradrenalina'] },
      { nome: 'Infecção urinária', escalas: ['SIRS'], calculadoras: [] },
      { nome: 'Pielonefrite', escalas: ['SIRS'], calculadoras: [] },
      { nome: 'Infecção de pele e partes moles', escalas: [], calculadoras: [] },
      { nome: 'Celulite', escalas: [], calculadoras: [] },
      { nome: 'Fasceíte necrosante', escalas: ['LRINEC'], calculadoras: [] },
      { nome: 'Meningite', escalas: ['Glasgow'], calculadoras: [] },
      { nome: 'Endocardite infecciosa', escalas: ['Duke'], calculadoras: [] },
      { nome: 'Pneumonia', escalas: ['CURB-65', 'PSI'], calculadoras: [] },
      { nome: 'Tuberculose', escalas: [], calculadoras: [] },
      { nome: 'COVID-19', escalas: [], calculadoras: ['PaO2/FiO2'] },
      { nome: 'Infecções gastrointestinais', escalas: [], calculadoras: [] },
      { nome: 'Diarreia infecciosa', escalas: [], calculadoras: [] },
      { nome: 'Febre sem foco', escalas: ['SIRS'], calculadoras: [] },
      { nome: 'Febre neutropênica', escalas: ['MASCC'], calculadoras: [] },
      { nome: 'Osteomielite', escalas: [], calculadoras: [] },
      { nome: 'Artrite séptica', escalas: [], calculadoras: [] }
    ]
  },
  {
    categoria: 'Gastroenterologia',
    icon: Stethoscope,
    color: 'bg-amber-500',
    temas: [
      { nome: 'Dor abdominal aguda', escalas: [], calculadoras: [] },
      { nome: 'Abdome agudo inflamatório', escalas: [], calculadoras: [] },
      { nome: 'Abdome agudo obstrutivo', escalas: [], calculadoras: [] },
      { nome: 'Abdome agudo perfurativo', escalas: [], calculadoras: [] },
      { nome: 'Apendicite aguda', escalas: ['Alvarado'], calculadoras: [] },
      { nome: 'Colecistite aguda', escalas: ['Tokyo'], calculadoras: [] },
      { nome: 'Colangite', escalas: ['Tokyo'], calculadoras: [] },
      { nome: 'Pancreatite aguda', escalas: ['Ranson', 'BISAP', 'Atlanta'], calculadoras: ['Balthazar'] },
      { nome: 'Pancreatite crônica', escalas: [], calculadoras: [] },
      { nome: 'Úlcera péptica', escalas: [], calculadoras: [] },
      { nome: 'Hemorragia digestiva alta', escalas: ['Glasgow-Blatchford', 'Rockall'], calculadoras: [] },
      { nome: 'Hemorragia digestiva baixa', escalas: [], calculadoras: [] },
      { nome: 'Hepatite aguda', escalas: [], calculadoras: [] },
      { nome: 'Insuficiência hepática aguda', escalas: ['Child-Pugh', 'MELD'], calculadoras: [] },
      { nome: 'Cirrose hepática', escalas: ['Child-Pugh', 'MELD'], calculadoras: [] },
      { nome: 'Ascite', escalas: [], calculadoras: [] },
      { nome: 'Encefalopatia hepática', escalas: ['West Haven'], calculadoras: [] },
      { nome: 'Doença inflamatória intestinal', escalas: [], calculadoras: [] },
      { nome: 'Obstrução intestinal', escalas: [], calculadoras: [] },
      { nome: 'Isquemia mesentérica', escalas: [], calculadoras: [] }
    ]
  },
  {
    categoria: 'Trauma',
    icon: Zap,
    color: 'bg-orange-500',
    temas: [
      { nome: 'Trauma cranioencefálico', escalas: ['Glasgow', 'Pupila', 'Marshall CT'], calculadoras: ['PIC'] },
      { nome: 'Trauma torácico', escalas: [], calculadoras: [] },
      { nome: 'Trauma abdominal', escalas: ['FAST'], calculadoras: [] },
      { nome: 'Trauma pélvico', escalas: [], calculadoras: [] },
      { nome: 'Politrauma', escalas: ['Glasgow', 'RTS', 'ISS', 'TRISS'], calculadoras: [] },
      { nome: 'Choque hemorrágico', escalas: ['Classe de choque'], calculadoras: ['Reposição volêmica'] },
      { nome: 'Trauma raquimedular', escalas: ['ASIA'], calculadoras: [] },
      { nome: 'Fraturas expostas', escalas: [], calculadoras: [] },
      { nome: 'Fraturas fechadas', escalas: [], calculadoras: [] },
      { nome: 'Luxações', escalas: [], calculadoras: [] },
      { nome: 'Queimaduras', escalas: ['Parkland', 'Lund-Browder'], calculadoras: ['SCQ', 'Reposição'] },
      { nome: 'Trauma ocular', escalas: [], calculadoras: [] },
      { nome: 'Trauma maxilofacial', escalas: [], calculadoras: [] },
      { nome: 'Trauma vascular', escalas: [], calculadoras: [] },
      { nome: 'Lesão por esmagamento', escalas: [], calculadoras: [] }
    ]
  },
  {
    categoria: 'Renal / Metabólico',
    icon: Droplets,
    color: 'bg-teal-500',
    temas: [
      { nome: 'Insuficiência renal aguda', escalas: ['KDIGO', 'RIFLE', 'AKIN'], calculadoras: ['TFG', 'FeNa'] },
      { nome: 'Insuficiência renal crônica', escalas: [], calculadoras: ['TFG'] },
      { nome: 'Distúrbios hidroeletrolíticos', escalas: [], calculadoras: [] },
      { nome: 'Hiponatremia', escalas: [], calculadoras: ['Na corrigido', 'Osmolaridade'] },
      { nome: 'Hipernatremia', escalas: [], calculadoras: ['Déficit água livre'] },
      { nome: 'Hipocalemia', escalas: [], calculadoras: ['Déficit K+'] },
      { nome: 'Hipercalemia', escalas: [], calculadoras: [] },
      { nome: 'Acidose metabólica', escalas: [], calculadoras: ['Anion Gap'] },
      { nome: 'Alcalose metabólica', escalas: [], calculadoras: [] },
      { nome: 'Cetoacidose diabética', escalas: ['Gravidade CAD'], calculadoras: ['Anion Gap', 'Na corrigido'] },
      { nome: 'Estado hiperosmolar hiperglicêmico', escalas: [], calculadoras: ['Osmolaridade'] },
      { nome: 'Hipoglicemia', escalas: [], calculadoras: [] },
      { nome: 'Nefrolitíase', escalas: [], calculadoras: [] },
      { nome: 'Síndrome nefrótica', escalas: [], calculadoras: [] },
      { nome: 'Síndrome nefrítica', escalas: [], calculadoras: [] },
      { nome: 'Rabdomiólise', escalas: [], calculadoras: ['CK'] },
      { nome: 'Crise adrenal', escalas: [], calculadoras: [] },
      { nome: 'Hipercalcemia', escalas: [], calculadoras: [] }
    ]
  },
  {
    categoria: 'Pediatria',
    icon: Baby,
    color: 'bg-pink-500',
    temas: [
      { nome: 'Febre sem sinais localizatórios', escalas: [], calculadoras: [] },
      { nome: 'Sepse neonatal', escalas: [], calculadoras: [] },
      { nome: 'Desidratação', escalas: ['Gorelick'], calculadoras: ['Déficit hídrico'] },
      { nome: 'Diarreia aguda', escalas: [], calculadoras: [] },
      { nome: 'Bronquiolite', escalas: ['Wood-Downes'], calculadoras: [] },
      { nome: 'Asma pediátrica', escalas: ['PRAM', 'Wood-Downes-Ferrés'], calculadoras: [] },
      { nome: 'Pneumonia pediátrica', escalas: [], calculadoras: [] },
      { nome: 'Crise convulsiva febril', escalas: [], calculadoras: [] },
      { nome: 'Crise convulsiva afebril', escalas: [], calculadoras: [] },
      { nome: 'Trauma pediátrico', escalas: ['Glasgow', 'PALS'], calculadoras: ['Peso estimado'] },
      { nome: 'Obstrução de vias aéreas', escalas: [], calculadoras: [] },
      { nome: 'Corpo estranho', escalas: [], calculadoras: [] },
      { nome: 'Meningite pediátrica', escalas: [], calculadoras: [] },
      { nome: 'Infecção urinária pediátrica', escalas: [], calculadoras: [] },
      { nome: 'Icterícia neonatal', escalas: ['Kramer'], calculadoras: ['Bilirrubina'] },
      { nome: 'Distúrbios do crescimento', escalas: [], calculadoras: [] }
    ]
  },
  {
    categoria: 'Psiquiatria',
    icon: Brain,
    color: 'bg-indigo-500',
    temas: [
      { nome: 'Ideação suicida', escalas: ['SAD PERSONS', 'Columbia'], calculadoras: [] },
      { nome: 'Tentativa de suicídio', escalas: ['Columbia'], calculadoras: [] },
      { nome: 'Agitação psicomotora', escalas: ['RASS'], calculadoras: [] },
      { nome: 'Psicose aguda', escalas: [], calculadoras: [] },
      { nome: 'Surto psicótico', escalas: [], calculadoras: [] },
      { nome: 'Transtorno bipolar (mania)', escalas: [], calculadoras: [] },
      { nome: 'Depressão maior', escalas: ['PHQ-9'], calculadoras: [] },
      { nome: 'Transtorno de ansiedade', escalas: ['GAD-7'], calculadoras: [] },
      { nome: 'Ataque de pânico', escalas: [], calculadoras: [] },
      { nome: 'Delirium', escalas: ['CAM-ICU', 'RASS'], calculadoras: [] },
      { nome: 'Abstinência alcoólica', escalas: ['CIWA-Ar'], calculadoras: [] },
      { nome: 'Intoxicação por álcool', escalas: ['Glasgow'], calculadoras: [] },
      { nome: 'Intoxicação por drogas', escalas: ['Glasgow'], calculadoras: [] },
      { nome: 'Síndrome neuroléptica maligna', escalas: [], calculadoras: [] },
      { nome: 'Catatonia', escalas: ['Bush-Francis'], calculadoras: [] }
    ]
  }
];

export default function PlantonistaSearch() {
  const [navigationLevel, setNavigationLevel] = useState(1); // 1=Especialidades, 2=Afecções, 3=Conteúdo
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [selectedTema, setSelectedTema] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoadingFromDB, setIsLoadingFromDB] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('supmed_doctor');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const generateSlug = (temaNome, categoria) => {
    return `${temaNome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}-${categoria.toLowerCase()}`;
  };

  const calculateHash = (content) => {
    return JSON.stringify(content).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0).toString(36);
  };

  const handleSearch = async (temaNome) => {
    if (!temaNome) return;

    const slug = generateSlug(temaNome, selectedCategoria?.categoria || 'geral');
    
    // PASSO 1: Verificar se existe afecção editorial APROVADA e PUBLICADA
    setIsLoadingFromDB(true);
    try {
      const afeccoesEditoriais = await base44.entities.AfeccaoEditorial.filter({ 
        slug,
        status_editorial: 'aprovado',
        publicado: true
      });
      
      if (afeccoesEditoriais && afeccoesEditoriais.length > 0) {
        const afeccao = afeccoesEditoriais[0];
        
        // Renderizar conteúdo editorial (APROVADO e PUBLICADO)
        setResult({
          titulo: afeccao.nome_afeccao,
          definicao: afeccao.definicao,
          imagens: afeccao.imagens || [],
          notificacao_compulsoria: afeccao.notificacao_compulsoria || false,
          orientacoes_notificacao: afeccao.orientacoes_notificacao || '',
          avaliacao_inicial: afeccao.avaliacao_inicial || [],
          diagnostico_diferencial: afeccao.diagnosticos_diferenciais || [],
          conduta_imediata: afeccao.conduta_imediata_pa || [],
          red_flags: afeccao.red_flags || [],
          escalas: [],
          exames: afeccao.exames_indicados || [],
          tratamento: afeccao.tratamento_manejo || [],
          desfecho: afeccao.criterios_internacao || [],
          contraindicacoes: afeccao.contraindicacoes || [],
          calculadoras: afeccao.calculadoras_relacionadas || [],
          scores_relacionados: afeccao.scores_relacionados || [],
          procedimentos_relacionados: afeccao.procedimentos_relacionados || [],
          medicamentos_texto_livre: afeccao.medicamentos_texto_livre || '',
          diretrizes_utilizadas: afeccao.referencias_utilizadas?.map(r => ({
            nome_completo: r.referencia_completa,
            sociedade: r.tipo === 'diretriz' ? 'Diretriz Oficial' : 'Literatura',
            ano: '2024'
          })) || [],
          livros_utilizados: [],
          _metadata: {
            versao: afeccao.versao || '1.0',
            data_atualizacao: afeccao.updated_date || afeccao.data_publicacao,
            fonte: 'Painel Editorial',
            do_banco: true
          },
          _origem: 'editorial',
          autor_id: afeccao.autor_id,
          revisor_id: afeccao.revisor_id,
          status_editorial: afeccao.status_editorial,
          publicado: afeccao.publicado,
          created_date: afeccao.created_date,
          data_revisao: afeccao.data_revisao,
          data_publicacao: afeccao.data_publicacao
        });
        setIsLoadingFromDB(false);
        setIsSearching(false);
        return;
      }
      
      // PASSO 2: Tentar carregar do banco de conteúdo clínico
      const conteudoExistente = await base44.entities.ConteudoClinico.filter({ slug });
      
      if (conteudoExistente && conteudoExistente.length > 0) {
        const conteudo = conteudoExistente[0];
        const conteudoData = conteudo.data || conteudo;
        
        // Incrementar contador de acessos
        await base44.entities.ConteudoClinico.update(conteudo.id, {
          acessos_count: (conteudoData.acessos_count || 0) + 1,
          ultima_verificacao: new Date().toISOString()
        });
        
        // Renderizar conteúdo do banco
        setResult({
          ...conteudoData.conteudo,
          titulo: conteudoData.titulo,
          diretrizes_utilizadas: conteudoData.diretrizes,
          livros_utilizados: conteudoData.livros_utilizados,
          _metadata: {
            versao: conteudoData.versao,
            data_atualizacao: conteudoData.ultima_atualizacao || conteudoData.data_download,
            fonte: conteudoData.fonte_primaria,
            do_banco: true
          }
        });
        setIsLoadingFromDB(false);
        setIsSearching(false);
        
        // PASSO 2: Verificar atualização em background (NÃO BLOQUEIA UI)
        verificarAtualizacaoBackground(conteudo.id, slug, temaNome);
        return;
      }
    } catch (error) {
      console.error('Erro ao buscar do banco:', error);
    }
    setIsLoadingFromDB(false);

    // PASSO 3: Se não existe no banco, buscar e salvar
    setIsSearching(true);

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `
        Você é o Base44 operando em MODO PLANTONISTA.
        
        ========================
        CRITICAL: ATUALIZAÇÃO OBRIGATÓRIA
        ========================
        
        DATA ATUAL: ${new Date().toLocaleDateString('pt-BR')} (${new Date().getFullYear()})
        
        REGRA IMPERATIVA DE ATUALIZAÇÃO:
        - Use APENAS diretrizes de 2024 ou 2025
        - Se existir versão 2025, use APENAS a 2025
        - Se só existir 2024, use a 2024
        - NUNCA use diretrizes anteriores a 2024
        - Verifique especificamente: GINA 2025, AHA 2024, ESC 2024, Surviving Sepsis 2024
        - Se uma diretriz foi atualizada em 2025, a versão antiga está OBSOLETA
        
        ========================
        REGRA CENTRAL
        ========================
        
        Para a afecção "${temaNome}", você DEVE fornecer:
        1. A diretriz clínica MAIS RECENTE (2025 ou 2024) e ESPECÍFICA para este tema
        2. TODOS os livros-texto efetivamente utilizados, com referência bibliográfica COMPLETA
        
        É PROIBIDO:
        – Usar diretrizes desatualizadas (anteriores a 2024)
        – Omitir o ano da diretriz
        – Omitir edição, autor ou editora de livros
        – Listar livros não utilizados
        – Listar referências genéricas ou incompletas
        – Usar informações obsoletas quando versão atualizada existe
        
        ========================
        FORMATO OBRIGATÓRIO DAS REFERÊNCIAS
        ========================
        
        1. DIRETRIZ:
           – Nome oficial completo da diretriz
           – Sociedade/organização responsável
           – Ano da publicação ou última atualização (OBRIGATÓRIO 2024 ou 2025)
           – Exemplo: "GINA 2025: Global Strategy for Asthma Management and Prevention. Global Initiative for Asthma. 2025."
           – Exemplo: "Diretriz Brasileira de Dor Torácica na Sala de Emergência. Sociedade Brasileira de Cardiologia / Associação Brasileira de Medicina de Emergência. 2024."
           
           DIRETRIZES PRIORITÁRIAS 2024-2025:
           • Asma: GINA 2025
           • DPOC: GOLD 2024
           • Sepse: Surviving Sepsis Campaign 2024
           • IAM: ESC 2023/AHA 2023
           • AVC: AHA/ASA 2024
           • Pneumonia: IDSA/ATS 2024
        
        2. LIVROS-TEXTO:
           Para CADA livro utilizado, fornecer:
           – SOBRENOME DO AUTOR PRINCIPAL, Nome completo
           – Título completo do livro
           – Número da edição
           – Local de publicação
           – Editora
           – Ano de publicação
           
           Formato exato: SOBRENOME, Nome. Título. Edição. Local: Editora; Ano.
           
           Exemplos corretos:
           – BRAUNWALD, Eugene. Braunwald's Heart Disease: A Textbook of Cardiovascular Medicine. 12th ed. Philadelphia: Elsevier; 2024.
           – TINTINALLI, Judith E. Tintinalli's Emergency Medicine: A Comprehensive Study Guide. 9th ed. New York: McGraw-Hill; 2023.
           – HARRISON, Dennis L. Harrison's Principles of Internal Medicine. 21st ed. New York: McGraw-Hill; 2022.
        
        ========================
        ESTRUTURA DO CONTEÚDO CLÍNICO
        ========================
        
        Apresente a afecção "${temaNome}" com:
        1. DEFINIÇÃO clínica objetiva
        2. AVALIAÇÃO INICIAL (anamnese e exame físico direcionados)
        3. DIAGNÓSTICOS DIFERENCIAIS (principais hipóteses alternativas)
        4. CONDUTA IMEDIATA (estabilização e prioridades)
        5. EXAMES (complementares indicados)
        6. TRATAMENTO (abordagem terapêutica baseada em evidências)
        7. DESFECHO (critérios de resposta, internação, alta)
        
        ========================
        LINGUAGEM E CONFORMIDADE
        ========================
        
        – Linguagem técnica, objetiva, apropriada para profissionais de saúde
        – Conteúdo educacional: não substitui julgamento clínico individualizado
        – NÃO reproduza texto literal protegido por direitos autorais
        – NÃO inclua citações ou menções a fontes no corpo do texto (serão exibidas separadamente)
        
        ========================
        CRÍTICO - LIVROS-TEXTO
        ========================
        
        Liste TODOS os livros efetivamente consultados para elaborar esta resposta.
        Não há limite de quantidade.
        Para cada livro, forneça: autor completo, título completo, edição, local, editora e ano.
        
        ========================
        OBJETIVO
        ========================
        
        Fornecer resposta clínica estruturada para plantão médico, com referências bibliográficas completas, rastreáveis e cientificamente corretas, no padrão Whitebook/WeMeds.
      `,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          titulo: { type: 'string' },
          definicao: { type: 'string' },
          avaliacao_inicial: { type: 'array', items: { type: 'string' } },
          diagnostico_diferencial: { type: 'array', items: { type: 'string' } },
          conduta_imediata: { type: 'array', items: { type: 'string' } },
          red_flags: { type: 'array', items: { type: 'string' } },
          escalas: { type: 'array', items: { type: 'object', properties: { nome: { type: 'string' }, interpretacao: { type: 'string' } } } },
          exames: { type: 'array', items: { type: 'string' } },
          tratamento: { type: 'array', items: { type: 'string' } },
          desfecho: { type: 'array', items: { type: 'string' } },
          contraindicacoes: { type: 'array', items: { type: 'string' } },
          calculadoras: { type: 'array', items: { type: 'string' } },
          medicacoes: { type: 'array', items: { type: 'object', properties: { nome: { type: 'string' }, dose: { type: 'string' }, via: { type: 'string' } } } },
          diretrizes_utilizadas: { 
            type: 'array', 
            items: { 
              type: 'object', 
              properties: { 
                nome_completo: { type: 'string' }, 
                sociedade: { type: 'string' }, 
                ano: { type: 'string' },
                versao: { type: 'string' },
                alerta_desatualizado: { type: 'boolean' }
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
          }
        }
      }
    });

    // Salvar no banco para uso futuro
    const hash = calculateHash(response);
    const agora = new Date().toISOString();
    
    try {
      await base44.entities.ConteudoClinico.create({
        titulo: temaNome,
        slug: slug,
        categoria: selectedCategoria?.categoria.toLowerCase().replace(/\s+/g, '_') || 'geral',
        tipo_conteudo: 'guideline',
        conteudo: {
          definicao: response.definicao,
          avaliacao_inicial: response.avaliacao_inicial,
          diagnostico_diferencial: response.diagnostico_diferencial,
          conduta_imediata: response.conduta_imediata,
          red_flags: response.red_flags,
          escalas: response.escalas,
          exames: response.exames,
          tratamento: response.tratamento,
          desfecho: response.desfecho,
          contraindicacoes: response.contraindicacoes,
          calculadoras: response.calculadoras,
          medicacoes: response.medicacoes
        },
        diretrizes: response.diretrizes_utilizadas || [],
        livros_utilizados: response.livros_utilizados || [],
        versao: '1.0',
        hash_conteudo: hash,
        data_download: agora,
        ultima_verificacao: agora,
        ultima_atualizacao: agora,
        status: 'ativo',
        fonte_primaria: response.diretrizes_utilizadas?.[0]?.sociedade || 'Literatura Médica',
        especialidade_primaria: selectedCategoria?.categoria || 'Geral',
        palavras_chave: [temaNome],
        acessos_count: 1
      });
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
    }

    setResult({
      ...response,
      _metadata: {
        versao: '1.0',
        data_atualizacao: agora,
        do_banco: false
      }
    });
    setIsSearching(false);
  };

  const verificarAtualizacaoBackground = async (conteudoId, slug, temaNome) => {
    // Executa em background sem bloquear UI
    setTimeout(async () => {
      try {
        const conteudoAtual = await base44.entities.ConteudoClinico.filter({ slug });
        if (!conteudoAtual || conteudoAtual.length === 0) return;
        
        const atual = conteudoAtual[0];
        const atualData = atual.data || atual;
        
        // Verificar se já foi verificado recentemente (últimas 24h)
        const ultimaVerif = new Date(atualData.ultima_verificacao);
        const agora = new Date();
        const diffHoras = (agora - ultimaVerif) / (1000 * 60 * 60);
        
        if (diffHoras < 24) return; // Não verificar novamente se foi verificado há menos de 24h
        
        // Buscar versão atualizada
        const responseNova = await base44.integrations.Core.InvokeLLM({
          prompt: `
            Verificação rápida: Para "${temaNome}", existe diretriz mais recente que ${atualData.diretrizes?.[0]?.ano || '2024'}?
            Se sim, retorne true e o ano. Se não, retorne false.
          `,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              existe_atualizacao: { type: 'boolean' },
              ano_nova_versao: { type: 'string' }
            }
          }
        });
        
        // Atualizar timestamp de verificação
        await base44.entities.ConteudoClinico.update(atual.id, {
          ultima_verificacao: new Date().toISOString()
        });
        
        if (responseNova.existe_atualizacao) {
          // Marcar como desatualizado para que seja atualizado na próxima busca completa
          await base44.entities.ConteudoClinico.update(atual.id, {
            status: 'desatualizado'
          });
        }
      } catch (error) {
        console.error('Erro na verificação de atualização:', error);
      }
    }, 1000); // Aguardar 1s antes de iniciar verificação
  };

  const handleCategoriaClick = (categoria) => {
    setSelectedCategoria(categoria);
    setNavigationLevel(2);
  };

  const handleTemaClick = (tema) => {
    setSelectedTema(tema);
    setNavigationLevel(3);
    handleSearch(tema.nome);
  };

  const handleBackToEspecialidades = () => {
    setNavigationLevel(1);
    setSelectedCategoria(null);
    setSelectedTema(null);
    setResult(null);
  };

  const handleBackToAfeccoes = () => {
    setNavigationLevel(2);
    setSelectedTema(null);
    setResult(null);
  };

  // Verificar retorno de calculadora
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const retornoAfeccao = urlParams.get('retorno_afeccao');
    
    if (retornoAfeccao) {
      for (const cat of especialidadesPlantonista) {
        const temaEncontrado = cat.temas.find(t => t.nome === retornoAfeccao);
        if (temaEncontrado) {
          setSelectedCategoria(cat);
          setNavigationLevel(2);
          setTimeout(() => {
            handleTemaClick(temaEncontrado);
          }, 100);
          
          urlParams.delete('retorno_afeccao');
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
          window.history.replaceState({}, '', newUrl);
          break;
        }
      }
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Breadcrumb de navegação */}
      <Card className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-xs">
            <button 
              onClick={handleBackToEspecialidades}
              className="flex items-center gap-1 text-blue-700 hover:text-blue-900 font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              Especialidades
            </button>
            {navigationLevel >= 2 && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <button 
                  onClick={handleBackToAfeccoes}
                  className="text-blue-700 hover:text-blue-900 font-medium"
                >
                  {selectedCategoria?.categoria}
                </button>
              </>
            )}
            {navigationLevel === 3 && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-slate-600">{selectedTema?.nome}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* NÍVEL 1 - ESPECIALIDADES */}
      {navigationLevel === 1 && (
        <>
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 mb-4">
            <CardContent className="p-4">
              <h2 className="text-white font-semibold text-base mb-1">Modo Plantonista</h2>
              <p className="text-blue-100 text-xs">Navegação clínica estruturada por especialidade → afecção → conduta</p>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {especialidadesPlantonista.map((cat) => {
            const Icon = cat.icon;
            return (
              <Card 
                key={cat.categoria} 
                className="bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleCategoriaClick(cat)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{cat.categoria}</h3>
                      <p className="text-[10px] text-slate-500">{cat.temas.length} afecções</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-blue-600 font-medium">
                    <span>Ver afecções</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </>
      )}

      {/* NÍVEL 2 - AFECÇÕES DA ESPECIALIDADE */}
      {navigationLevel === 2 && selectedCategoria && (
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded ${selectedCategoria.color} flex items-center justify-center`}>
                {React.createElement(selectedCategoria.icon, { className: "w-4 h-4 text-white" })}
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800">{selectedCategoria.categoria}</h2>
                <p className="text-[10px] text-slate-500">Selecione uma afecção para ver conteúdo estruturado</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {selectedCategoria.temas.map((tema) => (
                <button
                  key={tema.nome}
                  onClick={() => handleTemaClick(tema)}
                  className="text-left p-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition-all"
                >
                  <p className="text-sm font-medium text-slate-700 mb-1">{tema.nome}</p>
                  <div className="flex flex-wrap gap-1">
                    {tema.escalas.slice(0, 3).map((esc) => (
                      <Badge key={esc} variant="outline" className="text-[8px] px-1 py-0 h-4 text-blue-600 border-blue-200">
                        {esc}
                      </Badge>
                    ))}
                    {tema.calculadoras.slice(0, 2).map((calc) => (
                      <Badge key={calc} variant="outline" className="text-[8px] px-1 py-0 h-4 text-emerald-600 border-emerald-200">
                        <Calculator className="w-2 h-2 mr-0.5" />{calc}
                      </Badge>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NÍVEL 3 - CONTEÚDO CLÍNICO */}
      {navigationLevel === 3 && result && (
        <SearchResult result={result} selectedTema={selectedTema} selectedCategoria={selectedCategoria} onBack={handleBackToAfeccoes} />
      )}

      {navigationLevel === 3 && isLoadingFromDB && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-600">Carregando conteúdo do banco local...</p>
          </CardContent>
        </Card>
      )}

      {navigationLevel === 3 && isSearching && !isLoadingFromDB && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-600">Baixando e salvando conteúdo clínico...</p>
            <p className="text-xs text-slate-400 mt-2">Este conteúdo será salvo para acesso offline</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SearchResult({ result, selectedTema, selectedCategoria, onBack }) {
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('supmed_doctor');
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);
  // Verificar notificação compulsória (pode vir do banco ou da verificação automática)
  const notificacao = result.notificacao_compulsoria || verificarNotificacaoCompulsoria(result.titulo || '');
  
  // Verificar se há diretrizes desatualizadas
  const temDiretrizDesatualizada = result.diretrizes_utilizadas?.some(dir => {
    const ano = parseInt(dir.ano);
    return ano < 2024 || dir.alerta_desatualizado;
  });
  
  return (
    <div className="space-y-3">
      <Button variant="outline" size="sm" onClick={onBack} className="text-xs h-7">
        ← Voltar
      </Button>

      {/* Alerta de Diretriz Desatualizada */}
      {temDiretrizDesatualizada && (
        <Card className="bg-amber-50 border-amber-300">
          <CardContent className="p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-semibold">⚠️ Atenção: Diretriz pode estar desatualizada</p>
              <p className="mt-1">Esta informação pode estar baseada em diretriz anterior a 2024. Sempre verifique as versões mais recentes das sociedades médicas.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de Notificação Compulsória */}
      {notificacao && (
        <Card 
          className="bg-red-50 border-red-300 cursor-pointer hover:bg-red-100 transition-colors"
          onClick={() => window.open('https://portalsinan.saude.gov.br/', '_blank')}
        >
          <CardContent className="p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-800">
                🚨 Notificação Compulsória SINAN
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-red-600" />
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50">
        <CardContent className="p-4">
          <h2 className="text-base font-semibold text-slate-800 mb-3">{result.titulo}</h2>

          {/* Imagens Clínicas */}
          {result.imagens?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Imagens Clínicas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {result.imagens.map((img, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                    <img src={img.url} alt={img.legenda || 'Imagem clínica'} className="w-full h-32 object-cover" />
                    {img.legenda && (
                      <p className="text-[9px] text-slate-600 p-1 bg-slate-50">{img.legenda}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Escalas relacionadas - Clicáveis */}
          {selectedTema && (selectedTema.escalas.length > 0 || selectedTema.calculadoras.length > 0) && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-600 mb-2">Clique para abrir o score:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTema.escalas.map((esc) => {
                  const scoreId = getScoreId(esc);
                  const linkWithContext = scoreId 
                  ? createNavigationUrl(SUPMED_ROUTES.SCORES, { 
                      score: scoreId, 
                      origem: 'plantonista',
                      especialidade: selectedCategoria.categoria,
                      afeccao: selectedTema.nome
                    })
                  : null;
                  return linkWithContext ? (
                  <Link key={esc} to={linkWithContext}>
                    <Badge className="text-[10px] bg-blue-500 hover:bg-blue-600 cursor-pointer transition-colors">
                      {esc} <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </Badge>
                  </Link>
                  ) : (
                  <Badge key={esc} className="text-[10px] bg-blue-400">{esc}</Badge>
                  );
                  })}
                  {selectedTema.calculadoras.map((calc) => {
                  const scoreId = getScoreId(calc);
                  const linkWithContext = scoreId 
                  ? createNavigationUrl(SUPMED_ROUTES.SCORES, { 
                      score: scoreId, 
                      origem: 'plantonista',
                      especialidade: selectedCategoria.categoria,
                      afeccao: selectedTema.nome
                    })
                  : null;
                  return linkWithContext ? (
                  <Link key={calc} to={linkWithContext}>
                    <Badge className="text-[10px] bg-emerald-500 hover:bg-emerald-600 cursor-pointer transition-colors">
                      <Calculator className="w-2.5 h-2.5 mr-1" />{calc} <ExternalLink className="w-2.5 h-2.5 ml-1" />
                    </Badge>
                  </Link>
                  ) : (
                  <Badge key={calc} className="text-[10px] bg-emerald-400">
                    <Calculator className="w-2.5 h-2.5 mr-1" />{calc}
                  </Badge>
                  );
                  })}
              </div>
            </div>
          )}

          {/* Definição */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-slate-600 uppercase mb-1">Definição</h3>
            <p className="text-sm text-slate-700">{result.definicao}</p>
          </div>

          {/* Red Flags */}
          {result.red_flags?.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
              <h3 className="text-xs font-semibold text-red-700 uppercase mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Red Flags
              </h3>
              <ul className="space-y-1">
                {result.red_flags.map((flag, i) => (
                  <li key={i} className="text-xs text-red-800 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Integrações Clínicas - Scores, Calculadoras e Procedimentos */}
          {(result.scores_relacionados?.length > 0 || result.calculadoras_relacionadas?.length > 0 || result.procedimentos_relacionados?.length > 0) && (
            <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
              <h3 className="text-xs font-semibold text-emerald-800 uppercase mb-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Ferramentas Clínicas Relacionadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Scores Clínicos */}
                {result.scores_relacionados?.map((scoreId, i) => {
                  const url = createNavigationUrl(SUPMED_ROUTES.SCORES, { 
                    score: scoreId,
                    origem: 'plantonista',
                    especialidade: selectedCategoria?.categoria || 'geral',
                    afeccao: result.titulo
                  });
                  return (
                    <Button 
                      key={`score-${i}`}
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                      onClick={() => window.location.href = url}
                    >
                      <Calculator className="w-3 h-3 mr-1" />
                      {scoreId.toUpperCase()}
                    </Button>
                  );
                })}

                {/* Calculadoras */}
                {result.calculadoras_relacionadas?.map((calcId, i) => {
                  const url = createNavigationUrl(SUPMED_ROUTES.SCORES, { 
                    score: calcId,
                    origem: 'plantonista',
                    especialidade: selectedCategoria?.categoria || 'geral',
                    afeccao: result.titulo
                  });
                  return (
                    <Button 
                      key={`calc-${i}`}
                      size="sm" 
                      variant="outline"
                      className="h-8 bg-blue-50 hover:bg-blue-100 border-blue-200"
                      onClick={() => window.location.href = url}
                    >
                      <Calculator className="w-3 h-3 mr-1" />
                      {calcId.toUpperCase()}
                    </Button>
                  );
                })}

                {/* Procedimentos */}
                {result.procedimentos_relacionados?.map((procId, i) => {
                  const url = createNavigationUrl(SUPMED_ROUTES.PROCEDIMENTOS, { 
                    proc_id: procId,
                    origem: 'plantonista',
                    afeccao: result.titulo
                  });
                  return (
                    <Button 
                      key={`proc-${i}`}
                      size="sm" 
                      variant="outline"
                      className="h-8 bg-violet-50 hover:bg-violet-100 border-violet-200"
                      onClick={() => window.location.href = url}
                    >
                      <Scissors className="w-3 h-3 mr-1" />
                      {procId.replace(/_/g, ' ').replace(/-/g, ' ')}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Escalas e Escores - Clicáveis */}
          {result.escalas?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Escalas e Escores
              </h3>
              <div className="grid md:grid-cols-2 gap-2">
                {result.escalas.map((esc, i) => {
                  const scoreId = getScoreId(esc.nome);
                  const linkWithContext = scoreId 
                    ? createNavigationUrl(SUPMED_ROUTES.SCORES, { 
                        score: scoreId,
                        origem: 'plantonista',
                        especialidade: selectedCategoria.categoria,
                        afeccao: selectedTema.nome
                      })
                    : null;
                  const content = (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-blue-800">{esc.nome}</p>
                        {scoreId && <ExternalLink className="w-3 h-3 text-blue-500" />}
                      </div>
                      <p className="text-[10px] text-blue-600 mt-0.5">{esc.interpretacao}</p>
                    </>
                  );
                  return linkWithContext ? (
                    <Link key={i} to={linkWithContext}>
                      <div className="p-2 bg-blue-50 rounded border border-blue-100 hover:bg-blue-100 hover:border-blue-300 cursor-pointer transition-colors">
                        {content}
                      </div>
                    </Link>
                  ) : (
                    <div key={i} className="p-2 bg-blue-50 rounded border border-blue-100">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Avaliação Inicial */}
          {result.avaliacao_inicial?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Avaliação Inicial</h3>
              <ul className="space-y-1">
                {result.avaliacao_inicial.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700">• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Diagnósticos Diferenciais */}
          {result.diagnostico_diferencial?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Diagnósticos Diferenciais</h3>
              <ul className="space-y-0.5">
                {result.diagnostico_diferencial.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700">• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conduta Imediata */}
          {result.conduta_imediata?.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="text-xs font-semibold text-blue-800 uppercase mb-2">Conduta Imediata</h3>
              <ol className="space-y-1">
                {result.conduta_imediata.map((item, i) => (
                  <li key={i} className="text-xs text-blue-900">{i + 1}. {item}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Grid de informações */}
          <div className="grid md:grid-cols-2 gap-4">

            {result.exames?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-600 uppercase mb-1">Exames</h3>
                <ul className="space-y-0.5">
                  {result.exames.map((item, i) => (
                    <li key={i} className="text-xs text-slate-700">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.calculadoras?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1">
                  <Calculator className="w-3 h-3" /> Calculadoras
                </h3>
                <div className="flex flex-wrap gap-1">
                  {result.calculadoras.map((calc, i) => {
                    const scoreId = getScoreId(calc);
                    const linkWithContext = scoreId 
                      ? createNavigationUrl(SUPMED_ROUTES.SCORES, { 
                          score: scoreId,
                          origem: 'plantonista',
                          especialidade: selectedCategoria?.categoria || 'geral',
                          afeccao: selectedTema?.nome || result.titulo
                        })
                      : null;
                    return linkWithContext ? (
                      <Link key={i} to={linkWithContext}>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer">
                          {calc} <ExternalLink className="w-2 h-2 ml-1" />
                        </Badge>
                      </Link>
                    ) : (
                      <Badge key={i} variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">{calc}</Badge>
                    );
                    })}
                </div>
              </div>
            )}


          </div>

          {/* Tratamento */}
          {result.tratamento?.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <h3 className="text-xs font-semibold text-emerald-800 uppercase mb-2">Tratamento</h3>
              <ol className="space-y-1">
                {result.tratamento.map((item, i) => (
                  <li key={i} className="text-xs text-emerald-900">{i + 1}. {item}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Desfecho */}
          {result.desfecho?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">Desfecho</h3>
              <ul className="space-y-1">
                {result.desfecho.map((item, i) => (
                  <li key={i} className="text-xs text-slate-700">• {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contraindicações */}
          {result.contraindicacoes?.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <h3 className="text-xs font-semibold text-amber-700 uppercase mb-2">Contraindicações</h3>
              <ul className="space-y-0.5">
                {result.contraindicacoes.map((item, i) => (
                  <li key={i} className="text-xs text-amber-800">⚠️ {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Medicações (referência educacional) - TEXTO LIVRE */}
          {result.medicamentos_texto_livre && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-700 uppercase mb-2 flex items-center gap-1">
                <Pill className="w-3 h-3" /> Medicações de Referência
              </h3>
              <div className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                {result.medicamentos_texto_livre}
              </div>
              <p className="text-[9px] text-amber-700 mt-2 bg-amber-50 p-2 rounded">
                ⚠️ Conteúdo educacional. NÃO constitui prescrição médica. A prescrição deve ser individualizada.
              </p>
            </div>
          )}

          {/* Seção de Referências Utilizadas (Específicas do Tema) */}
          {(result.diretrizes_utilizadas?.length > 0 || result.livros_utilizados?.length > 0) && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-700 uppercase mb-3 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> Referências Utilizadas para este Tema
              </h3>
              
              {/* Diretrizes */}
              {result.diretrizes_utilizadas?.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-blue-600 mb-1.5">📋 Diretriz utilizada:</p>
                  {result.diretrizes_utilizadas.map((dir, i) => {
                    const ano = parseInt(dir.ano);
                    const isAtualizada = ano >= 2024;
                    return (
                      <div key={i} className={`p-2 rounded border mb-1 ${isAtualizada ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className={`text-xs font-semibold ${isAtualizada ? 'text-blue-900' : 'text-amber-900'}`}>
                              {dir.nome_completo}
                            </p>
                            <p className={`text-[10px] ${isAtualizada ? 'text-blue-700' : 'text-amber-700'}`}>
                              {dir.sociedade} • <span className="font-semibold">{dir.ano}</span>
                              {dir.versao && ` • ${dir.versao}`}
                            </p>
                          </div>
                          {isAtualizada ? (
                            <Badge className="bg-green-100 text-green-700 text-[8px] px-1.5 py-0.5 h-4">
                              ✓ 2024-2025
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 text-[8px] px-1.5 py-0.5 h-4">
                              ⚠️ Antiga
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Livros-texto */}
              {result.livros_utilizados?.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-slate-600 mb-1.5">📚 Livros-texto utilizados:</p>
                  <div className="space-y-1">
                    {result.livros_utilizados.map((livro, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded border border-slate-100">
                        <p className="text-xs text-slate-800 font-medium">
                          {livro.autor_sobrenome}, {livro.autor_nome}. {livro.titulo_completo}. {livro.edicao}. {livro.local}: {livro.editora}; {livro.ano}.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nota de Conformidade */}
              <div className="p-2 bg-amber-50 rounded border border-amber-100">
                <p className="text-[9px] text-amber-700 leading-relaxed">
                  <strong>Nota:</strong> Referências específicas efetivamente utilizadas para elaborar esta resposta. 
                  O conteúdo consiste em sínteses educacionais originais, não reproduzindo texto literal de fontes protegidas. 
                  Consulte sempre as versões mais recentes das diretrizes para aplicação clínica.
                </p>
              </div>
            </div>
          )}

          {/* Metadados de Versionamento */}
          {result._metadata && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[9px]">
                    {result._metadata.do_banco ? '💾 Banco Local' : '🌐 Internet'}
                  </Badge>
                  <span className="text-slate-500">
                    Versão: <strong>{result._metadata.versao}</strong>
                  </span>
                  <span className="text-slate-500">
                    Atualizado: <strong>{new Date(result._metadata.data_atualizacao).toLocaleDateString('pt-BR')}</strong>
                  </span>
                </div>
                {result._metadata.do_banco && (
                  <Badge className="bg-green-100 text-green-700 text-[8px]">
                    ✓ Modo Offline
                  </Badge>
                )}
              </div>
            </div>
          )}

          <DisclaimerFooter variant="ia" />

          {/* Bloco de Rastreabilidade Editorial */}
          {result._origem === 'editorial' && (
            <BlocoRastreabilidade 
              conteudo={result} 
              currentUser={currentUser}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}