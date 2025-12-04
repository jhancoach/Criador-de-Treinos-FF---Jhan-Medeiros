import React, { Component, useState, useEffect, useMemo, useRef, ErrorInfo, ReactNode } from 'react';
import { 
  Languages, Zap, ArrowRight, ListPlus, Globe, Map as MapIcon, Users, BarChart2, Share2, Instagram,
  ClipboardList, Check, Save, Trash2, Upload, AlertTriangle, MousePointer2, RefreshCw, Download, Image,
  Binary, Crown, Monitor, X, Target, Info, ShieldCheck, UserPlus, Unlock, Home, ChevronLeft, Sun, Moon, HelpCircle, FileJson, Trophy, Flame, Clock
} from 'lucide-react';
import { 
  Step, Language, Team, TrainingMode, MatchScore, ProcessedScore, 
  Position, SavedTrainingSession, OpenTraining, TrainingRequest, 
  ReplayEvent, PlayerAnalysis, PlayerStats, POINTS_SYSTEM 
} from './types';
import { MAPS, WARNINGS } from './constants';
import { Button } from './components/Button';
import { DraggableMap } from './components/DraggableMap';
import { Tooltip } from './components/Tooltip';
import * as htmlToImage from 'html-to-image';

const TEAM_COLORS = [
    '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', 
    '#007AFF', '#5856D6', '#FF2D55', '#A2845E', '#8E8E93',
    '#E056FD', '#22A6B3', '#F0932B', '#6AB04C', '#EB4D4B'
];

