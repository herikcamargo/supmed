import React, { createContext, useContext, useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Puzzle, 
  Download, 
  Trash2, 
  Settings,
  CheckCircle2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

// Context para gerenciar plugins
const PluginContext = createContext();

// Registro de plugins disponíveis
const availablePlugins = [
  {
    id: 'telemedicina',
    nome: 'Telemedicina',
    descricao: 'Integração com plataformas de teleconsulta',
    versao: '1.0.0',
    autor: 'SUPMED',
    categoria: 'comunicacao',
    status: 'stable'
  },
  {
    id: 'pacs_viewer',
    nome: 'Visualizador PACS',
    descricao: 'Visualização de exames DICOM',
    versao: '0.9.0',
    autor: 'SUPMED',
    categoria: 'imagem',
    status: 'beta'
  },
  {
    id: 'voice_input',
    nome: 'Entrada por Voz',
    descricao: 'Ditado para anamnese e prescrição',
    versao: '1.1.0',
    autor: 'SUPMED',
    categoria: 'acessibilidade',
    status: 'stable'
  },
  {
    id: 'ai_triage',
    nome: 'Triagem IA Avançada',
    descricao: 'Machine learning para classificação de risco',
    versao: '0.8.0',
    autor: 'SUPMED Labs',
    categoria: 'inteligencia',
    status: 'experimental'
  },
  {
    id: 'pharmacy_integration',
    nome: 'Integração Farmácia',
    descricao: 'Envio direto de prescrições para farmácia',
    versao: '1.0.0',
    autor: 'SUPMED',
    categoria: 'integracao',
    status: 'stable'
  },
  {
    id: 'lab_results',
    nome: 'Resultados Laboratoriais',
    descricao: 'Importação automática de exames',
    versao: '1.2.0',
    autor: 'SUPMED',
    categoria: 'integracao',
    status: 'stable'
  }
];

// Provider do sistema de plugins
export function PluginProvider({ children }) {
  const [installedPlugins, setInstalledPlugins] = useState([]);
  const [pluginConfigs, setPluginConfigs] = useState({});

  useEffect(() => {
    // Carregar plugins instalados
    const installed = JSON.parse(localStorage.getItem('supmed_plugins') || '[]');
    const configs = JSON.parse(localStorage.getItem('supmed_plugin_configs') || '{}');
    setInstalledPlugins(installed);
    setPluginConfigs(configs);
  }, []);

  const installPlugin = (pluginId) => {
    const newInstalled = [...installedPlugins, pluginId];
    setInstalledPlugins(newInstalled);
    localStorage.setItem('supmed_plugins', JSON.stringify(newInstalled));
    
    // Configuração padrão
    const newConfigs = { ...pluginConfigs, [pluginId]: { enabled: true } };
    setPluginConfigs(newConfigs);
    localStorage.setItem('supmed_plugin_configs', JSON.stringify(newConfigs));
  };

  const uninstallPlugin = (pluginId) => {
    const newInstalled = installedPlugins.filter(id => id !== pluginId);
    setInstalledPlugins(newInstalled);
    localStorage.setItem('supmed_plugins', JSON.stringify(newInstalled));
    
    const newConfigs = { ...pluginConfigs };
    delete newConfigs[pluginId];
    setPluginConfigs(newConfigs);
    localStorage.setItem('supmed_plugin_configs', JSON.stringify(newConfigs));
  };

  const togglePlugin = (pluginId) => {
    const newConfigs = {
      ...pluginConfigs,
      [pluginId]: {
        ...pluginConfigs[pluginId],
        enabled: !pluginConfigs[pluginId]?.enabled
      }
    };
    setPluginConfigs(newConfigs);
    localStorage.setItem('supmed_plugin_configs', JSON.stringify(newConfigs));
  };

  const isPluginEnabled = (pluginId) => {
    return installedPlugins.includes(pluginId) && pluginConfigs[pluginId]?.enabled;
  };

  return (
    <PluginContext.Provider value={{
      availablePlugins,
      installedPlugins,
      pluginConfigs,
      installPlugin,
      uninstallPlugin,
      togglePlugin,
      isPluginEnabled
    }}>
      {children}
    </PluginContext.Provider>
  );
}

export const usePlugins = () => useContext(PluginContext);

// Componente de gerenciamento de plugins
export function PluginManager({ isOpen, onClose }) {
  const { 
    availablePlugins, 
    installedPlugins, 
    pluginConfigs,
    installPlugin, 
    uninstallPlugin, 
    togglePlugin 
  } = usePlugins();

  if (!isOpen) return null;

  const statusColors = {
    stable: 'bg-green-100 text-green-700',
    beta: 'bg-yellow-100 text-yellow-700',
    experimental: 'bg-red-100 text-red-700'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Puzzle className="w-5 h-5 text-violet-500" />
              <h2 className="text-sm font-semibold">Gerenciador de Plugins</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {availablePlugins.map((plugin) => {
              const isInstalled = installedPlugins.includes(plugin.id);
              const isEnabled = pluginConfigs[plugin.id]?.enabled;
              
              return (
                <Card key={plugin.id} className="bg-slate-50 border border-slate-200">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-800">{plugin.nome}</span>
                          <Badge className={`text-[8px] ${statusColors[plugin.status]}`}>
                            {plugin.status}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500">v{plugin.versao} • {plugin.autor}</p>
                      </div>
                      {isInstalled && (
                        <Switch 
                          checked={isEnabled} 
                          onCheckedChange={() => togglePlugin(plugin.id)}
                        />
                      )}
                    </div>
                    
                    <p className="text-[10px] text-slate-600 mb-3">{plugin.descricao}</p>
                    
                    <div className="flex gap-2">
                      {isInstalled ? (
                        <>
                          <Button size="sm" variant="outline" className="h-6 text-[10px] flex-1">
                            <Settings className="w-3 h-3 mr-1" /> Configurar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 text-[10px] text-red-600"
                            onClick={() => uninstallPlugin(plugin.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button 
                          size="sm" 
                          className="h-6 text-[10px] w-full bg-violet-600 hover:bg-violet-700"
                          onClick={() => installPlugin(plugin.id)}
                        >
                          <Download className="w-3 h-3 mr-1" /> Instalar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default { PluginProvider, PluginManager, usePlugins };