import React, { useState, useEffect, useMemo, useRef, ErrorInfo, ReactNode, Component } from 'react';
import { 
  Languages, Zap, ArrowRight, ListPlus, Globe, Map as MapIcon, Users, BarChart2, Share2, 
  ClipboardList, Check, Trash2, Upload, AlertTriangle, MousePointer2, RefreshCw, Download, 
  Crown, X, Target, HelpCircle, FileJson, Trophy, Clock, Swords, Ban, Settings, Shuffle, 
  RotateCcw, CheckCircle, Plus, Minus, Undo, Search, Redo, Info, Home, ChevronLeft, Pencil, 
  Image as ImageIcon, User, Save, Printer
} from 'lucide-react';
import { 
  Step, Language, Team, TrainingMode, MatchScore, ProcessedScore, 
  Position, SavedTrainingSession, OpenTraining, 
  ReplayEvent, PlayerAnalysis, POINTS_SYSTEM,
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
    register: { title: 'REGISTRO DE TIMES', placeholder: 'Nome do Time (Ex: LOUD, FX, PAIN)...', add: 'ADICIONAR', next: 'GERAR TABELA DO TREINO', empty: 'Nenhum time adicionado.', copied: 'Copiado!', shareLineup: 'Compartilhar Escalação', tip: 'Dica: Use a TAG do time igual ao jogo para o Premium Plus funcionar automaticamente.' },
    sort: { title: 'SORTEIO DE MAPAS', spin: 'SORTEAR ORDEM', respin: 'SORTEAR NOVAMENTE', strategy: 'DEFINIR ESTRATÉGIA', pool: 'Mapas Disponíveis', basicTitle: 'Ordem dos Mapas' },
    strategy: { title: 'DEFINICIÓN DE CALLS', import: 'Importar', saveJson: 'JSON', saveImg: 'Imagem', scoring: 'PONTUAÇÃO', match: 'Queda', select: 'Selecione a Call...', free: 'LIVRE', defineCalls: 'Definir Calls (Lista)' },
    scoring: { title: 'PONTUAÇÃO', rank: 'Rank #', kills: 'Kills', loadReplay: 'Carregar Arquivo .JSON', results: 'VER RESULTADOS', manual: 'Tabela de Pontuação', dragJson: 'Arraste o arquivo JSON aqui ou clique para selecionar', successJson: 'Arquivo processado com sucesso!', errorJson: 'Erro ao ler arquivo. Verifique o formato.' },
    dashboard: { title: 'RESULTADOS & ESTATÍSTICAS', tabRank: 'CLASSIFICAÇÃO', tabMvp: 'MVP & STATS', social: 'Compartilhar', saveHub: 'Publicar no Hub', table: { team: 'Team', total: 'Pts Totais', pos: 'Posição (Pts)', killPts: 'Kills (Pts)', booyah: 'Booyahs', last: 'Última Queda', player: 'Jogador', mvpScore: 'MVP Score', damage: 'Dano', time: 'Tempo Vivo' }, emptyPlayer: 'Nenhum dado de jogador. No modo Premium Plus, os dados vêm do JSON.', resultTitle: 'RESULTADO FINAL', points: 'PONTOS' },
    waiting: { title: 'LISTA DE ESPERA & TREINOS', adminArea: 'Área do Organizador', yourName: 'Seu Nome/Nick', trainingName: 'Nome do Treino', pin: 'PIN de Segurança (ex: 1234)', create: 'CRIAR LISTA', successCreate: 'Lista de espera criada com sucesso!', requestTitle: 'Solicitar Vaga', selectTraining: 'Selecione um Treino...', yourTeam: 'Nome do Seu Time', sendRequest: 'ENVIAR SOLICITAÇÃO', successRequest: 'Solicitação enviada!', queue: 'Treinos Disponíveis (Rolando Agora)', generate: 'GERAR TREINO', delete: 'Tem certeza que deseja apagar esta lista?' },
    hub: { title: 'HUB DE TREINOS', desc: 'Seu Histórico de Sessões Salvas', info: 'Os dados são salvos no cache deste navegador.', empty: 'Nenhum treino salvo encontrado', load: 'Carregar este treino', delete: 'Excluir permanentemente', confirmLoad: 'Carregar este treino substituirá os dados atuais. Continuar?', emptyDesc: 'Para ver seus treinos aqui, clique em "Publicar no Hub" na tela de Resultados após finalizar uma sessão.' },
    common: { error: 'Ops! Algo deu errado.', reload: 'Recarregar Página', back: 'Voltar', home: 'Ir para Início', draft: 'Salvar Rascunho', help: 'Ajuda', theme: 'Cor Destaque', language: 'Idioma', dark: 'Modo Escuro', light: 'Modo Claro', confirmHome: 'Tem certeza? Todo o progresso não salvo pode ser perdido.', draftSaved: 'Rascunho salvo no navegador!', draftLoaded: 'Rascunho carregado com sucesso!', yes: 'Sim', no: 'Não', cancel: 'Cancelar', overview: 'Visão Geral', howTo: 'Como Usar', interactiveMap: 'Mapa Interativo' }
  }
};

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
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error:", error, errorInfo);
  }
  
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
  const [isProcessingJson, setIsProcessingJson] = useState(false);
  const [showVsHelp, setShowVsHelp] = useState(false);
  
  // Data State
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [shuffledMaps, setShuffledMaps] = useState<string[]>([]);
  const [basicSelections, setBasicSelections] = useState<Record<string, Record<string, string>>>({});
  const [premiumPositions, setPremiumPositions] = useState<Record<string, Record<string, Position>>>({});
  const [matchScores, setMatchScores] = useState<Record<number, Record<string, MatchScore>>>({});
  const [playerExtendedStats, setPlayerExtendedStats] = useState<Record<string, PlayerAnalysis>>({});
  const [selectedWarning, setSelectedWarning] = useState<string>('');
  
  // UI State
  const [isSpinning, setIsSpinning] = useState(false);
  const [isVsMapSpinning, setIsVsMapSpinning] = useState(false);
  const [activeStrategyMapIndex, setActiveStrategyMapIndex] = useState(0);
  const [currentMatchTab, setCurrentMatchTab] = useState(1);
  const [dashboardTab, setDashboardTab] = useState<'leaderboard' | 'mvp'>('leaderboard');
  const [savedTrainings, setSavedTrainings] = useState<SavedTrainingSession[]>([]);
  const [openTrainings, setOpenTrainings] = useState<OpenTraining[]>([]);
  
  // Waiting List State
  const [wlAdminName, setWlAdminName] = useState('');
  const [wlTrainingName, setWlTrainingName] = useState('');
  const [wlPin, setWlPin] = useState('');
  
  // 4x4 Mode State
  const [vsStep, setVsStep] = useState<VS_Step>('HOME');
  const [vsConfigStep, setVsConfigStep] = useState(0); // 0: Teams, 1: Mode, 2: MD, 3: Maps
  const [pbMode, setPbMode] = useState<PBMode>('snake');
  const [mdFormat, setMdFormat] = useState<number>(3);
  const [roundsFormat, setRoundsFormat] = useState<11 | 13>(13);
  const [mapStrategy, setMapStrategy] = useState<MapStrategy>('no_repeat');
  const [vsMaps, setVsMaps] = useState<string[]>([]);
  const [draftState, setDraftState] = useState<DraftState>({
      bansA: [], bansB: [], picksA: [], picksB: [], turnIndex: 0, history: [], redoStack: [], isComplete: false
  });
  const [teamAName, setTeamAName] = useState('Time A');
  const [teamBName, setTeamBName] = useState('Time B');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [matchRoundScore, setMatchRoundScore] = useState({ a: 0, b: 0 });
  const [seriesHistory, setSeriesHistory] = useState<SeriesMatchResult[]>([]);
  const [seriesScore, setSeriesScore] = useState({ a: 0, b: 0 });
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  // Draft UI State
  const [draftSearch, setDraftSearch] = useState('');
  const [hoveredChar, setHoveredChar] = useState<string | null>(null);
  
  // Refs
  const historyRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const basicStrategyRef = useRef<HTMLDivElement>(null);
  const replayInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
      document.body.className = isDarkMode ? '' : 'light-mode';
      const savedHub = localStorage.getItem('jhantraining_hub_data');
      if (savedHub) setSavedTrainings(JSON.parse(savedHub));
      const savedWaiting = localStorage.getItem('jhantraining_waiting_list');
      if (savedWaiting) setOpenTrainings(JSON.parse(savedWaiting));
  }, [isDarkMode]);

  // Sync vsMaps for manual strategy
  useEffect(() => {
      if (mapStrategy === 'manual') {
          setVsMaps(prev => {
              if (prev.length === mdFormat) return prev;
              const newMaps = [...prev];
              while (newMaps.length < mdFormat) newMaps.push(MAPS[0].id);
              return newMaps.slice(0, mdFormat);
          });
      }
  }, [mdFormat, mapStrategy]);

  const handleHome = () => { 
      if (step === Step.MODE_4X4) {
          if (vsStep === 'HOME') {
              setStep(Step.LANDING);
          } else {
              if (window.confirm("Voltar ao Menu do 4x4? Progresso atual será perdido.")) {
                  setVsStep('HOME');
              }
          }
          return;
      }
      const brSteps = [Step.MODE_SELECT, Step.TEAM_REGISTER, Step.MAP_SORT, Step.STRATEGY, Step.SCORING, Step.DASHBOARD, Step.WAITING_LIST, Step.PUBLIC_HUB, Step.VIEWER];
      if (step === Step.HOME) {
          setStep(Step.LANDING);
          return;
      }
      if (brSteps.includes(step)) {
          const criticalSteps = [Step.TEAM_REGISTER, Step.MAP_SORT, Step.STRATEGY, Step.SCORING, Step.DASHBOARD];
          if (criticalSteps.includes(step)) {
              if (window.confirm("Voltar ao Menu do Battle Royale?")) setStep(Step.HOME);
          } else {
              setStep(Step.HOME);
          }
          return;
      }
      if (window.confirm(t.common.confirmHome)) setStep(Step.LANDING);
  };

  const handleBack = () => {
    if(step === Step.HOME) setStep(Step.LANDING);
    else if(step === Step.MODE_SELECT) setStep(Step.HOME);
    else if(step === Step.MODE_4X4) {
        if (vsStep === 'HOME') setStep(Step.LANDING);
        else if (vsStep === 'CONFIG') {
            if (vsConfigStep > 0) setVsConfigStep(vsConfigStep - 1);
            else setVsStep('HOME');
        }
        else if (vsStep === 'DRAFT') {
            if (window.confirm('Sair da partida? O progresso será perdido.')) setVsStep('CONFIG');
        }
        else if (vsStep === 'HISTORY') setVsStep('HOME');
    }
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

  const handleSaveTeamDetails = () => {
      if (!editingTeam) return;
      setTeams(teams.map(t => t.id === editingTeam.id ? editingTeam : t));
      setEditingTeam(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (end) => {
              if (editingTeam) setEditingTeam({ ...editingTeam, logo: end.target?.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const downloadBasicStrategy = async () => {
      if (basicStrategyRef.current) {
          try {
              const dataUrl = await htmlToImage.toPng(basicStrategyRef.current, { backgroundColor: '#000000', pixelRatio: 2 });
              const link = document.createElement('a');
              link.download = `tabela-calls-${new Date().getTime()}.png`;
              link.href = dataUrl;
              link.click();
          } catch (error) {
              console.error('Error generating image', error);
              alert('Erro ao gerar imagem.');
          }
      }
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
        } else if (mapStrategy === 'manual') {
             for (let i = 0; i < mdFormat; i++) {
                const map = available[Math.floor(Math.random() * available.length)];
                selected.push(map.id);
             }
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
      setDraftState({ bansA: [], bansB: [], picksA: [], picksB: [], turnIndex: 0, history: [], redoStack: [], isComplete: false });
      setCurrentMatchIndex(0);
      setMatchRoundScore({ a: 0, b: 0 });
      setSeriesHistory([]);
      setSeriesScore({ a: 0, b: 0 });
      setShowWinnerModal(false);
      setVsStep('DRAFT');
  };

  const resetMatchDraft = () => {
      if(window.confirm('Tem certeza? O draft e o placar atual serão reiniciados.')) {
          setDraftState({ bansA: [], bansB: [], picksA: [], picksB: [], turnIndex: 0, history: [], redoStack: [], isComplete: false });
          setMatchRoundScore({ a: 0, b: 0 });
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
      const result: SeriesMatchResult = {
          matchIndex: currentMatchIndex,
          mapId: vsMaps[currentMatchIndex],
          winner,
          score: { ...matchRoundScore },
          draftState: { ...draftState }
      };
      const newHistory = [...seriesHistory, result];
      setSeriesHistory(newHistory);
      const newScore = { ...seriesScore, [winner.toLowerCase()]: seriesScore[winner.toLowerCase() as 'a' | 'b'] + 1 };
      setSeriesScore(newScore);

      const winsNeeded = Math.ceil(mdFormat / 2);
      if (newScore.a >= winsNeeded || newScore.b >= winsNeeded || currentMatchIndex >= mdFormat - 1) {
          setVsStep('HISTORY');
      } else {
          setCurrentMatchIndex(prev => prev + 1);
          setDraftState({ bansA: [], bansB: [], picksA: [], picksB: [], turnIndex: 0, history: [], redoStack: [], isComplete: false });
          setMatchRoundScore({ a: 0, b: 0 });
          setShowWinnerModal(false);
      }
  };

  const getTurnInfo = (turnIndex: number, mode: PBMode, matchIndex: number) => {
      let action: TurnAction | null = null;
      if (mode === 'snake') action = VS_SNAKE_ORDER[turnIndex];
      else if (mode === 'linear') action = VS_LINEAR_ORDER[turnIndex];
      else if (mode === 'mirrored') {
          if (turnIndex < 2) action = turnIndex === 0 ? 'BAN_A' : 'BAN_B';
          else action = turnIndex % 2 === 0 ? 'PICK_A' : 'PICK_B';
      }
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
          newState.redoStack = [];
          setDraftState(newState);
      }
  };

  const handleUndo = () => {
      if (draftState.history.length === 0) return;
      const lastMove = draftState.history[draftState.history.length - 1];
      const newState = { ...draftState };
      if (lastMove.action === 'BAN_A') newState.bansA = newState.bansA.filter(id => id !== lastMove.charId);
      else if (lastMove.action === 'BAN_B') newState.bansB = newState.bansB.filter(id => id !== lastMove.charId);
      else if (lastMove.action === 'PICK_A') newState.picksA = newState.picksA.filter(id => id !== lastMove.charId);
      else if (lastMove.action === 'PICK_B') newState.picksB = newState.picksB.filter(id => id !== lastMove.charId);
      newState.history.pop();
      newState.redoStack.push(lastMove);
      newState.turnIndex--;
      newState.isComplete = false;
      setDraftState(newState);
  };

  const handleRedo = () => {
      if (draftState.redoStack.length === 0) return;
      const move = draftState.redoStack[draftState.redoStack.length - 1];
      const newState = { ...draftState };
      if (move.action === 'BAN_A') newState.bansA.push(move.charId);
      else if (move.action === 'BAN_B') newState.bansB.push(move.charId);
      else if (move.action === 'PICK_A') newState.picksA.push(move.charId);
      else if (move.action === 'PICK_B') newState.picksB.push(move.charId);
      newState.redoStack.pop();
      newState.history.push(move);
      newState.turnIndex++;
      if (newState.turnIndex >= 10) newState.isComplete = true;
      setDraftState(newState);
  };

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
      if (targetTeam === 'A' && (currentTurn === 'BAN_A' || currentTurn === 'PICK_A')) handleDraftClick(charId);
      else if (targetTeam === 'B' && (currentTurn === 'BAN_B' || currentTurn === 'PICK_B')) handleDraftClick(charId);
  };

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
    setIsProcessingJson(true);
    // Timeout allows the UI to render the loading state before the main thread is blocked by JSON.parse
    setTimeout(() => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                processReplay(json);
            } catch(err) { alert(t.scoring.errorJson); }
            finally { setIsProcessingJson(false); }
        };
        reader.readAsText(file);
    }, 100);
  };

  const processReplay = (data: { Events: ReplayEvent[] }) => {
    if (!data.Events) return;
    const playerStats: Record<string, { name: string, teamTag: string, kills: number, damage: number, firstEvent: number, lastEvent: number }> = {};
    const teamSurvival: Record<string, number> = {};

    data.Events.forEach(ev => {
        const playerName = ev.SParam || 'Unknown';
        const teamTag = playerName.includes('.') ? playerName.split('.')[0] : 'LIVRE';
        if (!playerStats[playerName] && (ev.Event === 2 || ev.Event === 4 || ev.Event === 1)) {
            playerStats[playerName] = { name: playerName, teamTag, kills: 0, damage: 0, firstEvent: ev.Time, lastEvent: ev.Time };
        }
        if (playerStats[playerName]) {
            playerStats[playerName].firstEvent = Math.min(playerStats[playerName].firstEvent, ev.Time);
            playerStats[playerName].lastEvent = Math.max(playerStats[playerName].lastEvent, ev.Time);
        }
        if (ev.Event === 2 && ev.FParam) if (playerStats[playerName]) playerStats[playerName].damage += ev.FParam;
        if (ev.Event === 4) if (playerStats[playerName]) playerStats[playerName].kills += 1;
        if (ev.Event === 1 && ev.SParam) teamSurvival[ev.SParam] = ev.Time;
    });

    const sortedTeamsBySurvival = Object.entries(teamSurvival).sort(([, timeA], [, timeB]) => timeB - timeA).map(([name]) => name);
    const newScores = { ...matchScores[currentMatchTab] } || {};
    const extendedStats: Record<string, PlayerAnalysis> = { ...playerExtendedStats };

    teams.forEach(appTeam => {
        const tag = appTeam.name;
        const playersOfTeam = Object.values(playerStats).filter(p => p.teamTag.toUpperCase() === tag.toUpperCase());
        let teamKills = 0;
        const playerKillsMap: Record<string, number> = {};

        playersOfTeam.forEach(p => {
            teamKills += p.kills;
            playerKillsMap[p.name] = p.kills;
            const timeAlive = p.lastEvent - p.firstEvent;
            const mvpScore = (p.kills * 3) + (p.damage / 300) + (timeAlive / 200);
            extendedStats[p.name] = { name: p.name, teamTag: tag, kills: p.kills, damage: p.damage, firstEventTime: p.firstEvent, lastEventTime: p.lastEvent, mvpScore: mvpScore, timeAlive: timeAlive };
        });

        const survivalIndex = sortedTeamsBySurvival.findIndex(t => t.toUpperCase() === tag.toUpperCase());
        let rank = 1;
        if (survivalIndex !== -1) rank = survivalIndex + 2;
        newScores[appTeam.id] = { teamId: appTeam.id, rank: rank, kills: teamKills, playerKills: playerKillsMap };
    });
    
    setMatchScores({...matchScores, [currentMatchTab]: newScores});
    setPlayerExtendedStats(extendedStats);
    alert(t.scoring.successJson);
  };
  
  const leaderboard = useMemo(() => {
      const stats: Record<string, ProcessedScore> = {};
      teams.forEach(t => stats[t.id] = { teamId: t.id, teamName: t.name, totalPoints: 0, placementPoints: 0, killPoints: 0, booyahs: 0, totalKills: 0, matchesPlayed: 0, lastMatchRank: 99 });
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

  const mvpList = useMemo(() => {
      return Object.values(playerExtendedStats).sort((a: PlayerAnalysis, b: PlayerAnalysis) => b.mvpScore - a.mvpScore);
  }, [playerExtendedStats]);

  const downloadDashboard = async () => {
    if (leaderboardRef.current) {
        try {
            const dataUrl = await htmlToImage.toPng(leaderboardRef.current, { quality: 0.95, backgroundColor: '#1D1D1D' });
            const link = document.createElement('a');
            link.download = `resultado-treino-${new Date().toLocaleDateString().replace(/\//g, '-')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) { console.error(err); alert("Erro ao gerar imagem."); }
    }
  };

  const resetTraining = () => {
      if (window.confirm("Deseja realmente encerrar e iniciar um novo treino? Todos os dados atuais (Times, Mapas, Pontos) serão apagados.")) {
          setTeams([]);
          setShuffledMaps([]);
          setBasicSelections({});
          setPremiumPositions({});
          setMatchScores({});
          setPlayerExtendedStats({});
          setStep(Step.MODE_SELECT);
      }
  };

  const createWaitingTraining = () => {
      if(!wlAdminName || !wlTrainingName || !wlPin) return;
      const newT: OpenTraining = { id: Date.now().toString(), adminName: wlAdminName, trainingName: wlTrainingName, adminPin: wlPin, requests: [], createdAt: Date.now() };
      const updated = [newT, ...openTrainings];
      setOpenTrainings(updated);
      localStorage.setItem('jhantraining_waiting_list', JSON.stringify(updated));
      alert(t.waiting.successCreate);
  };

  const renderHelpModal = () => {
      if(!isHelpOpen) return null;
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsHelpOpen(false)}>
              <div className="bg-panel border border-theme rounded-2xl max-w-lg w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setIsHelpOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-primary"><HelpCircle/> Ajuda & Instruções</h3>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {mode === 'basic' && <div className="space-y-2"><h4 className="font-bold text-white">Modo Básico</h4><p className="text-sm text-gray-400">Ideal para treinos rápidos. Utilize as listas para sortear mapas e definir calls manualmente.</p></div>}
                      {mode === 'premium' && <div className="space-y-2"><h4 className="font-bold text-white">Modo Premium</h4><p className="text-sm text-gray-400">Use os mapas interativos. Arraste os nomes dos times para as posições desejadas. Use o scroll do mouse para dar zoom no mapa.</p></div>}
                      {mode === 'premium_plus' && <div className="space-y-2"><h4 className="font-bold text-purple-400">Modo Premium Plus</h4><p className="text-sm text-gray-400">Este modo automatiza a pontuação. Na tela "Pontuação", arraste ou selecione o arquivo <code>.JSON</code> ou <code>.BIN</code> gerado pelo jogo.</p></div>}
                      {step === Step.MODE_4X4 && <div className="space-y-2 border-t border-theme pt-4"><h4 className="font-bold text-red-500 flex items-center gap-2"><Swords size={16}/> Modo 4x4 (Versus)</h4><p className="text-sm text-gray-400">Gerencie partidas competitivas de Picks e Bans.</p></div>}
                  </div>
                  <Button className="w-full mt-6" onClick={() => setIsHelpOpen(false)}>Entendi</Button>
              </div>
          </div>
      );
  };

  const renderTeamEditModal = () => {
      if (!editingTeam) return null;
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setEditingTeam(null)}>
              <div className="bg-panel border border-theme rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-6" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setEditingTeam(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                  <h3 className="text-2xl font-bold flex items-center gap-2 text-white"><Pencil size={24} className="text-primary"/> Editar Time</h3>
                  
                  <div className="space-y-4">
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Nome do Time</label>
                          <input 
                              value={editingTeam.name} 
                              onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })} 
                              className="w-full bg-black border border-theme rounded p-3 text-white font-bold"
                          />
                      </div>
                      
                      <div className="flex gap-4">
                          <div className="w-24 h-24 bg-black border border-theme rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden group">
                              {editingTeam.logo ? (
                                  <img src={editingTeam.logo} alt="Logo" className="w-full h-full object-cover" />
                              ) : (
                                  <ImageIcon className="text-gray-600" size={32} />
                              )}
                              <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold text-white">
                                  Alterar <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                              </label>
                          </div>
                          <div className="flex-1 space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase">Jogadores (Max 6)</label>
                              <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                  {[0,1,2,3,4,5].map(i => (
                                      <div key={i} className="flex items-center gap-2 bg-black border border-theme rounded px-2 py-1.5">
                                          <User size={12} className="text-gray-500"/>
                                          <input 
                                              placeholder={`Player ${i+1}`}
                                              value={editingTeam.players[i] || ''}
                                              onChange={e => {
                                                  const newPlayers = [...editingTeam.players];
                                                  newPlayers[i] = e.target.value;
                                                  setEditingTeam({ ...editingTeam, players: newPlayers });
                                              }}
                                              className="bg-transparent outline-none text-xs text-white w-full"
                                          />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex gap-2">
                      <Button onClick={() => setEditingTeam(null)} variant="ghost" className="flex-1">Cancelar</Button>
                      <Button onClick={handleSaveTeamDetails} className="flex-1"><Save size={18}/> Salvar</Button>
                  </div>
              </div>
          </div>
      )
  };

  const renderBRHeader = (title: string, icon: React.ReactNode) => (
      <div className="flex items-center justify-between mb-6 bg-panel border border-theme p-4 rounded-xl shadow-lg animate-fade-in sticky top-0 z-40 backdrop-blur-md bg-panel/90">
          <h3 className="font-bold text-xl flex items-center gap-2 text-white">{icon} {title}</h3>
          <Tooltip content="Menu Principal do Modo"><button onClick={handleHome} className="p-2 bg-red-500/10 border border-red-500 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"><Home size={20}/></button></Tooltip>
      </div>
  );

  // Renders...
  // (All render functions for Landing, BRHub, ModeSelect, TeamRegister, MapSort, Strategy are same as previous)
  const renderLanding = () => (
    <div className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0a0a] text-white p-4">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-6 right-6 z-20">
            <button onClick={() => setLang(lang === 'pt' ? 'en' : lang === 'en' ? 'es' : 'pt')} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white"><Languages size={14} /><span>{lang === 'pt' ? 'PT-BR' : lang === 'en' ? 'EN-US' : 'ES-ES'}</span></button>
        </div>
        <div className="max-w-6xl w-full mx-auto z-10 space-y-12">
            <div className="text-center space-y-4 animate-fade-in"><h1 className="text-4xl md:text-6xl font-black tracking-tighter flex items-center justify-center gap-4"><Zap className="text-primary fill-current" size={48}/> CRIADOR DE TREINO</h1><p className="text-gray-400 text-lg uppercase tracking-widest font-bold">{t.landing.title}</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
                <div onClick={() => setStep(Step.HOME)} className="group cursor-pointer relative bg-[#121212] border border-white/10 rounded-3xl p-8 md:p-12 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(255,212,0,0.1)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center text-center gap-6"><div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-2 border-white/10 group-hover:border-primary group-hover:scale-110 transition-all duration-500 shadow-2xl"><Trophy size={40} className="text-gray-400 group-hover:text-primary transition-colors"/></div><div><h2 className="text-3xl font-black uppercase italic mb-2">{t.landing.br}</h2><p className="text-gray-500 font-medium">{t.landing.brDesc}</p></div><div className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm uppercase tracking-widest group-hover:bg-primary group-hover:text-black transition-all">{t.landing.enter}</div></div>
                </div>
                <div onClick={() => setStep(Step.MODE_4X4)} className="group cursor-pointer relative bg-[#121212] border border-white/10 rounded-3xl p-8 md:p-12 hover:border-red-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(239,68,68,0.1)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10 flex flex-col items-center text-center gap-6"><div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center border-2 border-white/10 group-hover:border-red-500 group-hover:scale-110 transition-all duration-500 shadow-2xl"><Swords size={40} className="text-gray-400 group-hover:text-red-500 transition-colors"/></div><div><h2 className="text-3xl font-black uppercase italic mb-2">{t.landing.vs}</h2><p className="text-gray-500 font-medium">{t.landing.vsDesc}</p></div><div className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-full font-bold text-sm uppercase tracking-widest group-hover:bg-red-500 group-hover:text-white transition-all">{t.landing.enter}</div></div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderBRHub = () => (
      <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in gap-8">
         <div className="space-y-2"><h2 className="text-primary font-bold tracking-widest uppercase text-sm md:text-base">{t.hero.subtitle}</h2><h1 className="text-5xl md:text-7xl font-black text-white leading-tight">{t.hero.title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">{t.hero.title2}</span></h1><p className="text-gray-400 max-w-xl mx-auto text-lg">{t.hero.desc}</p></div>
         <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl justify-center mt-8">
             <div onClick={() => setStep(Step.MODE_SELECT)} className="group cursor-pointer bg-primary text-black p-8 rounded-2xl flex-1 hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,212,0,0.2)]"><Zap size={40} className="mb-4"/><h3 className="text-2xl font-black uppercase">{t.hero.start}</h3><p className="text-sm font-bold opacity-80">Criar Nova Sala</p></div>
             <div className="flex flex-col gap-4 flex-1">
                 <div onClick={() => setStep(Step.WAITING_LIST)} className="group cursor-pointer bg-panel border border-theme p-6 rounded-xl flex items-center gap-4 hover:border-green-500 hover:bg-green-500/10 transition-all"><div className="bg-green-500/20 p-3 rounded-lg text-green-500"><Clock size={24}/></div><div className="text-left"><h3 className="font-bold uppercase text-lg">{t.hero.queue}</h3><p className="text-xs text-gray-500">Ver salas disponíveis</p></div></div>
                 <div onClick={() => setStep(Step.PUBLIC_HUB)} className="group cursor-pointer bg-panel border border-theme p-6 rounded-xl flex items-center gap-4 hover:border-blue-500 hover:bg-blue-500/10 transition-all"><div className="bg-blue-500/20 p-3 rounded-lg text-blue-500"><Share2 size={24}/></div><div className="text-left"><h3 className="font-bold uppercase text-lg">{t.hero.hub}</h3><p className="text-xs text-gray-500">Histórico e Comunidade</p></div></div>
             </div>
         </div>
         <Button variant="ghost" onClick={() => setStep(Step.LANDING)} className="mt-8"><ChevronLeft size={20} /> Voltar</Button>
      </div>
  );

  const renderModeSelect = () => (<div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 animate-fade-in p-6"><div className="text-center space-y-4"><h2 className="text-4xl font-display font-black text-white uppercase tracking-tighter">{t.mode.title}</h2><div className="w-24 h-1 bg-primary mx-auto rounded-full"></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl"><div onClick={() => selectMode('basic')} className="group cursor-pointer relative bg-panel border border-theme rounded-2xl p-8 hover:border-primary transition-all duration-300 hover:scale-105"><div className="mb-6 bg-black/50 w-16 h-16 rounded-xl flex items-center justify-center border border-theme group-hover:border-primary/50 transition-colors"><ListPlus size={32} className="text-gray-400 group-hover:text-primary transition-colors"/></div><h3 className="text-2xl font-black uppercase mb-2">{t.mode.basic}</h3><p className="text-sm text-gray-400 mb-6 min-h-[40px]">{t.mode.basicDesc}</p><Button variant="ghost" className="w-full border border-theme group-hover:bg-primary group-hover:text-black group-hover:border-primary">Selecionar</Button></div><div onClick={() => selectMode('premium')} className="group cursor-pointer relative bg-panel border border-theme rounded-2xl p-8 hover:border-blue-500 transition-all duration-300 hover:scale-105 transform scale-105 shadow-2xl z-10"><div className="mb-6 bg-blue-900/20 w-16 h-16 rounded-xl flex items-center justify-center border border-blue-500/30 group-hover:border-blue-500 transition-colors"><MapIcon size={32} className="text-blue-500"/></div><h3 className="text-2xl font-black uppercase mb-2 text-blue-400">{t.mode.premium}</h3><p className="text-sm text-gray-400 mb-6 min-h-[40px]">{t.mode.premiumDesc}</p><Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-900/20">Selecionar</Button></div><div onClick={() => selectMode('premium_plus')} className="group cursor-pointer relative bg-panel border border-theme rounded-2xl p-8 hover:border-purple-500 transition-all duration-300 hover:scale-105"><div className="mb-6 bg-purple-900/20 w-16 h-16 rounded-xl flex items-center justify-center border border-purple-500/30 group-hover:border-purple-500 transition-colors"><FileJson size={32} className="text-purple-500"/></div><h3 className="text-2xl font-black uppercase mb-2 text-purple-400">{t.mode.premiumPlus}</h3><p className="text-sm text-gray-400 mb-6 min-h-[40px]">{t.mode.premiumPlusDesc}</p><Button variant="ghost" className="w-full border border-theme group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600">Selecionar</Button></div></div><Button variant="ghost" onClick={() => setStep(Step.HOME)} className="mt-8"><ChevronLeft size={20} /> Voltar</Button></div>);
  const renderTeamRegister = () => (<div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4">{renderBRHeader(t.register.title, <Users className="text-primary"/>)}<div className="bg-panel border border-theme rounded-xl p-8 space-y-6"><div className="flex gap-4"><input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder={t.register.placeholder} className="flex-1 bg-input border border-theme rounded px-4 py-3 focus:border-primary outline-none text-white font-bold" onKeyDown={e => e.key === 'Enter' && addTeam()}/><Button onClick={addTeam} disabled={!newTeamName.trim()}><Plus size={20}/></Button></div><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{teams.map(team => (<div key={team.id} className="bg-black/40 border border-theme p-3 rounded flex items-center justify-between group"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: team.color}}></div><span className="font-bold truncate max-w-[100px]">{team.name}</span></div><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setEditingTeam(team)} className="text-gray-400 hover:text-white p-1"><Pencil size={14}/></button><button onClick={() => deleteTeam(team.id)} className="text-red-500 p-1"><Trash2 size={14}/></button></div></div>))}{teams.length === 0 && <div className="col-span-full text-center text-gray-500 py-8 italic">{t.register.empty}</div>}</div></div><div className="flex justify-between"><Button onClick={() => setStep(Step.MODE_SELECT)} variant="secondary">Voltar</Button><Button onClick={() => setStep(Step.MAP_SORT)} disabled={teams.length < 2}>Próximo <ArrowRight size={18}/></Button></div></div>);
  const renderMapSort = () => (<div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4">{renderBRHeader(t.sort.title, <Globe className="text-primary"/>)}<div className="bg-panel border border-theme rounded-xl p-8 space-y-6 text-center">{shuffledMaps.length > 0 ? (<div className="grid grid-cols-2 md:grid-cols-3 gap-6">{shuffledMaps.slice(0, 6).map((mapId, idx) => (<div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-theme group"><img src={MAPS.find(m => m.id === mapId)?.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"/><div className="absolute inset-0 flex items-center justify-center"><span className="bg-black/80 px-3 py-1 rounded text-xs font-bold uppercase backdrop-blur-md border border-white/10">Queda {idx + 1}</span></div><div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent p-2 text-center text-sm font-bold uppercase">{MAPS.find(m => m.id === mapId)?.name}</div></div>))}</div>) : (<div className="py-12 text-gray-500 italic">Clique para sortear os mapas da rodada</div>)}<Button onClick={spinRoulette} disabled={isSpinning} className="w-full">{isSpinning ? <RefreshCw className="animate-spin"/> : <Shuffle/>} {t.sort.spin}</Button></div><div className="flex justify-between"><Button onClick={() => setStep(Step.TEAM_REGISTER)} variant="secondary">Voltar</Button><Button onClick={() => setStep(Step.STRATEGY)} disabled={shuffledMaps.length === 0}>Próximo <ArrowRight size={18}/></Button></div></div>);
  const renderStrategy = () => { if (mode === 'basic') { const displayedMaps = shuffledMaps.length > 0 ? shuffledMaps.slice(0, 6) : MAPS.slice(0, 6).map(m => m.id); return (<div className="max-w-[95vw] mx-auto space-y-8 animate-fade-in pb-20 px-4">{renderBRHeader('Tabela de Calls (Básico)', <Target className="text-primary"/>)}<div ref={basicStrategyRef} className="bg-panel border border-theme rounded-xl p-6 space-y-6 overflow-x-auto"><div className="flex items-center gap-4 mb-4"><AlertTriangle className="text-yellow-500"/><select className="bg-black border border-theme rounded p-2 text-sm text-yellow-500 font-bold flex-1" value={selectedWarning} onChange={(e) => setSelectedWarning(e.target.value)}><option value="">Selecione um Aviso (Opcional)</option>{WARNINGS[lang].map((w, i) => <option key={i} value={w}>{w}</option>)}</select></div>{selectedWarning && (<div className="bg-yellow-900/20 border border-yellow-500/50 p-4 rounded text-center text-yellow-500 font-black uppercase text-xl mb-4 animate-pulse">{selectedWarning}</div>)}<table className="w-full text-sm border-collapse min-w-[1000px]"><thead><tr className="bg-black/50 text-gray-400"><th className="p-3 text-left border border-theme w-48">Time</th>{displayedMaps.map((mid, idx) => (<th key={idx} className="p-3 text-center border border-theme uppercase">{MAPS.find(m => m.id === mid)?.name}</th>))}</tr></thead><tbody>{teams.map(team => (<tr key={team.id} className="hover:bg-white/5"><td className="p-3 border border-theme font-bold flex items-center gap-2"><div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: team.color}}></div><span className="truncate">{team.name}</span></td>{displayedMaps.map((mid, idx) => { const currentSelection = basicSelections[mid]?.[team.id]; const isConflict = Object.entries(basicSelections[mid] || {}).some(([tId, call]) => tId !== team.id && call === currentSelection && call !== '' && call !== undefined); return (<td key={idx} className={`p-2 border border-theme ${isConflict ? 'bg-red-900/50 animate-pulse' : ''}`}><select className={`w-full bg-transparent border-none outline-none text-xs font-bold ${isConflict ? 'text-red-200' : 'text-gray-300'}`} value={currentSelection || ''} onChange={(e) => { const newSel = {...basicSelections}; if(!newSel[mid]) newSel[mid] = {}; newSel[mid][team.id] = e.target.value; setBasicSelections(newSel); }}><option value="">...</option>{MAPS.find(m => m.id === mid)?.cities.map(city => (<option key={city} value={city}>{city}</option>))}</select></td>); })}</tr>))}</tbody></table></div><div className="flex justify-between mt-6"><Button onClick={() => setStep(Step.MAP_SORT)} variant="secondary">Voltar</Button><div className="flex gap-2"><Button variant="secondary" onClick={downloadBasicStrategy}><Printer size={18}/> Salvar Tabela</Button><Button onClick={() => setStep(Step.SCORING)}>Próximo <ArrowRight size={18}/></Button></div></div></div>); } const currentMapId = shuffledMaps[activeStrategyMapIndex]; const currentMap = MAPS.find(m => m.id === currentMapId); return (<div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in"><div className="flex justify-between items-center px-6 py-4 border-b border-theme bg-panel"><div className="flex gap-2">{shuffledMaps.slice(0, 6).map((mid, idx) => (<button key={idx} onClick={() => setActiveStrategyMapIndex(idx)} className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all ${activeStrategyMapIndex === idx ? 'bg-primary text-black' : 'bg-black/40 text-gray-500 hover:text-white'}`}>Queda {idx + 1}</button>))}</div><div className="flex items-center gap-2"><Tooltip content="Menu Inicial"><button onClick={handleHome} className="p-2 bg-red-500/10 border border-red-500 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"><Home size={16}/></button></Tooltip><Button size="sm" variant="secondary" onClick={() => setStep(Step.MAP_SORT)}>Voltar</Button><Button size="sm" onClick={() => setStep(Step.SCORING)}>Próximo</Button></div></div><div className="flex-1 relative overflow-hidden">{currentMap && (<DraggableMap mapName={currentMap.name} image={currentMap.image} teams={teams} positions={premiumPositions[currentMapId] || {}} onPositionChange={(tId, pos) => { setPremiumPositions(prev => ({ ...prev, [currentMapId]: { ...prev[currentMapId], [tId]: pos } })); }}/>)}</div></div>); };
  const renderScoring = () => (<div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 pt-8 px-4">{renderBRHeader(t.scoring.title, <ClipboardList className="text-white"/>)}<div className="flex justify-center items-center mb-6"><div className="flex gap-2">{[1,2,3,4,5,6].map(num => (<button key={num} onClick={() => setCurrentMatchTab(num)} className={`w-10 h-10 rounded-full font-bold flex items-center justify-center transition-all ${currentMatchTab === num ? 'bg-primary text-black scale-110 shadow-lg' : 'bg-panel border border-theme text-gray-500 hover:text-white'}`}>{num}</button>))}</div></div>{mode === 'premium_plus' && (<div className={`bg-panel border-2 border-dashed border-theme rounded-xl p-8 text-center transition-all relative ${isDragOver ? 'border-primary bg-primary/10' : ''}`} onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={handleFileDrop}>{isProcessingJson && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10"><RefreshCw className="animate-spin text-primary" size={32}/><span className="ml-2 font-bold text-primary">Processando...</span></div>}<Upload size={48} className="mx-auto text-gray-500 mb-4"/><p className="text-lg font-bold mb-2">{t.scoring.dragJson}</p><p className="text-sm text-gray-500 mb-6">ou</p><label className="bg-primary hover:brightness-110 text-black px-6 py-3 rounded-lg font-bold cursor-pointer transition-all">Selecionar Arquivo<input type="file" className="hidden" accept=".json" onChange={handleReplayUpload} ref={replayInputRef}/></label></div>)}<div className="bg-panel border border-theme rounded-xl overflow-hidden"><table className="w-full text-sm"><thead className="bg-black/40 text-gray-400"><tr><th className="p-4 text-left">Time</th><th className="p-4 text-center w-24">Rank #</th><th className="p-4 text-center w-24">Kills</th></tr></thead><tbody>{teams.map(team => { const score = matchScores[currentMatchTab]?.[team.id] || { teamId: team.id, rank: '', kills: '', playerKills: {} }; return (<tr key={team.id} className="border-t border-theme hover:bg-white/5"><td className="p-4 font-bold flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{backgroundColor: team.color}}></div>{team.name}</td><td className="p-4"><input type="number" min="1" max="15" className="w-full bg-black border border-theme rounded p-2 text-center font-bold text-white" value={score.rank} onChange={(e) => { const val = parseInt(e.target.value) || ''; const newScores = {...matchScores}; if(!newScores[currentMatchTab]) newScores[currentMatchTab] = {}; newScores[currentMatchTab][team.id] = { ...score, teamId: team.id, rank: val }; setMatchScores(newScores); }}/></td><td className="p-4"><input type="number" className="w-full bg-black border border-theme rounded p-2 text-center font-bold text-white" value={score.kills} onChange={(e) => { const val = parseInt(e.target.value) || ''; const newScores = {...matchScores}; if(!newScores[currentMatchTab]) newScores[currentMatchTab] = {}; newScores[currentMatchTab][team.id] = { ...score, teamId: team.id, kills: val }; setMatchScores(newScores); }}/></td></tr>); })}</tbody></table></div><div className="flex justify-between"><Button onClick={() => setStep(Step.STRATEGY)} variant="secondary">Voltar</Button><Button onClick={() => setStep(Step.DASHBOARD)}>Ver Resultados <BarChart2 size={18}/></Button></div></div>);
  
  const renderVS_Draft = () => {
      const currentTurn = getTurnInfo(draftState.turnIndex, pbMode, currentMatchIndex);
      const winCap = roundsFormat === 13 ? 7 : 6;
      let turnMessage = '', activeTeam = '';
      if (draftState.isComplete) { turnMessage = "Partida Finalizada"; } 
      else if (pbMode === 'mirrored') { if (draftState.bansA.length === 0 || draftState.bansB.length === 0) { turnMessage = "Fase de Banimentos"; activeTeam = 'BOTH'; } else { turnMessage = "Fase de Escolhas"; activeTeam = 'BOTH'; } } 
      else { if (currentTurn === 'BAN_A') { turnMessage = `Banimento: ${teamAName}`; activeTeam = 'A'; } if (currentTurn === 'BAN_B') { turnMessage = `Banimento: ${teamBName}`; activeTeam = 'B'; } if (currentTurn === 'PICK_A') { turnMessage = `Escolha: ${teamAName}`; activeTeam = 'A'; } if (currentTurn === 'PICK_B') { turnMessage = `Escolha: ${teamBName}`; activeTeam = 'B'; } }
      const filteredChars = CHARACTERS.filter(c => c.name.toLowerCase().includes(draftSearch.toLowerCase()));

      return (
          <div className="flex flex-col h-full animate-fade-in relative">
              <div className="bg-panel border-b border-theme px-4 py-2 flex justify-between items-center shrink-0 shadow-lg z-20 h-16">
                  <div className="flex items-center gap-2">
                      <Tooltip content="Menu Inicial"><button onClick={handleHome} className="p-2 bg-red-500/10 border border-red-500 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"><Home size={20}/></button></Tooltip>
                      <Tooltip content="Configurações"><button onClick={() => { if(window.confirm('Sair da partida atual?')) setVsStep('CONFIG'); }} className="p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-all"><Settings size={20}/></button></Tooltip>
                      <Tooltip content="Ajuda do Draft"><button onClick={() => setShowVsHelp(!showVsHelp)} className="p-2 bg-blue-500/10 border border-blue-500 rounded-lg text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><Info size={20}/></button></Tooltip>
                  </div>
                  {/* Enhanced Scoreboard UI */}
                  <div className="flex items-center gap-4 bg-black/60 px-6 py-1 rounded-full border border-theme shadow-xl backdrop-blur-md absolute left-1/2 -translate-x-1/2">
                      <span className="text-yellow-500 font-black text-2xl drop-shadow-md">{seriesScore.a}</span>
                      <div className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">SÉRIE MD{mdFormat}</span>
                          <span className="text-white/20 text-xs">●</span>
                      </div>
                      <span className="text-blue-500 font-black text-2xl drop-shadow-md">{seriesScore.b}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Tooltip content="Desfazer"><button onClick={handleUndo} disabled={draftState.history.length === 0} className="p-2 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 border border-gray-700"><Undo size={16}/></button></Tooltip>
                      <Tooltip content="Refazer"><button onClick={handleRedo} disabled={draftState.redoStack.length === 0} className="p-2 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-30 border border-gray-700"><Redo size={16}/></button></Tooltip>
                      <Button size="sm" variant="secondary" onClick={resetMatchDraft} className="text-[10px] px-2 h-7 ml-2"><RotateCcw size={12}/> Reiniciar</Button>
                  </div>
              </div>

              {/* Help Overlay */}
              {showVsHelp && (
                  <div className="absolute top-20 right-4 z-50 bg-black/90 border border-theme p-4 rounded-xl max-w-xs shadow-2xl backdrop-blur-md animate-fade-in">
                      <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-white flex items-center gap-2"><HelpCircle size={16}/> Como Funciona</h4><button onClick={() => setShowVsHelp(false)}><X size={16}/></button></div>
                      <p className="text-xs text-gray-400 mb-2">1. <strong>Arraste</strong> o personagem para o lado do time ou clique para selecionar.</p>
                      <p className="text-xs text-gray-400 mb-2">2. A ordem segue o padrão <strong>{pbMode.toUpperCase()}</strong>.</p>
                      <p className="text-xs text-gray-400">3. Ao final, defina o vencedor para atualizar o placar da série.</p>
                  </div>
              )}

              {!draftState.isComplete && (<div className={`py-1 text-center shrink-0 border-b border-theme transition-colors duration-300 ${activeTeam === 'A' ? 'bg-yellow-900/20 border-yellow-500/30' : activeTeam === 'B' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-black/50'}`}><span className={`text-xs font-bold uppercase tracking-widest animate-pulse ${activeTeam === 'A' ? 'text-yellow-500' : activeTeam === 'B' ? 'text-blue-500' : 'text-white'}`}>{turnMessage}</span></div>)}

              {draftState.isComplete && !showWinnerModal ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in p-4 overflow-y-auto">
                      <div className="text-center"><h3 className="text-2xl font-black uppercase text-white mb-1">Resumo da Partida</h3><p className="text-gray-400 text-sm">Revise os picks e bans antes de definir o vencedor.</p></div>
                      
                      {/* Score Editor */}
                      <div className="flex items-center gap-6 bg-black/40 p-4 rounded-2xl border border-theme shadow-lg backdrop-blur-md">
                          <div className="flex items-center gap-2"><button onClick={() => updateMatchScore('a', -1)} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-gray-700"><Minus size={14}/></button><div className="text-4xl font-black text-yellow-500 tabular-nums w-12 text-center">{matchRoundScore.a}</div><button onClick={() => updateMatchScore('a', 1)} className="w-8 h-8 rounded-full bg-yellow-500/20 hover:bg-yellow-500 flex items-center justify-center text-yellow-500 hover:text-black transition-all border border-yellow-500/50" disabled={matchRoundScore.a >= winCap}><Plus size={14}/></button></div>
                          <div className="text-gray-600 font-bold text-2xl">:</div>
                          <div className="flex items-center gap-2"><div className="text-4xl font-black text-blue-500 tabular-nums w-12 text-center">{matchRoundScore.b}</div><button onClick={() => updateMatchScore('b', -1)} className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all border border-gray-700"><Minus size={14}/></button><button onClick={() => updateMatchScore('b', 1)} className="w-8 h-8 rounded-full bg-blue-500/20 hover:bg-blue-500 flex items-center justify-center text-blue-500 hover:text-black transition-all border border-blue-500/50" disabled={matchRoundScore.b >= winCap}><Plus size={14}/></button></div>
                      </div>

                      {/* Picks and Bans Visualization */}
                      <div className="w-full max-w-5xl bg-black/20 border border-theme rounded-xl p-6">
                        <div className="grid grid-cols-2 gap-8 relative">
                            {/* Team A Column */}
                            <div className="flex flex-col items-end gap-4">
                                <h4 className="text-yellow-500 font-black uppercase text-xl">{teamAName}</h4>
                                {/* Picks A */}
                                <div className="flex gap-2 flex-wrap justify-end">
                                    {draftState.picksA.map(c => {
                                        const char = CHARACTERS.find(x => x.id === c);
                                        return (
                                            <div key={c} className="w-16 h-24 relative border border-yellow-500/50 rounded overflow-hidden shadow-lg group">
                                                <img src={char?.image} className="w-full h-full object-cover object-top" />
                                                <div className="absolute bottom-0 w-full bg-black/80 text-[8px] text-center text-yellow-500 font-bold py-0.5 truncate px-1">{char?.name}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {/* Bans A */}
                                <div className="flex gap-2 items-center">
                                    <span className="text-[10px] text-red-500 font-bold uppercase">Bans</span>
                                    {draftState.bansA.map(c => {
                                        const char = CHARACTERS.find(x => x.id === c);
                                        return (
                                            <div key={c} className="w-10 h-10 rounded border border-red-500/50 bg-black relative overflow-hidden grayscale opacity-80">
                                                <img src={char?.image} className="w-full h-full object-cover object-top" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Ban size={14} className="text-red-500"/></div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Center Divider/VS */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 -translate-x-1/2 hidden md:block"></div>

                            {/* Team B Column */}
                            <div className="flex flex-col items-start gap-4">
                                <h4 className="text-blue-500 font-black uppercase text-xl">{teamBName}</h4>
                                {/* Picks B */}
                                <div className="flex gap-2 flex-wrap justify-start">
                                    {draftState.picksB.map(c => {
                                        const char = CHARACTERS.find(x => x.id === c);
                                        return (
                                            <div key={c} className="w-16 h-24 relative border border-blue-500/50 rounded overflow-hidden shadow-lg group">
                                                <img src={char?.image} className="w-full h-full object-cover object-top" />
                                                <div className="absolute bottom-0 w-full bg-black/80 text-[8px] text-center text-blue-500 font-bold py-0.5 truncate px-1">{char?.name}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {/* Bans B */}
                                <div className="flex gap-2 items-center">
                                    {draftState.bansB.map(c => {
                                        const char = CHARACTERS.find(x => x.id === c);
                                        return (
                                            <div key={c} className="w-10 h-10 rounded border border-red-500/50 bg-black relative overflow-hidden grayscale opacity-80">
                                                <img src={char?.image} className="w-full h-full object-cover object-top" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Ban size={14} className="text-red-500"/></div>
                                            </div>
                                        )
                                    })}
                                    <span className="text-[10px] text-red-500 font-bold uppercase">Bans</span>
                                </div>
                            </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="w-full max-w-5xl">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 text-center tracking-widest">Timeline</h4>
                        <div className="flex flex-wrap justify-center gap-2">
                            {draftState.history.map((h, i) => {
                                const isA = h.action.includes('_A');
                                const isBan = h.action.includes('BAN');
                                const char = CHARACTERS.find(c => c.id === h.charId);
                                const borderColor = isA ? 'border-yellow-500/30' : 'border-blue-500/30';
                                const textColor = isA ? 'text-yellow-500' : 'text-blue-500';
                                
                                return (
                                    <div key={i} className={`flex items-center gap-2 bg-panel border ${borderColor} px-2 py-1 rounded text-xs`}>
                                        <span className="text-gray-600 font-mono">{i + 1}.</span>
                                        {isBan && <Ban size={10} className="text-red-500" />}
                                        <span className={`font-bold ${isBan ? 'text-red-400' : textColor} uppercase`}>{char?.name}</span>
                                    </div>
                                )
                            })}
                        </div>
                      </div>

                      <div className="pt-2 flex gap-4 justify-center"><Button variant="secondary" size="md" onClick={() => setDraftState({...draftState, isComplete: false})} className="text-sm px-6"><Undo size={16}/> Editar Draft</Button><Button size="md" onClick={() => setShowWinnerModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-8 shadow-lg shadow-green-900/50 text-sm">DEFINIR VENCEDOR <CheckCircle size={16}/></Button></div>
                  </div>
              ) : (
                  <div className="flex flex-col h-full relative">
                      {hoveredChar && (<div className="absolute bottom-4 left-4 z-50 animate-fade-in hidden lg:block pointer-events-none"><div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black"><img src={CHARACTERS.find(c => c.id === hoveredChar)?.image} className="w-full h-full object-cover"/><div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4"><h3 className="text-2xl font-black text-white uppercase italic">{CHARACTERS.find(c => c.id === hoveredChar)?.name}</h3><p className="text-xs text-gray-400 font-bold">Personagem</p></div></div></div>)}
                      <div className="flex-none bg-black/40 border-b border-theme p-2 overflow-x-auto">
                          <div className="flex justify-between items-end min-w-[600px] mx-auto max-w-[1920px] px-4 gap-4">
                              <div className={`flex flex-col gap-2 items-end flex-1 transition-opacity duration-300 ${activeTeam === 'B' ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`} onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'A')}><h3 className={`font-black uppercase text-xl md:text-3xl truncate max-w-[300px] ${activeTeam === 'A' ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'text-yellow-600'}`}>{teamAName}</h3><div className="flex items-center gap-2 mb-1">{draftState.bansA.map(b => (<div key={b} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-red-500/50 bg-black/50 relative overflow-hidden group/ban shadow-md"><img src={CHARACTERS.find(c => c.id === b)?.image} className="w-full h-full object-cover grayscale opacity-50"/><div className="absolute inset-0 flex items-center justify-center"><Ban className="text-red-500 w-4 h-4 md:w-6 md:h-6 drop-shadow-lg"/></div></div>))}{draftState.bansA.length < 1 && (<div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-dashed border-gray-700 bg-white/5 flex items-center justify-center"><span className="text-[6px] text-gray-600 font-bold uppercase">BAN</span></div>)}<span className="text-[8px] md:text-[10px] text-red-500 font-bold uppercase mr-1">BANIMENTOS</span></div><div className="flex gap-2">{[0,1,2,3].map(i => (<div key={i} className={`w-20 h-28 md:w-28 md:h-40 bg-yellow-900/10 rounded border transition-all duration-300 flex items-center justify-center relative overflow-hidden ${activeTeam === 'A' && !draftState.picksA[i] && draftState.picksA.length === i ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-yellow-900/30'}`}>{draftState.picksA[i] ? (<><img src={CHARACTERS.find(c => c.id === draftState.picksA[i])?.image} className="w-full h-full object-cover object-top animate-zoom-in"/><div className="absolute bottom-0 w-full bg-black/60 text-[10px] md:text-xs text-center font-bold uppercase text-yellow-500 truncate px-1 py-1">{CHARACTERS.find(c => c.id === draftState.picksA[i])?.name}</div></>) : <span className="text-yellow-900/30 text-xs md:text-sm font-bold">PICK {i+1}</span>}</div>))}</div></div>
                              <div className="flex flex-col items-center justify-center px-4 pb-12"><div className="text-3xl md:text-5xl font-black text-gray-700 italic">VS</div></div>
                              <div className={`flex flex-col gap-2 items-start flex-1 transition-opacity duration-300 ${activeTeam === 'A' ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`} onDragOver={allowDrop} onDrop={(e) => handleDrop(e, 'B')}><h3 className={`font-black uppercase text-xl md:text-3xl truncate max-w-[300px] ${activeTeam === 'B' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' : 'text-blue-600'}`}>{teamBName}</h3><div className="flex items-center gap-2 mb-1 flex-row-reverse w-full justify-end">{draftState.bansB.map(b => (<div key={b} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-red-500/50 bg-black/50 relative overflow-hidden group/ban shadow-md"><img src={CHARACTERS.find(c => c.id === b)?.image} className="w-full h-full object-cover grayscale opacity-50"/><div className="absolute inset-0 flex items-center justify-center"><Ban className="text-red-500 w-4 h-4 md:w-6 md:h-6 drop-shadow-lg"/></div></div>))}{draftState.bansB.length < 1 && (<div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-dashed border-gray-700 bg-white/5 flex items-center justify-center"><span className="text-[6px] text-gray-600 font-bold uppercase">BAN</span></div>)}<span className="text-[8px] md:text-[10px] text-red-500 font-bold uppercase ml-1">BANIMENTOS</span></div><div className="flex gap-2">{[0,1,2,3].map(i => (<div key={i} className={`w-20 h-28 md:w-28 md:h-40 bg-blue-900/10 rounded border transition-all duration-300 flex items-center justify-center relative overflow-hidden ${activeTeam === 'B' && !draftState.picksB[i] && draftState.picksB.length === i ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-blue-900/30'}`}>{draftState.picksB[i] ? (<><img src={CHARACTERS.find(c => c.id === draftState.picksB[i])?.image} className="w-full h-full object-cover object-top animate-zoom-in"/><div className="absolute bottom-0 w-full bg-black/60 text-[10px] md:text-xs text-center font-bold uppercase text-blue-400 truncate px-1 py-1">{CHARACTERS.find(c => c.id === draftState.picksB[i])?.name}</div></>) : <span className="text-blue-900/30 text-xs md:text-sm font-bold">PICK {i+1}</span>}</div>))}</div></div>
                          </div>
                      </div>
                      <div className="flex-1 bg-[#0a0a0a] p-4 overflow-y-auto custom-scrollbar flex flex-col">
                          <div className="max-w-2xl mx-auto w-full mb-4 sticky top-0 z-10"><div className="relative group"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" /></div><input type="text" className="block w-full pl-10 pr-3 py-3 border border-theme rounded-xl leading-5 bg-panel text-white placeholder-gray-500 focus:outline-none focus:bg-black/80 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 sm:text-sm transition-all shadow-lg" placeholder="Buscar personagem..." value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)}/></div></div>
                          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 max-w-full mx-auto pb-20">{filteredChars.map(char => { const isBanned = draftState.bansA.includes(char.id) || draftState.bansB.includes(char.id); const isPickedA = draftState.picksA.includes(char.id); const isPickedB = draftState.picksB.includes(char.id); const isDisabled = isBanned || isPickedA || isPickedB; return (<div key={char.id} draggable={!isDisabled} onDragStart={(e) => handleDragStart(e, char.id)} onClick={() => !isDisabled && handleDraftClick(char.id)} onMouseEnter={() => setHoveredChar(char.id)} onMouseLeave={() => setHoveredChar(null)} className={`relative aspect-[3/4] rounded-lg border overflow-hidden transition-all duration-200 group ${isPickedA ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] opacity-60 grayscale' : ''} ${isPickedB ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] opacity-60 grayscale' : ''} ${isBanned ? 'border-red-900/50 grayscale opacity-30 cursor-not-allowed' : ''} ${!isDisabled ? 'border-theme hover:border-gray-400 hover:scale-105 cursor-pointer cursor-grab active:cursor-grabbing hover:shadow-lg' : ''}`}><img src={char.image} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"/><div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-1 pt-6"><div className="text-[10px] font-bold text-center uppercase truncate text-white tracking-widest">{char.name}</div></div>{isBanned && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><Ban className="text-red-500 w-8 h-8"/></div>}{isPickedA && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_currentColor]"></div>}{isPickedB && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_6px_currentColor]"></div>}</div>); })}</div>
                      </div>
                  </div>
              )}
              {draftState.isComplete && showWinnerModal && (<div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in p-4"><div className="bg-panel border border-theme rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"><h3 className="text-2xl font-black uppercase text-white">Vencedor?</h3><div className="text-gray-400 text-xs">Partida {currentMatchIndex + 1} - {MAPS.find(m => m.id === vsMaps[currentMatchIndex])?.name}</div><div className="grid grid-cols-2 gap-3"><button onClick={() => handleMatchEnd('A')} className="p-4 bg-yellow-500/10 border border-yellow-500 hover:bg-yellow-500 hover:text-black text-yellow-500 font-black text-lg rounded-xl transition-all uppercase truncate">{teamAName}</button><button onClick={() => handleMatchEnd('B')} className="p-4 bg-blue-500/10 border border-blue-500 hover:bg-blue-500 hover:text-black text-blue-500 font-black text-lg rounded-xl transition-all uppercase truncate">{teamBName}</button></div><button onClick={() => setShowWinnerModal(false)} className="text-gray-500 text-xs hover:text-white underline">Voltar</button></div></div>)}
          </div>
      );
  };

  const renderVS_History = () => { const handleDownload = async () => { if (historyRef.current) { const dataUrl = await htmlToImage.toPng(historyRef.current); const link = document.createElement('a'); link.download = `serie-4x4-${Date.now()}.png`; link.href = dataUrl; link.click(); } }; const winner = seriesScore.a > seriesScore.b ? teamAName : teamBName; const winnerColor = seriesScore.a > seriesScore.b ? 'text-yellow-500' : 'text-blue-500'; return (<div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10"><div className="flex justify-between items-center px-4"><h2 className="text-2xl md:text-3xl font-display font-bold">Resultado da Série</h2><div className="flex gap-2"><Button onClick={() => setVsStep('HOME')} variant="secondary" size="sm">Novo 4x4</Button><Button onClick={handleDownload} size="sm"><Download size={16}/> PNG</Button></div></div><div ref={historyRef} className="bg-[#0a0a0a] p-6 md:p-8 rounded-2xl border border-theme space-y-8 mx-4"><div className="text-center space-y-4 border-b border-theme pb-8"><div className="inline-block px-4 py-1 rounded-full bg-green-500/20 text-green-500 border border-green-500/50 text-xs font-bold uppercase tracking-widest mb-2">Série Finalizada</div><div className="flex justify-center items-center gap-8 md:gap-12 text-4xl md:text-6xl font-black uppercase"><div className="flex flex-col items-center gap-2"><span className="text-yellow-500 text-lg md:text-4xl">{teamAName}</span><span className="text-3xl md:text-5xl text-gray-500">{seriesScore.a}</span></div><span className="text-gray-700 text-2xl md:text-4xl">VS</span><div className="flex flex-col items-center gap-2"><span className="text-blue-500 text-lg md:text-4xl">{teamBName}</span><span className="text-3xl md:text-5xl text-gray-500">{seriesScore.b}</span></div></div><div className={`text-xl md:text-2xl font-bold uppercase tracking-widest ${winnerColor}`}>Vencedor: {winner}</div></div><div className="space-y-4"><h3 className="font-bold text-lg text-white uppercase tracking-widest text-center">Detalhes das Partidas</h3>{seriesHistory.map((match, idx) => (<div key={idx} className="bg-panel border border-theme rounded-xl p-4 md:p-6 relative overflow-hidden"><div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: match.winner === 'A' ? '#eab308' : '#3b82f6'}}></div><div className="flex flex-col md:flex-row justify-between items-center mb-4 border-b border-white/5 pb-4 gap-2"><div className="font-bold text-sm md:text-lg uppercase flex items-center gap-2"><span className="text-gray-500">#{idx+1}</span>{MAPS.find(m => m.id === match.mapId)?.name}</div><div className="text-sm font-black bg-black/40 px-3 py-1 rounded border border-theme flex items-center gap-2"><span className="text-yellow-500">{match.score?.a || 0}</span><span className="text-gray-500">:</span><span className="text-blue-500">{match.score?.b || 0}</span></div><div className={`text-[10px] md:text-sm font-bold uppercase px-2 py-1 rounded bg-black/40 border ${match.winner === 'A' ? 'border-yellow-500 text-yellow-500' : 'border-blue-500 text-blue-500'}`}>Vencedor: {match.winner === 'A' ? teamAName : teamBName}</div></div><div className="grid grid-cols-2 gap-4 md:gap-8 mb-6"><div><div className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex justify-between items-end"><span className="truncate pr-2 text-yellow-500">{teamAName}</span>{match.draftState.bansA.length > 0 && (<div className="flex items-center gap-1 text-red-500"><span className="text-[8px] uppercase font-bold hidden md:inline">Ban: {CHARACTERS.find(c => c.id === match.draftState.bansA[0])?.name}</span><div className="w-6 h-6 rounded border border-red-500/50 overflow-hidden relative"><img src={CHARACTERS.find(c => c.id === match.draftState.bansA[0])?.image} className="w-full h-full object-cover object-top grayscale opacity-60"/><Ban size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500"/></div></div>)}</div><div className="flex gap-1 md:gap-2">{match.draftState.picksA.map(c => (<div key={c} className="w-10 md:w-14 aspect-[2/3] relative border border-yellow-500/50 rounded overflow-hidden group"><img src={CHARACTERS.find(x => x.id === c)?.image} className="w-full h-full object-cover object-top"/><div className="absolute bottom-0 w-full bg-black/80 text-[6px] md:text-[8px] text-center text-white font-bold py-0.5">{CHARACTERS.find(x => x.id === c)?.name}</div></div>))}</div></div><div className="text-right"><div className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex justify-between items-end">{match.draftState.bansB.length > 0 && (<div className="flex items-center gap-1 text-red-500"><div className="w-6 h-6 rounded border border-red-500/50 overflow-hidden relative"><img src={CHARACTERS.find(c => c.id === match.draftState.bansB[0])?.image} className="w-full h-full object-cover object-top grayscale opacity-60"/><Ban size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500"/></div><span className="text-[8px] uppercase font-bold hidden md:inline">Ban: {CHARACTERS.find(c => c.id === match.draftState.bansB[0])?.name}</span></div>)}<span className="truncate pl-2 text-blue-500">{teamBName}</span></div><div className="flex gap-1 md:gap-2 justify-end">{match.draftState.picksB.map(c => (<div key={c} className="w-10 md:w-14 aspect-[2/3] relative border border-blue-500/50 rounded overflow-hidden group"><img src={CHARACTERS.find(x => x.id === c)?.image} className="w-full h-full object-cover object-top"/><div className="absolute bottom-0 w-full bg-black/70 text-[6px] md:text-[8px] text-center text-white font-bold py-0.5">{CHARACTERS.find(x => x.id === c)?.name}</div></div>))}</div></div></div><div className="w-full border-t border-white/5 pt-4"><h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Timeline</h4><div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono">{match.draftState.history.map((h, i) => { const isA = h.action.includes('_A'); const isBan = h.action.includes('BAN'); const colorClass = isA ? 'text-yellow-500' : 'text-blue-500'; const charName = CHARACTERS.find(c => c.id === h.charId)?.name; return (<div key={i} className="flex items-center opacity-80 hover:opacity-100 transition-opacity"><span className="text-gray-600 mr-1">{i+1}.</span>{isBan ? (<span className="text-red-500 font-bold flex items-center gap-1"><Ban size={10}/> BAN</span>) : (<span className={`${colorClass} font-bold`}>PICK</span>)}<span className="mx-1 text-gray-400">-</span><span className="text-white font-bold">{charName}</span>{i < match.draftState.history.length - 1 && (<span className="ml-2 text-gray-700">|</span>)}</div>) })}</div></div></div>))}</div></div></div>); };
  const renderVS_Config = () => (<div className="max-w-2xl mx-auto w-full min-h-[60vh] flex flex-col justify-center p-6 animate-fade-in"><div className="bg-panel border border-theme rounded-2xl p-8 space-y-8 relative overflow-hidden"><div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-2"><Settings className="text-red-500"/> Configuração</h3><div className="flex gap-1">{[0,1,2,3].map(s => (<div key={s} className={`h-2 w-8 rounded-full ${s <= vsConfigStep ? 'bg-red-500' : 'bg-gray-800'}`}></div>))}</div></div>{vsConfigStep === 0 && (<div className="space-y-6 animate-fade-in"><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Nome do Time A (Blue Side)</label><input className="w-full bg-black border border-theme rounded-lg p-4 text-xl font-bold text-yellow-500 focus:border-yellow-500 outline-none" value={teamAName} onChange={e => setTeamAName(e.target.value)} /></div><div className="flex justify-center text-gray-600 font-black text-xl italic">VS</div><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Nome do Time B (Red Side)</label><input className="w-full bg-black border border-theme rounded-lg p-4 text-xl font-bold text-blue-500 focus:border-blue-500 outline-none" value={teamBName} onChange={e => setTeamBName(e.target.value)} /></div></div>)}{vsConfigStep === 1 && (<div className="space-y-6 animate-fade-in"><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Modo de Picks & Bans</label><div className="grid grid-cols-3 gap-2">{(['snake', 'linear', 'mirrored'] as PBMode[]).map(m => (<button key={m} onClick={() => setPbMode(m)} className={`p-4 rounded-lg border text-sm font-bold uppercase ${pbMode === m ? 'bg-red-500 text-white border-red-500' : 'bg-black border-theme text-gray-500 hover:text-white'}`}>{m}</button>))}</div></div><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Formato da Série</label><div className="flex gap-2">{[1,3,5].map(md => (<button key={md} onClick={() => setMdFormat(md)} className={`flex-1 p-4 rounded-lg border text-sm font-bold uppercase ${mdFormat === md ? 'bg-red-500 text-white border-red-500' : 'bg-black border-theme text-gray-500 hover:text-white'}`}>MD{md}</button>))}</div></div><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Rodadas por Mapa</label><div className="flex gap-2">{[11,13].map(r => (<button key={r} onClick={() => setRoundsFormat(r as 11|13)} className={`flex-1 p-4 rounded-lg border text-sm font-bold uppercase ${roundsFormat === r ? 'bg-red-500 text-white border-red-500' : 'bg-black border-theme text-gray-500 hover:text-white'}`}>{r} Rodadas</button>))}</div></div></div>)}{vsConfigStep === 2 && (<div className="space-y-6 animate-fade-in"><div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase">Estratégia de Mapas</label><div className="grid grid-cols-2 gap-2">{(['no_repeat', 'repeat', 'fixed', 'manual'] as MapStrategy[]).map(s => (<button key={s} onClick={() => setMapStrategy(s)} className={`p-4 rounded-lg border text-xs font-bold uppercase ${mapStrategy === s ? 'bg-red-500 text-white border-red-500' : 'bg-black border-theme text-gray-500 hover:text-white'}`}>{s.replace('_', ' ')}</button>))}</div></div><div className="bg-black/40 p-4 rounded border border-theme text-xs text-gray-400">{mapStrategy === 'no_repeat' && 'Mapas não se repetem durante a série.'}{mapStrategy === 'repeat' && 'Mapas podem se repetir (sorteio aleatório).'}{mapStrategy === 'fixed' && 'O mesmo mapa para toda a série.'}{mapStrategy === 'manual' && 'Você escolhe a ordem dos mapas manualmente.'}</div></div>)}{vsConfigStep === 3 && (<div className="space-y-6 animate-fade-in text-center"><div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">{vsMaps.map((mid, i) => (<div key={i} className="flex items-center gap-4 bg-black border border-theme p-3 rounded"><span className="font-black text-gray-600">#{i+1}</span>{mapStrategy === 'manual' ? (<select className="flex-1 bg-transparent text-white font-bold outline-none" value={mid} onChange={(e) => { const newMaps = [...vsMaps]; newMaps[i] = e.target.value; setVsMaps(newMaps); }}>{MAPS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>) : (<span className="flex-1 text-left font-bold uppercase">{MAPS.find(m => m.id === mid)?.name}</span>)}<img src={MAPS.find(m => m.id === mid)?.image} className="w-12 h-8 object-cover rounded"/></div>))}</div>{mapStrategy !== 'manual' && (<Button onClick={handleMapSort4x4} disabled={isVsMapSpinning} className="w-full">{isVsMapSpinning ? <RefreshCw className="animate-spin"/> : <Shuffle/>} Sortear Mapas</Button>)}</div>)}<div className="flex justify-between pt-4 border-t border-theme"><Button variant="ghost" onClick={handleBack}>{vsConfigStep === 0 ? 'Cancelar' : 'Voltar'}</Button>{vsConfigStep < 3 ? (<Button onClick={() => setVsConfigStep(p => p + 1)}>Próximo <ArrowRight size={16}/></Button>) : (<Button onClick={startSeries} className="bg-red-600 hover:bg-red-700 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.4)]">INICIAR SÉRIE <Swords size={16}/></Button>)}</div></div></div>);

  const renderDashboard = () => (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20 pt-8 px-4">
          {renderBRHeader(t.dashboard.title, <BarChart2 className="text-primary"/>)}
          
          <div className="flex justify-center gap-4 mb-6">
              <button onClick={() => setDashboardTab('leaderboard')} className={`px-6 py-2 rounded-full font-bold uppercase transition-all ${dashboardTab === 'leaderboard' ? 'bg-primary text-black' : 'bg-panel border border-theme text-gray-500 hover:text-white'}`}>{t.dashboard.tabRank}</button>
              <button onClick={() => setDashboardTab('mvp')} className={`px-6 py-2 rounded-full font-bold uppercase transition-all ${dashboardTab === 'mvp' ? 'bg-primary text-black' : 'bg-panel border border-theme text-gray-500 hover:text-white'}`}>{t.dashboard.tabMvp}</button>
          </div>

          <div ref={leaderboardRef} className="bg-[#1a1a1a] p-8 rounded-xl border border-theme relative overflow-hidden">
              {/* Decoration */}
              <div className="absolute top-0 right-0 p-4 opacity-50 pointer-events-none">
                  <div className="text-right">
                      <h2 className="text-3xl font-black uppercase text-white/10 tracking-widest">{t.dashboard.resultTitle}</h2>
                      <p className="text-xs font-bold text-white/5 uppercase">Generated by Jhan Training</p>
                  </div>
              </div>

              {dashboardTab === 'leaderboard' ? (
                  <table className="w-full text-sm md:text-base">
                      <thead>
                          <tr className="border-b border-white/10 text-gray-500 uppercase text-xs font-bold tracking-widest">
                              <th className="pb-4 text-left px-4">#</th>
                              <th className="pb-4 text-left">{t.dashboard.table.team}</th>
                              <th className="pb-4 text-center">{t.dashboard.table.booyah}</th>
                              <th className="pb-4 text-center">{t.dashboard.table.killPts}</th>
                              <th className="pb-4 text-center">{t.dashboard.table.pos}</th>
                              <th className="pb-4 text-right pr-4">{t.dashboard.table.total}</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {leaderboard.map((row, idx) => (
                              <tr key={row.teamId} className={`group hover:bg-white/5 transition-colors ${idx < 3 ? 'font-black' : 'font-medium'}`}>
                                  <td className="py-4 px-4 w-12 text-center relative">
                                      {idx === 0 && <Crown size={16} className="text-yellow-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-4" />}
                                      <span className={idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-gray-600'}>{idx + 1}</span>
                                  </td>
                                  <td className="py-4 flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg shadow-lg flex items-center justify-center font-bold text-xs" style={{backgroundColor: teams.find(t => t.id === row.teamId)?.color, color: 'rgba(0,0,0,0.7)'}}>
                                          {row.teamName.substring(0, 2).toUpperCase()}
                                      </div>
                                      <span className={idx === 0 ? 'text-white text-lg' : 'text-gray-300'}>{row.teamName}</span>
                                  </td>
                                  <td className="py-4 text-center text-gray-400">{row.booyahs > 0 ? <span className="text-green-500 font-bold">{row.booyahs}</span> : '-'}</td>
                                  <td className="py-4 text-center text-gray-400">{row.totalKills} <span className="text-xs opacity-50">({row.killPoints})</span></td>
                                  <td className="py-4 text-center text-gray-400">{row.placementPoints}</td>
                                  <td className="py-4 text-right px-4">
                                      <span className={`text-xl ${idx === 0 ? 'text-primary' : 'text-white'}`}>{row.totalPoints}</span>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              ) : (
                  <div className="space-y-4">
                      {mvpList.length > 0 ? (
                            <table className="w-full text-sm md:text-base">
                              <thead>
                                  <tr className="border-b border-white/10 text-gray-500 uppercase text-xs font-bold tracking-widest">
                                      <th className="pb-4 text-left px-4">Player</th>
                                      <th className="pb-4 text-left">Team</th>
                                      <th className="pb-4 text-center">Kills</th>
                                      <th className="pb-4 text-center">Damage</th>
                                      <th className="pb-4 text-center">MVP Score</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                  {mvpList.slice(0, 15).map((p, idx) => (
                                      <tr key={idx} className="hover:bg-white/5">
                                          <td className="py-3 px-4 font-bold text-white">{p.name}</td>
                                          <td className="py-3 text-gray-400 text-xs">{p.teamTag}</td>
                                          <td className="py-3 text-center text-white">{p.kills}</td>
                                          <td className="py-3 text-center text-gray-400">{p.damage}</td>
                                          <td className="py-3 text-center font-black text-primary">{p.mvpScore.toFixed(2)}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      ) : (
                          <div className="text-center py-12 text-gray-500">
                              <p>{t.dashboard.emptyPlayer}</p>
                          </div>
                      )}
                  </div>
              )}
          </div>

          <div className="flex justify-between items-center">
                <Button onClick={() => setStep(Step.SCORING)} variant="secondary">Voltar</Button>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={downloadDashboard}><Download size={18}/> Salvar Imagem</Button>
                  <Button variant="secondary" onClick={() => {
                      // Save to hub logic
                        const session: SavedTrainingSession = {
                          id: Date.now().toString(),
                          name: `Treino ${new Date().toLocaleDateString()}`,
                          date: new Date().toISOString(),
                          teamsCount: teams.length,
                          matchesCount: Object.keys(matchScores).length,
                          leaderboardTop3: leaderboard.slice(0, 3).map(l => ({ name: l.teamName, points: l.totalPoints })),
                          data: JSON.stringify({ teams, matchScores, shuffledMaps, mode, basicSelections, premiumPositions })
                      };
                      const updated = [session, ...savedTrainings];
                      setSavedTrainings(updated);
                      localStorage.setItem('jhantraining_hub_data', JSON.stringify(updated));
                      alert('Salvo no Hub!');
                  }}><Share2 size={18}/> {t.dashboard.saveHub}</Button>
                  <Button onClick={resetTraining} variant="danger">Encerrar Treino</Button>
                </div>
          </div>
      </div>
  );

  const renderPublicHub = () => (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 pt-8 px-4">
          {renderBRHeader(t.hub.title, <Share2 className="text-primary"/>)}
          <div className="bg-panel border border-theme rounded-xl p-8 min-h-[400px]">
              {savedTrainings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                        <Share2 size={48} className="mb-4 opacity-20"/>
                        <p>{t.hub.empty}</p>
                        <p className="text-xs mt-2">{t.hub.emptyDesc}</p>
                    </div>
              ) : (
                  <div className="grid grid-cols-1 gap-4">
                      {savedTrainings.map(session => (
                          <div key={session.id} className="bg-black/40 border border-theme rounded-lg p-4 flex justify-between items-center hover:border-primary/50 transition-colors">
                              <div>
                                  <h4 className="font-bold text-white text-lg">{session.name}</h4>
                                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                      <span className="flex items-center gap-1"><Clock size={12}/> {new Date(session.date).toLocaleDateString()}</span>
                                      <span className="flex items-center gap-1"><Users size={12}/> {session.teamsCount} Times</span>
                                      <span className="flex items-center gap-1"><Trophy size={12}/> {session.leaderboardTop3[0]?.name || 'N/A'}</span>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  <Button size="sm" onClick={() => {
                                      if(window.confirm(t.hub.confirmLoad)) {
                                          try {
                                              const data = JSON.parse(session.data);
                                              setTeams(data.teams || []);
                                              setMatchScores(data.matchScores || {});
                                              setShuffledMaps(data.shuffledMaps || []);
                                              setMode(data.mode || 'basic');
                                              setBasicSelections(data.basicSelections || {});
                                              setPremiumPositions(data.premiumPositions || {});
                                              setStep(Step.DASHBOARD);
                                          } catch(e) { alert('Erro ao carregar dados.'); }
                                      }
                                  }}>{t.hub.load}</Button>
                                  <button onClick={() => {
                                      if(window.confirm('Delete?')) {
                                          const updated = savedTrainings.filter(s => s.id !== session.id);
                                          setSavedTrainings(updated);
                                          localStorage.setItem('jhantraining_hub_data', JSON.stringify(updated));
                                      }
                                  }} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><Trash2 size={16}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
          <div className="flex justify-start">
                <Button onClick={() => setStep(Step.HOME)} variant="secondary">{t.common.back}</Button>
          </div>
      </div>
  );

  const renderWaitingList = () => (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 pt-8 px-4">
          {renderBRHeader(t.waiting.title, <Clock className="text-primary"/>)}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Create Section */}
              <div className="bg-panel border border-theme rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-lg text-white flex items-center gap-2"><Crown size={18} className="text-yellow-500"/> {t.waiting.adminArea}</h4>
                  <input className="w-full bg-black border border-theme rounded p-3 text-white" placeholder={t.waiting.yourName} value={wlAdminName} onChange={e => setWlAdminName(e.target.value)} />
                  <input className="w-full bg-black border border-theme rounded p-3 text-white" placeholder={t.waiting.trainingName} value={wlTrainingName} onChange={e => setWlTrainingName(e.target.value)} />
                  <input className="w-full bg-black border border-theme rounded p-3 text-white" placeholder={t.waiting.pin} value={wlPin} onChange={e => setWlPin(e.target.value)} type="password" />
                  <Button onClick={createWaitingTraining} className="w-full" disabled={!wlAdminName || !wlTrainingName || !wlPin}>{t.waiting.create}</Button>
              </div>

                {/* List Section */}
              <div className="bg-panel border border-theme rounded-xl p-6 space-y-4">
                    <h4 className="font-bold text-lg text-white flex items-center gap-2"><ListPlus size={18} className="text-blue-500"/> {t.waiting.queue}</h4>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {openTrainings.length === 0 && <p className="text-gray-500 text-sm italic">Nenhum treino na fila.</p>}
                        {openTrainings.map(tr => (
                            <div key={tr.id} className="bg-black/40 border border-theme p-3 rounded flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-white">{tr.trainingName}</div>
                                    <div className="text-xs text-gray-500">Admin: {tr.adminName}</div>
                                </div>
                                <button onClick={() => {
                                    const pin = prompt('PIN do Admin:');
                                    if(pin === tr.adminPin) {
                                        const updated = openTrainings.filter(x => x.id !== tr.id);
                                        setOpenTrainings(updated);
                                        localStorage.setItem('jhantraining_waiting_list', JSON.stringify(updated));
                                    } else { alert('PIN Incorreto'); }
                                }} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
              </div>
          </div>
            <div className="flex justify-start">
                <Button onClick={() => setStep(Step.HOME)} variant="secondary">{t.common.back}</Button>
          </div>
        </div>
  );

  const renderVS_Home = () => (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
            <div className="z-10 text-center space-y-8 max-w-2xl">
                <div className="mb-4 inline-block p-4 rounded-full bg-red-500/10 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <Swords size={48} className="text-red-500"/>
                </div>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
                    MODO <span className="text-red-500">4x4</span>
                </h1>
                <p className="text-gray-400 text-lg">Gerenciador profissional de Picks e Bans para partidas competitivas. Suporte para MD1, MD3 e MD5.</p>
                
                <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                    <Button size="lg" onClick={() => setVsStep('CONFIG')} className="bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-900/30 w-full md:w-auto">
                      NOVO CONFRONTO <ArrowRight size={20}/>
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => setStep(Step.LANDING)} className="w-full md:w-auto">
                      VOLTAR AO MENU
                    </Button>
                </div>
            </div>
      </div>
  );

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-[#0a0a0a] text-white font-sans ${isDarkMode ? '' : 'light-mode'} flex flex-col`}>
        <div className="flex-1">
            {step === Step.LANDING && renderLanding()}
            {step === Step.HOME && renderBRHub()} 
            {step === Step.MODE_SELECT && renderModeSelect()}
            {step === Step.TEAM_REGISTER && renderTeamRegister()}
            {step === Step.MAP_SORT && renderMapSort()}
            {step === Step.STRATEGY && renderStrategy()}
            {step === Step.SCORING && renderScoring()}
            {step === Step.DASHBOARD && renderDashboard()}
            {step === Step.PUBLIC_HUB && renderPublicHub()}
            {step === Step.WAITING_LIST && renderWaitingList()}
            {step === Step.MODE_4X4 && (<>{vsStep === 'HOME' && renderVS_Home()}{vsStep === 'CONFIG' && renderVS_Config()}{vsStep === 'DRAFT' && renderVS_Draft()}{vsStep === 'HISTORY' && renderVS_History()}</>)}
            {![Step.LANDING, Step.HOME, Step.MODE_SELECT, Step.TEAM_REGISTER, Step.MAP_SORT, Step.STRATEGY, Step.SCORING, Step.DASHBOARD, Step.MODE_4X4, Step.PUBLIC_HUB, Step.WAITING_LIST].includes(step) && (<div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-fade-in"><AlertTriangle size={48} className="text-yellow-500 mb-4"/><h2 className="text-2xl font-bold text-white">Erro de Navegação</h2><p className="text-gray-400 mb-6">Esta tela ({step}) não foi encontrada.</p><Button onClick={handleBack}>Voltar</Button></div>)}
        </div>
        <footer className="py-6 text-center text-gray-600 text-xs font-bold uppercase tracking-widest border-t border-theme bg-panel/30">Desenvolvido por Jhan Medeiros</footer>
        {renderHelpModal()}
        {renderTeamEditModal()}
      </div>
    </ErrorBoundary>
  );
};

export default App;