const TRANSLATIONS = {
  pt: {
    hero: { subtitle: 'GERENCIADOR DE BATTLE ROYALE', title1: 'CRIADOR DE', title2: 'TREINO', desc: 'A plataforma mais completa para gestão competitiva. Sorteio de mapas, tabela automática e estatísticas detalhadas.', start: 'COMEÇAR', queue: 'TREINOS ROLANDO', hub: 'HUB PÚBLICO', footer: 'CRIADO POR JHAN' },
    steps: { maps: 'Mapas', teams: 'Times', calls: 'Calls', scoring: 'Pontos', results: 'Resultados' },
    mode: { title: 'SELECIONE O MODO', basic: 'Básico', basicDesc: 'Modo simplificado. Listas de texto para sorteio e calls. Ideal para treinos rápidos.', premium: 'Premium', premiumDesc: 'Modo Visual. Mapas interativos, sorteio animado e posicionamento visual.', premiumPlus: 'Premium Plus', premiumPlusDesc: 'Modo Automático. Importação de JSON para estatísticas de MVP, Dano e Kills.', recommended: 'VISUAL', feats: { cityList: 'Calls por Lista', mapSort: 'Sorteio em Texto', scoreTable: 'Tabela Manual', interactive: 'Mapas Interativos', dragDrop: 'Posicionamento Visual', replay: 'Importação JSON', mvp: 'MVP e Dano Real' } },
    register: { title: 'REGISTRO DE TIMES', placeholder: 'Nome do Time (Ex: LOUD, FX, PAIN)...', add: 'ADICIONAR', next: 'PRÓXIMO', empty: 'Nenhum time adicionado.', copied: 'Copiado!', shareLineup: 'Compartilhar Escalação', tip: 'Dica: Use a TAG do time igual ao jogo para o Premium Plus funcionar automaticamente.' },
    sort: { title: 'SORTEIO DE MAPAS', spin: 'SORTEAR ORDEM', respin: 'SORTEAR NOVAMENTE', strategy: 'DEFINIR ESTRATÉGIA', pool: 'Mapas Disponíveis', basicTitle: 'Ordem dos Mapas' },
    strategy: { title: 'DEFINIÇÃO DE CALLS', import: 'Importar', saveJson: 'JSON', saveImg: 'Imagem', scoring: 'PONTUAÇÃO', match: 'Queda', select: 'Selecione a Call...', free: 'LIVRE', defineCalls: 'Definir Calls (Lista)' },
    scoring: { title: 'PONTUAÇÃO', rank: 'Rank #', kills: 'Kills', loadReplay: 'Carregar Arquivo .JSON', results: 'VER RESULTADOS', manual: 'Tabela de Pontuação', dragJson: 'Arraste o arquivo JSON aqui ou clique para selecionar', successJson: 'Arquivo processado com sucesso!', errorJson: 'Erro ao ler arquivo. Verifique o formato.' },
    dashboard: { title: 'RESULTADOS & ESTATÍSTICAS', tabRank: 'CLASSIFICAÇÃO', tabMvp: 'MVP & STATS', social: 'Compartilhar', saveHub: 'Publicar no Hub', table: { team: 'Time', total: 'Pts Totais', pos: 'Posição (Pts)', killPts: 'Kills (Pts)', booyah: 'Booyahs', last: 'Última Queda', player: 'Jogador', mvpScore: 'MVP Score', damage: 'Dano', time: 'Tempo Vivo' }, emptyPlayer: 'Nenhum dado de jogador. No modo Premium Plus, os dados vêm do JSON.', resultTitle: 'RESULTADO FINAL', points: 'PONTOS' },
    waiting: { title: 'LISTA DE ESPERA & TREINOS', adminArea: 'Área do Organizador', yourName: 'Seu Nome/Nick', trainingName: 'Nome do Treino', pin: 'PIN de Segurança (ex: 1234)', create: 'CRIAR LISTA', successCreate: 'Lista de espera criada com sucesso!', requestTitle: 'Solicitar Vaga', selectTraining: 'Selecione um Treino...', yourTeam: 'Nome do Seu Time', sendRequest: 'ENVIAR SOLICITAÇÃO', successRequest: 'Solicitação enviada!', queue: 'Treinos Disponíveis (Rolando Agora)', generate: 'GERAR TREINO', delete: 'Tem certeza que deseja apagar esta lista?' },
    hub: { title: 'HUB DE TREINOS', desc: 'Seu Histórico de Sessões Salvas', info: 'Os dados são salvos no cache deste navegador.', empty: 'Nenhum treino salvo encontrado', load: 'Carregar este treino', delete: 'Excluir permanentemente', confirmLoad: 'Carregar este treino substituirá os dados atuais. Continuar?', emptyDesc: 'Para ver seus treinos aqui, clique em "Publicar no Hub" na tela de Resultados após finalizar uma sessão.' },
    common: { error: 'Ops! Algo deu errado.', reload: 'Recarregar Página', back: 'Voltar', home: 'Ir para Início', draft: 'Salvar Rascunho', help: 'Ajuda', theme: 'Cor Destaque', language: 'Idioma', dark: 'Modo Escuro', light: 'Modo Claro', confirmHome: 'Tem certeza? Todo o progresso não salvo pode ser perdido.', draftSaved: 'Rascunho salvo no navegador!', draftLoaded: 'Rascunho carregado com sucesso!', yes: 'Sim', no: 'Não', cancel: 'Cancelar', overview: 'Visão Geral', howTo: 'Como Usar', interactiveMap: 'Mapa Interativo' }
  },
  en: {
    hero: { subtitle: 'BATTLE ROYALE MANAGER', title1: 'ORGANIZE YOUR', title2: 'TOURNAMENT', desc: 'The most complete platform for competitive management. Map draw, automated leaderboard and detailed statistics.', start: 'START NOW', queue: 'LIVE TRAININGS', hub: 'PUBLIC HUB', footer: 'CREATED BY JHAN' },
    steps: { maps: 'Maps', teams: 'Teams', calls: 'Strategy', scoring: 'Scoring', results: 'Results' },
    mode: { title: 'SELECT MODE', basic: 'Basic', basicDesc: 'Simplified mode. Text lists for sorting and calls. Ideal for quick practice.', premium: 'Premium', premiumDesc: 'Visual Mode. Interactive maps, animated draw, and visual positioning.', premiumPlus: 'Premium Plus', premiumPlusDesc: 'Automated Mode. JSON import for MVP, Damage, and Kill stats.', recommended: 'VISUAL', feats: { cityList: 'List Calls', mapSort: 'Text Draw', scoreTable: 'Manual Table', interactive: 'Interactive Maps', dragDrop: 'Visual Positioning', replay: 'JSON Import', mvp: 'MVP & Real Damage' } },
    register: { title: 'TEAM REGISTRATION', placeholder: 'Team Name (e.g. LOUD)...', add: 'ADD', next: 'NEXT', empty: 'No teams added.', copied: 'Copied!', shareLineup: 'Share Lineup', tip: 'Tip: Use the team TAG matching the game for Premium Plus to work automatically.' },
    sort: { title: 'MAP SORT', spin: 'SPIN MAPS', respin: 'SPIN AGAIN', strategy: 'DEFINE STRATEGY', pool: 'Available Maps', basicTitle: 'Map Order' },
    strategy: { title: 'STRATEGY DEFINITION', import: 'Import', saveJson: 'JSON', saveImg: 'Image', scoring: 'SCORING', match: 'Match', select: 'Select Call...', free: 'FREE', defineCalls: 'Define Calls (List)' },
    scoring: { title: 'SCORING', rank: 'Rank #', kills: 'Kills', loadReplay: 'Load .JSON File', results: 'VIEW RESULTS', manual: 'Score Table', dragJson: 'Drag JSON file here or click to select', successJson: 'File processed successfully!', errorJson: 'Error reading file.' },
    dashboard: { title: 'RESULTS & STATISTICS', tabRank: 'LEADERBOARD', tabMvp: 'MVP & STATS', social: 'Share', saveHub: 'Publish to Hub', table: { team: 'Team', total: 'Total Pts', pos: 'Pos (Pts)', killPts: 'Kills (Pts)', booyah: 'Booyahs', last: 'Last Match', player: 'Player', mvpScore: 'MVP Score', damage: 'Damage', time: 'Time Alive' }, emptyPlayer: 'No player data. In Premium Plus, data comes from JSON.', resultTitle: 'FINAL RESULT', points: 'POINTS' },
    waiting: { title: 'WAITING LIST & LIVE', adminArea: 'Organizer Area', yourName: 'Your Name/Nick', trainingName: 'Training Name', pin: 'Security PIN (e.g. 1234)', create: 'CREATE LIST', successCreate: 'Waiting list created successfully!', requestTitle: 'Request Entry', selectTraining: 'Select Training...', yourTeam: 'Your Team Name', sendRequest: 'SEND REQUEST', successRequest: 'Request sent!', queue: 'Ongoing Trainings', generate: 'GENERATE TRAINING', delete: 'Are you sure you want to delete this list?' },
    hub: { title: 'TRAINING HUB', desc: 'Your Saved Session History', info: 'Data is saved in this browser\'s cache.', empty: 'No saved trainings found', load: 'Load this training', delete: 'Delete permanently', confirmLoad: 'Loading this training will replace current data. Continue?', emptyDesc: 'To see your trainings here, click "Publish to Hub" on the Results screen after finishing a session.' },
    common: { error: 'Oops! Algo deu errado.', reload: 'Reload Page', back: 'Back', home: 'Go Home', draft: 'Save Draft', help: 'Help', theme: 'Accent Color', language: 'Language', dark: 'Dark Mode', light: 'Light Mode', confirmHome: 'Are you sure? All unsaved progress may be lost.', draftSaved: 'Draft saved in browser!', draftLoaded: 'Draft loaded successfully!', yes: 'Yes', no: 'No', cancel: 'Cancel', overview: 'Overview', howTo: 'How to Use', interactiveMap: 'Interactive Map' }
  },
  es: {
    hero: { subtitle: 'GESTOR DE BATTLE ROYALE', title1: 'ORGANIZA TU', title2: 'TORNEO', desc: 'La plataforma más completa para gestión competitiva. Sorteio de mapas, tabla automática e estatísticas detalladas.', start: 'EMPEZAR', queue: 'ENTRENAMIENTOS', hub: 'HUB PÚBLICO', footer: 'CREADO POR JHAN' },
    steps: { maps: 'Mapas', teams: 'Equipos', calls: 'Calls', scoring: 'Puntos', results: 'Resultados' },
    mode: { title: 'SELECCIONAR MODO', basic: 'Básico', basicDesc: 'Modo simplificado. Listas de texto para sorteo y calls. Ideal para prácticas rápidas.', premium: 'Premium', premiumDesc: 'Modo Visual. Mapas interactivos, sorteo animado y posicionamento visual.', premiumPlus: 'Premium Plus', premiumPlusDesc: 'Modo Automático. Importación de JSON para estadísticas de MVP, Daño y Kills.', recommended: 'VISUAL', feats: { cityList: 'Calls por Lista', mapSort: 'Sorteo de Texto', scoreTable: 'Tabla Manual', interactive: 'Mapas Interactivos', dragDrop: 'Posicionamento Visual', replay: 'Importación JSON', mvp: 'MVP y Daño Real' } },
    register: { title: 'REGISTRO DE EQUIPOS', placeholder: 'Nombre del Equipo (Ej: LOUD)...', add: 'AGREGAR', next: 'SIGUIENTE', empty: 'Ningún equipo agregado.', copied: '¡Copiado!', shareLineup: 'Compartir Alineación', tip: 'Consejo: Usa el TAG del equipo igual al juego para que Premium Plus funcione automáticamente.' },
    sort: { title: 'SORTEO DE MAPAS', spin: 'SORTEAR MAPAS', respin: 'SORTEAR NUEVAMENTE', strategy: 'DEFINIR ESTRATEGIA', pool: 'Mapas Disponibles', basicTitle: 'Orden de Mapas' },
    strategy: { title: 'DEFINICIÓN DE CALLS', import: 'Importar', saveJson: 'JSON', saveImg: 'Imagem', scoring: 'PUNTUACIÓN', match: 'Partida', select: 'Seleccione Call...', free: 'LIBRE', defineCalls: 'Definir Calls (Lista)' },
    scoring: { title: 'PUNTUACIÓN', rank: 'Rank #', kills: 'Kills', loadReplay: 'Cargar Archivo .JSON', results: 'VER RESULTADOS', manual: 'Tabla de Puntuación', dragJson: 'Arrastre el archivo JSON aquí o haga clic para seleccionar', successJson: '¡Archivo procesado con éxito!', errorJson: 'Error al leer el archivo.' },
    dashboard: { title: 'RESULTADOS Y ESTADÍSTICAS', tabRank: 'CLASIFICACIÓN', tabMvp: 'MVP Y STATS', social: 'Compartir', saveHub: 'Publicar en Hub', table: { team: 'Equipo', total: 'Pts Totales', pos: 'Pos (Pts)', killPts: 'Kills (Pts)', booyah: 'Booyahs', last: 'Última Partida', player: 'Jugador', mvpScore: 'MVP Score', damage: 'Daño', time: 'Tiempo Vivo' }, emptyPlayer: 'Aún no hay datos de jugadores. En modo Premium Plus, los datos vienen del JSON.', resultTitle: 'RESULTADO FINAL', points: 'PUNTOS' },
    waiting: { title: 'LISTA DE ESPERA Y VIVO', adminArea: 'Área del Organizador', yourName: 'Tu Nombre/Nick', trainingName: 'Nombre del Entrenamiento', pin: 'PIN de Seguridad (ej: 1234)', create: 'CREAR LISTA', successCreate: '¡Lista de espera creada con éxito!', requestTitle: 'Solicitar Cupo', selectTraining: 'Selecciona un Entrenamiento...', yourTeam: 'Nombre de tu Equipo', sendRequest: 'ENVIAR SOLICITUD', successRequest: '¡Solicitud enviada!', queue: 'Entrenamientos en Curso', generate: 'GENERAR ENTRENAMIENTO', delete: '¿Seguro que deseas eliminar esta lista?' },
    hub: { title: 'HUB DE ENTRENAMIENTOS', desc: 'Tu Historial de Sesiones', info: 'Los datos se guardan en la caché de este navegador.', empty: 'No se encontraron entrenamientos guardados', load: 'Cargar este entrenamiento', delete: 'Eliminar permanentemente', confirmLoad: 'Cargar este entrenamiento reemplazará los datos actuales. ¿Continuar?', emptyDesc: 'Para ver tus entrenamientos aquí, haz clic en "Publicar en Hub" en la pantalla de Resultados después de finalizar una sesión.' },
    common: { error: '¡Ups! Algo salió mal.', reload: 'Recargar Página', back: 'Volver', home: 'Ir al Inicio', draft: 'Guardar Borrador', help: 'Ayuda', theme: 'Color Destacado', language: 'Idioma', dark: 'Modo Oscuro', light: 'Modo Claro', confirmHome: '¿Estás seguro? Todo el progreso no guardado se perderá.', draftSaved: '¡Borrador guardado en el navegador!', draftLoaded: '¡Borrador cargado con éxito!', yes: 'Sí', no: 'No', cancel: 'Cancelar', overview: 'Visión General', howTo: 'Cómo Usar', interactiveMap: 'Mapa Interativo' }
  }
};

