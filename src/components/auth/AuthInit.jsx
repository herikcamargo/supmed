import { useEffect } from 'react';

const TARGET_ADMIN_EMAIL = "tfailevestibular@gmail.com";

export function useAuthInit() {
  useEffect(() => {
    initializeAuth();
  }, []);
}

async function initializeAuth() {
  try {
    const localUsers = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
    const adminUser = localUsers.find(u => u.email === TARGET_ADMIN_EMAIL.toLowerCase());

    if (!adminUser) {
      // Criar admin
      const newAdmin = {
        id: 'admin_' + Date.now(),
        full_name: 'Administrador SUPMED',
        email: TARGET_ADMIN_EMAIL.toLowerCase(),
        role: 'admin',
        profissao: 'gestor',
        perfil_profissional: 'MEDICO',
        status: 'ativo',
        pronoun: 'Dr.',
        perfilData: {
          label: 'Administrador',
          acessos: ['*'],
          descricao: 'Acesso total ao sistema'
        },
        acessos: ['*'],
        restricoes: [],
        atalhos_personalizados: [],
        settings: {
          idioma: 'pt-BR',
          tema: 'light',
          notificacoes: true
        },
        created_date: new Date().toISOString()
      };

      localUsers.push(newAdmin);
      localStorage.setItem('supmed_users_db', JSON.stringify(localUsers));

      // Criar senha padrão
      const defaultPassword = 'eliaft1234';
      const hash = btoa(defaultPassword + 'supmed_salt_2024');
      const passwordHashes = JSON.parse(localStorage.getItem('supmed_password_hashes') || '{}');
      passwordHashes[newAdmin.email] = hash;
      localStorage.setItem('supmed_password_hashes', JSON.stringify(passwordHashes));

      console.log('✅ Admin criado:', TARGET_ADMIN_EMAIL, '| Senha:', defaultPassword);
    } else if (adminUser.role !== 'admin') {
      // Promover para admin
      adminUser.role = 'admin';
      adminUser.perfilData = {
        label: 'Administrador',
        acessos: ['*'],
        descricao: 'Acesso total ao sistema'
      };
      adminUser.acessos = ['*'];
      adminUser.restricoes = [];
      localStorage.setItem('supmed_users_db', JSON.stringify(localUsers));
      console.log('✅ Promovido a admin:', TARGET_ADMIN_EMAIL);
    }
  } catch (error) {
    console.error('Erro ao inicializar auth:', error);
  }
}