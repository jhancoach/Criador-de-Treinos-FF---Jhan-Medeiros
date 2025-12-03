import React, { useState, useEffect, useMemo, ErrorInfo, useRef, Component, ReactNode } from 'react';
import { Users, Trophy, Crown, AlertTriangle, ArrowRight, ArrowLeft, Home, Download, RefreshCw, BarChart2, Save, Trash2, Edit2, Play, LayoutGrid, HelpCircle, X, Info, FileText, Instagram, Eye, Check, Palette, Monitor, Moon, Sun, Medal, Target, Flame, Share2, Calendar, Upload, ChevronLeft, ChevronRight, Maximize, Printer, UserPlus, ChevronDown, ChevronUp, Zap, UploadCloud, Binary, Image, Globe, Search, Layers, Copy, MessageCircle, ListPlus, Lock, Unlock, UserCheck, ClipboardList, Map as MapIcon, ShieldCheck, Share, Smartphone, MousePointer2, Languages, Share as ShareIcon } from 'lucide-react';
import { Team, TrainingMode, Step, MapData, MatchScore, ProcessedScore, Position, POINTS_SYSTEM, PlayerStats, SavedTrainingSession, OpenTraining, TrainingRequest, Language, ReplayEvent, PlayerAnalysis } from './types';
import { MAPS, WARNINGS } from './constants';
import { Button } from './components/Button';
import { DraggableMap } from './components/DraggableMap';
import { Tooltip } from './components/Tooltip';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import * as htmlToImage from 'html-to-image';

// Theme Configuration
const THEMES = [
  { name: 'Yellow', color: '255 212 0', hex: '#FFD400' },
  { name: 'Blue', color: '59 130 246', hex: '#3B82F6' },
  { name: 'Red', color: '239 68 68', hex: '#EF4444' },
  { name: 'Green', color: '34 197 94', hex: '#22C55E' },
  { name: 'Purple', color: '168 85 247', hex: '#A855F7' },
];

const TEAM_COLORS = [
    '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', 
    '#007AFF', '#5856D6', '#FF2D55', '#A2845E', '#8E8E93',
    '#E056FD', '#22A6B3', '#F0932B', '#6AB04C', '#EB4D4B'
];

const PT_TRANSLATIONS = {
    steps: { teams: 'Times', maps: 'Mapas', calls: 'Calls', scoring: 'Pontos', results: 'Resultados' },
    hero: { subtitle: 'v2.0 - Edição Competitiva', title1: 'CRIADOR DE', title2: 'TREINOS', desc: 'A ferramenta definitiva para gestão de treinos de Free Fire. Estratégia, pontuação e análise em um só lugar.', start: 'COMEÇAR AGORA', queue: 'FILA', hub: 'Hub Público', restore: 'Restaurar Sessão', footer: 'Desenvolvido por Jhan Medeiros' },
    features: { maps: 'Estratégia Visual', teams: 'Gestão Completa', stats: 'Rankings Auto', share: 'Relatórios Prontos' },
    mode: { title: 'SELECIONE O MODO', basic: 'Básico', basicDesc: 'Ideal para treinos rápidos. Defina calls por nome de cidade.', premium: 'Premium', premiumDesc: 'Mapa interativo para posicionar times visualmente.', premiumPlus: 'Premium Plus', premiumPlusDesc: 'Importação de Replays JSON para estatísticas avançadas.', recommended: 'RECOMENDADO', feats: { cityList: 'Lista de Cidades', mapSort: 'Sorteio de Mapas', scoreTable: 'Tabela de Pontos', interactive: 'Mapas Interativos', dragDrop: 'Drag & Drop de Times', replay: 'Leitura de Replay (JSON)', mvp: 'MVP & Dano Total' } },
    register: { title: 'REGISTRO DE TIMES', placeholder: 'Nome do Time...', add: 'ADICIONAR', next: 'PRÓXIMO', empty: 'Nenhum time adicionado.', copied: 'Copiado!', shareLineup: 'Compartilhar Escalação' },
    waiting: { title: 'LISTA DE ESPERA', adminArea: 'Área do Organizador', yourName: 'Seu Nome/Nick', trainingName: 'Nome do Treino', pin: 'PIN de Segurança (ex: 1234)', create: 'CRIAR LISTA', successCreate: 'Lista de espera criada com sucesso!', requestTitle: 'Solicitar Vaga', selectTraining: 'Selecione um Treino...', yourTeam: 'Nome do Seu Time', sendRequest: 'ENVIAR SOLICITAÇÃO', successRequest: 'Solicitação enviada!', queue: 'Times na Fila', generate: 'GERAR TREINO', delete: 'Tem certeza que deseja apagar esta lista?' },
    hub: { title: 'HUB DE TREINOS', desc: 'Seu Histórico de Sessões', descText: 'Este é o seu banco de dados local. Aqui ficam armazenados os treinos que você salvou manualmente na tela de Resultados. Utilize o Hub para revisar pontuações passadas, analisar o desempenho dos times ou carregar uma configuração antiga para iniciar um novo treino rapidamente.', info: 'Os dados são salvos no cache deste navegador.', empty: 'Nenhum treino salvo encontrado', load: 'Carregar este treino', delete: 'Excluir permanentemente', confirmLoad: 'Carregar este treino substituirá os dados atuais. Continuar?', emptyDesc: 'Para ver seus treinos aqui, clique em "Publicar no Hub" na tela de Resultados após finalizar uma sessão.' },
    sort: { title: 'SORTEIO DE MAPAS', spin: 'SORTEAR MAPAS', respin: 'SORTEAR NOVAMENTE', strategy: 'DEFINIR ESTRATÉGIA' },
    strategy: { title: 'DEFINIÇÃO DE CALLS', import: 'Importar', saveJson: 'JSON', saveImg: 'Imagem', scoring: 'PONTUAÇÃO', match: 'Queda', select: 'Selecione...', free: 'LIVRE' },
    scoring: { title: 'PUNTUAÇÃO', rank: 'Rank #', kills: 'Kills', loadReplay: 'Cargar Replay (.json)', results: 'VER RESULTADOS' },
    report: { title: 'RELATÓRIO & COMPARTILHAMENTO', view: 'Visualização', raw: 'Texto Formatado', copy: 'Copiar Relatório', whatsapp: 'Enviar no WhatsApp', copied: 'Relatório copiado!', warnings: 'AVISOS', top3: 'TOP 3 ATUAL' },
    dashboard: { title: 'RESULTADOS & ESTATÍSTICAS', tabRank: 'CLASSIFICAÇÃO', tabMvp: 'MVP & STATS', social: 'Compartilhar', saveHub: 'Publicar no Hub', table: { team: 'Time', total: 'Pts Totais', pos: 'Posição (Pts)', killPts: 'Kills (Pts)', booyah: 'Booyahs', last: 'Última Queda', player: 'Jogador', mvpScore: 'MVP Score', damage: 'Dano', time: 'Tempo Vivo' }, emptyPlayer: 'Nenhum dado de jogador registrado ainda. Use o modo Premium Plus ou insira kills manualmente.', resultTitle: 'RESULTADO FINAL', points: 'PONTOS' },
    viewer: { ranking: 'RANKING', drops: 'DROPS', exit: 'Sair' },
    common: { error: 'Ops! Algo deu errado.', reload: 'Recarregar Página', back: 'Voltar', home: 'Ir para Início', draft: 'Salvar Rascunho', help: 'Ajuda', theme: 'Cor Destaque', language: 'Idioma', dark: 'Modo Escuro', light: 'Modo Claro', confirmHome: 'Tem certeza? Todo o progresso não salvo pode ser perdido.', draftSaved: 'Rascunho salvo no navegador!', draftLoaded: 'Rascunho carregado com sucesso!', yes: 'Sim', no: 'Não', cancel: 'Cancelar', overview: 'Visão Geral', howTo: 'Como Usar', interactiveMap: 'Mapa Interativo' }
};

const EN_TRANSLATIONS = {
    steps: { teams: 'Teams', maps: 'Maps', calls: 'Strategy', scoring: 'Scoring', results: 'Results' },
    hero: { subtitle: 'v2.0 - Competitive Edition', title1: 'TRAINING', title2: 'CREATOR', desc: 'The ultimate tool for Free Fire training management. Strategy, scoring, and analysis in one place.', start: 'START NOW', queue: 'QUEUE', hub: 'Public Hub', restore: 'Restore Session', footer: 'Developed by Jhan Medeiros' },
    features: { maps: 'Visual Strategy', teams: 'Full Management', stats: 'Auto Rankings', share: 'Ready Reports' },
    mode: { title: 'SELECT MODE', basic: 'Basic', basicDesc: 'Ideal for quick trainings. Define calls by city name.', premium: 'Premium', premiumDesc: 'Interactive map to position teams visually.', premiumPlus: 'Premium Plus', premiumPlusDesc: 'JSON Replay Import for advanced statistics.', recommended: 'RECOMMENDED', feats: { cityList: 'City List', mapSort: 'Map Sort', scoreTable: 'Score Table', interactive: 'Interactive Maps', dragDrop: 'Team Drag & Drop', replay: 'Replay Reading (JSON)', mvp: 'MVP & Total Damage' } },
    register: { title: 'TEAM REGISTRATION', placeholder: 'Team Name...', add: 'ADD', next: 'NEXT', empty: 'No teams added.', copied: 'Copied!', shareLineup: 'Share Lineup' },
    waiting: { title: 'WAITING LIST', adminArea: 'Organizer Area', yourName: 'Your Name/Nick', trainingName: 'Training Name', pin: 'Security PIN (e.g. 1234)', create: 'CREATE LIST', successCreate: 'Waiting list created successfully!', requestTitle: 'Request Entry', selectTraining: 'Select Training...', yourTeam: 'Your Team Name', sendRequest: 'SEND REQUEST', successRequest: 'Request sent!', queue: 'Teams in Queue', generate: 'GENERATE TRAINING', delete: 'Are you sure you want to delete this list?' },
    hub: { title: 'TRAINING HUB', desc: 'Your Session History', descText: 'This is your local database. Trainings manually saved from the Results screen are stored here. Use the Hub to review past scores, analyze team performance, or load an old configuration to quickly start a new training.', info: 'Data is saved in this browser\'s cache.', empty: 'No saved trainings found', load: 'Load this training', delete: 'Delete permanently', confirmLoad: 'Loading this training will replace current data. Continue?', emptyDesc: 'To see your trainings here, click "Publish to Hub" on the Results screen after finishing a session.' },
    sort: { title: 'MAP SORT', spin: 'SPIN MAPS', respin: 'SPIN AGAIN', strategy: 'DEFINE STRATEGY' },
    strategy: { title: 'STRATEGY DEFINITION', import: 'Import', saveJson: 'JSON', saveImg: 'Image', scoring: 'SCORING', match: 'Match', select: 'Select...', free: 'FREE' },
    scoring: { title: 'SCORING', rank: 'Rank #', kills: 'Kills', loadReplay: 'Load Replay (.json)', results: 'VIEW RESULTS' },
    report: { title: 'REPORT & SHARE', view: 'Preview', raw: 'Formatted Text', copy: 'Copy Report', whatsapp: 'Send on WhatsApp', copied: 'Report copied!', warnings: 'WARNINGS', top3: 'CURRENT TOP 3' },
    dashboard: { title: 'RESULTS & STATISTICS', tabRank: 'LEADERBOARD', tabMvp: 'MVP & STATS', social: 'Share', saveHub: 'Publish to Hub', table: { team: 'Team', total: 'Total Pts', pos: 'Pos (Pts)', killPts: 'Kills (Pts)', booyah: 'Booyahs', last: 'Last Match', player: 'Player', mvpScore: 'MVP Score', damage: 'Damage', time: 'Time Alive' }, emptyPlayer: 'No player data yet. Use Premium Plus mode or enter kills manually.', resultTitle: 'FINAL RESULT', points: 'POINTS' },
    viewer: { ranking: 'RANKING', drops: 'DROPS', exit: 'Exit' },
    common: { error: 'Oops! Something went wrong.', reload: 'Reload Page', back: 'Back', home: 'Go Home', draft: 'Save Draft', help: 'Help', theme: 'Accent Color', language: 'Language', dark: 'Dark Mode', light: 'Light Mode', confirmHome: 'Are you sure? All unsaved progress may be lost.', draftSaved: 'Draft saved in browser!', draftLoaded: 'Draft loaded successfully!', yes: 'Yes', no: 'No', cancel: 'Cancel', overview: 'Overview', howTo: 'How to Use', interactiveMap: 'Interactive Map' }
};