const STEPS_FLOW = [
    { id: Step.TEAM_REGISTER, labelKey: 'teams', icon: Users },
    { id: Step.MAP_SORT, labelKey: 'maps', icon: Globe },
    { id: Step.STRATEGY, labelKey: 'calls', icon: Target },
    { id: Step.SCORING, labelKey: 'scoring', icon: ClipboardList },
    { id: Step.DASHBOARD, labelKey: 'results', icon: BarChart2 },
];

// Error Boundary
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Error:", error, errorInfo); }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Crítico</h1>
          <p className="text-gray-400 mb-4">{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-yellow-500 text-black font-bold rounded">Recarregar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  // State
  const [lang, setLang] = useState<Language>('pt');
  const [step, setStep] = useState<Step>(Step.HOME);
  const [mode, setMode] = useState<TrainingMode>('basic');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Data State
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [shuffledMaps, setShuffledMaps] = useState<string[]>([]);
  const [basicSelections, setBasicSelections] = useState<Record<string, Record<string, string>>>({});
  const [premiumPositions, setPremiumPositions] = useState<Record<string, Record<string, Position>>>({});
  const [matchScores, setMatchScores] = useState<Record<number, Record<string, MatchScore>>>({});
  const [playerExtendedStats, setPlayerExtendedStats] = useState<Record<string, PlayerAnalysis>>({});
  
  // UI State
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeStrategyMapIndex, setActiveStrategyMapIndex] = useState(0);
  const [currentMatchTab, setCurrentMatchTab] = useState(1);
  const [dashboardTab, setDashboardTab] = useState<'leaderboard' | 'mvp'>('leaderboard');
  const [savedTrainings, setSavedTrainings] = useState<SavedTrainingSession[]>([]);
  const [openTrainings, setOpenTrainings] = useState<OpenTraining[]>([]);
  
  // Waiting List Form
  const [wlAdminName, setWlAdminName] = useState('');
  const [wlTrainingName, setWlTrainingName] = useState('');
  const [wlPin, setWlPin] = useState('');
  
  // Refs
  const replayInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
      document.body.className = isDarkMode ? '' : 'light-mode';
      const savedHub = localStorage.getItem('jhantraining_hub_data');
      if (savedHub) setSavedTrainings(JSON.parse(savedHub));
      const savedWaiting = localStorage.getItem('jhantraining_waiting_list');
      if (savedWaiting) setOpenTrainings(JSON.parse(savedWaiting));
  }, [isDarkMode]);

  // --- Handlers ---
  const handleStart = () => setStep(Step.MODE_SELECT);
  const handleHome = () => { if(window.confirm(t.common.confirmHome)) setStep(Step.HOME); };
  const handleBack = () => {
    if(step === Step.MODE_SELECT) setStep(Step.HOME);
    else if(step === Step.TEAM_REGISTER) setStep(Step.MODE_SELECT);
    else if(step === Step.MAP_SORT) setStep(Step.TEAM_REGISTER);
    else if(step === Step.STRATEGY) setStep(Step.MAP_SORT);
    else if(step === Step.SCORING) setStep(Step.STRATEGY);
    else if(step === Step.DASHBOARD) setStep(Step.SCORING);
    else if(step === Step.WAITING_LIST || step === Step.PUBLIC_HUB) setStep(Step.HOME);
    else if(step === Step.VIEWER) setStep(Step.DASHBOARD);
  };

  const selectMode = (m: TrainingMode) => {
    setMode(m);
    setStep(Step.TEAM_REGISTER);
  };

  const getRandomColor = () => TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];

  const addTeam = () => {
    if (newTeamName.trim() && teams.length < 15) {
      setTeams([...teams, { id: `${Date.now()}`, name: newTeamName.trim(), color: getRandomColor(), players: [] }]);
      setNewTeamName('');
    }
  };

  const deleteTeam = (id: string) => {
      if(window.confirm('Delete team?')) setTeams(teams.filter(t => t.id !== id));
  };

  const spinRoulette = () => {
    setIsSpinning(true);
    let counter = 0;
    const allMaps = MAPS.map(m => m.id);
    const interval = setInterval(() => {
      setShuffledMaps([...allMaps].sort(() => Math.random() - 0.5));
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setShuffledMaps([...allMaps].sort(() => Math.random() - 0.5));
        setIsSpinning(false);
      }
    }, 100);
  };

  // Replay Logic
  const handleFileDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) readFile(file);
  };

  const handleReplayUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) readFile(file);
    e.target.value = '';
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const json = JSON.parse(ev.target?.result as string);
            processReplay(json);
        } catch(err) { alert(t.scoring.errorJson); }
    };
    reader.readAsText(file);
  };

  const processReplay = (data: { Events: ReplayEvent[] }) => {
    if (!data.Events) return;

    const playerStats: Record<string, {
        name: string,
        teamTag: string,
        kills: number,
        damage: number,
        firstEvent: number,
        lastEvent: number
    }> = {};

    const teamSurvival: Record<string, number> = {};

    // Pass 1: Aggregation
    data.Events.forEach(ev => {
        const playerName = ev.SParam || 'Unknown';
        // Extract Team Tag (Before first dot)
        const teamTag = playerName.includes('.') ? playerName.split('.')[0] : 'LIVRE';

        // Init player stats
        if (!playerStats[playerName] && (ev.Event === 2 || ev.Event === 4 || ev.Event === 1)) {
            playerStats[playerName] = {
                name: playerName,
                teamTag,
                kills: 0,
                damage: 0,
                firstEvent: ev.Time,
                lastEvent: ev.Time
            };
        }

        // Update timestamps
        if (playerStats[playerName]) {
            playerStats[playerName].firstEvent = Math.min(playerStats[playerName].firstEvent, ev.Time);
            playerStats[playerName].lastEvent = Math.max(playerStats[playerName].lastEvent, ev.Time);
        }

        // Damage (Event 2)
        if (ev.Event === 2 && ev.FParam) {
            if (playerStats[playerName]) playerStats[playerName].damage += ev.FParam;
        }

        // Kill (Event 4)
        if (ev.Event === 4) {
            if (playerStats[playerName]) playerStats[playerName].kills += 1;
        }

        // Team Elimination (Event 1) - Usually SParam is Team Name
        if (ev.Event === 1 && ev.SParam) {
             teamSurvival[ev.SParam] = ev.Time;
        }
    });

    // Sort Teams by Survival Time (Latest event = better rank)
    // If team is not in elimination list, it likely survived till end or wasn't eliminated explicitly
    const sortedTeamsBySurvival = Object.entries(teamSurvival)
        .sort(([, timeA], [, timeB]) => timeB - timeA)
        .map(([name]) => name);

    const newScores = { ...matchScores[currentMatchTab] } || {};
    const extendedStats: Record<string, PlayerAnalysis> = { ...playerExtendedStats };

    teams.forEach(appTeam => {
        // Tag Matching: Simple inclusion check or uppercase match
        const tag = appTeam.name; // User MUST register team with correct Tag
        
        // Find players for this tag
        const playersOfTeam = Object.values(playerStats).filter(p => p.teamTag.toUpperCase() === tag.toUpperCase());
        
        let teamKills = 0;
        const playerKillsMap: Record<string, number> = {};

        playersOfTeam.forEach(p => {
            teamKills += p.kills;
            playerKillsMap[p.name] = p.kills;

            const timeAlive = p.lastEvent - p.firstEvent;
            // MVP Formula: (Kills * 3) + (DanoTotal / 300) + (TempoVivo / 200)
            const mvpScore = (p.kills * 3) + (p.damage / 300) + (timeAlive / 200);

            extendedStats[p.name] = {
                name: p.name,
                teamTag: tag,
                kills: p.kills,
                damage: p.damage,
                firstEventTime: p.firstEvent,
                lastEventTime: p.lastEvent,
                mvpScore: mvpScore,
                timeAlive: timeAlive
            };
        });

        // Determine Rank
        const survivalIndex = sortedTeamsBySurvival.findIndex(t => t.toUpperCase() === tag.toUpperCase());
        // If not found in elimination, assume winner or high rank. 
        // For simplicity, if not eliminated, they are ranked 1 (or based on manual adjust).
        // If eliminated, rank is index + 2 (since index 0 is second place? logic depends on if winner has event)
        // Let's assume sortedTeamsBySurvival contains ALL teams if parsed correctly.
        // If 12 teams total, and 11 in list. Missing is #1.
        let rank = 1;
        if (survivalIndex !== -1) {
            // Logic: if 12 teams, index 0 is 1st eliminated? No, sort was time descending.
            // Time descending: Index 0 is Last Eliminated (2nd place).
            // Winner might not be in list.
            rank = survivalIndex + 2; // Index 0 -> Rank 2
        }

        newScores[appTeam.id] = {
            teamId: appTeam.id,
            rank: rank,
            kills: teamKills,
            playerKills: playerKillsMap
        };
    });
    
    setMatchScores({...matchScores, [currentMatchTab]: newScores});
    setPlayerExtendedStats(extendedStats);
    alert(t.scoring.successJson);
  };
  
  // Dashboard Calculations
  const leaderboard = useMemo(() => {
      const stats: Record<string, ProcessedScore> = {};
      teams.forEach(t => {
          stats[t.id] = { teamId: t.id, teamName: t.name, totalPoints: 0, placementPoints: 0, killPoints: 0, booyahs: 0, totalKills: 0, matchesPlayed: 0, lastMatchRank: 99 };
      });
      Object.entries(matchScores).forEach(([_, scores]) => {
          Object.values(scores).forEach(s => {
              if(stats[s.teamId] && typeof s.rank === 'number' && s.rank > 0) {
                  const placePts = POINTS_SYSTEM[s.rank] || 0;
                  const killPts = typeof s.kills === 'number' ? s.kills : 0;
                  stats[s.teamId].totalPoints += placePts + killPts;
                  stats[s.teamId].killPoints += killPts;
                  stats[s.teamId].placementPoints += placePts;
                  stats[s.teamId].totalKills += killPts;
                  if(s.rank === 1) stats[s.teamId].booyahs += 1;
              }
          });
      });
      return Object.values(stats).sort((a,b) => b.totalPoints - a.totalPoints || b.booyahs - a.booyahs);
  }, [teams, matchScores]);

  // MVP List
  const mvpList = useMemo(() => {
      return Object.values(playerExtendedStats).sort((a: PlayerAnalysis, b: PlayerAnalysis) => b.mvpScore - a.mvpScore);
  }, [playerExtendedStats]);

  // Waiting List Logic
  const createWaitingTraining = () => {
      if(!wlAdminName || !wlTrainingName || !wlPin) return;
      const newT: OpenTraining = { id: Date.now().toString(), adminName: wlAdminName, trainingName: wlTrainingName, adminPin: wlPin, requests: [], createdAt: Date.now() };
      const updated = [newT, ...openTrainings];
      setOpenTrainings(updated);
      localStorage.setItem('jhantraining_waiting_list', JSON.stringify(updated));
      alert(t.waiting.successCreate);
  };

  // Help Content
  const renderHelpModal = () => {
      if(!isHelpOpen) return null;
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsHelpOpen(false)}>
              <div className="bg-panel border border-theme rounded-2xl max-w-lg w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setIsHelpOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary"><HelpCircle/> Ajuda & Instruções</h3>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {mode === 'basic' && (
                          <div className="space-y-2">
                              <h4 className="font-bold text-white">Modo Básico</h4>
                              <p className="text-sm text-gray-400">Ideal para treinos rápidos. Utilize as listas para sortear mapas e definir calls manualmente.</p>
                          </div>
                      )}
                      {mode === 'premium' && (
                          <div className="space-y-2">
                              <h4 className="font-bold text-white">Modo Premium</h4>
                              <p className="text-sm text-gray-400">Use os mapas interativos. Arraste os nomes dos times para as posições desejadas. Use o scroll do mouse para dar zoom no mapa.</p>
                          </div>
                      )}
                      {mode === 'premium_plus' && (
                          <div className="space-y-2">
                              <h4 className="font-bold text-purple-400">Modo Premium Plus</h4>
                              <p className="text-sm text-gray-400">Este modo automatiza a pontuação. Na tela "Pontuação", arraste ou selecione o arquivo <code>.JSON</code> ou <code>.BIN</code> gerado pelo jogo.</p>
                              <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                                  <li>Certifique-se que o nome do time cadastrado aqui seja IGUAL à TAG do time no jogo (ex: LOUD).</li>
                                  <li>O sistema calculará automaticamente Kills, Rank e MVP.</li>
                              </ul>
                          </div>
                      )}
                      <div className="pt-4 border-t border-theme">
                          <h4 className="font-bold text-white text-sm mb-2">Teclas de Atalho</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                              <span>Esc: Fechar Modais</span>
                              <span>Scroll: Zoom no Mapa</span>
                          </div>
                      </div>
                  </div>
                  <Button className="w-full mt-6" onClick={() => setIsHelpOpen(false)}>Entendi</Button>
              </div>
          </div>
      );
  };

  // --- Renders ---
  const renderHome = () => (
    <div className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0a0a] text-white p-4 lg:p-12">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-6 right-6 z-20">
            <button onClick={() => setLang(lang === 'pt' ? 'en' : lang === 'en' ? 'es' : 'pt')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white">
                <Languages size={14} /><span>{lang === 'pt' ? 'PT-BR' : lang === 'en' ? 'EN-US' : 'ES-ES'}</span>
            </button>
        </div>
        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8 animate-in slide-in-from-left duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1A] border border-white/10 text-xs font-bold text-yellow-500 uppercase tracking-widest shadow-lg"><Zap size={14} fill="currentColor"/> {t.hero.subtitle}</div>
                <h1 className={`${lang === 'es' ? 'text-4xl md:text-5xl lg:text-7xl' : 'text-5xl md:text-6xl lg:text-8xl'} font-black leading-none tracking-tighter text-white transition-all duration-300`}>
                    {t.hero.title1}<br/><span className="text-[#FFD400]">{t.hero.title2}</span>
                </h1>
                <p className="text-base md:text-lg text-gray-400 max-w-lg leading-relaxed font-medium">{t.hero.desc}</p>
                <div className="flex flex-wrap gap-4 pt-2">
                    <button onClick={handleStart} className="px-8 py-4 bg-[#FFD400] text-black font-black text-lg rounded-xl hover:bg-[#ffe033] flex items-center gap-2">{t.hero.start} <ArrowRight size={24}/></button>
                    <button onClick={() => setStep(Step.WAITING_LIST)} className="px-8 py-4 bg-[#1A1A1A] border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-[#252525] flex items-center gap-2"><ListPlus size={24}/> {t.hero.queue}</button>
                    <button onClick={() => setStep(Step.PUBLIC_HUB)} className="px-8 py-4 bg-[#1A1A1A] border border-white/10 text-white font-bold text-lg rounded-xl hover:bg-[#252525] flex items-center gap-2"><Globe size={24}/> {t.hero.hub}</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right duration-700 delay-200">
                <div className="p-6 bg-[#121212] border border-white/5 rounded-2xl"><MapIcon size={24} className="text-blue-500 mb-4"/><h3 className="text-xl font-bold text-white mb-1">{t.steps.maps}</h3></div>
                <div className="p-6 bg-[#121212] border border-white/5 rounded-2xl"><Users size={24} className="text-green-500 mb-4"/><h3 className="text-xl font-bold text-white mb-1">{t.steps.teams}</h3></div>
                <div className="p-6 bg-[#121212] border border-white/5 rounded-2xl"><BarChart2 size={24} className="text-purple-500 mb-4"/><h3 className="text-xl font-bold text-white mb-1">Stats</h3></div>
                <div className="p-6 bg-[#121212] border border-white/5 rounded-2xl"><Share2 size={24} className="text-pink-500 mb-4"/><h3 className="text-xl font-bold text-white mb-1">Share</h3></div>
            </div>
        </div>
    </div>
  );

  const renderModeSelect = () => (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center animate-fade-in space-y-12 py-10">
        <div className="text-center space-y-4">
             <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">{t.mode.title}</h2>
             <p className="text-gray-400 max-w-2xl mx-auto text-lg opacity-80">Escolha a versão ideal para o seu nível de competição.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full px-4 md:px-0">
            {/* Basic */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all flex flex-col gap-6 group relative overflow-hidden h-full">
                <div className="w-14 h-14 bg-gray-800 rounded-xl flex items-center justify-center text-white mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ClipboardList size={28}/>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t.mode.basic}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{t.mode.basicDesc}</p>
                </div>
                
                <div className="space-y-3 my-4 flex-1">
                    {[t.mode.feats.cityList, t.mode.feats.mapSort, t.mode.feats.scoreTable].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                            <Check size={16} className="text-gray-500 shrink-0"/> {feat}
                        </div>
                    ))}
                </div>

                <Button onClick={() => selectMode('basic')} variant="secondary" className="w-full py-4 border-gray-700 hover:bg-gray-800">Selecionar Básico</Button>
            </div>

            {/* Premium */}
            <div className="bg-[#1A1A1A] border-2 border-primary/50 rounded-2xl p-8 flex flex-col gap-6 shadow-[0_0_50px_rgba(var(--color-primary),0.1)] relative transform lg:-translate-y-4 z-10 h-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black text-xs font-black tracking-widest px-4 py-1.5 rounded-full uppercase shadow-lg shadow-primary/20 whitespace-nowrap">
                    {t.mode.recommended}
                </div>
                
                 <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-black mb-2 shadow-lg shadow-primary/20 animate-bounce-slow">
                    <MapIcon size={28}/>
                </div>
                
                <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">{t.mode.premium}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{t.mode.premiumDesc}</p>
                </div>

                <div className="space-y-3 my-4 flex-1">
                     {[t.mode.feats.interactive, t.mode.feats.dragDrop, t.mode.feats.mapSort, t.mode.feats.scoreTable].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-white font-medium text-sm">
                            <div className="bg-primary/20 p-1 rounded-full shrink-0"><Check size={12} className="text-primary"/></div> {feat}
                        </div>
                    ))}
                </div>

                <Button onClick={() => selectMode('premium')} variant="primary" className="w-full py-4 font-bold text-lg">Selecionar Premium</Button>
            </div>

            {/* Premium Plus */}
             <div className="bg-[#121212] border border-purple-500/30 rounded-2xl p-8 hover:border-purple-500/60 transition-all flex flex-col gap-6 group relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="w-14 h-14 bg-purple-900/50 text-purple-400 border border-purple-500/20 rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Binary size={28}/>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-purple-400 mb-2">{t.mode.premiumPlus}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{t.mode.premiumPlusDesc}</p>
                </div>

                 <div className="space-y-3 my-4 flex-1">
                    {[t.mode.feats.replay, t.mode.feats.mvp, t.mode.feats.interactive, t.mode.feats.scoreTable].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                            <Check size={16} className="text-purple-500 shrink-0"/> {feat}
                        </div>
                    ))}
                </div>

                <Button onClick={() => selectMode('premium_plus')} variant="secondary" className="w-full py-4 border-purple-900/30 hover:bg-purple-900/20 hover:text-purple-400 hover:border-purple-500/50">Selecionar Plus</Button>
            </div>
        </div>
    </div>
  );

  const renderTeamRegister = () => (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 animate-fade-in">
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex items-center gap-3 text-sm text-blue-200">
            <Info size={16} /> {t.register.tip}
        </div>
        <div className="flex gap-4">
            <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTeam()} className="flex-1 bg-panel border border-theme rounded-lg px-4 py-3 text-white outline-none" placeholder={t.register.placeholder} />
            <Button onClick={addTeam} disabled={!newTeamName.trim()}><Users size={18}/> {t.register.add}</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {teams.map(team => (
                <div key={team.id} className="bg-panel border border-theme rounded-lg p-3 flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full" style={{backgroundColor: team.color}}></div>
                        <span className="font-bold text-sm">{team.name}</span>
                    </div>
                    <button onClick={() => deleteTeam(team.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
                </div>
            ))}
        </div>
        <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(Step.MAP_SORT)} size="lg" disabled={teams.length === 0}>{t.register.next} <ArrowRight size={20}/></Button>
        </div>
    </div>
  );

  const renderMapSort = () => {
    // Basic Mode: Simple List
    if (mode === 'basic') {
        return (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 animate-fade-in text-center py-10">
                <div className="w-full bg-panel border border-theme rounded-xl p-8">
                     <h2 className="text-2xl font-bold mb-6">{t.sort.basicTitle}</h2>
                     <Button onClick={spinRoulette} disabled={isSpinning} className="mb-6 w-full">
                        {isSpinning ? <RefreshCw className="animate-spin mr-2"/> : <RefreshCw className="mr-2"/>}
                        {shuffledMaps.length > 0 ? t.sort.respin : t.sort.spin}
                     </Button>
                     {shuffledMaps.length > 0 && (
                         <div className="flex flex-col gap-2">
                             {shuffledMaps.map((mapId, i) => (
                                 <div key={i} className="flex items-center gap-4 p-3 bg-black/40 rounded border border-white/5">
                                     <span className="font-mono text-gray-500 font-bold">#{i+1}</span>
                                     <span className="font-bold">{MAPS.find(m => m.id === mapId)?.name}</span>
                                 </div>
                             ))}
                         </div>
                     )}
                </div>
                {shuffledMaps.length > 0 && <Button onClick={() => setStep(Step.STRATEGY)} size="lg">{t.sort.strategy} <ArrowRight/></Button>}
            </div>
        );
    }
    
    // Premium & Plus: Visual Cards
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-8 animate-fade-in text-center py-10">
            <div className="w-full bg-panel border border-theme rounded-2xl p-8 relative overflow-hidden min-h-[400px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                <h2 className="text-2xl font-bold mb-6 relative z-10 uppercase tracking-widest">{t.sort.title}</h2>
                <div className="flex justify-center mb-8 relative z-10">
                    <Button onClick={spinRoulette} disabled={isSpinning} size="lg" className="h-20 text-2xl px-12 rounded-full shadow-2xl shadow-primary/20">
                        {isSpinning ? <RefreshCw className="animate-spin mr-3" size={28}/> : <Globe className="mr-3" size={28}/>} 
                        {shuffledMaps.length > 0 ? t.sort.respin : t.sort.spin}
                    </Button>
                </div>
                {shuffledMaps.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full relative z-10">
                        {shuffledMaps.map((mapId, idx) => {
                            const mapInfo = MAPS.find(m => m.id === mapId);
                            return (
                                <div key={idx} className="group relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-theme hover:border-primary transition-all shadow-lg animate-zoom-in" style={{animationDelay: `${idx*150}ms`}}>
                                    <img src={mapInfo?.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute bottom-0 left-0 w-full p-3">
                                        <div className="text-[10px] font-bold text-primary mb-1">MAPA {idx + 1}</div>
                                        <div className="text-lg font-black uppercase leading-none">{mapInfo?.name}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-5 gap-4 opacity-10 pointer-events-none">
                        {[1,2,3,4,5].map(i => <div key={i} className="aspect-[3/4] bg-gray-500 rounded-xl"></div>)}
                    </div>
                )}
            </div>
            {shuffledMaps.length > 0 && (
                <div className="animate-fade-in delay-500">
                    <Button onClick={() => setStep(Step.STRATEGY)} size="lg" className="px-12">{t.sort.strategy} <ArrowRight/></Button>
                </div>
            )}
        </div>
    );
  };

  const renderStrategy = () => (
    <div className="w-full h-full flex flex-col gap-4 animate-fade-in">
        <div className="flex gap-2 overflow-x-auto pb-2">
            {shuffledMaps.map((mapId, idx) => (
                <button key={idx} onClick={() => setActiveStrategyMapIndex(idx)} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase whitespace-nowrap ${activeStrategyMapIndex===idx ? 'bg-primary text-black' : 'bg-panel text-gray-500'}`}>
                    {MAPS.find(m => m.id === mapId)?.name} #{idx+1}
                </button>
            ))}
            <div className="ml-auto flex gap-2">
                <Button onClick={() => setStep(Step.SCORING)} size="sm">{t.strategy.scoring} <ArrowRight/></Button>
            </div>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row gap-4 h-[600px]">
            {/* Map Area */}
            {mode !== 'basic' ? (
                <div className="flex-1 bg-black/20 rounded-xl overflow-hidden relative border border-theme">
                    {shuffledMaps[activeStrategyMapIndex] && (
                        <DraggableMap
                            mapName={MAPS.find(m => m.id === shuffledMaps[activeStrategyMapIndex])?.name || ''}
                            image={MAPS.find(m => m.id === shuffledMaps[activeStrategyMapIndex])?.image || ''}
                            teams={teams}
                            positions={premiumPositions[shuffledMaps[activeStrategyMapIndex]] || {}}
                            onPositionChange={(tid, pos) => setPremiumPositions({...premiumPositions, [shuffledMaps[activeStrategyMapIndex]]: { ...premiumPositions[shuffledMaps[activeStrategyMapIndex]], [tid]: pos }})}
                            readOnly={false}
                        />
                    )}
                </div>
            ) : (
                <div className="flex-1 bg-panel border border-theme rounded-xl p-8 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        <MapIcon size={48} className="mx-auto mb-4 opacity-50"/>
                        <p>Mapa Visual desativado no modo Básico.</p>
                        <p className="text-xs mt-2">Use a lista ao lado para definir as calls.</p>
                    </div>
                </div>
            )}
            
            {/* Sidebar / Tools */}
            <div className="w-80 bg-panel border border-theme rounded-xl p-4 overflow-y-auto flex flex-col gap-4">
                 <div className="flex items-center gap-2 font-bold text-lg border-b border-theme pb-2">
                     {mode === 'basic' ? <ListPlus size={20} className="text-primary"/> : <MousePointer2 size={20} className="text-primary"/>}
                     {mode === 'basic' ? t.strategy.defineCalls : t.common.interactiveMap}
                 </div>

                 {mode === 'basic' ? (
                     <div className="space-y-3">
                         <p className="text-xs text-gray-400">Selecione a cidade para cada time.</p>
                         {teams.map(t => (
                             <div key={t.id} className="space-y-1">
                                 <div className="flex items-center gap-2">
                                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: t.color}}></div>
                                     <span className="text-sm font-bold">{t.name}</span>
                                 </div>
                                 <select 
                                    className="w-full bg-black border border-theme rounded px-2 py-1.5 text-xs text-white"
                                    value={basicSelections[shuffledMaps[activeStrategyMapIndex]]?.[t.id] || ''}
                                    onChange={(e) => setBasicSelections({
                                        ...basicSelections, 
                                        [shuffledMaps[activeStrategyMapIndex]]: {
                                            ...(basicSelections[shuffledMaps[activeStrategyMapIndex]] || {}),
                                            [t.id]: e.target.value
                                        }
                                    })}
                                 >
                                     <option value="">{t.strategy.select}</option>
                                     <option value="LIVRE">{t.strategy.free}</option>
                                     {MAPS.find(m => m.id === shuffledMaps[activeStrategyMapIndex])?.cities.map(city => (
                                         <option key={city} value={city}>{city}</option>
                                     ))}
                                 </select>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div>
                         <div className="text-xs text-gray-400 mb-4 bg-primary/10 p-2 rounded border border-primary/20">
                            Arraste os ícones ou nomes dos times diretamente no mapa para definir as posições.
                         </div>
                         <div className="space-y-2">
                            {teams.map(t => (
                                <div key={t.id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                                    // Optional: center map on this team or highlight
                                }}>
                                    <div className="w-3 h-3 rounded-full shadow-[0_0_5px_currentColor]" style={{backgroundColor: t.color}}></div>
                                    <span className="text-sm font-medium">{t.name}</span>
                                    {premiumPositions[shuffledMaps[activeStrategyMapIndex]]?.[t.id] && <Check size={12} className="ml-auto text-green-500"/>}
                                </div>
                            ))}
                         </div>
                     </div>
                 )}
            </div>
        </div>
    </div>
  );

  const renderScoring = () => (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
          <div className="flex justify-between items-center bg-panel p-4 rounded-xl border border-theme">
              <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-display font-bold text-primary">{t.scoring.title}</h2>
              </div>
              <Button onClick={() => setStep(Step.DASHBOARD)}>{t.scoring.results} <ArrowRight/></Button>
          </div>

          <div className="bg-panel border border-theme rounded-xl overflow-hidden shadow-xl p-6">
              <div className="flex overflow-x-auto border-b border-theme bg-black/40 p-1 gap-1 mb-6 rounded-lg">
                  {[1,2,3,4,5,6].map(num => (
                      <button 
                        key={num} 
                        onClick={() => setCurrentMatchTab(num)} 
                        className={`px-6 py-2 rounded-lg font-bold transition-all text-sm uppercase tracking-wider ${currentMatchTab===num ? 'bg-primary text-black shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                      >
                        Queda {num}
                      </button>
                  ))}
              </div>
              
              {/* Premium Plus Specific Upload Area */}
              {mode === 'premium_plus' && (
                  <div className="mb-8 animate-fade-in">
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleFileDrop}
                        onClick={() => replayInputRef.current?.click()}
                        className={`border-2 border-dashed ${isDragOver ? 'border-primary bg-primary/10' : 'border-purple-500/50 bg-purple-900/10'} hover:border-purple-400 hover:bg-purple-900/20 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all group`}
                      >
                           <input 
                            type="file" 
                            accept=".json,.bin" 
                            ref={replayInputRef} 
                            className="hidden" 
                            onChange={handleReplayUpload}
                        />
                        <div className="bg-purple-500/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                            <FileJson size={48} className="text-purple-400"/>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Importar Arquivo de Replay (.JSON / .BIN)</h3>
                        <p className="text-gray-400 text-sm max-w-md text-center">{t.scoring.dragJson}</p>
                        <div className="flex gap-4 mt-6 text-xs text-purple-300">
                             <span className="flex items-center gap-1 bg-purple-900/40 px-3 py-1 rounded border border-purple-500/30"><Flame size={12}/> Auto Kills</span>
                             <span className="flex items-center gap-1 bg-purple-900/40 px-3 py-1 rounded border border-purple-500/30"><Trophy size={12}/> Auto MVP</span>
                             <span className="flex items-center gap-1 bg-purple-900/40 px-3 py-1 rounded border border-purple-500/30"><Clock size={12}/> Auto Rank</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 my-6">
                          <div className="h-px bg-theme flex-1"></div>
                          <span className="text-xs text-gray-500 uppercase font-bold">OU (Edição Manual)</span>
                          <div className="h-px bg-theme flex-1"></div>
                      </div>
                  </div>
              )}

              {/* Standard Scoring Table (Always visible but secondary in Premium Plus) */}
              <div>
                  <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <Target size={14}/> {t.scoring.manual}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teams.map(team => {
                          const score = matchScores[currentMatchTab]?.[team.id] || { rank: '', kills: '' };
                          return (
                            <div key={team.id} className={`bg-black/40 border ${mode === 'premium_plus' ? 'border-theme opacity-80 hover:opacity-100' : 'border-theme'} rounded-lg p-3 flex flex-col gap-2 transition-all`}>
                                <div className="font-bold flex items-center gap-2 text-sm border-b border-white/5 pb-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: team.color}}></div>
                                    {team.name}
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Rank #</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-background border border-theme rounded p-2 text-center text-white font-mono focus:border-primary focus:outline-none" 
                                            value={score.rank} 
                                            onChange={e => setMatchScores({...matchScores, [currentMatchTab]: {...matchScores[currentMatchTab], [team.id]: {...score, rank: parseInt(e.target.value)||''}}})} 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-1 block">Kills</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-background border border-theme rounded p-2 text-center text-white font-mono focus:border-red-500 focus:outline-none" 
                                            value={score.kills} 
                                            onChange={e => setMatchScores({...matchScores, [currentMatchTab]: {...matchScores[currentMatchTab], [team.id]: {...score, kills: parseInt(e.target.value)||''}}})} 
                                        />
                                    </div>
                                </div>
                            </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderDashboard = () => (
      <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in pb-20">
          <div className="flex justify-between items-center">
              <h2 className="text-4xl font-display font-bold">{t.dashboard.resultTitle}</h2>
              <div className="flex gap-2">
                <Button onClick={() => setDashboardTab(dashboardTab === 'leaderboard' ? 'mvp' : 'leaderboard')} variant="secondary">
                    {dashboardTab === 'leaderboard' ? 'Ver MVP' : 'Ver Tabela'}
                </Button>
              </div>
          </div>

          {/* Leaderboard View */}
          {dashboardTab === 'leaderboard' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {leaderboard.slice(0,3).map((t, i) => (
                        <div key={t.teamId} className={`bg-panel border border-theme p-6 rounded-xl flex flex-col items-center ${i===0 ? 'border-yellow-500 order-2 scale-110 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : i===1 ? 'order-1' : 'order-3'}`}>
                            {i===0 && <Crown className="text-yellow-500 mb-2 fill-yellow-500/20" size={32}/>}
                            <h3 className="font-bold text-xl mb-1">{t.teamName}</h3>
                            <div className="text-4xl font-black text-primary tabular-nums">{t.totalPoints}</div>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500 font-bold uppercase">
                                <span>{t.booyahs} Booyahs</span>
                                <span>{t.totalKills} Kills</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-panel rounded-xl overflow-hidden border border-theme">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-xs uppercase text-gray-500 font-bold tracking-wider">
                            <tr><th className="p-4">#</th><th className="p-4">Team</th><th className="p-4 text-center">Booyahs</th><th className="p-4 text-center">Kills</th><th className="p-4 text-right">Points</th></tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((t, i) => (
                                <tr key={t.teamId} className="border-t border-theme hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-gray-500 font-mono font-bold w-16">{i+1}</td>
                                    <td className="p-4 font-bold text-lg">{t.teamName}</td>
                                    <td className="p-4 text-center text-gray-400 font-mono">{t.booyahs}</td>
                                    <td className="p-4 text-center text-gray-400 font-mono">{t.totalKills}</td>
                                    <td className="p-4 text-right font-black text-2xl text-primary tabular-nums">{t.totalPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
          )}

          {/* MVP View (Premium Plus) */}
          {dashboardTab === 'mvp' && (
            <div className="space-y-6">
                 {Object.keys(playerExtendedStats).length === 0 ? (
                     <div className="text-center py-20 text-gray-500 bg-panel rounded-xl border border-theme border-dashed">
                         <Trophy size={48} className="mx-auto mb-4 opacity-50"/>
                         <p>{mode === 'premium_plus' ? 'Faça upload do JSON na tela de Pontuação para ver os MVPs.' : 'Disponível apenas no modo Premium Plus com upload de JSON.'}</p>
                     </div>
                 ) : (
                     <div className="bg-panel rounded-xl overflow-hidden border border-theme">
                         <div className="p-4 border-b border-theme bg-purple-900/10 flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider">
                             <Trophy size={16}/> MVP Ranking (Algoritmo Premium)
                         </div>
                         <table className="w-full text-left">
                            <thead className="bg-black/40 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Rank</th>
                                    <th className="p-4">Jogador</th>
                                    <th className="p-4">Time</th>
                                    <th className="p-4 text-center">Kills</th>
                                    <th className="p-4 text-center">Dano</th>
                                    <th className="p-4 text-right">MVP Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(playerExtendedStats).sort((a: PlayerAnalysis, b: PlayerAnalysis) => b.mvpScore - a.mvpScore).map((p: PlayerAnalysis, i) => (
                                    <tr key={p.name} className={`border-t border-theme hover:bg-white/5 transition-colors ${i===0 ? 'bg-yellow-500/10' : ''}`}>
                                        <td className="p-4 font-mono font-bold text-gray-500 w-16">
                                            {i===0 ? <Crown size={16} className="text-yellow-500"/> : i+1}
                                        </td>
                                        <td className="p-4 font-bold">{p.name}</td>
                                        <td className="p-4 text-sm text-gray-400">{p.teamTag}</td>
                                        <td className="p-4 text-center font-mono">{p.kills}</td>
                                        <td className="p-4 text-center font-mono">{p.damage}</td>
                                        <td className="p-4 text-right font-black text-lg text-primary">{p.mvpScore.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                     </div>
                 )}
            </div>
          )}
      </div>
  );

  const renderStepper = () => (
    <div className="flex justify-center mb-8 overflow-x-auto pb-2">
        <div className="flex items-center bg-panel border border-theme rounded-full p-1.5 shadow-lg backdrop-blur-md">
            {STEPS_FLOW.map((s, idx) => {
                const isActive = step === s.id;
                const isCompleted = STEPS_FLOW.findIndex(flow => flow.id === step) > idx;
                const Icon = s.icon;
                
                return (
                    <div key={s.id} className="flex items-center">
                        <button 
                            onClick={() => isCompleted ? setStep(s.id) : null}
                            disabled={!isCompleted && !isActive}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold whitespace-nowrap ${isActive ? 'bg-primary text-black shadow-lg' : isCompleted ? 'text-white hover:bg-white/10' : 'text-gray-600'}`}
                        >
                            <Icon size={16} className={isActive ? 'text-black' : isCompleted ? 'text-green-500' : ''}/>
                            {t.steps[s.labelKey as keyof typeof t.steps]}
                        </button>
                        {idx < STEPS_FLOW.length - 1 && <div className="w-4 h-0.5 bg-gray-800 mx-1"></div>}
                    </div>
                );
            })}
        </div>
    </div>
  );

  const renderWaitingList = () => (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
          <div className="text-center space-y-4">
              <h2 className="text-4xl font-display font-bold uppercase">{t.waiting.title}</h2>
              <p className="text-gray-400">{t.waiting.adminArea}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Admin Create */}
              <div className="bg-panel border border-theme rounded-xl p-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2"><ShieldCheck className="text-primary"/> {t.waiting.adminArea}</h3>
                  <div className="space-y-3">
                      <input value={wlAdminName} onChange={e => setWlAdminName(e.target.value)} placeholder={t.waiting.yourName} className="w-full bg-black border border-theme rounded p-3" />
                      <input value={wlTrainingName} onChange={e => setWlTrainingName(e.target.value)} placeholder={t.waiting.trainingName} className="w-full bg-black border border-theme rounded p-3" />
                      <input value={wlPin} onChange={e => setWlPin(e.target.value)} placeholder={t.waiting.pin} className="w-full bg-black border border-theme rounded p-3" type="password" />
                      <Button onClick={createWaitingTraining} className="w-full">{t.waiting.create}</Button>
                  </div>
              </div>

              {/* User Request */}
              <div className="bg-panel border border-theme rounded-xl p-6 space-y-4">
                   <h3 className="text-xl font-bold flex items-center gap-2"><UserPlus className="text-blue-500"/> {t.waiting.requestTitle}</h3>
                   <div className="space-y-3">
                       <select className="w-full bg-black border border-theme rounded p-3 text-gray-400">
                           <option>{t.waiting.selectTraining}</option>
                           {openTrainings.map(tr => (
                               <option key={tr.id} value={tr.id}>{tr.trainingName} (by {tr.adminName})</option>
                           ))}
                       </select>
                       <input placeholder={t.waiting.yourTeam} className="w-full bg-black border border-theme rounded p-3" />
                       <Button className="w-full" variant="secondary">{t.waiting.sendRequest}</Button>
                   </div>
              </div>
          </div>

          {/* List of Open Trainings (Active) */}
          <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-400 uppercase tracking-widest">{t.waiting.queue}</h3>
              {openTrainings.length === 0 && <div className="text-center p-8 bg-panel border border-theme rounded-xl text-gray-500">Nenhuma lista ativa.</div>}
              {openTrainings.map(tr => (
                  <div key={tr.id} className="bg-panel border border-theme rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div>
                          <h4 className="font-bold text-xl">{tr.trainingName}</h4>
                          <div className="text-sm text-gray-500">Admin: <span className="text-white">{tr.adminName}</span> • {new Date(tr.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex gap-3">
                          <Button size="sm" variant="secondary" onClick={() => {
                              if(prompt('Enter PIN') === tr.adminPin) {
                                  // Logic to generate training from requests
                                  alert('Feature in progress: Generate Training from Queue');
                              } else {
                                  alert('Wrong PIN');
                              }
                          }}>{t.waiting.generate}</Button>
                          <button onClick={() => {
                               if(prompt('Enter PIN to delete') === tr.adminPin) {
                                  const updated = openTrainings.filter(x => x.id !== tr.id);
                                  setOpenTrainings(updated);
                                  localStorage.setItem('jhantraining_waiting_list', JSON.stringify(updated));
                               }
                          }} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2/></button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderPublicHub = () => (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
          <div className="text-center space-y-4">
              <h2 className="text-4xl font-display font-bold uppercase">{t.hub.title}</h2>
              <p className="text-gray-400">{t.hub.desc}</p>
          </div>

          {savedTrainings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-panel border border-theme rounded-xl text-center space-y-4">
                  <Save size={48} className="text-gray-600"/>
                  <h3 className="text-xl font-bold">{t.hub.empty}</h3>
                  <p className="text-gray-500 max-w-md">{t.hub.emptyDesc}</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-4">
                  {savedTrainings.map(session => (
                      <div key={session.id} className="bg-panel border border-theme rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:border-primary/50 transition-colors">
                          <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-xl">{session.name}</h3>
                                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">{new Date(session.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex gap-4 text-sm text-gray-400">
                                  <span>{session.teamsCount} Times</span>
                                  <span>{session.matchesCount} Quedas</span>
                              </div>
                              <div className="mt-2 flex gap-2">
                                  {session.leaderboardTop3.map((top, i) => (
                                      <div key={i} className="text-xs font-bold bg-black/40 px-2 py-1 rounded flex items-center gap-1">
                                          <span className={`w-1.5 h-1.5 rounded-full ${i===0 ? 'bg-yellow-500' : i===1 ? 'bg-gray-300' : 'bg-orange-700'}`}></span>
                                          {top.name}
                                      </div>
                                  ))}
                              </div>
                          </div>
                          <div className="flex gap-3">
                              <Button onClick={() => {
                                  if(window.confirm(t.hub.confirmLoad)) {
                                      // Load logic would go here (need to parse data string back to state)
                                      // Since I don't have the full load logic in this file, I'll just alert or leave placeholder
                                      alert("Load feature implementation required");
                                  }
                              }} variant="primary" size="sm">{t.hub.load}</Button>
                              <Button onClick={() => {
                                  if(window.confirm('Delete?')) {
                                      const updated = savedTrainings.filter(s => s.id !== session.id);
                                      setSavedTrainings(updated);
                                      localStorage.setItem('jhantraining_hub_data', JSON.stringify(updated));
                                  }
                              }} variant="danger" size="sm"><Trash2 size={16}/></Button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
          <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
              <Info size={12}/> {t.hub.info}
          </p>
      </div>
  );

  return (
    <div className={`min-h-screen bg-background text-main font-sans selection:bg-primary selection:text-black`}>
        {renderHelpModal()}
        {step === Step.HOME ? renderHome() : (
            <div className="flex flex-col min-h-screen">
                <header className="h-16 border-b border-theme bg-panel/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
                     <div className="flex items-center gap-4">
                         <button onClick={handleBack} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft/></button>
                         <h1 className="font-bold flex items-center gap-2"><Zap className="text-primary"/> FF TRAINING</h1>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => setIsHelpOpen(true)} className="p-2 hover:text-white text-gray-400"><HelpCircle size={20}/></button>
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:text-white text-gray-400">{isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}</button>
                        <button onClick={handleHome} className="p-2 hover:text-red-500 text-gray-400"><Home size={20}/></button>
                     </div>
                </header>
                <main className="flex-1 p-6">
                    {![Step.WAITING_LIST, Step.PUBLIC_HUB, Step.VIEWER].includes(step) && renderStepper()}
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
            </div>
        )}
    </div>
  );
};

export default App;