// Componente auxiliar para navegação entre módulos
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowRight } from 'lucide-react';
import { ROUTES, createRouteUrl, navigateTo } from '@/utils/navigation';

// Botão de navegação para Plantonista (com aba específica)
export const GoToPlantonistaButton = ({ tab = 'pesquisa', children, variant = 'outline', className = '' }) => {
  const url = createRouteUrl(ROUTES.PLANTONISTA, { tab });
  
  return (
    <Link to={url}>
      <Button variant={variant} size="sm" className={className}>
        {children}
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </Link>
  );
};

// Botão de navegação para Scores (com score específico)
export const GoToScoreButton = ({ scoreId, children, variant = 'outline', className = '' }) => {
  const url = createRouteUrl(ROUTES.SCORES, { score: scoreId });
  
  return (
    <Link to={url}>
      <Button variant={variant} size="sm" className={className}>
        {children}
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </Link>
  );
};

// Badge clicável para navegar a score
export const ScoreBadge = ({ scoreId, children, className = '' }) => {
  const url = createRouteUrl(ROUTES.SCORES, { score: scoreId });
  
  return (
    <Link to={url}>
      <Badge className={`cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
        {children}
        <ExternalLink className="w-2.5 h-2.5 ml-1" />
      </Badge>
    </Link>
  );
};

// Link genérico para qualquer rota
export const RouteLink = ({ route, params = {}, children, className = '' }) => {
  const url = createRouteUrl(route, params);
  
  return (
    <Link to={url} className={className}>
      {children}
    </Link>
  );
};

// Hook para navegação programática
export const useAppNavigation = () => {
  const navigate = useNavigate();
  
  return {
    goToPlantonistaTab: (tab) => navigateTo(navigate, ROUTES.PLANTONISTA, { tab }),
    goToScore: (scoreId) => navigateTo(navigate, ROUTES.SCORES, { score: scoreId }),
    goToRoute: (route, params = {}) => navigateTo(navigate, route, params),
  };
};