const ES_TRANSLATIONS = {
    steps: { teams: 'Equipos', maps: 'Mapas', calls: 'Calls', scoring: 'Puntos', results: 'Resultados' },
    hero: { subtitle: 'v2.0 - Edición Competitiva', title1: 'CREADOR DE', title2: 'ENTRENAMIENTOS', desc: 'La herramienta definitiva para gestión de entrenamientos de Free Fire. Estrategia, puntuación y análisis en un solo lugar.', start: 'EMPEZAR AHORA', queue: 'COLA', hub: 'Hub Público', restore: 'Restaurar Sesión', footer: 'Desarrollado por Jhan Medeiros' },
    features: { maps: 'Estrategia Visual', teams: 'Gestión Completa', stats: 'Rankings Auto', share: 'Reportes Listos' },
    mode: { title: 'SELECCIONAR MODO', basic: 'Básico', basicDesc: 'Ideal para entrenamientos rápidos. Define calls por nombre de ciudad.', premium: 'Premium', premiumDesc: 'Mapa interactivo para posicionar equipos visualmente.', premiumPlus: 'Premium Plus', premiumPlusDesc: 'Importación de Replays JSON para estadísticas avanzadas.', recommended: 'RECOMENDADO', feats: { cityList: 'Lista de Ciudades', mapSort: 'Sorteo de Mapas', scoreTable: 'Tabla de Puntos', interactive: 'Mapas Interactivos', dragDrop: 'Drag & Drop de Equipos', replay: 'Lectura de Replay (JSON)', mvp: 'MVP y Daño Total' } },
    register: { title: 'REGISTRO DE EQUIPOS', placeholder: 'Nombre del Equipo...', add: 'AGREGAR', next: 'SIGUIENTE', empty: 'Ningún equipo agregado.', copied: '¡Copiado!', shareLineup: 'Compartir Alineación' },
    waiting: { title: 'LISTA DE ESPERA', adminArea: 'Área del Organizador', yourName: 'Tu Nombre/Nick', trainingName: 'Nombre del Entrenamiento', pin: 'PIN de Seguridad (ej: 1234)', create: 'CREAR LISTA', successCreate: '¡Lista de espera creada con éxito!', requestTitle: 'Solicitar Cupo', selectTraining: 'Selecciona un Entrenamiento...', yourTeam: 'Nombre de tu Equipo', sendRequest: 'ENVIAR SOLICITUD', successRequest: '¡Solicitud enviada!', queue: 'Equipos en Cola', generate: 'GENERAR ENTRENAMIENTO', delete: '¿Seguro que deseas eliminar esta lista?' },
    hub: { title: 'HUB DE ENTRENAMIENTOS', desc: 'Tu Historial de Sesiones', descText: 'Esta es tu base de datos local. Aquí se almacenan los entrenamientos guardados manualmente desde la pantalla de Resultados. Utiliza el Hub para revisar puntuaciones pasadas, analizar el rendimiento de los equipos o cargar una configuración antigua para iniciar un nuevo entrenamiento rápidamente.', info: 'Los datos se guardan en la caché de este navegador.', empty: 'No se encontraron entrenamientos guardados', load: 'Cargar este entrenamiento', delete: 'Eliminar permanentemente', confirmLoad: 'Cargar este entrenamiento reemplazará los datos actuales. ¿Continuar?', emptyDesc: 'Para ver tus entrenamientos aquí, haz clic en "Publicar en Hub" en la pantalla de Resultados después de finalizar una sesión.' },
    sort: { title: 'SORTEO DE MAPAS', spin: 'SORTEAR MAPAS', respin: 'SORTEAR NUEVAMENTE', strategy: 'DEFINIR ESTRATEGIA' },
    strategy: { title: 'DEFINICIÓN DE CALLS', import: 'Importar', saveJson: 'JSON', saveImg: 'Imagem', scoring: 'PUNTUACIÓN', match: 'Partida', select: 'Seleccione...', free: 'LIBRE' },
    scoring: { title: 'PUNTUACIÓN', rank: 'Rank #', kills: 'Kills', loadReplay: 'Cargar Replay (.json)', results: 'VER RESULTADOS' },
    report: { title: 'REPORTE Y COMPARTIR', view: 'Vista Previa', raw: 'Texto Formateado', copy: 'Copiar Reporte', whatsapp: 'Enviar en WhatsApp', copied: '¡Reporte copiado!', warnings: 'AVISOS', top3: 'TOP 3 ACTUAL' },
    dashboard: { title: 'RESULTADOS Y ESTADÍSTICAS', tabRank: 'CLASIFICACIÓN', tabMvp: 'MVP Y STATS', social: 'Compartir', saveHub: 'Publicar en Hub', table: { team: 'Equipo', total: 'Pts Totales', pos: 'Pos (Pts)', killPts: 'Kills (Pts)', booyah: 'Booyahs', last: 'Última Partida', player: 'Jugador', mvpScore: 'MVP Score', damage: 'Daño', time: 'Tiempo Vivo' }, emptyPlayer: 'Aún no hay datos de jugadores. Usa el modo Premium Plus o ingresa kills manualmente.', resultTitle: 'RESULTADO FINAL', points: 'PUNTOS' },
    viewer: { ranking: 'RANKING', drops: 'DROPS', exit: 'Salir' },
    common: { error: '¡Ups! Algo salió mal.', reload: 'Recargar Página', back: 'Volver', home: 'Ir al Inicio', draft: 'Guardar Borrador', help: 'Ayuda', theme: 'Color Destacado', language: 'Idioma', dark: 'Modo Oscuro', light: 'Modo Claro', confirmHome: '¿Estás seguro? Todo el progreso no guardado se perderá.', draftSaved: '¡Borrador guardado en el navegador!', draftLoaded: '¡Borrador cargado con éxito!', yes: 'Sí', no: 'No', cancel: 'Cancelar', overview: 'Visión General', howTo: 'Cómo Usar', interactiveMap: 'Mapa Interativo' }
};

const TRANSLATIONS = {
  pt: PT_TRANSLATIONS,
  en: EN_TRANSLATIONS,
  es: ES_TRANSLATIONS
};

const STEPS_FLOW = [
    { id: Step.TEAM_REGISTER, labelKey: 'teams', icon: Users },
    { id: Step.MAP_SORT, labelKey: 'maps', icon: Globe },
    { id: Step.STRATEGY, labelKey: 'calls', icon: Target },
    { id: Step.SCORING, labelKey: 'scoring', icon: Edit2 },
    { id: Step.DASHBOARD, labelKey: 'results', icon: BarChart2 },
];

