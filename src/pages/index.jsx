import Layout from "./Layout.jsx";

import AcessoMedico from "./AcessoMedico";

import AdminPanel from "./AdminPanel";

import AdminPromote from "./AdminPromote";

import Anamnese from "./Anamnese";

import AttentionSelect from "./AttentionSelect";

import Bulario from "./Bulario";

import Calculadoras from "./Calculadoras";

import CalendarioPlantoes from "./CalendarioPlantoes";

import CasosClinicosInterativos from "./CasosClinicosInterativos";

import Ceatox from "./Ceatox";

import ComunicacaoDificil from "./ComunicacaoDificil";

import Comunidade from "./Comunidade";

import Configuracoes from "./Configuracoes";

import Dashboard from "./Dashboard";

import Dermatologia from "./Dermatologia";

import Diluicao from "./Diluicao";

import DiluicaoMedicamentos from "./DiluicaoMedicamentos";

import ECG from "./ECG";

import Estatisticas from "./Estatisticas";

import Exames from "./Exames";

import ExamesImagem from "./ExamesImagem";

import Ginecologia from "./Ginecologia";

import Guidelines from "./Guidelines";

import GuidelinesProtocolos from "./GuidelinesProtocolos";

import Home from "./Home";

import Infectologia from "./Infectologia";

import Interacoes from "./Interacoes";

import Jornal from "./Jornal";

import ModoEducacional from "./ModoEducacional";

import PainelEditorial from "./PainelEditorial";

import Pediatria from "./Pediatria";

import Plantonista from "./Plantonista";

import PrescricaoDigital from "./PrescricaoDigital";

import Prescricoes from "./Prescricoes";

import Procedimentos from "./Procedimentos";

import Protocolos from "./Protocolos";

import Semiologia from "./Semiologia";

import Vacinacao from "./Vacinacao";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    AcessoMedico: AcessoMedico,
    
    AdminPanel: AdminPanel,
    
    AdminPromote: AdminPromote,
    
    Anamnese: Anamnese,
    
    AttentionSelect: AttentionSelect,
    
    Bulario: Bulario,
    
    Calculadoras: Calculadoras,
    
    CalendarioPlantoes: CalendarioPlantoes,
    
    CasosClinicosInterativos: CasosClinicosInterativos,
    
    Ceatox: Ceatox,
    
    ComunicacaoDificil: ComunicacaoDificil,
    
    Comunidade: Comunidade,
    
    Configuracoes: Configuracoes,
    
    Dashboard: Dashboard,
    
    Dermatologia: Dermatologia,
    
    Diluicao: Diluicao,
    
    DiluicaoMedicamentos: DiluicaoMedicamentos,
    
    ECG: ECG,
    
    Estatisticas: Estatisticas,
    
    Exames: Exames,
    
    ExamesImagem: ExamesImagem,
    
    Ginecologia: Ginecologia,
    
    Guidelines: Guidelines,
    
    GuidelinesProtocolos: GuidelinesProtocolos,
    
    Home: Home,
    
    Infectologia: Infectologia,
    
    Interacoes: Interacoes,
    
    Jornal: Jornal,
    
    ModoEducacional: ModoEducacional,
    
    PainelEditorial: PainelEditorial,
    
    Pediatria: Pediatria,
    
    Plantonista: Plantonista,
    
    PrescricaoDigital: PrescricaoDigital,
    
    Prescricoes: Prescricoes,
    
    Procedimentos: Procedimentos,
    
    Protocolos: Protocolos,
    
    Semiologia: Semiologia,
    
    Vacinacao: Vacinacao,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<AcessoMedico />} />
                
                
                <Route path="/AcessoMedico" element={<AcessoMedico />} />
                
                <Route path="/AdminPanel" element={<AdminPanel />} />
                
                <Route path="/AdminPromote" element={<AdminPromote />} />
                
                <Route path="/Anamnese" element={<Anamnese />} />
                
                <Route path="/AttentionSelect" element={<AttentionSelect />} />
                
                <Route path="/Bulario" element={<Bulario />} />
                
                <Route path="/Calculadoras" element={<Calculadoras />} />
                
                <Route path="/CalendarioPlantoes" element={<CalendarioPlantoes />} />
                
                <Route path="/CasosClinicosInterativos" element={<CasosClinicosInterativos />} />
                
                <Route path="/Ceatox" element={<Ceatox />} />
                
                <Route path="/ComunicacaoDificil" element={<ComunicacaoDificil />} />
                
                <Route path="/Comunidade" element={<Comunidade />} />
                
                <Route path="/Configuracoes" element={<Configuracoes />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Dermatologia" element={<Dermatologia />} />
                
                <Route path="/Diluicao" element={<Diluicao />} />
                
                <Route path="/DiluicaoMedicamentos" element={<DiluicaoMedicamentos />} />
                
                <Route path="/ECG" element={<ECG />} />
                
                <Route path="/Estatisticas" element={<Estatisticas />} />
                
                <Route path="/Exames" element={<Exames />} />
                
                <Route path="/ExamesImagem" element={<ExamesImagem />} />
                
                <Route path="/Ginecologia" element={<Ginecologia />} />
                
                <Route path="/Guidelines" element={<Guidelines />} />
                
                <Route path="/GuidelinesProtocolos" element={<GuidelinesProtocolos />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Infectologia" element={<Infectologia />} />
                
                <Route path="/Interacoes" element={<Interacoes />} />
                
                <Route path="/Jornal" element={<Jornal />} />
                
                <Route path="/ModoEducacional" element={<ModoEducacional />} />
                
                <Route path="/PainelEditorial" element={<PainelEditorial />} />
                
                <Route path="/Pediatria" element={<Pediatria />} />
                
                <Route path="/Plantonista" element={<Plantonista />} />
                
                <Route path="/PrescricaoDigital" element={<PrescricaoDigital />} />
                
                <Route path="/Prescricoes" element={<Prescricoes />} />
                
                <Route path="/Procedimentos" element={<Procedimentos />} />
                
                <Route path="/Protocolos" element={<Protocolos />} />
                
                <Route path="/Semiologia" element={<Semiologia />} />
                
                <Route path="/Vacinacao" element={<Vacinacao />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}