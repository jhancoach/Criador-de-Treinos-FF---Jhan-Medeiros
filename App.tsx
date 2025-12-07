import React, { useState, useEffect, useMemo, useRef, ErrorInfo, ReactNode, Component } from 'react';
import { 
  Languages, Zap, ArrowRight, ListPlus, Globe, Map as MapIcon, Users, BarChart2, Share2, Instagram,
  ClipboardList, Check, Save, Trash2, Upload, AlertTriangle, MousePointer2, RefreshCw, Download, Image,
  Binary, Crown, Monitor, X, Target, Info, ShieldCheck, UserPlus, Unlock, Home, ChevronLeft, Sun, Moon, HelpCircle, FileJson, Trophy, Flame, Clock, Swords, Crosshair, Ban, Dna, Settings, Layout, Shuffle, Grid, RotateCcw, CheckCircle, Plus, Minus, LogOut
} from 'lucide-react';
import { 
  Step, Language, Team, TrainingMode, MatchScore, ProcessedScore, 
  Position, SavedTrainingSession, OpenTraining, TrainingRequest, 
  ReplayEvent, PlayerAnalysis, PlayerStats, POINTS_SYSTEM,
  VS_Step, PBMode, MapStrategy, DraftState, TurnAction, SeriesMatchResult
} from './types';
import { MAPS, WARNINGS, CHARACTERS } from './constants';
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
    landing: { title: 'SELECIONE O MODO DE JOGO', br: 'BATTLE ROYALE', brDesc: 'Criador de Treino Completo (Mapas, Tabela, MVP)', vs: 'MODO 4X4', vsDesc: 'Picks e Bans Modo WB', enter: 'ENTRAR' },
    hero: { subtitle: 'GERENCIADOR DE BATTLE ROYALE', title1: 'CRIADOR DE', title2: 'TREINO', desc: 'A plataforma mais completa para gestão competitiva. Sorteio de mapas, tabela automática e estatísticas detalhadas.', start: 'COMEÇAR', queue: 'TREINOS ROLANDO', hub: 'HUB PÚBLICO', footer: 'CRIADO POR JHAN' },
    steps: { maps: 'Mapas', teams: 'Times', calls: 'Calls', scoring: 'Pontos', results: 'Resultados' },
    mode: { title: 'SELECIONE O MODO', basic: 'Básico', basicDesc: 'Modo simplificado. Listas de texto para sorteio e calls. Ideal para treinos rápidos.', premium: 'Premium', premiumDesc: 'Modo Visual. Mapas interativos, sorteio animado e posicionamento visual.', premiumPlus: 'Premium Plus', premiumPlusDesc: 'Modo Automático. Importação de JSON para estatísticas de MVP, Dano e Kills.', recommended: 'VISUAL', feats: { cityList: 'Calls por Lista', mapSort: 'Sorteio em Texto', scoreTable: 'Tabela Manual', interactive: 'Mapas Interativos', dragDrop: 'Posicionamento Visual', replay: 'Importação JSON', mvp: 'MVP e Dano Real' } },
    register: { title: 'REGISTRO DE TIMES', placeholder: 'Nome do Time (Ex: LOUD, FX, PAIN)...', add: 'ADICIONAR', next: 'PRÓXIMO', empty: 'Nenhum time adicionado.', copied: 'Copiado!', shareLineup: 'Compartilhar Escalação', tip: 'Dica: Use a TAG do time igual ao jogo para o Premium Plus funcionar automaticamente.' },
    sort: { title: 'SORTEIO DE MAPAS', spin: 'SORTEAR ORDEM', respin: 'SORTEAR NOVAMENTE', strategy: 'DEFINIR ESTRATÉGIA', pool: 'Mapas Disponíveis', basicTitle: 'Ordem dos Mapas' },
    strategy: { title: 'DEFINICIÓN DE CALLS', import: 'Importar', saveJson: 'JSON', saveImg: 'Imagem', scoring: 'PONTUAÇÃO', match: 'Queda', select: 'Selecione a Call...', free: 'LIVRE', defineCalls: 'Definir Calls (Lista)' },
    scoring: { title: 'PONTUAÇÃO', rank: 'Rank #', kills: 'Kills', loadReplay: 'Carregar Arquivo .JSON', results: 'VER RESULTADOS', manual: 'Tabela de Pontuação', dragJson: 'Arraste o arquivo JSON aqui ou clique para selecionar', successJson: 'Arquivo processado com sucesso!', errorJson: 'Erro ao ler arquivo. Verifique o formato.' },
    dashboard: { title: 'RESULTADOS & ESTATÍSTICAS', tabRank: 'CLASSIFICAÇÃO', tabMvp: 'MVP & STATS', social: 'Compartilhar', saveHub: 'Publicar no Hub', table: { team: 'Team', total: 'Pts Totais', pos: 'Posição (Pts)', killPts: 'Kills (Pts)', booyah: 'Booyahs', last: 'Última Queda', player: 'Jogador', mvpScore: 'MVP Score', damage: 'Dano', time: 'Tempo Vivo' }, emptyPlayer: 'Nenhum dado de jogador. No modo Premium Plus, os dados vêm do JSON.', resultTitle: 'RESULTADO FINAL', points: 'PONTOS' },
    waiting: { title: 'LISTA DE ESPERA & TREINOS', adminArea: 'Área do Organizador', yourName: 'Seu Nome/Nick', trainingName: 'Nome do Treino', pin: 'PIN de Segurança (ex: 1234)', create: 'CRIAR LISTA', successCreate: 'Lista de espera criada com sucesso!', requestTitle: 'Solicitar Vaga', selectTraining: 'Selecione um Treino...', yourTeam: 'Nome do Seu Time', sendRequest: 'ENVIAR SOLICITAÇÃO', successRequest: 'Solicitação enviada!', queue: 'Treinos Disponíveis (Rolando Agora)', generate: 'GERAR TREINO', delete: 'Tem certeza que deseja apagar esta lista?' },
    hub: { title: 'HUB DE TREINOS', desc: 'Seu Histórico de Sessões Salvas', info: 'Os dados são salvos no cache deste navegador.', empty: 'Nenhum treino salvo encontrado', load: 'Carregar este treino', delete: 'Excluir permanentemente', confirmLoad: 'Carregar este treino substituirá os dados atuais. Continuar?', emptyDesc: 'Para ver seus treinos aqui, clique em "Publicar no Hub" na tela de Resultados após finalizar uma sessão.' },
    common: { error: 'Ops! Algo deu errado.', reload: 'Recarregar Página', back: 'Voltar', home: 'Ir para Início', draft: 'Salvar Rascunho', help: 'Ajuda', theme: 'Cor Destaque', language: 'Idioma', dark: 'Modo Escuro', light: 'Modo Claro', confirmHome: 'Tem certeza? Todo o progresso não salvo pode ser perdido.', draftSaved: 'Rascunho salvo no navegador!', draftLoaded: 'Rascunho carregado com sucesso!', yes: 'Sim', no: 'Não', cancel: 'Cancelar', overview: 'Visão Geral', howTo: 'Como Usar', interactiveMap: 'Mapa Interativo' }
  }
};