// Error Boundary Component
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado.</h1>
          <p className="text-gray-400 mb-4 max-w-md">Ocorreu um erro inesperado na aplicação.</p>
          <div className="bg-gray-900 p-4 rounded text-left overflow-auto max-w-full text-xs font-mono text-red-300 border border-red-900 mb-4">
            {this.state.error?.message}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-yellow-500 text-black font-bold rounded hover:opacity-90 transition"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // --- State ---
  const [step, setStep] = useState<Step>(Step.HOME);
  const [mode, setMode] = useState<TrainingMode>('basic');
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [trainingName, setTrainingName] = useState('Treino Competitivo');
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState<Language>('pt');
  
  const t = TRANSLATIONS[lang];

  // Modals & UI State
  const [showHelp, setShowHelp] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [showStrategyVisualizer, setShowStrategyVisualizer] = useState(false);
  const [showSocialBanner, setShowSocialBanner] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null); // For scoring details
  const [hasDraft, setHasDraft] = useState(false);
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null); // Feedback for share button
  
  // Waiting List State
  const [openTrainings, setOpenTrainings] = useState<OpenTraining[]>([]);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  // Waiting List Form Data
  const [wlAdminName, setWlAdminName] = useState('');
  const [wlTrainingName, setWlTrainingName] = useState('');
  const [wlPin, setWlPin] = useState('');
  const [wlTeamRequestName, setWlTeamRequestName] = useState('');
  const [wlUnlockPin, setWlUnlockPin] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  // Strategy State
  const [shuffledMaps, setShuffledMaps] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [basicSelections, setBasicSelections] = useState<Record<string, Record<string, string>>>({});
  const [premiumPositions, setPremiumPositions] = useState<Record<string, Record<string, Position>>>({});
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);
  const [activeStrategyMapIndex, setActiveStrategyMapIndex] = useState(0); // For mobile view
  const strategyRef = useRef<HTMLDivElement>(null); // For downloading strategy image

  // Scoring State
  const [matchScores, setMatchScores] = useState<Record<number, Record<string, MatchScore>>>({});
  const [currentMatchTab, setCurrentMatchTab] = useState(0);
  const replayInputRef = useRef<HTMLInputElement>(null);
  
  // Extended Stats for Premium Plus
  const [playerExtendedStats, setPlayerExtendedStats] = useState<Record<string, PlayerAnalysis>>({});

  // Dashboard State
  const [dashboardTab, setDashboardTab] = useState<'leaderboard' | 'mvp'>('leaderboard');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null); // For logo uploads
  const [activeTeamIdForLogo, setActiveTeamIdForLogo] = useState<string | null>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  
  // Viewer Mode State
  const [viewerTab, setViewerTab] = useState<'ranking' | 'drops'>('ranking');

  // Public Hub State
  const [savedTrainings, setSavedTrainings] = useState<SavedTrainingSession[]>([]);

  // --- Effects ---
  useEffect(() => {
    // Apply Theme to CSS Variables
    document.documentElement.style.setProperty('--color-primary', activeTheme.color);
  }, [activeTheme]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
      // Load saved trainings on mount
      const savedHub = localStorage.getItem('jhantraining_hub_data');
      if (savedHub) {
          try {
              setSavedTrainings(JSON.parse(savedHub));
          } catch (e) {
              console.error("Failed to load hub data", e);
          }
      }
      
      // Load waiting list
      const savedWaiting = localStorage.getItem('jhantraining_waiting_list');
      if (savedWaiting) {
          try {
              setOpenTrainings(JSON.parse(savedWaiting));
          } catch (e) { console.error(e) }
      }

      // Check draft
      if (localStorage.getItem('jhantraining_draft')) {
          setHasDraft(true);
      }
  }, []);

  // --- Navigation Handlers ---
  const handleBack = () => {
    switch(step) {
      case Step.WAITING_LIST: setStep(Step.HOME); break;
      case Step.PUBLIC_HUB: setStep(Step.HOME); break;
      case Step.MODE_SELECT: setStep(Step.HOME); break;
      case Step.TEAM_REGISTER: setStep(Step.MODE_SELECT); break;
      case Step.MAP_SORT: setStep(Step.TEAM_REGISTER); break;
      case Step.STRATEGY: setStep(Step.MAP_SORT); break;
      case Step.SCORING: setStep(Step.STRATEGY); break;
      case Step.REPORT: setStep(Step.SCORING); break;
      case Step.DASHBOARD: setStep(Step.SCORING); break;
      case Step.VIEWER: setStep(Step.DASHBOARD); break;
      default: break;
    }
  };

  const handleHome = () => {
    if (teams.length > 0) {
      if (window.confirm(t.common.confirmHome)) {
        setStep(Step.HOME);
      }
    } else {
      setStep(Step.HOME);
    }
  };

  const handleStart = () => setStep(Step.MODE_SELECT);

  const selectMode = (m: TrainingMode) => {
    setMode(m);
    setStep(Step.TEAM_REGISTER);
  };

  // --- Waiting List Logic ---
  const createWaitingTraining = () => {
      if (!wlAdminName || !wlTrainingName || !wlPin) {
          alert(t.common.error);
          return;
      }
      const newTraining: OpenTraining = {
          id: Date.now().toString(),
          adminName: wlAdminName,
          trainingName: wlTrainingName,
          adminPin: wlPin,
          requests: [],
          createdAt: Date.now()
      };
      const updated = [newTraining, ...openTrainings];
      setOpenTrainings(updated);
      localStorage.setItem('jhantraining_waiting_list', JSON.stringify(updated));
      
      setWlAdminName('');
      setWlTrainingName('');
      setWlPin('');
      alert(t.waiting.successCreate);
  };

  const requestEntryToTraining = () => {
      if (!selectedTrainingId || !wlTeamRequestName.trim()) return;
      
      const updated = openTrainings.map(training => {
          if (training.id === selectedTrainingId) {
              if (training.requests.some(r => r.teamName.toLowerCase() === wlTeamRequestName.toLowerCase())) {
                  alert(t.common.error);
                  return training;
              }
              const newReq: TrainingRequest = {
                  id: Date.now().toString(),
                  teamName: wlTeamRequestName,
                  timestamp: Date.now()
              };
              return { ...training, requests: [...training.requests, newReq] };
          }
          return training;
      });
      
      setOpenTrainings(updated);
      localStorage.setItem('jhantraining_waiting_list', JSON.stringify(updated));
      setWlTeamRequestName('');
      alert(t.waiting.successRequest);
  };

  const deleteWaitingTraining = (id: string) => {
      if (!window.confirm(t.waiting.delete)) return;
      const updated = openTrainings.filter(t => t.id !== id);
      setOpenTrainings(updated);
      localStorage.setItem('jhantraining_waiting_list', JSON.stringify(updated));
      setSelectedTrainingId(null);
      setIsAdminUnlocked(false);
  };

  const checkAdminPin = (training: OpenTraining) => {
      if (wlUnlockPin === training.adminPin) {
          setIsAdminUnlocked(true);
          setWlUnlockPin('');
      } else {
          alert("PIN Incorreto!");
      }
  };

  const importWaitingListToApp = (training: OpenTraining) => {
      if (!window.confirm(t.hub.confirmLoad)) return;
      
      const newTeams: Team[] = training.requests.slice(0, 15).map(req => ({
          id: req.id,
          name: req.teamName,
          color: getRandomColor(),
          players: []
      }));

      setTeams(newTeams);
      setTrainingName(training.trainingName);
      setMode('basic'); 
      setStep(Step.TEAM_REGISTER); 
  };

  // --- Draft System ---
  const saveDraft = () => {
      const data = {
          trainingName,
          mode,
          teams,
          shuffledMaps,
          basicSelections,
          premiumPositions,
          selectedWarnings,
          matchScores,
          playerExtendedStats,
          step 
      };
      localStorage.setItem('jhantraining_draft', JSON.stringify(data));
      setHasDraft(true);
      alert(t.common.draftSaved);
  };

  const loadDraft = () => {
       const draft = localStorage.getItem('jhantraining_draft');
       if (draft) {
           try {
               const data = JSON.parse(draft);
               if(data.trainingName) setTrainingName(data.trainingName);
               if(data.mode) setMode(data.mode);
               if(data.teams) setTeams(data.teams);
               if(data.shuffledMaps) setShuffledMaps(data.shuffledMaps);
               if(data.basicSelections) setBasicSelections(data.basicSelections);
               if(data.premiumPositions) setPremiumPositions(data.premiumPositions);
               if(data.selectedWarnings) setSelectedWarnings(data.selectedWarnings);
               if(data.matchScores) setMatchScores(data.matchScores);
               if(data.playerExtendedStats) setPlayerExtendedStats(data.playerExtendedStats);
               if(data.step) setStep(data.step);
               alert(t.common.draftLoaded);
           } catch(e) {
               console.error(e);
               alert(t.common.error);
           }
       }
  };

  // --- Logic Helpers ---
  const getRandomColor = () => {
      return TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
  }

  const addTeam = () => {
    if (newTeamName.trim() && teams.length < 15) {
      setTeams([...teams, { 
          id: `${Date.now()}${Math.random()}`, 
          name: newTeamName.trim(),
          color: getRandomColor(),
          players: []
      }]);
      setNewTeamName('');
    }
  };

  const confirmDeleteTeam = (id: string) => {
    setTeamToDelete(id);
  };

  const executeDeleteTeam = () => {
    if (teamToDelete) {
      setTeams(teams.filter(t => t.id !== teamToDelete));
      setTeamToDelete(null);
    }
  };

  const updateTeamName = (id: string, newName: string) => {
    setTeams(teams.map(t => t.id === id ? { ...t, name: newName } : t));
  };
  
  const updateTeamColor = (id: string, newColor: string) => {
      setTeams(teams.map(t => t.id === id ? { ...t, color: newColor } : t));
  }

  const triggerLogoUpload = (teamId: string) => {
      setActiveTeamIdForLogo(teamId);
      if(logoInputRef.current) logoInputRef.current.click();
  };

  const resizeImage = (file: File, maxWidth: number): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !activeTeamIdForLogo) return;

      try {
          const resizedBase64 = await resizeImage(file, 150);
          setTeams(prev => prev.map(t => t.id === activeTeamIdForLogo ? { ...t, logo: resizedBase64 } : t));
      } catch (e) {
          console.error("Error resizing image", e);
          alert(t.common.error);
      }
      
      setActiveTeamIdForLogo(null);
      event.target.value = '';
  };

  const addPlayerToTeam = (teamId: string, playerName: string) => {
      if(!playerName.trim()) return;
      setTeams(prev => prev.map(t => {
          if(t.id === teamId && t.players.length < 6) {
              return { ...t, players: [...t.players, playerName.trim()] };
          }
          return t;
      }));
  }

  const removePlayerFromTeam = (teamId: string, playerIndex: number) => {
      setTeams(prev => prev.map(t => {
          if(t.id === teamId) {
              const newPlayers = [...t.players];
              newPlayers.splice(playerIndex, 1);
              return { ...t, players: newPlayers };
          }
          return t;
      }));
  }

  const shareTeamInfo = async (team: Team) => {
    const playerList = team.players.length > 0 
        ? team.players.map(p => `• ${p}`).join('\n') 
        : '• (Sem jogadores registrados)';
    const textToShare = `🛡️ *${team.name.toUpperCase()}*\n\n👥 *LINE-UP:*\n${playerList}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: `Time: ${team.name}`,
                text: textToShare,
            });
        } catch (err) {
            console.log('User cancelled share or API error', err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(textToShare);
            setCopiedTeamId(team.id);
            setTimeout(() => setCopiedTeamId(null), 2000); 
        } catch (err) {
            alert(t.register.copied);
        }
    }
  };

  const goToSort = () => {
    if (teams.length === 0 && mode !== 'premium_plus') return;
    setStep(Step.MAP_SORT);
  };

  const spinRoulette = () => {
    setIsSpinning(true);
    let interval: ReturnType<typeof setInterval>;
    let counter = 0;
    const allMaps = MAPS.map(m => m.id);
    
    interval = setInterval(() => {
      const tempShuffle = [...allMaps].sort(() => Math.random() - 0.5);
      setShuffledMaps(tempShuffle);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        const finalShuffle = [...allMaps].sort(() => Math.random() - 0.5);
        setShuffledMaps(finalShuffle);
        setIsSpinning(false);
      }
    }, 100);
  };

  const startStrategy = () => {
    setStep(Step.STRATEGY);
  };

  const handleCitySelect = (mapId: string, teamId: string, city: string) => {
    setBasicSelections(prev => ({
      ...prev,
      [mapId]: {
        ...(prev[mapId] || {}),
        [teamId]: city
      }
    }));
  };

  const handlePremiumPosition = (mapId: string, teamId: string, pos: Position) => {
    setPremiumPositions(prev => ({
      ...prev,
      [mapId]: {
        ...(prev[mapId] || {}),
        [teamId]: pos
      }
    }));
  };

  const toggleWarning = (warning: string) => {
    if (selectedWarnings.includes(warning)) {
      setSelectedWarnings(prev => prev.filter(w => w !== warning));
    } else {
      setSelectedWarnings(prev => [...prev, warning]);
    }
  };

  const handleExportStrategy = () => {
    const data = {
        version: "1.0",
        date: new Date().toISOString(),
        trainingName,
        mode,
        teams,
        shuffledMaps,
        basicSelections,
        premiumPositions,
        selectedWarnings,
        matchScores
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CriadorDeTreino_${trainingName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
      if(fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              
              if(json.teams) setTeams(json.teams);
              if(json.trainingName !== undefined) setTrainingName(json.trainingName || '');
              if(json.mode) setMode(json.mode);
              if(json.shuffledMaps) setShuffledMaps(json.shuffledMaps);
              if(json.basicSelections) setBasicSelections(json.basicSelections);
              if(json.premiumPositions) setPremiumPositions(json.premiumPositions);
              if(json.selectedWarnings) setSelectedWarnings(json.selectedWarnings);
              if(json.matchScores) setMatchScores(json.matchScores);

              alert("Estratégia carregada com sucesso!");
              setStep(Step.STRATEGY); 
          } catch (error) {
              alert(t.common.error);
              console.error(error);
          }
      };
      reader.readAsText(file);
      event.target.value = '';
  };

  const downloadStrategyImage = async () => {
    if (strategyRef.current) {
        try {
            const dataUrl = await htmlToImage.toPng(strategyRef.current, { 
                backgroundColor: '#111111', 
                style: { overflow: 'visible', height: 'auto' }, 
                quality: 1.0, 
                pixelRatio: 2 
            });
            const link = document.createElement('a');
            link.download = `Calls-${trainingName.replace(/\s/g, '-')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('oops, something went wrong!', error);
            alert(t.common.error);
        }
    }
  };

  const handleScoreChange = (matchIdx: number, teamId: string, field: 'rank' | 'kills', value: string) => {
    const val = value === '' ? '' : parseInt(value);
    setMatchScores(prev => {
      const matchData = prev[matchIdx] || {};
      const teamData = matchData[teamId] || { teamId, rank: '', kills: '', playerKills: {} };
      const newTeamData = { ...teamData, [field]: val };
      return {
        ...prev,
        [matchIdx]: {
          ...matchData,
          [teamId]: newTeamData
        }
      };
    });
  };

  const handleReplayUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(!file || !currentMatchTab) {
        if(!currentMatchTab) alert("Selecione uma Queda (Aba) antes de enviar o replay.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);
            processReplayData(json);
        } catch (error) {
            alert("Erro ao ler arquivo. Verifique se é um JSON válido de replay.");
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const processReplayData = (data: { Events: ReplayEvent[] }) => {
    if (!data.Events || !Array.isArray(data.Events)) {
        alert("Formato de replay inválido: Lista de eventos não encontrada.");
        return;
    }

    const players: Record<string, PlayerAnalysis> = {};
    const teamPlacement: {name: string, time: number}[] = [];

    const getPlayer = (name: string) => {
        if (!players[name]) {
            const parts = name.split(/[. ]/);
            const tag = parts.length > 1 ? parts[0] : (name.length > 3 ? name.substring(0, 3) : "SOLO");
            players[name] = {
                name,
                teamTag: tag,
                kills: 0,
                damage: 0,
                firstEventTime: Infinity,
                lastEventTime: 0
            };
        }
        return players[name];
    };

    const updateTime = (name: string, time: number) => {
        const p = getPlayer(name);
        if (time < p.firstEventTime) p.firstEventTime = time;
        if (time > p.lastEventTime) p.lastEventTime = time;
    };

    data.Events.forEach(e => {
        if (e.Event === 1 && e.SParam) {
            teamPlacement.push({ name: e.SParam, time: e.Time });
        }
        if (e.Event === 2 && e.SParam && e.FParam) {
            const p = getPlayer(e.SParam);
            p.damage += e.FParam;
            updateTime(e.SParam, e.Time);
        }
        if (e.Event === 4 && e.SParam) {
            const p = getPlayer(e.SParam);
            p.kills += 1;
            updateTime(e.SParam, e.Time);
        }
    });

    let currentTeams = [...teams];
    const uniqueTags = new Set(Object.values(players).map(p => p.teamTag));

    uniqueTags.forEach(tag => {
        if (!currentTeams.find(t => t.name === tag)) {
            if (currentTeams.length < 15) {
                currentTeams.push({
                    id: `${Date.now()}_${tag}`,
                    name: tag,
                    color: getRandomColor(),
                    players: []
                });
            }
        }
    });

    Object.values(players).forEach(p => {
        const team = currentTeams.find(t => t.name === p.teamTag);
        if (team && !team.players.includes(p.name) && team.players.length < 6) {
            team.players.push(p.name);
        }
    });

    setTeams(currentTeams);

    teamPlacement.sort((a, b) => a.time - b.time); 
    
    const newScores: Record<string, MatchScore> = { ...matchScores[currentMatchTab] };

    currentTeams.forEach(team => {
        const elimIndex = teamPlacement.findIndex(tp => tp.name === team.name || team.name.includes(tp.name));
        let rank: number | '' = '';
        if (elimIndex !== -1) {
            const totalTeams = Math.max(12, currentTeams.length);
            rank = totalTeams - elimIndex;
        } else {
            const hasStats = Object.values(players).some(p => p.teamTag === team.name);
            if (hasStats) rank = 1;
        }

        let teamKills = 0;
        const playerKillsMap: Record<string, number> = {};

        team.players.forEach(pName => {
            const pData = players[pName];
            if (pData) {
                teamKills += pData.kills;
                playerKillsMap[pName] = pData.kills;
            }
        });

        newScores[team.id] = {
            teamId: team.id,
            rank: typeof rank === 'number' ? rank : '',
            kills: teamKills,
            playerKills: playerKillsMap
        };
    });

    setMatchScores(prev => ({
        ...prev,
        [currentMatchTab]: newScores
    }));

    setPlayerExtendedStats(prev => {
        const newStats = { ...prev };
        Object.values(players).forEach(p => {
             newStats[p.name] = p;
        });
        return newStats;
    });

    alert("Replay processado com sucesso! Dados atualizados.");
  };

  const leaderboard = useMemo(() => {
    const stats: Record<string, ProcessedScore> = {};

    teams.forEach(team => {
      stats[team.id] = {
        teamId: team.id,
        teamName: team.name,
        totalPoints: 0,
        placementPoints: 0,
        killPoints: 0,
        booyahs: 0,
        totalKills: 0,
        matchesPlayed: 0,
        lastMatchRank: 999
      };
    });

    Object.entries(matchScores).forEach(([matchIdx, scores]) => {
      Object.values(scores).forEach(score => {
        if (!stats[score.teamId]) return;
        
        const rank = typeof score.rank === 'number' ? score.rank : 0;
        const kills = typeof score.kills === 'number' ? score.kills : 0;

        if (rank > 0) {
          stats[score.teamId].matchesPlayed += 1;
          stats[score.teamId].lastMatchRank = rank; 
          
          const placementPts = POINTS_SYSTEM[rank] || 0;
          const killPts = kills; 

          stats[score.teamId].totalPoints += (placementPts + killPts);
          stats[score.teamId].placementPoints += placementPts;
          stats[score.teamId].killPoints += killPts;
          stats[score.teamId].totalKills += kills;
          if (rank === 1) stats[score.teamId].booyahs += 1;
        }
      });
    });

    const playedMatches = Object.keys(matchScores).map(Number).sort((a,b) => b-a);
    const lastMatchIndex = playedMatches.length > 0 ? playedMatches[0] : -1;
    
    if (lastMatchIndex >= 0) {
      const lastScores = matchScores[lastMatchIndex];
      if (lastScores) {
        Object.values(lastScores).forEach((s: MatchScore) => {
          if (stats[s.teamId] && typeof s.rank === 'number') {
             stats[s.teamId].lastMatchRank = s.rank;
          }
        });
      }
    }

    return Object.values(stats).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.booyahs !== a.booyahs) return b.booyahs - a.booyahs;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return a.lastMatchRank - b.lastMatchRank;
    }).map((s, i) => ({ ...s, rank: i + 1 }));
  }, [teams, matchScores]);

  const playerStats = useMemo(() => {
      const pStats: Record<string, PlayerStats> = {};
      teams.forEach(team => {
          team.players.forEach(pName => {
              pStats[pName] = {
                  name: pName,
                  teamName: team.name,
                  teamColor: team.color,
                  totalKills: 0,
                  matchesPlayed: 0,
                  totalDamage: 0,
                  timeAlive: 0,
                  mvpScore: 0
              };
          });
      });

      Object.values(playerExtendedStats).forEach((analysis: PlayerAnalysis) => {
          if (!pStats[analysis.name]) {
               const team = teams.find(t => t.name === analysis.teamTag);
               pStats[analysis.name] = {
                   name: analysis.name,
                   teamName: analysis.teamTag,
                   teamColor: team?.color || '#fff',
                   totalKills: 0,
                   matchesPlayed: 0,
                   totalDamage: 0,
                   timeAlive: 0,
                   mvpScore: 0
               };
          }

          const p = pStats[analysis.name];
          p.totalDamage = analysis.damage;
          p.timeAlive = Math.max(0, analysis.lastEventTime - analysis.firstEventTime);
          p.totalKills = analysis.kills;
          p.mvpScore = (p.totalKills * 3) + (p.totalDamage / 300) + (p.timeAlive / 200);
      });
      
      if (Object.keys(playerExtendedStats).length === 0) {
        Object.entries(matchScores).forEach(([matchIdx, scores]) => {
            Object.values(scores).forEach(teamScore => {
                if(teamScore.playerKills) {
                    Object.entries(teamScore.playerKills).forEach(([pName, kills]) => {
                        if(!pStats[pName]) {
                             // Create partial record
                        } else {
                            pStats[pName].totalKills += (kills as number);
                            pStats[pName].matchesPlayed += 1;
                        }
                    });
                }
            });
        });
      }

      return Object.values(pStats).sort((a,b) => (b.mvpScore || 0) - (a.mvpScore || 0));
  }, [teams, matchScores, playerExtendedStats]);

  const saveToHub = () => {
      if (teams.length === 0) {
          alert(t.register.empty);
          return;
      }
      
      const newSession: SavedTrainingSession = {
          id: Date.now().toString(),
          name: trainingName,
          date: new Date().toLocaleDateString(),
          teamsCount: teams.length,
          matchesCount: Object.keys(matchScores).length,
          leaderboardTop3: leaderboard.slice(0, 3).map(t => ({ name: t.teamName, points: t.totalPoints })),
          data: JSON.stringify({
              trainingName,
              mode,
              teams,
              shuffledMaps,
              basicSelections,
              premiumPositions,
              selectedWarnings,
              matchScores,
              playerExtendedStats
          })
      };

      const updated = [newSession, ...savedTrainings];
      setSavedTrainings(updated);
      localStorage.setItem('jhantraining_hub_data', JSON.stringify(updated));
      alert(t.hub.title + " " + t.common.yes);
  };

  const loadFromHub = (session: SavedTrainingSession) => {
      if (window.confirm(t.hub.confirmLoad)) {
          try {
              const data = JSON.parse(session.data);
              setTrainingName(data.trainingName || 'Treino Importado');
              setMode(data.mode || 'basic');
              setTeams(data.teams || []);
              setShuffledMaps(data.shuffledMaps || []);
              setBasicSelections(data.basicSelections || {});
              setPremiumPositions(data.premiumPositions || {});
              setSelectedWarnings(data.selectedWarnings || []);
              setMatchScores(data.matchScores || {});
              setPlayerExtendedStats(data.playerExtendedStats || {});
              
              setStep(Step.DASHBOARD);
          } catch (e) {
              console.error(e);
              alert(t.common.error);
          }
      }
  };

  const deleteFromHub = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(t.common.confirmHome)) {
          const updated = savedTrainings.filter(s => s.id !== id);
          setSavedTrainings(updated);
          localStorage.setItem('jhantraining_hub_data', JSON.stringify(updated));
      }
  };

  const downloadSocialBanner = async () => {
    if (bannerRef.current) {
        try {
            const blob = await htmlToImage.toBlob(bannerRef.current, { quality: 1.0, pixelRatio: 2 });
            if (!blob) return;

            const file = new File([blob], `Resultado-${trainingName.replace(/\s/g, '-')}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Resultado do Treino',
                    text: `Confira o resultado do treino ${trainingName}!`
                });
            } else {
                // Fallback to download
                const link = document.createElement('a');
                link.download = `Resultado-${trainingName.replace(/\s/g, '-')}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
            }
        } catch (error) {
            console.error('oops, something went wrong!', error);
            alert(t.common.error);
        }
    }
  };
  
  const renderHelpModal = () => {
    if (!showHelp) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-panel border border-theme rounded-xl max-w-lg w-full p-6 relative shadow-2xl">
                <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-muted hover:text-white"><X/></button>
                <h3 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2"><HelpCircle size={24}/> {t.common.help}</h3>
                <div className="space-y-4 text-gray-300 text-sm max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    <section>
                        <h4 className="font-bold text-white mb-1">🎯 {t.hero.title2}</h4>
                        <p>{t.hero.desc}</p>
                    </section>
                </div>
            </div>
        </div>
    );
  };

  const renderDeleteModal = () => {
    if (!teamToDelete) return null;
    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#111] border border-red-900 rounded-2xl max-w-sm w-full p-8 text-center shadow-[0_0_100px_rgba(220,38,38,0.2)] transform transition-all scale-100 animate-zoom-in relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-transparent pointer-events-none"></div>
                
                <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-6 text-red-500 ring-1 ring-red-500/50">
                     <AlertTriangle size={32}/>
                </div>
                
                <h3 className="text-2xl font-black mb-2 text-white">Excluir Time?</h3>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">Esta ação não pode ser desfeita. O time será removido da lista atual.</p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setTeamToDelete(null)} 
                        className="flex-1 py-3 px-4 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        {t.common.cancel}
                    </button>
                    <button 
                        onClick={executeDeleteTeam} 
                        className="flex-1 py-3 px-4 rounded-lg font-bold bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={16}/> {t.common.yes}
                    </button>
                </div>
            </div>
        </div>
    );
  };
  
  const renderVisualizerModal = () => {
      if (!showStrategyVisualizer) return null;
      return null; 
  };

  const renderStepper = () => {
    const currentIndex = STEPS_FLOW.findIndex(s => s.id === step);
    if (currentIndex === -1) return null;

    return (
        <div className="w-full max-w-4xl mb-8 overflow-x-auto no-scrollbar py-2">
            <div className="flex items-center justify-between min-w-[300px] relative px-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -z-10"></div>
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                    style={{ width: `${(currentIndex / (STEPS_FLOW.length - 1)) * 100}%` }}
                ></div>

                {STEPS_FLOW.map((s, idx) => {
                    const isActive = idx === currentIndex;
                    const isCompleted = idx < currentIndex;
                    const Icon = s.icon;
                    // @ts-ignore
                    const label = t.steps[s.labelKey];

                    return (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-background px-2">
                            <div 
                                className={`
                                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${isActive ? 'bg-primary border-primary text-black scale-110 shadow-[0_0_15px_rgba(var(--color-primary),0.5)]' : 
                                      isCompleted ? 'bg-primary border-primary text-black' : 
                                      'bg-gray-900 border-gray-700 text-gray-500'}
                                `}
                            >
                                {isCompleted ? <Check size={16} strokeWidth={3}/> : <Icon size={18} />}
                            </div>
                            <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted'}`}>{label}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
  };

  const renderHome = () => (
    <div className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0a0a] text-white p-4 lg:p-12">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left Column - Hero Text */}
            <div className="space-y-8 animate-in slide-in-from-left duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1A] border border-white/10 text-xs font-bold text-yellow-500 uppercase tracking-widest shadow-lg">
                    <Zap size={14} fill="currentColor"/> {t.hero.subtitle}
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-black leading-none tracking-tighter text-white">
                    {t.hero.title1}<br/>
                    <span className="text-[#FFD400]">{t.hero.title2}</span>
                </h1>
                
                <p className="text-base md:text-lg text-gray-400 max-w-lg leading-relaxed font-medium">
                    {t.hero.desc}
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                    <button 
                        onClick={handleStart}
                        className="px-8 py-4 bg-[#FFD400] text-black font-black text-lg rounded-xl hover:bg-[#ffe033] transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,212,0,0.3)] flex items-center gap-2"
                    >
                        {t.hero.start} <ArrowRight size={24}/>
                    </button>
                    <button 
                        onClick={() => setStep(Step.WAITING_LIST)}
                        className="px-8 py-4 bg-[#1A1A1A] border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-[#252525] transition-all flex items-center gap-2"
                    >
                        <ListPlus size={24}/> {t.hero.queue}
                    </button>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono text-gray-500 pt-8">
                     <button onClick={() => setStep(Step.PUBLIC_HUB)} className="flex items-center gap-2 hover:text-white transition-colors"><Globe size={14}/> {t.hero.hub}</button>
                </div>
            </div>

            {/* Right Column - Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right duration-700 delay-200">
                <div className="p-6 bg-[#121212] border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                    <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <MapIcon size={24}/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{t.steps.maps}</h3>
                    <p className="text-sm text-gray-500 font-medium">{t.features.maps}</p>
                </div>
                {/* ... other features ... */}
                 <div className="p-6 bg-[#121212] border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                     <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Users size={24}/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{t.steps.teams}</h3>
                    <p className="text-sm text-gray-500 font-medium">{t.features.teams}</p>
                </div>
                <div className="p-6 bg-[#121212] border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                     <div className="w-12 h-12 bg-[#A855F7] rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <BarChart2 size={24}/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Stats</h3>
                    <p className="text-sm text-gray-500 font-medium">{t.features.stats}</p>
                </div>
                <div className="p-6 bg-[#121212] border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                     <div className="w-12 h-12 bg-[#EC4899] rounded-xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Share2 size={24}/>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Share</h3>
                    <p className="text-sm text-gray-500 font-medium">{t.features.share}</p>
                </div>
            </div>
        </div>
        
        {/* Footer Credit (Fixed) */}
        <div className="fixed bottom-4 left-0 w-full flex justify-center z-50 pointer-events-none">
            <a 
                href="https://www.instagram.com/jhanmedeiros/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="pointer-events-auto flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white transition-all bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md uppercase tracking-widest hover:border-primary/50 hover:bg-black/80 hover:shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
            >
                {t.hero.footer} <Instagram size={12}/>
            </a>
        </div>
    </div>
  );

  // ... (renderWaitingList, renderPublicHub, renderModeSelect, renderTeamRegister, renderMapSort, renderStrategy, renderScoring, renderDashboard - No Changes needed)

  const renderWaitingList = () => (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">
        <h2 className="text-3xl font-display font-bold text-primary flex items-center gap-2"><ListPlus/> {t.waiting.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-panel rounded-xl p-6 border border-theme">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldCheck size={20}/> {t.waiting.adminArea}</h3>
                 <div className="space-y-4">
                     <input value={wlAdminName} onChange={e => setWlAdminName(e.target.value)} placeholder={t.waiting.yourName} className="w-full p-3 bg-background rounded-lg border border-theme focus:border-primary outline-none"/>
                     <input value={wlTrainingName} onChange={e => setWlTrainingName(e.target.value)} placeholder={t.waiting.trainingName} className="w-full p-3 bg-background rounded-lg border border-theme focus:border-primary outline-none"/>
                     <input value={wlPin} onChange={e => setWlPin(e.target.value)} placeholder={t.waiting.pin} type="password" maxLength={6} className="w-full p-3 bg-background rounded-lg border border-theme focus:border-primary outline-none"/>
                     <Button onClick={createWaitingTraining} className="w-full">{t.waiting.create}</Button>
                 </div>
             </div>

             <div className="bg-panel rounded-xl p-6 border border-theme">
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><UserPlus size={20}/> {t.waiting.requestTitle}</h3>
                 <div className="space-y-4">
                     <select value={selectedTrainingId || ''} onChange={e => setSelectedTrainingId(e.target.value)} className="w-full p-3 bg-background rounded-lg border border-theme focus:border-primary outline-none text-main">
                         <option value="">{t.waiting.selectTraining}</option>
                         {openTrainings.map(tr => (
                             <option key={tr.id} value={tr.id}>{tr.trainingName} (Admin: {tr.adminName})</option>
                         ))}
                     </select>
                     <input value={wlTeamRequestName} onChange={e => setWlTeamRequestName(e.target.value)} placeholder={t.waiting.yourTeam} className="w-full p-3 bg-background rounded-lg border border-theme focus:border-primary outline-none"/>
                     <Button onClick={requestEntryToTraining} variant="secondary" className="w-full">{t.waiting.sendRequest}</Button>
                 </div>
             </div>
        </div>

        {openTrainings.map(training => (
            <div key={training.id} className="bg-panel rounded-xl p-6 border border-theme">
                 <div className="flex justify-between items-start mb-4">
                     <div>
                         <h3 className="text-xl font-bold text-white">{training.trainingName}</h3>
                         <p className="text-sm text-gray-500">Admin: {training.adminName} • {new Date(training.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div className="flex gap-2">
                         {!isAdminUnlocked && 
                            <div className="flex gap-2">
                                <input value={wlUnlockPin} onChange={e => setWlUnlockPin(e.target.value)} placeholder="PIN" className="w-20 p-2 bg-background rounded border border-theme text-center text-xs" type="password"/>
                                <Button size="sm" onClick={() => checkAdminPin(training)}><Unlock size={14}/></Button>
                            </div>
                         }
                         {isAdminUnlocked && (
                             <>
                                <Button size="sm" onClick={() => importWaitingListToApp(training)} className="bg-green-600 hover:bg-green-700 text-white border-none">{t.waiting.generate}</Button>
                                <Button size="sm" variant="danger" onClick={() => deleteWaitingTraining(training.id)}><Trash2 size={14}/></Button>
                             </>
                         )}
                     </div>
                 </div>
                 <div className="bg-background rounded-lg p-4 border border-theme">
                     <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">{t.waiting.queue} ({training.requests.length})</h4>
                     {training.requests.length === 0 ? (
                         <p className="text-gray-600 text-sm italic">Nenhuma solicitação ainda.</p>
                     ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                             {training.requests.map((req, idx) => (
                                 <div key={req.id} className="flex items-center gap-3 p-2 bg-panel rounded border border-theme/50">
                                     <span className="font-mono font-bold text-gray-500 w-6 text-center">{idx + 1}</span>
                                     <span className="font-bold text-white">{req.teamName}</span>
                                     <span className="text-xs text-gray-600 ml-auto">{new Date(req.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
            </div>
        ))}
    </div>
  );

  const renderPublicHub = () => (
      <div className="w-full max-w-6xl mx-auto space-y-6 animate-fade-in">
           <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
              <div>
                  <h2 className="text-3xl font-display font-bold text-primary flex items-center gap-2"><Globe/> {t.hub.title}</h2>
                  <p className="text-gray-400">{t.hub.desc}</p>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1 bg-panel px-3 py-1 rounded-full border border-theme"><Info size={12}/> {t.hub.info}</div>
          </div>
          
          {savedTrainings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                  <Globe size={48} className="mb-4 opacity-20"/>
                  <h3 className="text-xl font-bold">{t.hub.empty}</h3>
                  <p>{t.hub.emptyDesc}</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedTrainings.map(session => (
                      <div key={session.id} className="bg-panel rounded-xl overflow-hidden border border-theme hover:border-primary transition-all group shadow-lg">
                          <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-b border-theme relative">
                              <h3 className="font-bold text-lg text-white truncate pr-8">{session.name}</h3>
                              <p className="text-xs text-primary font-mono mt-1">{session.date}</p>
                              <button onClick={(e) => deleteFromHub(session.id, e)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                          </div>
                          <div className="p-4 space-y-4">
                              <div className="flex justify-between text-sm text-gray-400">
                                  <span>{session.teamsCount} Teams</span>
                                  <span>{session.matchesCount} Matches</span>
                              </div>
                              <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Top 3 Leaderboard</p>
                                  {session.leaderboardTop3.map((team, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-sm p-1.5 bg-background rounded">
                                          <div className="flex items-center gap-2">
                                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${idx===0 ? 'bg-yellow-500 text-black' : idx===1 ? 'bg-gray-400 text-black' : 'bg-orange-700 text-white'}`}>{idx+1}</span>
                                              <span className="truncate max-w-[120px]">{team.name}</span>
                                          </div>
                                          <span className="font-mono font-bold text-primary">{team.points}</span>
                                      </div>
                                  ))}
                              </div>
                              <Button variant="secondary" onClick={() => loadFromHub(session)} className="w-full text-sm mt-2">{t.hub.load}</Button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderModeSelect = () => (
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in space-y-8">
          <div className="text-center space-y-2">
              <h2 className="text-3xl font-display font-bold text-white tracking-tight">{t.mode.title}</h2>
              <p className="text-muted">Escolha a melhor experiência para o seu treino.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
               {/* Basic Mode */}
               <div className="bg-panel border border-theme rounded-xl p-6 hover:border-gray-500 transition-all flex flex-col gap-4">
                   <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 mb-2"><ClipboardList/></div>
                   <div>
                       <h3 className="text-xl font-bold text-white">{t.mode.basic}</h3>
                       <p className="text-sm text-gray-400 mt-2 min-h-[40px]">{t.mode.basicDesc}</p>
                   </div>
                   <ul className="text-xs space-y-2 text-gray-500 mb-4 flex-1">
                       <li className="flex items-center gap-2"><Check size={12}/> {t.mode.feats.cityList}</li>
                       <li className="flex items-center gap-2"><Check size={12}/> {t.mode.feats.mapSort}</li>
                       <li className="flex items-center gap-2"><Check size={12}/> {t.mode.feats.scoreTable}</li>
                   </ul>
                   <Button onClick={() => selectMode('basic')} variant="secondary" className="w-full">Selecionar</Button>
               </div>
               {/* Premium Mode */}
               <div className="bg-panel border-2 border-primary rounded-xl p-6 relative flex flex-col gap-4 transform md:-translate-y-4 shadow-[0_0_30px_rgba(var(--color-primary),0.1)]">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                       {t.mode.recommended}
                   </div>
                   <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-black mb-2"><MapIcon/></div>
                   <div>
                       <h3 className="text-xl font-bold text-white">{t.mode.premium}</h3>
                       <p className="text-sm text-gray-400 mt-2 min-h-[40px]">{t.mode.premiumDesc}</p>
                   </div>
                   <ul className="text-xs space-y-2 text-gray-500 mb-4 flex-1">
                       <li className="flex items-center gap-2 text-primary"><Check size={12}/> {t.mode.feats.interactive}</li>
                       <li className="flex items-center gap-2 text-primary"><Check size={12}/> {t.mode.feats.dragDrop}</li>
                       <li className="flex items-center gap-2"><Check size={12}/> {t.mode.feats.scoreTable}</li>
                   </ul>
                   <Button onClick={() => selectMode('premium')} variant="primary" className="w-full">Selecionar</Button>
               </div>
               {/* Premium Plus */}
               <div className="bg-panel border border-theme rounded-xl p-6 hover:border-purple-500 transition-all flex flex-col gap-4 group">
                   <div className="w-12 h-12 rounded-lg bg-purple-900/50 flex items-center justify-center text-purple-400 mb-2 group-hover:text-purple-300"><Binary/></div>
                   <div>
                       <h3 className="text-xl font-bold text-white">{t.mode.premiumPlus}</h3>
                       <p className="text-sm text-gray-400 mt-2 min-h-[40px]">{t.mode.premiumPlusDesc}</p>
                   </div>
                   <ul className="text-xs space-y-2 text-gray-500 mb-4 flex-1">
                       <li className="flex items-center gap-2 text-purple-400"><Check size={12}/> {t.mode.feats.replay}</li>
                       <li className="flex items-center gap-2 text-purple-400"><Check size={12}/> {t.mode.feats.mvp}</li>
                       <li className="flex items-center gap-2"><Check size={12}/> {t.mode.feats.interactive}</li>
                   </ul>
                   <Button onClick={() => selectMode('premium_plus')} variant="secondary" className="w-full group-hover:border-purple-500 group-hover:text-purple-400">Selecionar</Button>
               </div>
          </div>
          {hasDraft && (
             <button onClick={loadDraft} className="text-sm text-gray-500 hover:text-white underline flex items-center gap-2">
                 <Save size={14}/> {t.hero.restore}
             </button>
          )}
      </div>
  );

  const renderTeamRegister = () => (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 w-full space-y-2">
                 <label className="text-xs font-bold text-muted uppercase tracking-wide">Nome do Treino</label>
                 <input 
                    value={trainingName} 
                    onChange={(e) => setTrainingName(e.target.value)} 
                    className="w-full bg-panel border border-theme rounded-lg px-4 py-3 text-white focus:border-primary outline-none text-lg font-bold placeholder-gray-700"
                    placeholder="Ex: Treino da Tarde"
                 />
             </div>
             {mode !== 'premium_plus' && (
                 <div className="flex-1 w-full space-y-2">
                     <label className="text-xs font-bold text-muted uppercase tracking-wide">Adicionar Time</label>
                     <div className="flex gap-2">
                        <input 
                            value={newTeamName} 
                            onChange={(e) => setNewTeamName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTeam()}
                            className="flex-1 bg-panel border border-theme rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                            placeholder={t.register.placeholder}
                        />
                        <Button onClick={addTeam} disabled={!newTeamName.trim() || teams.length >= 15}>
                            <Users size={18}/> {t.register.add}
                        </Button>
                     </div>
                 </div>
             )}
          </div>
          
          <div className="bg-panel border border-theme rounded-xl overflow-hidden min-h-[300px] flex flex-col">
              <div className="bg-background/50 p-4 border-b border-theme flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2"><ListPlus size={18}/> Lista de Times ({teams.length}/15)</h3>
                  {mode === 'premium_plus' && <span className="text-xs text-purple-400 border border-purple-900 bg-purple-900/20 px-2 py-1 rounded">Replay Mode: Times serão auto-detectados</span>}
              </div>
              
              <div className="p-4 flex-1">
                  {teams.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                          <Users size={48} />
                          <p>{t.register.empty}</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {teams.map(team => (
                              <div key={team.id} className="bg-background rounded-lg border border-theme p-3 flex flex-col gap-3 group hover:border-gray-600 transition-colors">
                                  <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div 
                                            onClick={() => triggerLogoUpload(team.id)}
                                            className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer overflow-hidden border border-gray-700 hover:border-white transition-colors relative"
                                            style={{ backgroundColor: team.color }}
                                          >
                                              {team.logo ? <img src={team.logo} className="w-full h-full object-cover"/> : <Upload size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/50"/>}
                                          </div>
                                          <input 
                                            value={team.name}
                                            onChange={(e) => updateTeamName(team.id, e.target.value)}
                                            className="bg-transparent font-bold text-white outline-none w-full text-sm"
                                          />
                                      </div>
                                      <button onClick={() => confirmDeleteTeam(team.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                  </div>
                                  
                                  {/* Color Picker & Player Input */}
                                  <div className="flex items-center gap-2">
                                      <div className="flex gap-1">
                                        {[...TEAM_COLORS].slice(0,5).map(c => (
                                            <button key={c} onClick={() => updateTeamColor(team.id, c)} className={`w-3 h-3 rounded-full ${team.color===c ? 'ring-1 ring-white' : ''}`} style={{backgroundColor: c}}></button>
                                        ))}
                                      </div>
                                      <div className="ml-auto">
                                          <button 
                                            onClick={() => shareTeamInfo(team)}
                                            className="text-xs text-gray-500 hover:text-primary flex items-center gap-1"
                                          >
                                            <Share2 size={10}/> {copiedTeamId === team.id ? t.register.copied : 'Share'}
                                          </button>
                                      </div>
                                  </div>

                                  <div className="bg-black/20 rounded p-2 space-y-2">
                                      <div className="flex gap-1">
                                          <input 
                                            id={`player-input-${team.id}`}
                                            placeholder="Add Player..." 
                                            className="flex-1 bg-transparent text-xs outline-none border-b border-gray-700 focus:border-primary py-1"
                                            onKeyPress={(e) => {
                                                if(e.key === 'Enter') {
                                                    addPlayerToTeam(team.id, e.currentTarget.value);
                                                    e.currentTarget.value = '';
                                                }
                                            }}
                                          />
                                      </div>
                                      <div className="flex flex-wrap gap-1">
                                          {team.players.map((p, idx) => (
                                              <span key={idx} className="bg-gray-800 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                                                  {p} <button onClick={() => removePlayerFromTeam(team.id, idx)} className="hover:text-red-400">×</button>
                                              </span>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
          
          <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden"/>

          <div className="flex justify-end pt-4">
              <Button onClick={goToSort} size="lg" disabled={teams.length === 0 && mode !== 'premium_plus'}>
                  {t.register.next} <ArrowRight size={20}/>
              </Button>
          </div>
      </div>
  );
  
  const renderMapSort = () => (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 animate-fade-in text-center py-10">
          <div className="space-y-2">
             <h2 className="text-3xl font-display font-bold text-white">{t.sort.title}</h2>
             <p className="text-gray-400">Defina a rotação de mapas para o seu treino.</p>
          </div>
          
          <div className="relative group">
               <div className="absolute inset-0 bg-primary/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               <Button onClick={spinRoulette} disabled={isSpinning} size="lg" className="relative z-10 min-w-[200px] h-16 text-xl">
                   {isSpinning ? <RefreshCw className="animate-spin mr-2"/> : <Globe className="mr-2"/>}
                   {shuffledMaps.length > 0 ? t.sort.respin : t.sort.spin}
               </Button>
          </div>
          
          <div className="w-full bg-panel border border-theme rounded-xl p-6 min-h-[200px] flex items-center justify-center relative overflow-hidden">
               {shuffledMaps.length === 0 ? (
                   <div className="text-gray-600 flex flex-col items-center gap-2">
                       <Globe size={48} className="opacity-20"/>
                       <p>Aguardando sorteio...</p>
                   </div>
               ) : (
                   <div className="grid grid-cols-3 md:grid-cols-5 gap-4 w-full">
                       {shuffledMaps.map((mapId, idx) => {
                           const mapInfo = MAPS.find(m => m.id === mapId);
                           return (
                               <div key={idx} className="flex flex-col items-center gap-2 animate-in zoom-in duration-300" style={{animationDelay: `${idx * 100}ms`}}>
                                   <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-theme relative group">
                                       <img src={mapInfo?.image} className="w-full h-full object-cover transition-transform group-hover:scale-110"/>
                                       <div className="absolute top-0 left-0 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-br font-bold">#{idx+1}</div>
                                   </div>
                                   <span className="text-xs font-bold uppercase text-gray-400">{mapInfo?.name}</span>
                               </div>
                           )
                       })}
                   </div>
               )}
          </div>

          <Button onClick={startStrategy} disabled={shuffledMaps.length === 0} className="w-full md:w-auto">
              {t.sort.strategy} <ArrowRight/>
          </Button>
      </div>
  );

  const renderStrategy = () => (
      <div className="w-full h-[calc(100vh-140px)] flex flex-col gap-4 animate-fade-in relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-panel p-4 rounded-xl border border-theme">
              <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto no-scrollbar">
                  {shuffledMaps.map((mapId, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveStrategyMapIndex(idx)}
                        className={`
                            px-4 py-2 rounded-lg text-sm font-bold uppercase whitespace-nowrap transition-all border
                            ${activeStrategyMapIndex === idx ? 'bg-primary text-black border-primary' : 'bg-background text-gray-500 border-transparent hover:text-white'}
                        `}
                      >
                          {MAPS.find(m => m.id === mapId)?.name || mapId} <span className="opacity-50 text-[10px] ml-1">#{idx+1}</span>
                      </button>
                  ))}
              </div>
              <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json"/>
                  <Tooltip content={t.strategy.import}>
                      <Button variant="secondary" size="sm" onClick={handleImportClick}><Upload size={16}/></Button>
                  </Tooltip>
                  <Tooltip content={t.strategy.saveJson}>
                      <Button variant="secondary" size="sm" onClick={handleExportStrategy}><Download size={16}/></Button>
                  </Tooltip>
                  <Tooltip content={t.strategy.saveImg}>
                      <Button variant="secondary" size="sm" onClick={downloadStrategyImage}><Image size={16}/></Button>
                  </Tooltip>
                  <Button onClick={() => setStep(Step.SCORING)} size="sm">
                      {t.strategy.scoring} <ArrowRight size={16}/>
                  </Button>
              </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative bg-black/20 rounded-xl border border-theme/50" ref={strategyRef}>
                {shuffledMaps.map((mapId, idx) => {
                    if (idx !== activeStrategyMapIndex) return null;
                    const mapData = MAPS.find(m => m.id === mapId);
                    if (!mapData) return null;

                    return (
                        <div key={mapId} className="w-full h-full flex flex-col md:flex-row gap-4 p-4 animate-in fade-in">
                            {/* Map Visualization */}
                            <div className="flex-1 h-full min-h-[400px]">
                                {mode === 'premium' || mode === 'premium_plus' ? (
                                    <DraggableMap
                                        mapName={mapData.name}
                                        image={mapData.image}
                                        teams={teams}
                                        positions={premiumPositions[mapId] || {}}
                                        onPositionChange={(tid, pos) => handlePremiumPosition(mapId, tid, pos)}
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-xl overflow-hidden relative border border-theme">
                                        <img src={mapData.image} className="w-full h-full object-cover opacity-50"/>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <p className="text-gray-400 text-sm bg-black/80 px-4 py-2 rounded border border-gray-700">{t.common.interactiveMap} Only in Premium</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Controls */}
                            <div className="w-full md:w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                                {/* Warnings Selection */}
                                <div className="bg-panel rounded-xl p-4 border border-theme">
                                    <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wide flex items-center gap-2"><AlertTriangle size={14}/> {t.report.warnings}</h4>
                                    <div className="space-y-2">
                                        {WARNINGS[lang].map((w, i) => (
                                            <label key={i} className="flex items-start gap-2 text-xs text-gray-400 cursor-pointer hover:text-white transition-colors">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedWarnings.includes(w)}
                                                    onChange={() => toggleWarning(w)}
                                                    className="mt-0.5 accent-primary"
                                                />
                                                <span className={selectedWarnings.includes(w) ? 'text-white font-bold' : ''}>{w}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Basic Mode Calls List */}
                                {mode === 'basic' && (
                                    <div className="bg-panel rounded-xl p-4 border border-theme flex-1">
                                        <h4 className="font-bold text-white mb-3 text-sm uppercase tracking-wide">Calls Definition</h4>
                                        <div className="space-y-3">
                                            {teams.map(team => (
                                                <div key={team.id} className="flex flex-col gap-1">
                                                    <label className="text-xs font-bold" style={{color: team.color}}>{team.name}</label>
                                                    <select 
                                                        value={basicSelections[mapId]?.[team.id] || ''}
                                                        onChange={(e) => handleCitySelect(mapId, team.id, e.target.value)}
                                                        className="bg-background border border-theme rounded p-2 text-xs text-white focus:border-primary outline-none"
                                                    >
                                                        <option value="">{t.strategy.free}</option>
                                                        {mapData.cities.map(city => (
                                                            <option key={city} value={city}>{city}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Drag info for Premium */}
                                {(mode === 'premium' || mode === 'premium_plus') && (
                                    <div className="bg-panel rounded-xl p-4 border border-theme text-xs text-gray-400">
                                        <p className="flex items-center gap-2 mb-2"><MousePointer2 size={14}/> <strong>Drag & Drop</strong></p>
                                        Arraste os ícones ou nomes dos times no mapa para definir o posicionamento inicial (Call).
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
          </div>
      </div>
  );

  const renderScoring = () => (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                  <h2 className="text-3xl font-display font-bold text-primary">{t.scoring.title}</h2>
                  <p className="text-gray-400 text-sm">Insira os resultados de cada queda manualmente ou via replay.</p>
              </div>
              <div className="flex gap-2">
                  <Button onClick={() => replayInputRef.current?.click()} variant="secondary" className="flex items-center gap-2">
                      <Binary size={16}/> {t.scoring.loadReplay}
                  </Button>
                  <input type="file" ref={replayInputRef} onChange={handleReplayUpload} className="hidden" accept=".json"/>
                  <Button onClick={() => setStep(Step.DASHBOARD)}>
                      {t.scoring.results} <ArrowRight size={18}/>
                  </Button>
              </div>
          </div>

          <div className="bg-panel border border-theme rounded-xl overflow-hidden shadow-lg">
              {/* Tabs */}
              <div className="flex overflow-x-auto bg-black/40 border-b border-theme no-scrollbar">
                  {Array.from({length: 8}, (_, i) => i + 1).map(num => (
                      <button
                        key={num}
                        onClick={() => setCurrentMatchTab(num)}
                        className={`
                            flex-1 min-w-[60px] py-4 text-sm font-bold uppercase border-b-2 transition-colors
                            ${currentMatchTab === num ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}
                        `}
                      >
                          Queda {num}
                      </button>
                  ))}
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-black/20 text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-4 md:col-span-5">Time</div>
                  <div className="col-span-3 text-center">Kills</div>
                  <div className="col-span-4 md:col-span-3 text-center">Pontos Totais</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-800">
                  {teams.map(team => {
                      const score = matchScores[currentMatchTab]?.[team.id] || { rank: '', kills: '', playerKills: {} };
                      const ptsRank = typeof score.rank === 'number' ? POINTS_SYSTEM[score.rank] || 0 : 0;
                      const ptsKills = typeof score.kills === 'number' ? score.kills : 0;
                      const total = ptsRank + ptsKills;

                      return (
                          <div key={team.id} className={`grid grid-cols-12 gap-2 px-6 py-3 items-center hover:bg-white/5 transition-colors ${typeof score.rank === 'number' && score.rank === 1 ? 'bg-yellow-500/10' : ''}`}>
                              <div className="col-span-1">
                                  <input 
                                    type="number" 
                                    value={score.rank} 
                                    onChange={(e) => handleScoreChange(currentMatchTab, team.id, 'rank', e.target.value)}
                                    className={`w-full bg-background border rounded text-center font-bold outline-none focus:border-primary py-1 ${typeof score.rank === 'number' && score.rank === 1 ? 'border-yellow-500 text-yellow-500' : 'border-gray-700 text-white'}`}
                                  />
                              </div>
                              <div className="col-span-4 md:col-span-5 flex items-center gap-2 overflow-hidden">
                                  <div className="w-1 h-8 rounded-full" style={{backgroundColor: team.color}}></div>
                                  <span className="font-bold truncate">{team.name}</span>
                                  {typeof score.rank === 'number' && score.rank === 1 && <Crown size={14} className="text-yellow-500"/>}
                              </div>
                              <div className="col-span-3">
                                  <input 
                                    type="number" 
                                    value={score.kills} 
                                    onChange={(e) => handleScoreChange(currentMatchTab, team.id, 'kills', e.target.value)}
                                    className="w-full bg-background border border-gray-700 rounded text-center text-white font-bold outline-none focus:border-primary py-1"
                                  />
                              </div>
                              <div className="col-span-4 md:col-span-3 text-center font-mono font-bold text-lg text-primary">
                                  {total > 0 ? total : '-'}
                              </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      </div>
  );

  const renderDashboard = () => (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                  <h2 className="text-4xl font-display font-bold text-white tracking-tight">{t.dashboard.resultTitle}</h2>
                  <p className="text-gray-400">{trainingName} • {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                   <Button variant="secondary" onClick={saveToHub}><Save size={18}/> {t.dashboard.saveHub}</Button>
                   <Button variant="secondary" onClick={downloadSocialBanner}><ShareIcon size={18}/> {t.dashboard.social}</Button>
                   <Button onClick={() => setStep(Step.VIEWER)}><Monitor size={18}/> Viewer Mode</Button>
              </div>
          </div>

          {/* Top 3 Cards */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 items-end max-w-4xl mx-auto py-8">
              {leaderboard.slice(0, 3).map((team, idx) => {
                  const isFirst = idx === 0;
                  const isSecond = idx === 1;
                  const isThird = idx === 2;
                  
                  // Reorder for visual podium: 2nd, 1st, 3rd
                  let orderClass = '';
                  let heightClass = '';
                  let colorClass = '';
                  
                  if (isFirst) { orderClass = 'order-2'; heightClass = 'h-48 md:h-64'; colorClass = 'bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 border-yellow-500'; }
                  if (isSecond) { orderClass = 'order-1'; heightClass = 'h-40 md:h-52'; colorClass = 'bg-gradient-to-t from-gray-400/20 to-gray-400/5 border-gray-400'; }
                  if (isThird) { orderClass = 'order-3'; heightClass = 'h-32 md:h-44'; colorClass = 'bg-gradient-to-t from-orange-700/20 to-orange-700/5 border-orange-700'; }

                  return (
                      <div key={team.teamId} className={`${orderClass} flex flex-col items-center animate-in slide-in-from-bottom duration-700`} style={{animationDelay: `${idx*150}ms`}}>
                           <div className="mb-3 relative">
                               {isFirst && <Crown className="text-yellow-500 absolute -top-8 left-1/2 -translate-x-1/2" size={32} />}
                        </div>
                        <div className={`w-full ${heightClass} ${colorClass} rounded-t-xl relative border-t border-x shadow-[0_0_30px_rgba(0,0,0,0.5)] bg-panel/80 backdrop-blur-sm flex flex-col items-center justify-end p-4 group overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <h3 className="font-bold text-lg md:text-xl text-white text-center leading-none">{team.teamName}</h3>
                                <div className="text-xs font-mono font-bold text-gray-400 bg-black/50 px-2 py-0.5 rounded flex items-center gap-2">
                                    <span>{team.totalPoints} PTS</span>
                                    {team.booyahs > 0 && <span className="text-yellow-500 flex items-center gap-1">| {team.booyahs} <Crown size={10}/></span>}
                                </div>
                            </div>
                            <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                        </div>
                    </div>
                  );
              })}
          </div>

          {/* Main Table & Stats */}
          <div className="bg-panel border border-theme rounded-xl overflow-hidden shadow-xl" ref={bannerRef}>
                <div className="flex border-b border-theme">
                    <button 
                        onClick={() => setDashboardTab('leaderboard')}
                        className={`flex-1 py-4 text-center font-bold uppercase text-sm tracking-wide transition-colors ${dashboardTab === 'leaderboard' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        {t.dashboard.tabRank}
                    </button>
                    <button 
                        onClick={() => setDashboardTab('mvp')}
                        className={`flex-1 py-4 text-center font-bold uppercase text-sm tracking-wide transition-colors ${dashboardTab === 'mvp' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                        {t.dashboard.tabMvp}
                    </button>
                </div>
                
                <div className="p-0">
                    {dashboardTab === 'leaderboard' ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-black/40 text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-3 text-center w-12">#</th>
                                        <th className="p-3">{t.dashboard.table.team}</th>
                                        <th className="p-3 text-center">{t.dashboard.table.booyah}</th>
                                        <th className="p-3 text-center">{t.dashboard.table.killPts}</th>
                                        <th className="p-3 text-center">{t.dashboard.table.pos}</th>
                                        <th className="p-3 text-center text-primary">{t.dashboard.table.total}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-sm">
                                    {leaderboard.map((team, idx) => (
                                        <tr key={team.teamId} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-center font-mono text-gray-500">{idx + 1}</td>
                                            <td className="p-3 font-bold flex items-center gap-2">
                                                <div className="w-1 h-4 rounded-full" style={{backgroundColor: teams.find(t => t.id === team.teamId)?.color}}></div>
                                                {team.teamName}
                                            </td>
                                            <td className="p-3 text-center text-gray-400">{team.booyahs}</td>
                                            <td className="p-3 text-center text-gray-400">{team.totalKills} <span className="text-[10px] opacity-50">({team.killPoints})</span></td>
                                            <td className="p-3 text-center text-gray-400">{team.placementPoints}</td>
                                            <td className="p-3 text-center font-bold text-lg text-white font-mono">{team.totalPoints}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                             <table className="w-full text-left border-collapse">
                                <thead className="bg-black/40 text-[10px] uppercase text-gray-500 font-bold tracking-wider">
                                    <tr>
                                        <th className="p-3 text-center w-12">#</th>
                                        <th className="p-3">{t.dashboard.table.player}</th>
                                        <th className="p-3 text-center">Kills</th>
                                        <th className="p-3 text-center">{t.dashboard.table.damage}</th>
                                        <th className="p-3 text-center">{t.dashboard.table.time}</th>
                                        <th className="p-3 text-center text-purple-400">{t.dashboard.table.mvpScore}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800 text-sm">
                                    {playerStats.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                                                {t.dashboard.emptyPlayer}
                                            </td>
                                        </tr>
                                    ) : (
                                        playerStats.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="p-3 text-center font-mono text-gray-500">{idx + 1}</td>
                                                <td className="p-3 font-bold flex flex-col">
                                                    <span>{p.name}</span>
                                                    <span className="text-[10px] text-gray-500" style={{color: p.teamColor}}>{p.teamName}</span>
                                                </td>
                                                <td className="p-3 text-center text-gray-400">{p.totalKills}</td>
                                                <td className="p-3 text-center text-gray-400">{p.totalDamage?.toLocaleString()}</td>
                                                <td className="p-3 text-center text-gray-400">{p.timeAlive ? Math.floor(p.timeAlive / 60) + 'm' : '-'}</td>
                                                <td className="p-3 text-center font-bold text-purple-400 font-mono">{p.mvpScore?.toFixed(1)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                             </table>
                        </div>
                    )}
                </div>
          </div>
      </div>
  );

  const renderViewer = () => (
      <div className="fixed inset-0 bg-[#0a0a0a] z-[200] flex flex-col overflow-hidden animate-fade-in">
          <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#111]">
               <h1 className="font-display font-bold text-2xl text-white tracking-widest flex items-center gap-2">
                   <Zap className="text-primary" fill="currentColor"/> VIEWER <span className="text-primary">MODE</span>
               </h1>
               <div className="flex items-center gap-4">
                   <div className="flex bg-black rounded-lg p-1 border border-gray-800">
                       <button onClick={() => setViewerTab('ranking')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all ${viewerTab === 'ranking' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>{t.viewer.ranking}</button>
                       <button onClick={() => setViewerTab('drops')} className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition-all ${viewerTab === 'drops' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>{t.viewer.drops}</button>
                   </div>
                   <button onClick={() => setStep(Step.DASHBOARD)} className="text-red-500 hover:text-red-400 flex items-center gap-2 text-sm font-bold uppercase"><X size={18}/> {t.viewer.exit}</button>
               </div>
          </div>

          <div className="flex-1 overflow-hidden relative p-8 flex items-center justify-center">
              {viewerTab === 'ranking' ? (
                  <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {leaderboard.map((team, idx) => (
                          <div key={team.teamId} className="bg-[#151515] border border-gray-800 rounded-xl p-4 flex items-center gap-4 shadow-xl transform transition-all hover:scale-105 hover:border-gray-600">
                               <div className="font-display font-black text-4xl text-gray-700 w-12 text-center">{idx + 1}</div>
                               <div className="flex-1">
                                   <h3 className="font-bold text-xl text-white mb-1">{team.teamName}</h3>
                                   <div className="flex gap-4 text-xs font-mono text-gray-400">
                                       <span className="flex items-center gap-1"><Target size={12}/> {team.totalKills}</span>
                                       <span className="flex items-center gap-1"><Crown size={12}/> {team.booyahs}</span>
                                   </div>
                               </div>
                               <div className="text-3xl font-bold text-primary">{team.totalPoints}</div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <div className="text-center">
                          <MapIcon size={64} className="mx-auto mb-4 opacity-20"/>
                          <h3 className="text-2xl font-bold">MAP OVERVIEW</h3>
                          <p>Coming Soon</p>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  return (
    <div className={`min-h-screen bg-background text-main font-sans selection:bg-primary selection:text-black ${isDarkMode ? 'dark' : ''}`}>
        {step === Step.HOME && renderHome()}
        
        {step !== Step.HOME && step !== Step.VIEWER && (
            <div className="flex flex-col min-h-screen">
                <header className="h-16 border-b border-theme bg-panel/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50">
                     <div className="flex items-center gap-4">
                         <button onClick={handleBack} className="p-2 hover:bg-white/5 rounded-full text-muted hover:text-white transition-colors"><ChevronLeft/></button>
                         <h1 className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-2">
                             <Zap className="text-primary" fill="currentColor"/> FREE FIRE <span className="text-primary">TRAINING</span>
                         </h1>
                     </div>
                     <div className="flex items-center gap-3">
                         <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-muted hover:text-white">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
                         <button onClick={() => setLang(lang === 'pt' ? 'en' : lang === 'en' ? 'es' : 'pt')} className="p-2 text-muted hover:text-white font-mono text-xs font-bold border border-theme rounded px-2">{lang.toUpperCase()}</button>
                         <button onClick={handleHome} className="p-2 text-muted hover:text-red-500"><Home size={20}/></button>
                     </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
                    {renderStepper()}
                    
                    <ErrorBoundary>
                        {step === Step.WAITING_LIST && renderWaitingList()}
                        {step === Step.PUBLIC_HUB && renderPublicHub()}
                        {step === Step.MODE_SELECT && renderModeSelect()}
                        {step === Step.TEAM_REGISTER && renderTeamRegister()}
                        {step === Step.MAP_SORT && renderMapSort()}
                        {step === Step.STRATEGY && renderStrategy()}
                        {step === Step.SCORING && renderScoring()}
                        {step === Step.DASHBOARD && renderDashboard()}
                    </ErrorBoundary>
                </main>

                {/* Global Footer for non-Home pages */}
                <footer className="border-t border-theme bg-panel/30 p-4 flex justify-center items-center">
                     <a 
                        href="https://www.instagram.com/jhanmedeiros/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[10px] font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest"
                    >
                        {t.hero.footer} <Instagram size={12}/>
                    </a>
                </footer>
            </div>
        )}

        {step === Step.VIEWER && renderViewer()}
        
        {renderHelpModal()}
        {renderDeleteModal()}
        {renderVisualizerModal()}
    </div>
  );
}

export default App;