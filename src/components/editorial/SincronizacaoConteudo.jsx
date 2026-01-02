import { base44 } from '@/api/base44Client';

/**
 * SINCRONIZA TODO CONTEÚDO EXISTENTE PARA O PAINEL EDITORIAL
 * Status inicial: pendente_revisao
 */

export async function sincronizarCalculadoras() {
  try {
    const calculadoras = [
      { id: 'grace', nome: 'GRACE Score', categoria: 'cardiologia' },
      { id: 'apache2', nome: 'APACHE II', categoria: 'uti' },
      { id: 'sofa', nome: 'SOFA Score', categoria: 'uti' },
      { id: 'qsofa', nome: 'qSOFA', categoria: 'uti' },
      { id: 'curb65', nome: 'CURB-65', categoria: 'pneumologia' },
      { id: 'chadsvasc', nome: 'CHA₂DS₂-VASc', categoria: 'cardiologia' },
      { id: 'hasbled', nome: 'HAS-BLED', categoria: 'cardiologia' },
      { id: 'wells_tvp', nome: 'Wells TVP', categoria: 'vascular' },
      { id: 'wells_tep', nome: 'Wells TEP', categoria: 'vascular' },
      { id: 'nihss', nome: 'NIHSS', categoria: 'neurologia' },
      { id: 'glasgow', nome: 'Glasgow', categoria: 'neurologia' },
      { id: 'child_pugh', nome: 'Child-Pugh', categoria: 'gastro' },
      { id: 'meld', nome: 'MELD', categoria: 'gastro' },
      { id: 'heart', nome: 'HEART Score', categoria: 'cardiologia' },
      { id: 'perc', nome: 'PERC Rule', categoria: 'vascular' },
      { id: 'pesi', nome: 'PESI', categoria: 'vascular' },
      { id: 'caprini', nome: 'Caprini', categoria: 'vascular' },
      { id: 'padua', nome: 'Padua', categoria: 'vascular' }
    ];

    let count = 0;
    for (const calc of calculadoras) {
      const existe = await base44.entities.ConteudoEditorial.filter({
        slug: calc.id,
        tipo_modulo: 'calculadora'
      });

      if (existe.length === 0) {
        await base44.entities.ConteudoEditorial.create({
          titulo: calc.nome,
          slug: calc.id,
          tipo_modulo: 'calculadora',
          categoria: calc.categoria,
          conteudo_estruturado: { origem: 'score_hardcoded' },
          status_editorial: 'pendente_revisao',
          publicado: false,
          autor_id: 'sistema',
          editor_responsavel: 'sistema',
          versao: '1.0',
          origem_conteudo: 'sistema',
          data_criacao: new Date().toISOString()
        });
        count++;
      } else {
        // Garantir status pendente se não tem
        if (!existe[0].status_editorial || existe[0].status_editorial === 'aprovado') {
          await base44.entities.ConteudoEditorial.update(existe[0].id, {
            status_editorial: 'pendente_revisao',
            publicado: false
          });
          count++;
        }
      }
    }

    return { success: true, count };
  } catch (error) {
    console.error('Erro sincronizar calculadoras:', error);
    throw error;
  }
}

export async function sincronizarProcedimentos() {
  try {
    const procedimentos = await base44.entities.Procedimento.list();
    
    let count = 0;
    for (const proc of procedimentos) {
      // Garantir status pendente se não tem
      if (!proc.status_editorial) {
        await base44.entities.Procedimento.update(proc.id, {
          status_editorial: 'pendente_revisao',
          publicado: false,
          versao: proc.versao || '1.0',
          autor_id: proc.autor_id || proc.created_by || 'sistema'
        });
        count++;
      }
    }

    return { success: true, count };
  } catch (error) {
    console.error('Erro sincronizar procedimentos:', error);
    throw error;
  }
}