const STEPS_FLOW = [
    { id: Step.TEAM_REGISTER, labelKey: 'teams', icon: Users },
    { id: Step.MAP_SORT, labelKey: 'maps', icon: Globe },
    { id: Step.STRATEGY, labelKey: 'calls', icon: Target },
    { id: Step.SCORING, labelKey: 'scoring', icon: ClipboardList },
    { id: Step.DASHBOARD, labelKey: 'results', icon: BarChart2 },
];

const VS_SNAKE_ORDER: TurnAction[] = ['BAN_A', 'BAN_B', 'PICK_A', 'PICK_B', 'PICK_B', 'PICK_A', 'PICK_A', 'PICK_B', 'PICK_B', 'PICK_A'];
const VS_LINEAR_ORDER: TurnAction[] = ['BAN_A', 'BAN_B', 'PICK_A', 'PICK_B', 'PICK_A', 'PICK_B', 'PICK_A', 'PICK_B', 'PICK_A', 'PICK_B'];

// Error Boundary
interface ErrorBoundaryProps {
  children?: ReactNode;
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
  const [step, setStep] = useState<Step>(Step.LANDING);
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
  const [isVsMapSpinning, setIsVsMapSpinning] = useState(false);
  const [activeStrategyMapIndex, setActiveStrategyMapIndex] = useState(0);
  const [currentMatchTab, setCurrentMatchTab] = useState(1);
  const [dashboardTab, setDashboardTab] = useState<'leaderboard' | 'mvp'>('leaderboard');
  const [savedTrainings, setSavedTrainings] = useState<SavedTrainingSession[]>([]);
  const [openTrainings, setOpenTrainings] = useState<OpenTraining[]>([]);
  
