import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminCheck() {
  const [adminExists, setAdminExists] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = () => {
    const localUsers = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
    const admins = localUsers.filter(u => u.role === 'admin');
    
    setAdminExists(admins.length > 0);
    
    if (admins.length > 0) {
      setAdminInfo(admins[0]);
    }
  };

  const forceCreateAdmin = () => {
    const TARGET_ADMIN_EMAIL = "tfailevestibular@gmail.com";
    const TARGET_ADMIN_PASSWORD = "eliaft1234";
    
    let localUsers = JSON.parse(localStorage.getItem('supmed_users_db') || '[]');
    let passwordHashes = JSON.parse(localStorage.getItem('supmed_password_hashes') || '{}');
    
    const newAdmin = {
      id: 'admin_manual_' + Date.now(),
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
    
    const hash = btoa(TARGET_ADMIN_PASSWORD + 'supmed_salt_2024');
    passwordHashes[newAdmin.email] = hash;
    
    localStorage.setItem('supmed_users_db', JSON.stringify(localUsers));
    localStorage.setItem('supmed_password_hashes', JSON.stringify(passwordHashes));
    
    checkAdmin();
    alert('Admin criado com sucesso!\nEmail: ' + TARGET_ADMIN_EMAIL + '\nSenha: ' + TARGET_ADMIN_PASSWORD);
  };

  if (!adminExists) {
    return (
      <Card className="bg-red-50 border-red-200 m-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">Sistema sem Administrador</h3>
              <p className="text-xs text-red-700 mb-3">
                Nenhum usuário ADMIN foi encontrado. O sistema precisa de pelo menos um administrador para funcionar.
              </p>
              <Button size="sm" onClick={forceCreateAdmin} className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="w-3 h-3 mr-1" />
                Criar Admin Agora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}