export async function sincronizarEscalas() {
  try {
    const escalas = [
      { id: 'aldrete', nome: 'Escala de Aldrete', categoria: 'anestesia' },
      { id: 'ramsay', nome: 'Escala de Ramsay', categoria: 'sedacao' },
      { id: 'rass', nome: 'RASS', categoria: 'sedacao' },
      { id: 'apgar', nome: 'Apgar', categoria: 'pediatria' }
    ];

    let count = 0;
    for (const escala of escalas) {
      const existe = await base44.entities.ConteudoEditorial.filter({
        slug: escala.id,
        tipo_modulo: 'escala'
      });

      if (existe.length === 0) {
        await base44.entities.ConteudoEditorial.create({
          titulo: escala.nome,
          slug: escala.id,
          tipo_modulo: 'escala',
          categoria: escala.categoria,
          conteudo_estruturado: { origem: 'escala_hardcoded' },
          status_editorial: 'pendente_revisao',
          publicado: false,
          autor_id: 'sistema',
          editor_responsavel: 'sistema',
          versao: '1.0',
          origem_conteudo: 'sistema',
          data_criacao: new Date().toISOString()
        });
        count++;
      } else {
        if (!existe[0].status_editorial) {
          await base44.entities.ConteudoEditorial.update(existe[0].id, {
            status_editorial: 'pendente_revisao',
            publicado: false
          });
          count++;
        }
      }
    }

    return { success: true, count };
  } catch (error) {
    console.error('Erro sincronizar escalas:', error);
    throw error;
  }
}

