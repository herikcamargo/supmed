import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile deve ser usado dentro de ProfileProvider');
  }
  return context;
};

// Configurações de perfil
export const PERFIS_CONFIG = {
  MEDICO: {
    label: 'Médico',
    modulosPrioritarios: ['plantonista', 'prescricao', 'exames-lab', 'exames-imagem', 'ecg', 'protocolos', 'ceatox'],
    linguagem: 'tecnica',
    descricao: 'Foco em diagnóstico, prescrição e protocolos clínicos',
    cor: 'blue',
    icone: 'Stethoscope'
  },
  ENFERMEIRO: {
    label: 'Enfermeiro(a)',
    modulosPrioritarios: ['plantonista', 'procedimentos', 'diluicao', 'protocolos', 'scores', 'guidelines'],
    linguagem: 'assistencial',
    descricao: 'Foco em assistência, procedimentos e protocolos',
    cor: 'green',
    icone: 'HeartPulse'
  },
  TECNICO: {
    label: 'Técnico(a) de Enfermagem',
    modulosPrioritarios: ['diluicao', 'procedimentos', 'scores', 'protocolos'],
    linguagem: 'simples',
    descricao: 'Foco em rotinas, procedimentos e checklists',
    cor: 'purple',
    icone: 'ClipboardList'
  },
  ESTUDANTE: {
    label: 'Estudante',
    modulosPrioritarios: ['educacional', 'plantonista', 'casos', 'comunidade', 'guidelines'],
    linguagem: 'didatica',
    descricao: 'Foco em aprendizado e gamificação',
    cor: 'amber',
    icone: 'GraduationCap'
  },
  OUTRO: {
    label: 'Outro Profissional',
    modulosPrioritarios: ['plantonista', 'guidelines', 'protocolos', 'comunidade'],
    linguagem: 'geral',
    descricao: 'Visualização padrão do sistema',
    cor: 'slate',
    icone: 'User'
  }
};

export function ProfileProvider({ children }) {
  const [perfil, setPerfil] = useState('MEDICO');
  const [customAtalhos, setCustomAtalhos] = useState([]);

  useEffect(() => {
    const storedDoctor = localStorage.getItem('supmed_doctor');
    if (storedDoctor) {
      try {
        const doctor = JSON.parse(storedDoctor);
        setPerfil(doctor.perfil_profissional || 'MEDICO');
        setCustomAtalhos(doctor.atalhos_personalizados || []);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    }
  }, []);

  const atualizarPerfil = (novoPerfil) => {
    setPerfil(novoPerfil);
    
    // Atualizar localStorage
    const storedDoctor = localStorage.getItem('supmed_doctor');
    if (storedDoctor) {
      try {
        const doctor = JSON.parse(storedDoctor);
        doctor.perfil_profissional = novoPerfil;
        localStorage.setItem('supmed_doctor', JSON.stringify(doctor));
        
        // Atualizar no banco de usuários
        const localUsers = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
        const userIndex = localUsers.findIndex(u => u.id === doctor.id);
        if (userIndex !== -1) {
          localUsers[userIndex].perfil_profissional = novoPerfil;
          localStorage.setItem('supmed_users_db', JSON.stringify(localUsers));
        }
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
      }
    }
  };

  const atualizarAtalhos = (atalhos) => {
    setCustomAtalhos(atalhos);
    
    const storedDoctor = localStorage.getItem('supmed_doctor');
    if (storedDoctor) {
      try {
        const doctor = JSON.parse(storedDoctor);
        doctor.atalhos_personalizados = atalhos;
        localStorage.setItem('supmed_doctor', JSON.stringify(doctor));
        
        const localUsers = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
        const userIndex = localUsers.findIndex(u => u.id === doctor.id);
        if (userIndex !== -1) {
          localUsers[userIndex].atalhos_personalizados = atalhos;
          localStorage.setItem('supmed_users_db', JSON.stringify(localUsers));
        }
      } catch (error) {
        console.error('Erro ao atualizar atalhos:', error);
      }
    }
  };

  const getModulosPrioritarios = () => {
    if (customAtalhos.length > 0) {
      return customAtalhos;
    }
    return PERFIS_CONFIG[perfil]?.modulosPrioritarios || PERFIS_CONFIG.MEDICO.modulosPrioritarios;
  };

  const getConfigPerfil = () => {
    return PERFIS_CONFIG[perfil] || PERFIS_CONFIG.MEDICO;
  };

  const value = {
    perfil,
    atualizarPerfil,
    customAtalhos,
    atualizarAtalhos,
    getModulosPrioritarios,
    getConfigPerfil,
    PERFIS_CONFIG
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}