  // 4x4 Mode State
  const [vsStep, setVsStep] = useState<VS_Step>('HOME');
  const [vsConfigStep, setVsConfigStep] = useState(0); // 0: Teams, 1: Mode, 2: MD, 3: Maps
  const [pbMode, setPbMode] = useState<PBMode>('snake');
  const [mdFormat, setMdFormat] = useState<number>(3);
  const [roundsFormat, setRoundsFormat] = useState<11 | 13>(13);
  const [mapStrategy, setMapStrategy] = useState<MapStrategy>('no_repeat');
  const [vsMaps, setVsMaps] = useState<string[]>([]);
  const [draftState, setDraftState] = useState<DraftState>({
      bansA: [], bansB: [], picksA: [], picksB: [], turnIndex: 0, history: [], isComplete: false
  });
  const [teamAName, setTeamAName] = useState('Time A');
  const [teamBName, setTeamBName] = useState('Time B');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matchRoundScore, setMatchRoundScore] = useState({ a: 0, b: 0 });
  const [seriesHistory, setSeriesHistory] = useState<SeriesMatchResult[]>([]);
  const [seriesScore, setSeriesScore] = useState({ a: 0, b: 0 });
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

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
  const handleHome = () => { if(window.confirm(t.common.confirmHome)) setStep(Step.LANDING); };
  const handleBack = () => {
    if(step === Step.HOME) setStep(Step.LANDING);
    else if(step === Step.MODE_4X4) {
        if (vsStep === 'HOME') setStep(Step.LANDING);
        else if (vsStep === 'CONFIG') {
            if (vsConfigStep > 0) setVsConfigStep(vsConfigStep - 1);
            else setVsStep('HOME');
        }
        else if (vsStep === 'DRAFT') {
            if (window.confirm('Sair da partida? O progresso será perdido.')) setVsStep('CONFIG');
        }
        else if (vsStep === 'HISTORY') setVsStep('HOME'); // Reset
    }
    else if(step === Step.MODE_SELECT) setStep(Step.HOME);
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

  // 4x4 Logic
  const handleMapSort4x4 = () => {
      setIsVsMapSpinning(true);
      let duration = 2000;
      let start = Date.now();
      
      const spin = setInterval(() => {
        let available = [...MAPS];
        let selected: string[] = [];
        
        if (mapStrategy === 'fixed') {
            const map = available[Math.floor(Math.random() * available.length)];
            selected = Array(mdFormat).fill(map.id);
        } else {
            for (let i = 0; i < mdFormat; i++) {
                if (available.length === 0 && mapStrategy === 'no_repeat') break;
                if (mapStrategy === 'repeat') available = [...MAPS];
                
                const randIndex = Math.floor(Math.random() * available.length);
                selected.push(available[randIndex].id);
                
                if (mapStrategy === 'no_repeat') available.splice(randIndex, 1);
            }
        }
        setVsMaps(selected);

        if (Date.now() - start > duration) {
            clearInterval(spin);
            setIsVsMapSpinning(false);
        }
      }, 100);
  };

  const startSeries = () => {
      setDraftState({ bansA: [], bansB: [], picksA: [], picksB: [], turnIndex: 0, history: [], isComplete: false });
      setCurrentMatchIndex(0);
      setMatchRoundScore({ a: 0, b: 0 }); // Reset Rounds
      setSeriesHistory([]);
      setSeriesScore({ a: 0, b: 0 });
      setShowWinnerModal(false);
      setVsStep('DRAFT');
  };

  const resetMatchDraft = () => {
      if(window.confirm('Tem certeza? O draft e o placar atual serão reiniciados.')) {
          setDraftState({ bansA: [], bansB: [], picksA: [], picksB: [], turnIndex: 0, history: [], isComplete: false });
          setMatchRoundScore({ a: 0, b: 0 }); // Reset Rounds
          setShowWinnerModal(false);
      }
  };

  const updateMatchScore = (team: 'a' | 'b', delta: number) => {
      setMatchRoundScore(prev => {
          const newVal = Math.max(0, prev[team] + delta);
          const winCap = roundsFormat === 13 ? 7 : 6;
          if (newVal > winCap) return prev;
          return { ...prev, [team]: newVal };
      });
  };

  const handleMatchEnd = (winner: 'A' | 'B') => {
      // Save current match
      const result: SeriesMatchResult = {
          matchIndex: currentMatchIndex,
          mapId: vsMaps[currentMatchIndex],
          winner,
          draftState: { ...draftState }
      };
      
      const newHistory = [...seriesHistory, result];
      setSeriesHistory(newHistory);
      
      const newScore = { ...seriesScore, [winner.toLowerCase()]: seriesScore[winner.toLowerCase() as 'a' | 'b'] + 1 };
      setSeriesScore(newScore);

      // Check series condition
      const winsNeeded = Math.ceil(mdFormat / 2);
      if (newScore.a >= winsNeeded || newScore.b >= winsNeeded || currentMatchIndex >= mdFormat - 1) {
          // Series Over
          setVsStep('HISTORY');
      } else {
          // Next Match
          setCurrentMatchIndex(prev => prev + 1);
          setDraftState({ bansA: [], bansB: [], picksA: [], picksB: [], turnIndex: 0, history: [], isComplete: false });
          setMatchRoundScore({ a: 0, b: 0 }); // Reset Rounds
          setShowWinnerModal(false);
      }
  };

  const getTurnInfo = (turnIndex: number, mode: PBMode, matchIndex: number) => {
      let action: TurnAction | null = null;
      if (mode === 'snake') action = VS_SNAKE_ORDER[turnIndex];
      else if (mode === 'linear') action = VS_LINEAR_ORDER[turnIndex];
      // Mirrored Logic
      else if (mode === 'mirrored') {
          if (turnIndex < 2) action = turnIndex === 0 ? 'BAN_A' : 'BAN_B'; // Simulating simultaneous
          else action = turnIndex % 2 === 0 ? 'PICK_A' : 'PICK_B'; // Simulating picks
      }

      // Alternate Turn Logic: If match index is Odd (2nd, 4th...), swap A and B
      if (action && matchIndex % 2 !== 0) {
          if (action.endsWith('_A')) return action.replace('_A', '_B') as TurnAction;
          if (action.endsWith('_B')) return action.replace('_B', '_A') as TurnAction;
      }

      return action;
  };

  const handleDraftClick = (charId: string) => {
      if (draftState.isComplete) return;
      if (draftState.bansA.includes(charId) || draftState.bansB.includes(charId) || draftState.picksA.includes(charId) || draftState.picksB.includes(charId)) return;

      const newState = { ...draftState };
      
      // Determine action based on current state and alternating match logic
      let action = getTurnInfo(newState.turnIndex, pbMode, currentMatchIndex);
      
      if (!action) return;

      if (action === 'BAN_A') newState.bansA.push(charId);
      if (action === 'BAN_B') newState.bansB.push(charId);
      if (action === 'PICK_A') newState.picksA.push(charId);
      if (action === 'PICK_B') newState.picksB.push(charId);

      newState.turnIndex++;
      if (newState.turnIndex >= 10) newState.isComplete = true;

      if (action) {
          newState.history.push({ action, charId });
          setDraftState(newState);
      }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, charId: string) => {
      e.dataTransfer.setData('charId', charId);
  };

  const allowDrop = (e: React.DragEvent) => {
      e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetTeam: 'A' | 'B') => {
      e.preventDefault();
      const charId = e.dataTransfer.getData('charId');
      if (!charId) return;

      const currentTurn = getTurnInfo(draftState.turnIndex, pbMode, currentMatchIndex);
      if (!currentTurn) return;

      // Validate drop: Team A panel only accepts drops when it's Team A's turn
      if (targetTeam === 'A' && (currentTurn === 'BAN_A' || currentTurn === 'PICK_A')) {
          handleDraftClick(charId);
      }
      // Validate drop: Team B panel only accepts drops when it's Team B's turn
      else if (targetTeam === 'B' && (currentTurn === 'BAN_B' || currentTurn === 'PICK_B')) {
          handleDraftClick(charId);
      }
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
                      
                      {step === Step.MODE_4X4 && (
                          <div className="space-y-2 border-t border-theme pt-4">
                              <h4 className="font-bold text-red-500 flex items-center gap-2"><Swords size={16}/> Modo 4x4 (Versus)</h4>
                              <p className="text-sm text-gray-400">Gerencie partidas competitivas de Picks e Bans.</p>
                              <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                                  <li>Configure os times e o formato da série (MD1, MD3, etc).</li>
                                  <li>Realize o draft (Picks e Bans) seguindo o modo escolhido.</li>
                                  <li>Você pode clicar ou <strong>arrastar</strong> os personagens para selecionar.</li>
                                  <li>O primeiro a banir altera a cada partida da série.</li>
                                  <li>Ao final de cada draft, revise a timeline e selecione o vencedor.</li>
                                  <li>O sistema gerencia o placar da série automaticamente.</li>
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
  
  const renderLanding = () => (
    <div className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0a0a] text-white p-4">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-6 right-6 z-20">
            <button onClick={() => setLang(lang === 'pt' ? 'en' : lang === 'en' ? 'es' : 'pt')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white">
                <Languages size={14} /><span>{lang === 'pt' ? 'PT-BR' : lang === 'en' ? 'EN-US' : 'ES-ES'}</span>
            </button>
        </div>
        
        <div className="max-w-6xl w-full mx-auto z-10 space-y-12">
            <div className="text-center space-y-4 animate-fade-in">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter flex items-center justify-center gap-4">
                    <Zap className="text-primary fill-current" size={48}/> JHAN TRAINING
                </h1>
                <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">{t.landing.title}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
                {/* Battle Royale Card */}
                <div onClick={() => setStep(Step.HOME)} className="group cursor-pointer relative bg-[#121212] border border-white/10 rounded-3xl p-8 md:p-12 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(255,212,0,0.1)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-2 border-white/10 group-hover:border-primary group-hover:scale-110 transition-all duration-500 shadow-2xl">
                            <Trophy size={40} className="text-gray-400 group-hover:text-primary transition-colors"/>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase italic mb-2">{t.landing.br}</h2>
                            <p className="text-gray-500 font-medium">{t.landing.brDesc}</p>
                        </div>
                        <div className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm uppercase tracking-widest group-hover:bg-primary group-hover:text-black transition-all">
                            {t.landing.enter}
                        </div>
                    </div>
                </div>

                {/* 4x4 Mode Card */}
                <div onClick={() => setStep(Step.MODE_4X4)} className="group cursor-pointer relative bg-[#121212] border border-white/10 rounded-3xl p-8 md:p-12 hover:border-red-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-2 border-white/10 group-hover:border-red-500 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                            <Swords size={40} className="text-gray-400 group-hover:text-red-500 transition-colors"/>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase italic mb-2">{t.landing.vs}</h2>
                            <p className="text-gray-500 font-medium">{t.landing.vsDesc}</p>
                        </div>
                        <div className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm uppercase tracking-widest group-hover:bg-red-500 group-hover:text-white transition-all">
                            {t.landing.enter}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderVS_Home = () => (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 animate-fade-in p-6">
          <div className="text-center space-y-2">
              <h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Gerenciador de Partidas</h2>
              <div className="bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
                  <Swords size={14}/> Picks & Bans
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
              {[
                  { id: 'mode', icon: Dna, title: 'Modo de Picks', desc: 'Snake, Linear, Mirrored', action: () => { setVsStep('CONFIG'); setVsConfigStep(1); } },
                  { id: 'md', icon: Trophy, title: 'Formato MD', desc: 'MD1, MD3, MD5, MD7', action: () => { setVsStep('CONFIG'); setVsConfigStep(2); } },
                  { id: 'maps', icon: MapIcon, title: 'Sorteio de Mapas', desc: 'Definir Rotação', action: () => { setVsStep('CONFIG'); setVsConfigStep(3); } },
              ].map(item => (
                  <div key={item.id} onClick={item.action} className="bg-panel border border-theme hover:border-red-500 transition-all p-6 rounded-xl cursor-pointer group hover:scale-105">
                      <div className="bg-black/50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:text-red-500 text-gray-400">
                          <item.icon size={24}/>
                      </div>
                      <h3 className="font-bold text-xl">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
              ))}
          </div>

          <Button onClick={() => { setVsStep('CONFIG'); setVsConfigStep(0); }} size="lg" className="px-12 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/50">
              CONFIGURAR PARTIDA <ArrowRight size={20}/>
          </Button>
      </div>
  );

  const renderVS_Config = () => (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
          <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-display font-bold">Configuração da Série</h2>
              </div>
              <button onClick={() => setIsHelpOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <HelpCircle className="text-gray-400 hover:text-white" size={24}/>
              </button>
          </div>

          {/* Stepper for VS Config */}
          <div className="flex justify-between items-center mb-8 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-theme -z-10" />
              {['Times', 'Modo', 'Formato', 'Mapas'].map((stepName, idx) => (
                  <div key={idx} className={`bg-background px-2 flex flex-col items-center gap-2 ${idx === vsConfigStep ? 'opacity-100' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${idx <= vsConfigStep ? 'bg-red-500 border-red-500 text-white' : 'bg-panel border-theme text-muted'}`}>
                          {idx + 1}
                      </div>
                      <span className="text-[10px] font-bold uppercase">{stepName}</span>
                  </div>
              ))}
          </div>

          {/* Step 0: Teams */}
          {vsConfigStep === 0 && (
              <div className="bg-panel border border-theme rounded-xl p-8 space-y-6 animate-fade-in">
                  <h3 className="font-bold text-xl flex items-center gap-2"><Users className="text-red-500"/> Definir Times</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Time A</label>
                          <input value={teamAName} onChange={e => setTeamAName(e.target.value)} className="w-full bg-black border border-theme rounded p-4 text-center font-bold text-yellow-500 text-lg" placeholder="Nome Time A" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Time B</label>
                          <input value={teamBName} onChange={e => setTeamBName(e.target.value)} className="w-full bg-black border border-theme rounded p-4 text-center font-bold text-blue-500 text-lg" placeholder="Nome Time B" />
                      </div>
                  </div>
              </div>
          )}

          {/* Step 1: Picks & Bans Mode */}
          {vsConfigStep === 1 && (
              <div className="bg-panel border border-theme rounded-xl p-8 space-y-6 animate-fade-in">
                  <h3 className="font-bold text-xl flex items-center gap-2"><Dna className="text-red-500"/> Modo de Picks & Bans</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                          { id: 'snake', label: 'Snake Draft', desc: 'Alternado (1-2-2-2-1)' },
                          { id: 'linear', label: 'Linear Draft', desc: 'Alternado Simples (1-1-1-1)' },
                          { id: 'mirrored', label: 'Mirrored', desc: 'Simultâneo (Bans -> Picks)' }
                      ].map(m => (
                          <button 
                            key={m.id}
                            onClick={() => setPbMode(m.id as PBMode)}
                            className={`p-6 rounded-xl border text-left transition-all hover:scale-105 ${pbMode === m.id ? 'bg-red-500/10 border-red-500 text-white' : 'bg-black/20 border-theme text-gray-400 hover:border-gray-500'}`}
                          >
                              <div className="font-bold text-lg mb-2">{m.label}</div>
                              <div className="text-xs opacity-70">{m.desc}</div>
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* Step 2: MD Format & Rounds */}
          {vsConfigStep === 2 && (
              <div className="bg-panel border border-theme rounded-xl p-8 space-y-8 animate-fade-in">
                  <div className="space-y-4">
                      <h3 className="font-bold text-xl flex items-center gap-2"><Trophy className="text-yellow-500"/> Formato MD (Melhor De)</h3>
                      <div className="flex gap-4">
                          {[1, 3, 5, 7].map(num => (
                              <button 
                                key={num}
                                onClick={() => setMdFormat(num)}
                                className={`flex-1 p-6 rounded-xl border font-black text-2xl transition-all hover:scale-105 ${mdFormat === num ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-black/20 border-theme text-gray-500 hover:text-white'}`}
                              >
                                  MD{num}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-theme">
                      <h3 className="font-bold text-xl flex items-center gap-2"><Target className="text-blue-500"/> Formato de Rounds</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setRoundsFormat(13)}
                            className={`p-6 rounded-xl border text-left transition-all hover:scale-105 ${roundsFormat === 13 ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-black/20 border-theme text-gray-400'}`}
                          >
                              <div className="font-bold text-xl">13 Rounds</div>
                              <div className="text-xs opacity-70">Vitória com 7 rounds (7x6)</div>
                          </button>
                          <button 
                            onClick={() => setRoundsFormat(11)}
                            className={`p-6 rounded-xl border text-left transition-all hover:scale-105 ${roundsFormat === 11 ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-black/20 border-theme text-gray-400'}`}
                          >
                              <div className="font-bold text-xl">11 Rounds</div>
                              <div className="text-xs opacity-70">Vitória com 6 rounds (6x5)</div>
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* Step 3: Map Sort */}
          {vsConfigStep === 3 && (
              <div className="bg-panel border border-theme rounded-xl p-8 space-y-6 animate-fade-in">
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-xl flex items-center gap-2"><MapIcon className="text-blue-500"/> Sorteio de Mapas</h3>
                      <select 
                        value={mapStrategy} 
                        onChange={(e) => setMapStrategy(e.target.value as MapStrategy)}
                        className="bg-black border border-theme rounded px-4 py-2 text-sm"
                      >
                          <option value="no_repeat">Sem Repetir</option>
                          <option value="repeat">Com Repetição</option>
                          <option value="fixed">Mapa Fixo</option>
                      </select>
                  </div>
                  
                  <Button onClick={handleMapSort4x4} className="w-full h-16 text-lg" variant="secondary" disabled={isVsMapSpinning}>
                      {isVsMapSpinning ? <RefreshCw className="animate-spin" /> : <Shuffle size={24}/>} 
                      {isVsMapSpinning ? 'Sorteando...' : 'Sortear Mapas'}
                  </Button>

                  {vsMaps.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                          {vsMaps.map((mapId, idx) => (
                              <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-theme group">
                                  <img src={MAPS.find(m => m.id === mapId)?.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"/>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="bg-black/80 px-3 py-1 rounded text-xs font-bold uppercase backdrop-blur-md border border-white/10">Partida {idx + 1}</span>
                                  </div>
                                  <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent p-2 text-center text-sm font-bold uppercase">
                                      {MAPS.find(m => m.id === mapId)?.name}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
              <Button 
                  onClick={() => setVsConfigStep(prev => prev - 1)} 
                  disabled={vsConfigStep === 0 || isVsMapSpinning}
                  variant="secondary"
              >
                  Voltar
              </Button>
              
              {vsConfigStep < 3 ? (
                  <Button onClick={() => setVsConfigStep(prev => prev + 1)} disabled={isVsMapSpinning}>Próximo <ArrowRight size={18}/></Button>
              ) : (
                  <Button 
                    onClick={startSeries} 
                    size="lg" 
                    className="bg-red-600 hover:bg-red-700 text-white px-12"
                    disabled={vsMaps.length === 0 || isVsMapSpinning}
                  >
                      INICIAR SÉRIE <ArrowRight/>
                  </Button>
              )}
          </div>
      </div>
  );

  const renderVS_Draft = () => {
      const currentTurn = getTurnInfo(draftState.turnIndex, pbMode, currentMatchIndex);
      const winCap = roundsFormat === 13 ? 7 : 6;
      
      let turnMessage = '';
      if (draftState.isComplete) turnMessage = "Partida Finalizada";
      else if (pbMode === 'mirrored') {
          if (draftState.bansA.length === 0 || draftState.bansB.length === 0) turnMessage = "Fase de Banimentos";
          else turnMessage = "Fase de Escolhas";
      } else {
          if (currentTurn === 'BAN_A') turnMessage = `Banimento: ${teamAName}`;
          if (currentTurn === 'BAN_B') turnMessage = `Banimento: ${teamBName}`;
          if (currentTurn === 'PICK_A') turnMessage = `Escolha: ${teamAName}`;
          if (currentTurn === 'PICK_B') turnMessage = `Escolha: ${teamBName}`;
      }

      return (
          <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in relative">
              {/* Header Status with Navigation & Scoreboard */}
              <div className="bg-panel border-b border-theme p-4 flex justify-between items-center shrink-0 shadow-lg z-20">
                  <div className="flex items-center gap-2">
                      <Tooltip content="Menu Inicial">
                          <button onClick={handleHome} className="p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-all"><Home size={20}/></button>
                      </Tooltip>
                      <Tooltip content="Voltar para Configuração">
                          <button onClick={() => { if(window.confirm('Sair da partida atual?')) setVsStep('CONFIG'); }} className="p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-all"><ChevronLeft size={20}/></button>
                      </Tooltip>
                      <div className="h-8 w-[1px] bg-gray-700 mx-2"></div>
                      <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                              <div className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                  Partida {currentMatchIndex + 1}/{mdFormat}
                              </div>
                              <span className="text-xs font-bold text-gray-400 uppercase">{MAPS.find(m => m.id === vsMaps[currentMatchIndex])?.name}</span>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                          <div className="text-[10px] uppercase font-bold text-gray-500">Placar da Série</div>
                          <div className="text-sm font-bold bg-black/40 px-3 py-1 rounded border border-theme">
                              <span className="text-yellow-500">{seriesScore.a}</span> x <span className="text-blue-500">{seriesScore.b}</span>
                          </div>
                      </div>
                      <Button size="sm" variant="secondary" onClick={resetMatchDraft} className="text-xs px-3 h-9"><RotateCcw size={14}/> <span className="hidden md:inline">Reiniciar</span></Button>
                  </div>
              </div>

              {/* Turn Message Banner */}
              {!draftState.isComplete && (
                  <div className="bg-black/50 border-b border-theme py-2 text-center">
                      <span className="text-sm font-bold uppercase tracking-widest text-white animate-pulse">{turnMessage}</span>
                  </div>
              )}

              {/* Draft Review Phase - Before Winner Selection */}
              {draftState.isComplete && !showWinnerModal ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-fade-in">
                      <div className="text-center">
                          <h3 className="text-3xl font-black uppercase text-white mb-2">Resumo da Partida</h3>
                          <p className="text-gray-400">Revise os picks e bans antes de definir o vencedor.</p>
                      </div>

                      {/* Round Scoreboard */}
                      <div className="flex items-center gap-8 bg-black/40 p-6 rounded-2xl border border-theme shadow-lg backdrop-blur-md">
                          <div className="flex items-center gap-3">
                              <button 
                                onClick={() => updateMatchScore('a', -1)} 
                                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-gray-700"
                              >
                                  <Minus size={16}/>
                              </button>
                              <div className="text-5xl font-black text-yellow-500 tabular-nums w-16 text-center">{matchRoundScore.a}</div>
                              <button 
                                onClick={() => updateMatchScore('a', 1)} 
                                className="w-10 h-10 rounded-full bg-yellow-500/20 hover:bg-yellow-500 flex items-center justify-center text-yellow-500 hover:text-black transition-all border border-yellow-500/50"
                                disabled={matchRoundScore.a >= winCap}
                              >
                                  <Plus size={16}/>
                              </button>
                          </div>
                          
                          <div className="text-gray-600 font-bold text-3xl">:</div>

                          <div className="flex items-center gap-3">
                              <div className="text-5xl font-black text-blue-500 tabular-nums w-16 text-center">{matchRoundScore.b}</div>
                              <button 
                                onClick={() => updateMatchScore('b', -1)} 
                                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-gray-700"
                              >
                                  <Minus size={16}/>
                              </button>
                              <button 
                                onClick={() => updateMatchScore('b', 1)} 
                                className="w-10 h-10 rounded-full bg-blue-500/20 hover:bg-blue-500 flex items-center justify-center text-blue-500 hover:text-black transition-all border border-blue-500/50"
                                disabled={matchRoundScore.b >= winCap}
                              >
                                  <Plus size={16}/>
                              </button>
                          </div>
                      </div>

                      {/* Teams Review */}
                      <div className="flex gap-12 w-full max-w-6xl justify-center">
                          <div className="bg-panel/50 border border-theme rounded-xl p-8 w-1/2 max-w-md">
                              <h4 className="text-yellow-500 font-bold text-2xl mb-6 border-b border-white/10 pb-4">{teamAName}</h4>
                              <div className="space-y-6">
                                  <div>
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Banimento</span>
                                      <div className="flex items-start gap-3">
                                          {draftState.bansA[0] ? (
                                              <div className="w-20 aspect-[2/3] relative border border-red-500/50 rounded-lg overflow-hidden group">
                                                  <img src={CHARACTERS.find(x => x.id === draftState.bansA[0])?.image} className="w-full h-full object-cover object-top grayscale"/>
                                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Ban className="text-red-500"/></div>
                                                  <div className="absolute bottom-0 w-full bg-red-900/80 text-[10px] text-center text-white font-bold py-1 uppercase">{CHARACTERS.find(c => c.id === draftState.bansA[0])?.name}</div>
                                              </div>
                                          ) : <span className="text-gray-500 italic">Nenhum</span>}
                                      </div>
                                  </div>
                                  <div>
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Picks</span>
                                      <div className="grid grid-cols-4 gap-3">
                                          {draftState.picksA.map(c => (
                                              <div key={c} className="w-full aspect-[2/3] relative border border-yellow-500/50 rounded-lg overflow-hidden group shadow-lg">
                                                  <img src={CHARACTERS.find(x => x.id === c)?.image} className="w-full h-full object-cover object-top"/>
                                                  <div className="absolute bottom-0 w-full bg-black/80 text-[10px] text-center text-yellow-500 font-bold py-1 uppercase">{CHARACTERS.find(x => x.id === c)?.name}</div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="flex flex-col justify-center gap-4">
                              <div className="text-center font-bold text-gray-500 text-xl">VS</div>
                          </div>

                          <div className="bg-panel/50 border border-theme rounded-xl p-8 w-1/2 max-w-md">
                              <h4 className="text-blue-500 font-bold text-2xl mb-6 border-b border-white/10 pb-4 text-right">{teamBName}</h4>
                              <div className="space-y-6">
                                  <div className="flex flex-col items-end">
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Banimento</span>
                                      <div className="flex items-start gap-3">
                                          {draftState.bansB[0] ? (
                                              <div className="w-20 aspect-[2/3] relative border border-red-500/50 rounded-lg overflow-hidden group">
                                                  <img src={CHARACTERS.find(x => x.id === draftState.bansB[0])?.image} className="w-full h-full object-cover object-top grayscale"/>
                                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Ban className="text-red-500"/></div>
                                                  <div className="absolute bottom-0 w-full bg-red-900/80 text-[10px] text-center text-white font-bold py-1 uppercase">{CHARACTERS.find(c => c.id === draftState.bansB[0])?.name}</div>
                                              </div>
                                          ) : <span className="text-gray-500 italic">Nenhum</span>}
                                      </div>
                                  </div>
                                  <div>
                                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2 text-right">Picks</span>
                                      <div className="grid grid-cols-4 gap-3 justify-end">
                                          {draftState.picksB.map(c => (
                                              <div key={c} className="w-full aspect-[2/3] relative border border-blue-500/50 rounded-lg overflow-hidden group shadow-lg">
                                                  <img src={CHARACTERS.find(x => x.id === c)?.image} className="w-full h-full object-cover object-top"/>
                                                  <div className="absolute bottom-0 w-full bg-black/80 text-[10px] text-center text-blue-500 font-bold py-1 uppercase">{CHARACTERS.find(x => x.id === c)?.name}</div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Timeline */}
                      <div className="w-full max-w-4xl">
                          <h4 className="text-center text-xs font-bold text-gray-500 uppercase mb-4">Timeline de Escolhas</h4>
                          <div className="flex flex-wrap justify-center gap-2">
                              {draftState.history.map((h, i) => {
                                  const isA = h.action.includes('_A');
                                  const isBan = h.action.includes('BAN');
                                  return (
                                      <div key={i} className={`px-3 py-1 rounded text-[10px] font-bold uppercase border flex items-center gap-1 ${isA ? 'border-yellow-500 text-yellow-500' : 'border-blue-500 text-blue-500'} ${isBan ? 'bg-red-500/10 !border-red-500 !text-red-500' : ''}`}>
                                          <span className="text-gray-500 mr-1">{i+1}.</span>
                                          {isBan && <Ban size={10}/>}
                                          {CHARACTERS.find(c => c.id === h.charId)?.name}
                                      </div>
                                  )
                              })}
                          </div>
                      </div>

                      <div className="pt-8">
                          <Button size="lg" onClick={() => setShowWinnerModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-12 shadow-lg shadow-green-900/50">
                              DEFINIR VENCEDOR <CheckCircle size={20}/>
                          </Button>
                      </div>
                  </div>
              ) : (
                  <div className="flex flex-1 overflow-hidden relative">
                      {/* Team A Panel */}
                      <div 
                        className="w-64 bg-black/40 border-r border-theme p-4 flex flex-col gap-4 overflow-y-auto"
                        onDragOver={allowDrop}
                        onDrop={(e) => handleDrop(e, 'A')}
                      >
                          <h3 className="font-black text-xl text-yellow-500 uppercase border-b border-theme pb-2 text-center">{teamAName}</h3>
                          
                          <div className="space-y-2">
                              <div className="text-xs font-bold text-gray-500 uppercase">Banido</div>
                              <div className="aspect-square bg-gray-900 rounded-lg border border-theme flex items-center justify-center relative overflow-hidden transition-colors duration-300 hover:bg-red-900/20">
                                  {draftState.bansA[0] ? (
                                      <>
                                        <img src={CHARACTERS.find(c => c.id === draftState.bansA[0])?.image} className="w-full h-full object-cover object-top grayscale opacity-50"/>
                                        <Ban className="absolute text-red-500 w-1/2 h-1/2"/>
                                      </>
                                  ) : <span className="text-gray-700 text-xs text-center p-2">Arraste ou Clique para Banir (Se for a vez)</span>}
                              </div>
                          </div>

                          <div className="space-y-2">
                              <div className="text-xs font-bold text-gray-500 uppercase">Picks</div>
                              <div className="grid grid-cols-1 gap-2">
                                  {[0,1,2,3].map(i => (
                                      <div key={i} className="aspect-video bg-yellow-900/10 rounded-lg border border-yellow-900/30 flex items-center justify-center relative overflow-hidden group">
                                          {draftState.picksA[i] ? (
                                              <>
                                                <img src={CHARACTERS.find(c => c.id === draftState.picksA[i])?.image} className="w-full h-full object-cover object-top"/>
                                                <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-center font-bold uppercase text-yellow-500">{CHARACTERS.find(c => c.id === draftState.picksA[i])?.name}</div>
                                              </>
                                          ) : <span className="text-yellow-900/30 text-xs font-bold">Pick {i+1}</span>}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Character Grid */}
                      <div className="flex-1 bg-[#0a0a0a] p-6 overflow-y-auto custom-scrollbar">
                          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
                              {CHARACTERS.map(char => {
                                  const isBanned = draftState.bansA.includes(char.id) || draftState.bansB.includes(char.id);
                                  const isPickedA = draftState.picksA.includes(char.id);
                                  const isPickedB = draftState.picksB.includes(char.id);
                                  const isDisabled = isBanned || isPickedA || isPickedB;

                                  return (
                                      <div 
                                        key={char.id} 
                                        draggable={!isDisabled}
                                        onDragStart={(e) => handleDragStart(e, char.id)}
                                        onClick={() => !isDisabled && handleDraftClick(char.id)}
                                        className={`
                                            relative aspect-[2/3] rounded-lg border-2 overflow-hidden transition-all duration-200
                                            ${isPickedA ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] opacity-100 z-10 scale-105' : ''}
                                            ${isPickedB ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] opacity-100 z-10 scale-105' : ''}
                                            ${isBanned ? 'border-gray-800 grayscale opacity-40 cursor-not-allowed' : ''}
                                            ${!isDisabled ? 'border-theme hover:border-gray-400 hover:scale-105 cursor-pointer cursor-grab active:cursor-grabbing opacity-80 hover:opacity-100' : ''}
                                        `}
                                      >
                                          <img src={char.image} className="w-full h-full object-cover object-top"/>
                                          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-2 pt-6">
                                              <div className="text-xs font-bold text-center uppercase truncate text-white tracking-widest">{char.name}</div>
                                          </div>
                                          {isBanned && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><Ban className="text-red-500 w-12 h-12"/></div>}
                                          {isPickedA && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_currentColor]"></div>}
                                          {isPickedB && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_currentColor]"></div>}
                                      </div>
                                  );
                              })}
                          </div>
                      </div>

                      {/* Team B Panel */}
                      <div 
                        className="w-64 bg-black/40 border-l border-theme p-4 flex flex-col gap-4 overflow-y-auto"
                        onDragOver={allowDrop}
                        onDrop={(e) => handleDrop(e, 'B')}
                      >
                          <h3 className="font-black text-xl text-blue-500 uppercase border-b border-theme pb-2 text-center">{teamBName}</h3>
                          
                          <div className="space-y-2">
                              <div className="text-xs font-bold text-gray-500 uppercase">Banido</div>
                              <div className="aspect-square bg-gray-900 rounded-lg border border-theme flex items-center justify-center relative overflow-hidden transition-colors duration-300 hover:bg-red-900/20">
                                  {draftState.bansB[0] ? (
                                      <>
                                        <img src={CHARACTERS.find(c => c.id === draftState.bansB[0])?.image} className="w-full h-full object-cover object-top grayscale opacity-50"/>
                                        <Ban className="absolute text-red-500 w-1/2 h-1/2"/>
                                      </>
                                  ) : <span className="text-gray-700 text-xs text-center p-2">Arraste ou Clique para Banir (Se for a vez)</span>}
                              </div>
                          </div>

                          <div className="space-y-2">
                              <div className="text-xs font-bold text-gray-500 uppercase">Picks</div>
                              <div className="grid grid-cols-1 gap-2">
                                  {[0,1,2,3].map(i => (
                                      <div key={i} className="aspect-video bg-blue-900/10 rounded-lg border border-blue-900/30 flex items-center justify-center relative overflow-hidden group">
                                          {draftState.picksB[i] ? (
                                              <>
                                                <img src={CHARACTERS.find(c => c.id === draftState.picksB[i])?.image} className="w-full h-full object-cover object-top"/>
                                                <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-center font-bold uppercase text-blue-400">{CHARACTERS.find(c => c.id === draftState.picksB[i])?.name}</div>
                                              </>
                                          ) : <span className="text-blue-900/30 text-xs font-bold">Pick {i+1}</span>}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* Match Winner Selection Modal */}
              {draftState.isComplete && showWinnerModal && (
                  <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
                      <div className="bg-panel border border-theme rounded-2xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl">
                          <h3 className="text-3xl font-black uppercase text-white">Quem venceu a partida?</h3>
                          <div className="text-gray-400 text-sm">Selecione o vencedor da <span className="text-white font-bold">Partida {currentMatchIndex + 1}</span> no mapa <span className="text-white font-bold">{MAPS.find(m => m.id === vsMaps[currentMatchIndex])?.name}</span></div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => handleMatchEnd('A')}
                                className="p-6 bg-yellow-500/10 border border-yellow-500 hover:bg-yellow-500 hover:text-black text-yellow-500 font-black text-xl rounded-xl transition-all uppercase"
                              >
                                  {teamAName}
                              </button>
                              <button 
                                onClick={() => handleMatchEnd('B')}
                                className="p-6 bg-blue-500/10 border border-blue-500 hover:bg-blue-500 hover:text-black text-blue-500 font-black text-xl rounded-xl transition-all uppercase"
                              >
                                  {teamBName}
                              </button>
                          </div>
                          
                          <button onClick={() => setShowWinnerModal(false)} className="text-gray-500 text-sm hover:text-white underline">Voltar para revisão</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderVS_History = () => {
      const handleDownload = async () => {
          if (historyRef.current) {
              const dataUrl = await htmlToImage.toPng(historyRef.current);
              const link = document.createElement('a');
              link.download = `serie-4x4-${Date.now()}.png`;
              link.href = dataUrl;
              link.click();
          }
      };

      const winner = seriesScore.a > seriesScore.b ? teamAName : teamBName;
      const winnerColor = seriesScore.a > seriesScore.b ? 'text-yellow-500' : 'text-blue-500';

      return (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
              <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-display font-bold">Resultado da Série</h2>
                  <div className="flex gap-2">
                      <Button onClick={() => setVsStep('HOME')} variant="secondary">Novo 4x4</Button>
                      <Button onClick={handleDownload}><Download size={18}/> Salvar PNG</Button>
                  </div>
              </div>

              <div ref={historyRef} className="bg-[#0a0a0a] p-8 rounded-2xl border border-theme space-y-8">
                  {/* Series Header */}
                  <div className="text-center space-y-4 border-b border-theme pb-8">
                      <div className="inline-block px-4 py-1 rounded-full bg-green-500/20 text-green-500 border border-green-500/50 text-xs font-bold uppercase tracking-widest mb-2">
                          Série Finalizada
                      </div>
                      <div className="flex justify-center items-center gap-12 text-6xl font-black uppercase">
                          <div className="flex flex-col items-center gap-2">
                              <span className="text-yellow-500">{teamAName}</span>
                              <span className="text-4xl text-gray-500">{seriesScore.a}</span>
                          </div>
                          <span className="text-gray-700 text-4xl">VS</span>
                          <div className="flex flex-col items-center gap-2">
                              <span className="text-blue-500">{teamBName}</span>
                              <span className="text-4xl text-gray-500">{seriesScore.b}</span>
                          </div>
                      </div>
                      <div className={`text-2xl font-bold uppercase tracking-widest ${winnerColor}`}>
                          Vencedor: {winner}
                      </div>
                  </div>

                  {/* Match List */}
                  <div className="space-y-6">
                      <h3 className="font-bold text-xl text-white uppercase tracking-widest text-center">Detalhes das Partidas</h3>
                      {seriesHistory.map((match, idx) => (
                          <div key={idx} className="bg-panel border border-theme rounded-xl p-6 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: match.winner === 'A' ? '#eab308' : '#3b82f6'}}></div>
                              
                              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                                  <div className="font-bold text-lg uppercase flex items-center gap-2">
                                      <span className="text-gray-500">#{idx+1}</span>
                                      {MAPS.find(m => m.id === match.mapId)?.name}
                                  </div>
                                  <div className={`text-sm font-bold uppercase px-3 py-1 rounded bg-black/40 border ${match.winner === 'A' ? 'border-yellow-500 text-yellow-500' : 'border-blue-500 text-blue-500'}`}>
                                      Vencedor: {match.winner === 'A' ? teamAName : teamBName}
                                  </div>
                              </div>

                              <div className="grid grid-cols-2 gap-8">
                                  {/* Team A Picks */}
                                  <div>
                                      <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex justify-between items-end">
                                          <span>{teamAName} Picks</span>
                                          {match.draftState.bansA.length > 0 && (
                                              <div className="flex items-center gap-2 text-red-500">
                                                  <span className="text-[10px] uppercase font-bold">Ban: {CHARACTERS.find(c => c.id === match.draftState.bansA[0])?.name}</span>
                                                  <div className="w-8 h-8 rounded border border-red-500/50 overflow-hidden relative">
                                                      <img src={CHARACTERS.find(c => c.id === match.draftState.bansA[0])?.image} className="w-full h-full object-cover object-top grayscale opacity-60"/>
                                                      <Ban size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500"/>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                      <div className="flex gap-2">
                                          {match.draftState.picksA.map(c => (
                                              <div key={c} className="w-14 aspect-[2/3] relative border border-yellow-500/50 rounded overflow-hidden group">
                                                  <img src={CHARACTERS.find(x => x.id === c)?.image} className="w-full h-full object-cover object-top"/>
                                                  <div className="absolute bottom-0 w-full bg-black/70 text-[8px] text-center text-white font-bold py-0.5">{CHARACTERS.find(x => x.id === c)?.name}</div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>

                                  {/* Team B Picks */}
                                  <div className="text-right">
                                      <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex justify-between items-end">
                                          {match.draftState.bansB.length > 0 && (
                                              <div className="flex items-center gap-2 text-red-500">
                                                  <div className="w-8 h-8 rounded border border-red-500/50 overflow-hidden relative">
                                                      <img src={CHARACTERS.find(c => c.id === match.draftState.bansB[0])?.image} className="w-full h-full object-cover object-top grayscale opacity-60"/>
                                                      <Ban size={16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500"/>
                                                  </div>
                                                  <span className="text-[10px] uppercase font-bold">Ban: {CHARACTERS.find(c => c.id === match.draftState.bansB[0])?.name}</span>
                                              </div>
                                          )}
                                          <span>{teamBName} Picks</span>
                                      </div>
                                      <div className="flex gap-2 justify-end">
                                          {match.draftState.picksB.map(c => (
                                              <div key={c} className="w-14 aspect-[2/3] relative border border-blue-500/50 rounded overflow-hidden group">
                                                  <img src={CHARACTERS.find(x => x.id === c)?.image} className="w-full h-full object-cover object-top"/>
                                                  <div className="absolute bottom-0 w-full bg-black/70 text-[8px] text-center text-white font-bold py-0.5">{CHARACTERS.find(x => x.id === c)?.name}</div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-[#0a0a0a] text-white font-sans ${isDarkMode ? '' : 'light-mode'} flex flex-col`}>
        <div className="flex-1">
            {step === Step.LANDING && renderLanding()}
            {step === Step.MODE_4X4 && (
                <>
                {vsStep === 'HOME' && renderVS_Home()}
                {vsStep === 'CONFIG' && renderVS_Config()}
                {vsStep === 'DRAFT' && renderVS_Draft()}
                {vsStep === 'HISTORY' && renderVS_History()}
                </>
            )}
            
            {/* Placeholder logic for steps missing in the provided code snippet */}
            {![Step.LANDING, Step.MODE_4X4].includes(step) && (
                <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-fade-in">
                    <AlertTriangle size={48} className="text-yellow-500 mb-4"/>
                    <h2 className="text-2xl font-bold text-white">Funcionalidade em Desenvolvimento</h2>
                    <p className="text-gray-400 mb-6">Esta tela ({step}) ainda não foi implementada neste trecho de código.</p>
                    <Button onClick={handleBack}>Voltar</Button>
                </div>
            )}
        </div>

        <footer className="py-6 text-center text-gray-600 text-xs font-bold uppercase tracking-widest border-t border-theme bg-panel/30">
            Desenvolvido por Jhan Medeiros
        </footer>

        {renderHelpModal()}
      </div>
    </ErrorBoundary>
  );
};

export default App;