export async function sincronizarAfeccoesPlantonista() {
  try {
    const especialidadesPlantonista = [
      {
        categoria: 'Cardiologia',
        especialidade: 'cardiologia',
        temas: [
          'Dor torácica', 'Síndrome coronariana aguda', 'Angina estável', 
          'Infarto com supra de ST', 'Infarto sem supra de ST',
          'Insuficiência cardíaca agudizada', 'Insuficiência cardíaca crônica',
          'Edema agudo de pulmão', 'Arritmias supraventriculares', 
          'Fibrilação atrial', 'Flutter atrial', 'Taquicardia ventricular',
          'Bradicardia sintomática', 'Bloqueios AV', 'Crise hipertensiva',
          'Hipertensão arterial sistêmica', 'Miocardite', 'Pericardite',
          'Endocardite infecciosa', 'Síncope cardiogênica', 'Choque cardiogênico',
          'Tromboembolismo pulmonar', 'Doença arterial periférica'
        ]
      },
      {
        categoria: 'Neurologia',
        especialidade: 'neurologia',
        temas: [
          'Acidente vascular cerebral isquêmico', 'Acidente vascular cerebral hemorrágico',
          'Ataque isquêmico transitório', 'Cefaleia aguda', 'Cefaleia secundária',
          'Enxaqueca', 'Crise convulsiva', 'Estado de mal epiléptico',
          'Rebaixamento do nível de consciência', 'Delirium', 'Síncope neurológica',
          'Déficit neurológico focal', 'Hemorragia subaracnoide', 
          'Hipertensão intracraniana', 'Traumatismo cranioencefálico',
          'Meningite', 'Encefalite', 'Síndrome de Guillain-Barré', 
          'Miastenia gravis (crise miastênica)'
        ]
      },
      {
        categoria: 'Respiratório',
        especialidade: 'respiratorio',
        temas: [
          'Dispneia aguda', 'Asma', 'Estado asmático', 'DPOC', 
          'Exacerbação de DPOC', 'Pneumonia comunitária', 'Pneumonia hospitalar',
          'Pneumonia associada à ventilação', 'Tromboembolismo pulmonar',
          'Derrame pleural', 'Pneumotórax', 'Pneumotórax hipertensivo',
          'Síndrome do desconforto respiratório agudo (SDRA)',
          'Insuficiência respiratória aguda', 'Insuficiência respiratória crônica',
          'Hemoptise', 'Bronquiolite (pediatria)'
        ]
      },
      {
        categoria: 'Infecções / Sepse',
        especialidade: 'infeccoes',
        temas: [
          'Sepse', 'Choque séptico', 'Infecção urinária', 'Pielonefrite',
          'Infecção de pele e partes moles', 'Celulite', 'Fasceíte necrosante',
          'Meningite', 'Endocardite infecciosa', 'Pneumonia', 'Tuberculose',
          'COVID-19', 'Infecções gastrointestinais', 'Diarreia infecciosa',
          'Febre sem foco', 'Febre neutropênica', 'Osteomielite', 'Artrite séptica'
        ]
      },
      {
        categoria: 'Gastroenterologia',
        especialidade: 'gastro',
        temas: [
          'Dor abdominal aguda', 'Abdome agudo inflamatório', 
          'Abdome agudo obstrutivo', 'Abdome agudo perfurativo',
          'Apendicite aguda', 'Colecistite aguda', 'Colangite',
          'Pancreatite aguda', 'Pancreatite crônica', 'Úlcera péptica',
          'Hemorragia digestiva alta', 'Hemorragia digestiva baixa',
          'Hepatite aguda', 'Insuficiência hepática aguda', 'Cirrose hepática',
          'Ascite', 'Encefalopatia hepática', 'Doença inflamatória intestinal',
          'Obstrução intestinal', 'Isquemia mesentérica'
        ]
      },
      {
        categoria: 'Trauma',
        especialidade: 'trauma',
        temas: [
          'Trauma cranioencefálico', 'Trauma torácico', 'Trauma abdominal',
          'Trauma pélvico', 'Politrauma', 'Choque hemorrágico',
          'Trauma raquimedular', 'Fraturas expostas', 'Fraturas fechadas',
          'Luxações', 'Queimaduras', 'Trauma ocular', 'Trauma maxilofacial',
          'Trauma vascular', 'Lesão por esmagamento'
        ]
      },
      {
        categoria: 'Renal / Metabólico',
        especialidade: 'renal_metabolico',
        temas: [
          'Insuficiência renal aguda', 'Insuficiência renal crônica',
          'Distúrbios hidroeletrolíticos', 'Hiponatremia', 'Hipernatremia',
          'Hipocalemia', 'Hipercalemia', 'Acidose metabólica', 'Alcalose metabólica',
          'Cetoacidose diabética', 'Estado hiperosmolar hiperglicêmico',
          'Hipoglicemia', 'Nefrolitíase', 'Síndrome nefrótica',
          'Síndrome nefrítica', 'Rabdomiólise', 'Crise adrenal', 'Hipercalcemia'
        ]
      },
      {
        categoria: 'Pediatria',
        especialidade: 'pediatria',
        temas: [
          'Febre sem sinais localizatórios', 'Sepse neonatal', 'Desidratação',
          'Diarreia aguda', 'Bronquiolite', 'Asma pediátrica', 'Pneumonia pediátrica',
          'Crise convulsiva febril', 'Crise convulsiva afebril', 'Trauma pediátrico',
          'Obstrução de vias aéreas', 'Corpo estranho', 'Meningite pediátrica',
          'Infecção urinária pediátrica', 'Icterícia neonatal', 'Distúrbios do crescimento'
        ]
      },
      {
        categoria: 'Psiquiatria',
        especialidade: 'psiquiatria',
        temas: [
          'Ideação suicida', 'Tentativa de suicídio', 'Agitação psicomotora',
          'Psicose aguda', 'Surto psicótico', 'Transtorno bipolar (mania)',
          'Depressão maior', 'Transtorno de ansiedade', 'Ataque de pânico',
          'Delirium', 'Abstinência alcoólica', 'Intoxicação por álcool',
          'Intoxicação por drogas', 'Síndrome neuroléptica maligna', 'Catatonia'
        ]
      }
    ];

    let count = 0;
    for (const esp of especialidadesPlantonista) {
      for (const tema of esp.temas) {
        const slug = tema.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
        
        const existe = await base44.entities.AfeccaoEditorial.filter({ slug });

        if (existe.length === 0) {
          await base44.entities.AfeccaoEditorial.create({
            nome_afeccao: tema,
            slug,
            especialidade: esp.especialidade,
            ambiente_uso: ['pronto_atendimento', 'hospital'],
            definicao: `Afecção clínica: ${tema}. Aguardando revisão completa pelo corpo clínico.`,
            avaliacao_inicial: [],
            diagnosticos_diferenciais: [],
            conduta_imediata_pa: [],
            red_flags: [],
            exames_indicados: [],
            tratamento_manejo: [],
            criterios_internacao: [],
            referencias_utilizadas: [],
            status_editorial: 'pendente_revisao',
            publicado: false,
            autor_id: 'sistema_plantonista',
            editor_responsavel: 'sistema',
            versao: '1.0',
            origem_conteudo: 'sistema',
            historico_versoes: [{
              versao: '1.0',
              data: new Date().toISOString(),
              editor: 'sistema',
              alteracoes: 'Importação automática do módulo Plantonista'
            }],
            data_criacao: new Date().toISOString()
          });
          count++;
        }
      }
    }

    return { success: true, count };
  } catch (error) {
    console.error('Erro sincronizar afecções plantonista:', error);
    throw error;
  }
}