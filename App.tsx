import React, { Component, useState, useEffect, useMemo, ErrorInfo, useRef } from 'react';
import { Users, Trophy, Crown, AlertTriangle, ArrowRight, ArrowLeft, Home, Download, RefreshCw, BarChart2, Save, Trash2, Edit2, Play, LayoutGrid, HelpCircle, X, Info, FileText, Instagram, Eye, Check, Palette, Monitor, Moon, Sun, Medal, Target, Flame, Share2, Calendar, Upload, ChevronLeft, ChevronRight, Maximize, Printer, UserPlus, ChevronDown, ChevronUp, Zap, UploadCloud, Binary, Image, Globe, Search, Layers, Copy, MessageCircle, ListPlus, Lock, Unlock, UserCheck, ClipboardList, Map as MapIcon, ShieldCheck } from 'lucide-react';
import { Team, TrainingMode, Step, MapData, MatchScore, ProcessedScore, Position, POINTS_SYSTEM, PlayerStats, SavedTrainingSession, OpenTraining, TrainingRequest } from './types';
import { MAPS, WARNINGS } from './constants';
import { Button } from './components/Button';
import { DraggableMap } from './components/DraggableMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
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

const STEPS_FLOW = [
    { id: Step.TEAM_REGISTER, label: 'Times', icon: Users },
    { id: Step.MAP_SORT, label: 'Mapas', icon: Globe },
    { id: Step.STRATEGY, label: 'Calls', icon: Target },
    { id: Step.SCORING, label: 'Pontos', icon: Edit2 },
    { id: Step.DASHBOARD, label: 'Resultados', icon: BarChart2 },
];

// Replay Data Interfaces
interface ReplayEvent {
    Event: number;
    Time: number;
    SParam?: string; // String Parameter (Player/Team Name)
    FParam?: number; // Float Parameter (Damage amount, etc)
}

interface PlayerAnalysis {
    name: string;
    teamTag: string;
    kills: number;
    damage: number;
    firstEventTime: number;
    lastEventTime: number;
}

// Error Boundary Component
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
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

function MainApp() {
  // --- State ---
  const [step, setStep] = useState<Step>(Step.HOME);
  const [mode, setMode] = useState<TrainingMode>('basic');
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [trainingName, setTrainingName] = useState('Treino Competitivo');
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Modals & UI State
  const [showHelp, setShowHelp] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [showStrategyVisualizer, setShowStrategyVisualizer] = useState(false);
  const [showSocialBanner, setShowSocialBanner] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null); // For scoring details
  const [hasDraft, setHasDraft] = useState(false);
  
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
      if (window.confirm("Tem certeza? Todo o progresso não salvo pode ser perdido.")) {
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
          alert("Preencha todos os campos!");
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
      alert("Lista de espera criada com sucesso!");
  };

  const requestEntryToTraining = () => {
      if (!selectedTrainingId || !wlTeamRequestName.trim()) return;
      
      const updated = openTrainings.map(t => {
          if (t.id === selectedTrainingId) {
              // Check dupes
              if (t.requests.some(r => r.teamName.toLowerCase() === wlTeamRequestName.toLowerCase())) {
                  alert("Este time já solicitou vaga.");
                  return t;
              }
              const newReq: TrainingRequest = {
                  id: Date.now().toString(),
                  teamName: wlTeamRequestName,
                  timestamp: Date.now()
              };
              return { ...t, requests: [...t.requests, newReq] };
          }
          return t;
      });
      
      setOpenTrainings(updated);
      localStorage.setItem('jhantraining_waiting_list', JSON.stringify(updated));
      setWlTeamRequestName('');
      alert("Solicitação enviada!");
  };

  const deleteWaitingTraining = (id: string) => {
      if (!window.confirm("Tem certeza que deseja apagar esta lista?")) return;
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
      if (!window.confirm(`Isso irá iniciar um novo treino com ${training.requests.length} times. O progresso atual será perdido. Continuar?`)) return;
      
      const newTeams: Team[] = training.requests.slice(0, 15).map(req => ({
          id: req.id,
          name: req.teamName,
          color: getRandomColor(),
          players: []
      }));

      setTeams(newTeams);
      setTrainingName(training.trainingName);
      setMode('basic'); // Default to basic, user can change
      setStep(Step.TEAM_REGISTER); // Go to editing
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
          step // Save current step
      };
      localStorage.setItem('jhantraining_draft', JSON.stringify(data));
      setHasDraft(true);
      alert("Rascunho salvo no navegador!");
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
               alert("Rascunho carregado com sucesso!");
           } catch(e) {
               console.error(e);
               alert("Erro ao carregar rascunho.");
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

  // --- LOGO UPLOAD LOGIC ---
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
                // Compress to 70% quality JPEG
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
          // Resize image to max 150px width to save space/performance
          const resizedBase64 = await resizeImage(file, 150);
          setTeams(prev => prev.map(t => t.id === activeTeamIdForLogo ? { ...t, logo: resizedBase64 } : t));
      } catch (e) {
          console.error("Error resizing image", e);
          alert("Erro ao processar imagem.");
      }
      
      setActiveTeamIdForLogo(null);
      event.target.value = ''; // Reset input
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

  // --- Export / Import Strategy ---
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
              setStep(Step.STRATEGY); // Jump to strategy to see loaded content
          } catch (error) {
              alert("Erro ao ler arquivo: Formato inválido.");
              console.error(error);
          }
      };
      reader.readAsText(file);
      // Reset input
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
            alert("Erro ao gerar imagem. Tente novamente.");
        }
    }
  };


  // Scoring Logic
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

  const handlePlayerKillChange = (matchIdx: number, teamId: string, playerName: string, kills: string) => {
    const val = kills === '' ? 0 : parseInt(kills);
    
    setMatchScores(prev => {
        const matchData = prev[matchIdx] || {};
        const teamData: MatchScore = matchData[teamId] || { teamId, rank: '', kills: 0, playerKills: {} };
        const currentPlayerKills = { ...teamData.playerKills, [playerName]: val };
        
        // Sum individual kills for total team kills
        const totalKills = Object.values(currentPlayerKills).reduce((a: number, b: number) => a + b, 0);

        return {
            ...prev,
            [matchIdx]: {
                ...matchData,
                [teamId]: {
                    ...teamData,
                    playerKills: currentPlayerKills,
                    kills: totalKills // Auto-update total kills
                }
            }
        };
    });
  };

  // --- PREMIUM PLUS: REPLAY READING ---
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

  // --- Functions for Modals and Actions ---

  const saveToHub = () => {
      if (teams.length === 0) {
          alert("Nenhum time cadastrado para salvar.");
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
      alert("Treino salvo no Hub com sucesso!");
  };

  const loadFromHub = (session: SavedTrainingSession) => {
      if (window.confirm("Carregar este treino substituirá os dados atuais. Continuar?")) {
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
              alert("Erro ao carregar dados do treino.");
          }
      }
  };

  const deleteFromHub = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja apagar este treino do histórico?")) {
          const updated = savedTrainings.filter(s => s.id !== id);
          setSavedTrainings(updated);
          localStorage.setItem('jhantraining_hub_data', JSON.stringify(updated));
      }
  };

  const downloadSocialBanner = async () => {
    if (bannerRef.current) {
        try {
            const dataUrl = await htmlToImage.toPng(bannerRef.current, { quality: 1.0, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = `Resultado-${trainingName.replace(/\s/g, '-')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('oops, something went wrong!', error);
            alert("Erro ao gerar imagem. Tente novamente.");
        }
    }
  };
  
  const renderHelpModal = () => {
    if (!showHelp) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-panel border border-theme rounded-xl max-w-lg w-full p-6 relative">
                <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-muted hover:text-white"><X/></button>
                <h3 className="text-2xl font-bold mb-4 text-primary">Ajuda Rápida</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm">
                    <li><strong className="text-white">Modos:</strong> Escolha entre Básico (Listas) ou Premium (Mapas Interativos).</li>
                    <li><strong className="text-white">Mapas:</strong> Sorteie os mapas ou defina manualmente.</li>
                    <li><strong className="text-white">Calls:</strong> No modo Premium, arraste os ícones dos times. No Básico, selecione a cidade.</li>
                    <li><strong className="text-white">Pontuação:</strong> O sistema calcula automaticamente baseado no Rank e Kills (Sistema LBFF).</li>
                    <li><strong className="text-white">Relatórios:</strong> Gere imagens para Stories ou textos formatados para WhatsApp.</li>
                    <li><strong className="text-white">Hub:</strong> Salve seus treinos para acessar depois.</li>
                </ul>
            </div>
        </div>
    );
  };

  const renderDeleteModal = () => {
    if (!teamToDelete) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="bg-panel border border-red-500/50 rounded-xl max-w-sm w-full p-6 text-center">
                <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4"/>
                <h3 className="text-xl font-bold mb-2">Excluir Time?</h3>
                <p className="text-muted mb-6">Esta ação não pode ser desfeita.</p>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setTeamToDelete(null)} className="flex-1">Cancelar</Button>
                    <Button variant="danger" onClick={executeDeleteTeam} className="flex-1">Excluir</Button>
                </div>
            </div>
        </div>
    );
  };
  
  const renderVisualizerModal = () => {
      if (!showStrategyVisualizer) return null;
      return null; // Placeholder as implementation details were not fully provided, prevents crash.
  };

  const renderStepper = () => {
    const currentIndex = STEPS_FLOW.findIndex(s => s.id === step);
    if (currentIndex === -1) return null;

    return (
        <div className="w-full max-w-4xl mb-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center justify-between min-w-[300px] relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -z-10 rounded"></div>
                {/* Active Progress */}
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -z-10 rounded transition-all duration-500"
                    style={{ width: `${(currentIndex / (STEPS_FLOW.length - 1)) * 100}%` }}
                ></div>

                {STEPS_FLOW.map((s, idx) => {
                    const isActive = idx === currentIndex;
                    const isCompleted = idx < currentIndex;
                    const Icon = s.icon;

                    return (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-background p-2 rounded-xl">
                            <div 
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                    ${isActive ? 'bg-primary border-primary text-black scale-110 shadow-[0_0_15px_rgba(var(--color-primary),0.5)]' : 
                                      isCompleted ? 'bg-primary/20 border-primary text-primary' : 
                                      'bg-gray-900 border-gray-700 text-gray-500'}
                                `}
                            >
                                <Icon size={20} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted'}`}>{s.label}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl animate-in fade-in zoom-in duration-500 p-6">
        <div className="w-24 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(var(--color-primary),0.4)]">
             <Target size={40} className="text-black"/>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase text-white">
            CRIADOR DE <span className="text-primary">TREINO</span>
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-md">
            Gerencie seus treinos de Free Fire, crie calls estratégicas e gere resultados profissionais em segundos.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-lg">
            <div className="flex flex-col md:flex-row gap-4 w-full">
                <Button onClick={handleStart} size="lg" className="flex-1 h-16 text-base font-bold shadow-xl shadow-primary/10 bg-primary text-black hover:bg-yellow-400 border-none">
                    <Zap size={20} fill="currentColor"/> COMEÇAR AGORA
                </Button>
                <Button onClick={() => setStep(Step.WAITING_LIST)} variant="secondary" className="flex-1 h-16 text-base font-bold bg-[#111] border-gray-800 hover:bg-gray-800 text-white">
                    <ListPlus size={20}/> LISTA DE ESPERA
                </Button>
            </div>
            
            <Button onClick={() => setStep(Step.PUBLIC_HUB)} variant="secondary" className="w-full h-14 text-base font-bold bg-[#111] border-gray-800 hover:bg-gray-800 text-white">
                <Globe size={20}/> HUB PÚBLICO
            </Button>

            {hasDraft && (
                <Button onClick={loadDraft} variant="secondary" className="w-full h-12 text-sm border-primary/30 text-primary hover:bg-primary/5">
                    <Save size={18}/> CONTINUAR RASCUNHO
                </Button>
            )}
        </div>

        <div className="mt-12 flex gap-4 text-sm text-gray-500">
            <button onClick={() => setShowHelp(true)} className="flex items-center gap-1 hover:text-white transition-colors"><HelpCircle size={14}/> Como usar</button>
            <span>•</span>
            <span className="flex items-center gap-1"><ShieldCheck size={14}/> v2.0 Stable</span>
        </div>
    </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col items-center max-w-5xl">
        <h2 className="text-3xl font-display font-bold mb-8">SELECIONE O MODO</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* BASIC */}
            <div onClick={() => selectMode('basic')} className="bg-panel border border-theme hover:border-primary cursor-pointer rounded-xl p-6 transition-all hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-colors">
                    <FileText size={24}/>
                </div>
                <h3 className="text-xl font-bold mb-2">Básico</h3>
                <p className="text-sm text-muted mb-4">Ideal para treinos rápidos. Defina calls por nome de cidade.</p>
                <ul className="text-xs space-y-2 text-gray-400">
                    <li className="flex gap-2"><Check size={12} className="text-green-500"/> Lista de Cidades</li>
                    <li className="flex gap-2"><Check size={12} className="text-green-500"/> Sorteio de Mapas</li>
                    <li className="flex gap-2"><Check size={12} className="text-green-500"/> Tabela de Pontos</li>
                </ul>
            </div>

            {/* PREMIUM */}
            <div onClick={() => selectMode('premium')} className="bg-panel border border-primary/50 cursor-pointer rounded-xl p-6 transition-all hover:-translate-y-2 relative overflow-hidden group shadow-[0_0_20px_rgba(var(--color-primary),0.1)]">
                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold px-2 py-1">RECOMENDADO</div>
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-colors">
                    <MapIcon size={24}/>
                </div>
                <h3 className="text-xl font-bold mb-2">Premium</h3>
                <p className="text-sm text-muted mb-4">Mapa interativo para posicionar times visualmente.</p>
                <ul className="text-xs space-y-2 text-gray-400">
                    <li className="flex gap-2"><Check size={12} className="text-green-500"/> Tudo do Básico</li>
                    <li className="flex gap-2"><Check size={12} className="text-green-500"/> Mapas Interativos</li>
                    <li className="flex gap-2"><Check size={12} className="text-green-500"/> Drag & Drop de Times</li>
                </ul>
            </div>

            {/* PREMIUM PLUS */}
            <div onClick={() => selectMode('premium_plus')} className="bg-panel border border-purple-500/50 cursor-pointer rounded-xl p-6 transition-all hover:-translate-y-2 group">
                 <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <Zap size={24}/>
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Plus</h3>
                <p className="text-sm text-muted mb-4">Importação de Replays JSON para estatísticas avançadas.</p>
                <ul className="text-xs space-y-2 text-gray-400">
                    <li className="flex gap-2"><Check size={12} className="text-purple-500"/> Tudo do Premium</li>
                    <li className="flex gap-2"><Check size={12} className="text-purple-500"/> Leitura de Replay (JSON)</li>
                    <li className="flex gap-2"><Check size={12} className="text-purple-500"/> MVP & Dano Total</li>
                </ul>
            </div>
        </div>
    </div>
  );

  const renderTeamRegister = () => (
    <div className="flex flex-col items-center w-full max-w-4xl">
        <h2 className="text-3xl font-display font-bold mb-8">REGISTRO DE TIMES</h2>
        
        <div className="w-full bg-panel border border-theme rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input 
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTeam()}
                    placeholder="Nome do Time..." 
                    className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 focus:border-primary outline-none text-white"
                />
                <Button onClick={addTeam} disabled={!newTeamName.trim() || teams.length >= 15}>
                    <UserPlus size={20}/> ADICIONAR
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team, idx) => (
                    <div key={team.id} className="bg-background border border-gray-800 rounded-lg p-3 flex flex-col gap-2 group hover:border-gray-600 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-muted font-mono text-xs w-6">#{idx + 1}</span>
                            
                            {/* Color Picker Trigger */}
                            <div className="relative">
                                <button 
                                    className="w-8 h-8 rounded-full border-2 border-white/20 hover:scale-110 transition-transform shadow-lg"
                                    style={{ backgroundColor: team.color }}
                                    onClick={() => {
                                        const newColor = prompt("Hex Cor:", team.color);
                                        if(newColor) updateTeamColor(team.id, newColor);
                                    }}
                                ></button>
                            </div>

                            {/* Logo Upload */}
                            <div className="relative group/logo cursor-pointer" onClick={() => triggerLogoUpload(team.id)}>
                                {team.logo ? (
                                    <img src={team.logo} className="w-10 h-10 rounded-lg object-cover bg-black" />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-xs text-muted hover:bg-gray-700">Logo</div>
                                )}
                            </div>

                            {/* Name Edit */}
                            <input 
                                value={team.name}
                                onChange={(e) => updateTeamName(team.id, e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none font-bold text-white placeholder-gray-600 focus:bg-white/5 rounded px-2"
                                placeholder="Nome do Time"
                            />

                            <button onClick={() => confirmDeleteTeam(team.id)} className="text-red-900 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                        </div>

                        {/* Player Management (Expandable) */}
                        <div className="pl-12">
                            <div className="flex flex-wrap gap-2">
                                {team.players.map((p, pIdx) => (
                                    <span key={pIdx} className="bg-gray-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                                        {p}
                                        <button onClick={() => removePlayerFromTeam(team.id, pIdx)} className="hover:text-red-500"><X size={10}/></button>
                                    </span>
                                ))}
                                {team.players.length < 6 && (
                                    <button 
                                        onClick={() => {
                                            const pName = prompt("Nome do Jogador:");
                                            if(pName) addPlayerToTeam(team.id, pName);
                                        }}
                                        className="bg-gray-800/50 hover:bg-gray-800 text-xs px-2 py-1 rounded border border-dashed border-gray-600 text-muted hover:text-white"
                                    >
                                        + Add
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {teams.length === 0 && <div className="col-span-2 text-center text-muted py-8">Nenhum time adicionado.</div>}
            </div>
        </div>

        <div className="flex justify-end w-full">
            <Button onClick={goToSort} disabled={teams.length === 0 && mode !== 'premium_plus'}>
                PRÓXIMO <ArrowRight size={20}/>
            </Button>
        </div>
        
        {/* Hidden File Input for Logo */}
        <input 
            type="file" 
            ref={logoInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleLogoChange}
        />
    </div>
  );

  const renderWaitingList = () => (
    <div className="flex flex-col items-center w-full max-w-4xl">
        <h2 className="text-3xl font-display font-bold mb-8">LISTA DE ESPERA</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
            {/* ADMIN SIDE */}
            <div className="bg-panel border border-theme rounded-xl p-6">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Crown size={20} className="text-yellow-500"/> Área do Organizador</h3>
                <div className="space-y-4">
                    <input value={wlAdminName} onChange={e => setWlAdminName(e.target.value)} placeholder="Seu Nome/Nick" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-sm"/>
                    <input value={wlTrainingName} onChange={e => setWlTrainingName(e.target.value)} placeholder="Nome do Treino" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-sm"/>
                    <input value={wlPin} onChange={e => setWlPin(e.target.value)} placeholder="PIN de Segurança (ex: 1234)" type="password" maxLength={4} className="w-full bg-black/50 border border-gray-700 rounded p-3 text-sm"/>
                    <Button onClick={createWaitingTraining} className="w-full">CRIAR LISTA</Button>
                </div>
            </div>

            {/* TEAM SIDE */}
            <div className="bg-panel border border-theme rounded-xl p-6">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Users size={20}/> Solicitar Vaga</h3>
                <div className="space-y-4">
                    <select 
                        value={selectedTrainingId || ''} 
                        onChange={e => setSelectedTrainingId(e.target.value)} 
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-sm text-white"
                    >
                        <option value="">Selecione um Treino...</option>
                        {openTrainings.map(t => <option key={t.id} value={t.id}>{t.trainingName} (Admin: {t.adminName})</option>)}
                    </select>
                    <input value={wlTeamRequestName} onChange={e => setWlTeamRequestName(e.target.value)} placeholder="Nome do Seu Time" className="w-full bg-black/50 border border-gray-700 rounded p-3 text-sm"/>
                    <Button onClick={requestEntryToTraining} variant="secondary" className="w-full" disabled={!selectedTrainingId}>ENVIAR SOLICITAÇÃO</Button>
                </div>
            </div>
        </div>

        {/* LISTS DISPLAY */}
        {openTrainings.map(t => (
            <div key={t.id} className="w-full bg-panel border border-theme rounded-xl p-6 mb-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-xl">{t.trainingName}</h3>
                        <div className="text-sm text-muted">Admin: {t.adminName} • Criado em {new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                        {!isAdminUnlocked && (
                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    placeholder="PIN" 
                                    value={wlUnlockPin} 
                                    onChange={e => setWlUnlockPin(e.target.value)}
                                    className="w-16 bg-black border border-gray-700 rounded px-2 text-center"
                                />
                                <Button size="sm" variant="secondary" onClick={() => checkAdminPin(t)}><Lock size={14}/></Button>
                            </div>
                        )}
                        {isAdminUnlocked && (
                            <>
                                <Button size="sm" onClick={() => importWaitingListToApp(t)}><Zap size={14}/> GERAR TREINO</Button>
                                <Button size="sm" variant="danger" onClick={() => deleteWaitingTraining(t.id)}><Trash2 size={14}/></Button>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-black/40 rounded-lg p-4">
                     <h4 className="font-bold text-sm text-muted uppercase mb-2">Times na Fila ({t.requests.length})</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                         {t.requests.map((r, i) => (
                             <div key={r.id} className="bg-gray-800 rounded px-2 py-1 text-sm flex justify-between items-center">
                                 <span>{i+1}. {r.teamName}</span>
                                 <span className="text-[10px] text-gray-500">{new Date(r.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                         ))}
                         {t.requests.length === 0 && <span className="text-muted text-sm italic">Nenhum time ainda.</span>}
                     </div>
                </div>
            </div>
        ))}
    </div>
  );

  const renderPublicHub = () => (
    <div className="flex flex-col items-center w-full max-w-4xl">
        <h2 className="text-3xl font-display font-bold mb-8">HUB DE TREINOS</h2>
        <p className="text-muted mb-8">Treinos salvos localmente no seu dispositivo.</p>

        <div className="grid grid-cols-1 gap-4 w-full">
            {savedTrainings.map(session => (
                <div key={session.id} className="bg-panel border border-theme rounded-xl p-6 hover:border-primary transition-colors cursor-pointer group" onClick={() => loadFromHub(session)}>
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-xl text-primary mb-1 group-hover:underline">{session.name}</h3>
                            <div className="text-sm text-muted flex gap-4">
                                <span className="flex items-center gap-1"><Calendar size={14}/> {session.date}</span>
                                <span className="flex items-center gap-1"><Users size={14}/> {session.teamsCount} Times</span>
                                <span className="flex items-center gap-1"><ListPlus size={14}/> {session.matchesCount} Quedas</span>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-900 hover:text-red-500 hover:bg-red-900/10" onClick={(e) => deleteFromHub(session.id, e)}>
                            <Trash2 size={18}/>
                        </Button>
                    </div>
                    <div className="mt-4 flex gap-4">
                         {session.leaderboardTop3.map((t, i) => (
                             <div key={i} className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full text-sm">
                                 <span className={`font-bold ${i===0 ? 'text-yellow-500' : i===1 ? 'text-gray-400' : 'text-orange-500'}`}>{i+1}º</span>
                                 <span className="text-gray-300">{t.name}</span>
                                 <span className="text-primary font-bold text-xs">{t.points}pts</span>
                             </div>
                         ))}
                    </div>
                </div>
            ))}
            {savedTrainings.length === 0 && (
                <div className="text-center py-12 bg-panel border border-theme border-dashed rounded-xl">
                    <div className="text-muted mb-2">Nenhum treino salvo encontrado.</div>
                    <div className="text-sm text-gray-500">Salve seus treinos na tela de Resultados para vê-los aqui.</div>
                </div>
            )}
        </div>
    </div>
  );
  
  const renderViewer = () => (
      <div className="min-h-screen bg-black text-white p-4 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">{trainingName}</h1>
              <div className="flex gap-2">
                  <div className="flex bg-gray-900 rounded p-1">
                      <button onClick={() => setViewerTab('ranking')} className={`px-4 py-2 rounded font-bold text-sm ${viewerTab==='ranking' ? 'bg-primary text-black' : 'text-gray-400'}`}>RANKING</button>
                      <button onClick={() => setViewerTab('drops')} className={`px-4 py-2 rounded font-bold text-sm ${viewerTab==='drops' ? 'bg-primary text-black' : 'text-gray-400'}`}>DROPS</button>
                  </div>
                  <Button onClick={handleBack} variant="secondary">Sair</Button>
              </div>
          </div>
          
          <div className="flex-1">
              {viewerTab === 'ranking' ? (
                  <div className="max-w-4xl mx-auto">
                      {/* Podium */}
                      <div className="flex justify-center items-end gap-4 mb-12">
                          {leaderboard.slice(0, 3).map((t, i) => {
                              const size = i === 0 ? 'h-48 w-32 md:w-40' : i === 1 ? 'h-36 w-28 md:w-32' : 'h-24 w-24 md:w-28';
                              const color = i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-600';
                              const order = i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3';
                              return (
                                  <div key={t.teamId} className={`${order} flex flex-col items-center`}>
                                      <span className="font-bold mb-2 truncate max-w-[100px]">{t.teamName}</span>
                                      <div className={`${size} ${color} rounded-t-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col justify-end items-center p-2`}>
                                          <span className="text-3xl font-black text-black/50">#{i+1}</span>
                                          <span className="font-bold text-black">{t.totalPoints}</span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                      
                      {/* List */}
                      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                          {leaderboard.map((t, i) => (
                              <div key={t.teamId} className="flex items-center p-4 border-b border-gray-800 last:border-0 hover:bg-white/5">
                                  <span className="font-mono text-gray-500 w-8">#{i+1}</span>
                                  <div className="flex-1 font-bold flex items-center gap-3">
                                      {t.teamName}
                                      {i===0 && <Crown size={14} className="text-yellow-500"/>}
                                  </div>
                                  <div className="text-right">
                                      <span className="block font-bold text-xl text-primary">{t.totalPoints}</span>
                                      <span className="text-xs text-gray-500">PTS</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m=>m.id)).map((mid, i) => {
                          const mData = MAPS.find(m => m.id === mid);
                          return (
                              <div key={mid} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                                  <div className="h-32 relative">
                                      <img src={mData?.image} className="w-full h-full object-cover opacity-60" />
                                      <div className="absolute inset-0 flex items-center justify-center font-bold text-xl uppercase tracking-widest text-shadow">
                                          {mData?.name}
                                      </div>
                                  </div>
                                  <div className="p-4 space-y-2">
                                      {teams.map(t => (
                                          <div key={t.id} className="flex justify-between text-sm">
                                              <span className="text-gray-300 font-bold">{t.name}</span>
                                              <span className="text-primary">{mode === 'basic' ? (basicSelections[mid]?.[t.id] || '-') : 'Ver Mapa'}</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              )}
          </div>
      </div>
  );

  const renderMapSort = () => (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 min-h-[60vh] justify-center">
            <h2 className="text-3xl font-display font-bold mb-12">SORTEIO DE MAPAS</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 w-full">
                {(shuffledMaps.length > 0 ? shuffledMaps : [0,1,2,3,4,5].map(i => MAPS[i]?.id || i)).map((mapId, idx) => {
                    const mapData = MAPS.find(m => m.id === mapId);
                    return (
                        <div key={idx} className={`relative aspect-video rounded-xl overflow-hidden border-2 ${shuffledMaps.length > 0 ? 'border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)]' : 'border-gray-800 opacity-50'}`}>
                            {mapData ? (
                                <>
                                    <img src={mapData.image} alt={mapData.name} className="w-full h-full object-cover" />
                                    {/* Improved visibility gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-4">
                                        <span className="font-black text-white uppercase text-lg drop-shadow-md">{idx + 1}. {mapData.name}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full bg-gray-900 flex items-center justify-center text-muted font-bold text-2xl">?</div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-6">
                <Button variant="secondary" onClick={spinRoulette} disabled={isSpinning}>
                    <RefreshCw size={20} className={isSpinning ? 'animate-spin' : ''}/>
                    {shuffledMaps.length > 0 ? 'SORTEAR NOVAMENTE' : 'SORTEAR MAPAS'}
                </Button>
                <Button onClick={startStrategy} disabled={shuffledMaps.length === 0} className="shadow-lg shadow-primary/20">
                    DEFINIR ESTRATÉGIA <ArrowRight size={20}/>
                </Button>
            </div>
        </div>
    );

    const renderStrategy = () => {
        const currentMaps = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);

        return (
            <div className="w-full max-w-[1600px] p-4 flex flex-col h-[calc(100vh-140px)]">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-display font-bold">DEFINIÇÃO DE CALLS</h2>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={handleImportClick}><UploadCloud size={18}/> Importar</Button>
                        <Button variant="ghost" onClick={handleExportStrategy}><Download size={18}/> Exportar JSON</Button>
                        <Button variant="secondary" onClick={downloadStrategyImage}><Image size={18}/> Baixar Imagem</Button>
                        <Button onClick={() => setStep(Step.SCORING)}>PONTUAÇÃO <ArrowRight size={18}/></Button>
                    </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    {WARNINGS.map(w => (
                        <button 
                            key={w} 
                            onClick={() => toggleWarning(w)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${selectedWarnings.includes(w) ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-muted border-theme hover:border-red-500'}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>

                {/* Mobile Map Switcher */}
                <div className="md:hidden flex items-center justify-between mb-4 bg-panel p-2 rounded-lg border border-theme">
                    <button onClick={() => setActiveStrategyMapIndex(Math.max(0, activeStrategyMapIndex - 1))} disabled={activeStrategyMapIndex === 0} className="p-2 disabled:opacity-30"><ChevronLeft/></button>
                    <span className="font-bold uppercase">{MAPS.find(m => m.id === currentMaps[activeStrategyMapIndex])?.name}</span>
                    <button onClick={() => setActiveStrategyMapIndex(Math.min(currentMaps.length - 1, activeStrategyMapIndex + 1))} disabled={activeStrategyMapIndex === currentMaps.length - 1} className="p-2 disabled:opacity-30"><ChevronRight/></button>
                </div>

                <div className={`flex-1 bg-background/50 rounded-xl border border-theme ${mode === 'basic' ? 'overflow-y-auto' : 'md:overflow-hidden'}`}>
                    {mode === 'basic' ? (
                        <div ref={strategyRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-[#111]">
                            {currentMaps.map((mapId, i) => {
                                const mapData = MAPS.find(m => m.id === mapId);
                                if(!mapData) return null;
                                return (
                                    <div key={mapId} className="bg-panel border border-theme rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-800">
                                            <img src={mapData.image} className="w-12 h-12 rounded-lg object-cover" alt={mapData.name}/>
                                            <div>
                                                <div className="text-xs text-muted font-bold">QUEDA {i+1}</div>
                                                <div className="font-bold text-lg">{mapData.name}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {teams.map(team => (
                                                <div key={team.id} className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: team.color}}></div>
                                                    <span className="text-sm font-bold w-24 truncate">{team.name}</span>
                                                    <select 
                                                        value={basicSelections[mapId]?.[team.id] || ''}
                                                        onChange={(e) => handleCitySelect(mapId, team.id, e.target.value)}
                                                        className="flex-1 bg-black/30 border border-gray-800 rounded px-2 py-1 text-xs text-white outline-none focus:border-primary"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        <option value="LIVRE">LIVRE</option>
                                                        {mapData.cities.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col md:flex-row overflow-x-auto snap-x snap-mandatory">
                            {currentMaps.map((mapId, i) => {
                                const mapData = MAPS.find(m => m.id === mapId);
                                if(!mapData) return null;
                                const isVisibleMobile = i === activeStrategyMapIndex;
                                return (
                                    <div key={mapId} className={`${isVisibleMobile ? 'block' : 'hidden md:block'} md:w-1/2 lg:w-1/3 min-w-[350px] p-4 h-full shrink-0 snap-center`}>
                                        <DraggableMap 
                                            mapName={`QUEDA ${i+1}: ${mapData.name}`}
                                            image={mapData.image}
                                            teams={teams}
                                            positions={premiumPositions[mapId] || {}}
                                            onPositionChange={(tid, pos) => handlePremiumPosition(mapId, tid, pos)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
            </div>
        );
    };

    const renderScoring = () => {
        const currentMaps = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);
        const activeMapId = currentMaps[currentMatchTab];
        const activeMapData = MAPS.find(m => m.id === activeMapId);

        return (
            <div className="w-full max-w-5xl mx-auto p-4 flex flex-col items-center">
                <h2 className="text-3xl font-display font-bold mb-8">PONTUAÇÃO</h2>

                {/* Match Tabs */}
                <div className="flex gap-2 overflow-x-auto w-full pb-4 mb-4 no-scrollbar">
                    {currentMaps.map((mid, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentMatchTab(idx)}
                            className={`
                                flex-shrink-0 px-6 py-3 rounded-lg font-bold text-sm uppercase transition-all whitespace-nowrap
                                ${currentMatchTab === idx ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'bg-panel border border-theme text-muted hover:text-white'}
                            `}
                        >
                            Queda {idx + 1}
                        </button>
                    ))}
                </div>

                <div className="w-full bg-panel border border-theme rounded-xl p-6 mb-8">
                     <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden border border-gray-600">
                                 {activeMapData && <img src={activeMapData.image} className="w-full h-full object-cover" />}
                             </div>
                             <div>
                                 <h3 className="font-bold text-xl">{activeMapData?.name}</h3>
                                 <div className="text-sm text-muted">Queda {currentMatchTab + 1}</div>
                             </div>
                         </div>

                         {mode === 'premium_plus' && (
                             <div className="flex gap-2">
                                 <Button variant="secondary" onClick={() => replayInputRef.current?.click()} size="sm" className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10">
                                     <Binary size={16}/> Carregar Replay (.json)
                                 </Button>
                                 <input type="file" ref={replayInputRef} className="hidden" accept=".json" onChange={handleReplayUpload} />
                             </div>
                         )}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {teams.map(team => {
                             const score = matchScores[currentMatchTab]?.[team.id] || { teamId: team.id, rank: '', kills: '', playerKills: {} };
                             return (
                                 <div key={team.id} className="bg-background/50 border border-theme rounded-lg p-3 flex flex-col gap-2">
                                     <div className="flex items-center gap-2 mb-2">
                                         <div className="w-3 h-3 rounded-full" style={{backgroundColor: team.color}}></div>
                                         <span className="font-bold truncate flex-1">{team.name}</span>
                                     </div>
                                     <div className="flex gap-2">
                                         <div className="flex-1">
                                             <label className="text-[10px] text-muted uppercase font-bold">Rank #</label>
                                             <input 
                                                 type="number" 
                                                 min="1" 
                                                 max="12"
                                                 value={score.rank} 
                                                 onChange={(e) => handleScoreChange(currentMatchTab, team.id, 'rank', e.target.value)}
                                                 className="w-full bg-black border border-gray-700 rounded p-2 text-center font-bold outline-none focus:border-primary"
                                             />
                                         </div>
                                         <div className="flex-1">
                                             <label className="text-[10px] text-muted uppercase font-bold">Kills</label>
                                             <input 
                                                 type="number" 
                                                 min="0"
                                                 value={score.kills}
                                                 onChange={(e) => handleScoreChange(currentMatchTab, team.id, 'kills', e.target.value)}
                                                 className="w-full bg-black border border-gray-700 rounded p-2 text-center font-bold outline-none focus:border-primary"
                                             />
                                         </div>
                                     </div>
                                 </div>
                             )
                         })}
                     </div>
                </div>

                <div className="flex gap-4">
                     <Button variant="secondary" onClick={() => setStep(Step.STRATEGY)}><ArrowLeft size={18}/> Voltar</Button>
                     <Button onClick={() => setStep(Step.DASHBOARD)} size="lg" className="shadow-lg shadow-primary/20">
                         VER RESULTADOS <ArrowRight size={18}/>
                     </Button>
                </div>
            </div>
        );
    };

  const renderSocialBanner = () => {
      if(!showSocialBanner) return null;
      return (
          <div className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center p-4">
               <div className="mb-4 flex justify-between w-full max-w-2xl text-white items-center">
                   <h3 className="font-bold">Pré-visualização do Banner</h3>
                   <button onClick={() => setShowSocialBanner(false)}><X size={24}/></button>
               </div>
               
               <div ref={bannerRef} className="bg-[#0a0a0a] border border-theme w-[1080px] h-[1080px] scale-[0.3] md:scale-[0.5] origin-top flex flex-col relative overflow-hidden shadow-2xl shrink-0">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-700 via-black to-black"></div>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary blur-[150px] opacity-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                    
                    <div className="absolute top-0 left-0 w-full h-3 bg-primary z-10"></div>

                    <div className="p-16 flex flex-col h-full relative z-20">
                        <div className="flex justify-between items-start mb-16">
                            <div>
                                <h1 className="text-7xl font-black text-white uppercase tracking-tighter mb-4 drop-shadow-lg">{trainingName}</h1>
                                <span className="bg-primary text-black font-black text-3xl px-6 py-2 rounded inline-block uppercase tracking-widest">RESULTADO FINAL</span>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                <Crown size={100} className="text-primary drop-shadow-[0_0_15px_rgba(255,212,0,0.5)]"/>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-5">
                            {leaderboard.slice(0, 10).map((t, i) => {
                                const tObj = teams.find(team => team.id === t.teamId);
                                return (
                                <div key={i} className={`flex items-center p-6 rounded-2xl border-b-2 ${i<3 ? 'bg-gradient-to-r from-white/10 to-transparent border-primary/50' : 'bg-transparent border-gray-800'}`}>
                                    <span className={`text-5xl font-black w-24 text-center ${i===0 ? 'text-[#FFD400]' : i===1 ? 'text-gray-300' : i===2 ? 'text-orange-500' : 'text-gray-600'}`}>{i+1}</span>
                                    <span className="text-4xl font-bold text-white flex-1 tracking-tight flex items-center gap-4">
                                        {tObj?.logo ? (
                                            <img src={tObj.logo} className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                                                <div className="w-6 h-6 rounded-full" style={{backgroundColor: tObj?.color}}></div>
                                            </div>
                                        )}
                                        {t.teamName}
                                    </span>
                                    <div className="text-right">
                                        <div className="text-5xl font-black text-white">{t.totalPoints}</div>
                                        <div className="text-sm text-primary font-bold tracking-[0.2em] uppercase">PONTOS</div>
                                    </div>
                                </div>
                            )})}
                        </div>

                        <div className="mt-auto pt-10 border-t border-gray-800 flex justify-between items-end text-gray-400 font-mono text-xl">
                             <div>
                                 <div>{new Date().toLocaleDateString()}</div>
                                 <div className="text-primary">{teams.length} TIMES • {Object.keys(matchScores).length} QUEDAS</div>
                             </div>
                             <div className="flex items-center gap-3">
                                 <Instagram size={32}/> <span>@jhanmedeiros</span>
                             </div>
                        </div>
                    </div>
               </div>

               <div className="mt-[400px] md:mt-[300px] flex gap-4">
                   <Button onClick={downloadSocialBanner} className="bg-white text-black hover:bg-gray-200"><Download size={18}/> Baixar Imagem (PNG)</Button>
               </div>
          </div>
      )
  };

  const renderReport = () => {
    const generateReportText = () => {
         let text = `*${trainingName.toUpperCase()}*\n\n`;
         if (selectedWarnings.length > 0) {
             text += `⚠️ *AVISOS:*\n`;
             selectedWarnings.forEach(w => text += `• ${w}\n`);
             text += `\n`;
         }
         const currentMaps = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);
         currentMaps.forEach((mid, idx) => {
             const mName = MAPS.find(x => x.id === mid)?.name;
             text += `📍 *QUEDA ${idx + 1}: ${mName?.toUpperCase()}*\n`;
             teams.forEach(t => {
                 let call = mode === 'basic' ? (basicSelections[mid]?.[t.id] || 'LIVRE') : 'Ver Mapa';
                 if (mode === 'basic') text += `▫️ ${t.name}: ${call}\n`;
             });
             if (mode !== 'basic') text += `(Confira a imagem da call)\n`;
             text += `\n`;
         });
         if (leaderboard.some(t => t.totalPoints > 0)) {
             text += `🏆 *TOP 3 ATUAL:*\n`;
             leaderboard.slice(0, 3).forEach((t, i) => {
                 text += `${i+1}º ${t.teamName} - ${t.totalPoints} pts\n`;
             });
         }
         return text;
    };

    const handleWhatsAppShare = () => {
        const text = encodeURIComponent(generateReportText());
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateReportText());
        alert("Relatório copiado!");
    };

    const currentMaps = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);

    return (
        <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 md:p-8">
            <h2 className="text-3xl font-display font-bold mb-8">RELATÓRIO & COMPARTILHAMENTO</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full h-full">
                {/* Visual Preview */}
                <div className="bg-panel border border-theme rounded-xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[600px] custom-scrollbar">
                    <h3 className="font-bold text-muted uppercase text-sm tracking-wider">Visualização do Relatório</h3>
                    
                    {currentMaps.map((mid, idx) => {
                        const mName = MAPS.find(x => x.id === mid)?.name;
                        return (
                            <div key={idx} className="bg-black/40 border border-gray-800 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-primary text-black text-xs font-bold px-2 py-1 rounded">QUEDA {idx+1}</span>
                                    <span className="font-bold text-white">{mName}</span>
                                </div>
                                <div className="space-y-1">
                                    {teams.map(t => {
                                        const call = mode === 'basic' ? (basicSelections[mid]?.[t.id] || 'Livre') : 'Ver Mapa';
                                        return (
                                            <div key={t.id} className="flex items-center justify-between text-sm text-gray-400 border-b border-gray-800/50 pb-1 last:border-0">
                                                <div className="flex items-center gap-2">
                                                    {t.logo && <img src={t.logo} className="w-4 h-4 rounded-full"/>}
                                                    <span className="text-gray-300">{t.name}</span>
                                                </div>
                                                <span className="font-mono text-primary">{call}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Actions & Raw Text */}
                <div className="flex flex-col gap-4">
                    <div className="bg-panel border border-theme rounded-xl p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-muted uppercase text-sm tracking-wider">Texto para WhatsApp</h3>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={copyToClipboard}><Copy size={16}/></Button>
                            </div>
                        </div>
                        <textarea 
                            readOnly 
                            className="w-full flex-1 bg-black/50 border border-gray-800 rounded-lg p-4 font-mono text-xs text-gray-300 resize-none focus:outline-none focus:border-primary"
                            value={generateReportText()}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <Button onClick={copyToClipboard} variant="secondary" className="w-full">
                            <Copy size={18}/> COPIAR
                        </Button>
                        <Button onClick={handleWhatsAppShare} className="w-full bg-green-600 hover:bg-green-500 text-white border-none shadow-lg shadow-green-900/20">
                            <MessageCircle size={18}/> ENVIAR NO ZAP
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderDashboard = () => (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-4 md:p-8">
        <h2 className="text-3xl font-display font-bold mb-8">RESULTADOS & ESTATÍSTICAS</h2>

        <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <div className="bg-panel border border-theme rounded-lg p-1 flex">
                <button 
                    onClick={() => setDashboardTab('leaderboard')}
                    className={`px-4 py-2 rounded font-bold text-sm transition-all ${dashboardTab === 'leaderboard' ? 'bg-primary text-black shadow' : 'text-muted hover:text-white'}`}
                >
                    CLASSIFICAÇÃO
                </button>
                <button 
                    onClick={() => setDashboardTab('mvp')}
                    className={`px-4 py-2 rounded font-bold text-sm transition-all ${dashboardTab === 'mvp' ? 'bg-primary text-black shadow' : 'text-muted hover:text-white'}`}
                >
                    MVP & STATS
                </button>
            </div>
            <Button variant="secondary" onClick={() => setShowSocialBanner(true)} className="text-pink-500 border-pink-500/30 hover:bg-pink-500/10">
                <Instagram size={18}/> Banner Social
            </Button>
            <Button variant="secondary" onClick={saveToHub} className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10">
                <Globe size={18}/> Publicar no Hub
            </Button>
        </div>

        <div className="w-full bg-panel border border-theme rounded-xl overflow-hidden mb-8 min-h-[400px]">
            {dashboardTab === 'leaderboard' ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 text-xs text-muted uppercase font-bold border-b border-gray-800">
                                <th className="p-4 w-16 text-center">#</th>
                                <th className="p-4">Time</th>
                                <th className="p-4 text-center">Pts Totais</th>
                                <th className="p-4 text-center hidden md:table-cell">Posição (Pts)</th>
                                <th className="p-4 text-center hidden md:table-cell">Kills (Pts)</th>
                                <th className="p-4 text-center hidden sm:table-cell">Booyahs</th>
                                <th className="p-4 text-center hidden lg:table-cell">Última Queda</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((row, idx) => (
                                <tr key={row.teamId} className={`border-b border-gray-800/50 hover:bg-white/5 transition-colors ${idx < 3 ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''}`}>
                                    <td className="p-4 text-center font-black text-lg">
                                        {idx === 0 && <span className="text-yellow-500">1º</span>}
                                        {idx === 1 && <span className="text-gray-400">2º</span>}
                                        {idx === 2 && <span className="text-orange-500">3º</span>}
                                        {idx > 2 && <span className="text-muted">{idx + 1}º</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {teams.find(t => t.id === row.teamId)?.logo ? (
                                                <img src={teams.find(t => t.id === row.teamId)?.logo} className="w-8 h-8 rounded-full object-cover border border-gray-600" />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center font-bold text-xs border border-gray-700" style={{ color: teams.find(t => t.id === row.teamId)?.color }}>
                                                    {row.teamName.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <span className={`font-bold ${idx < 3 ? 'text-white' : 'text-gray-300'}`}>{row.teamName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="font-black text-xl text-primary">{row.totalPoints}</span>
                                    </td>
                                    <td className="p-4 text-center hidden md:table-cell text-gray-400">
                                        {row.placementPoints}
                                    </td>
                                    <td className="p-4 text-center hidden md:table-cell text-gray-400">
                                        {row.killPoints} <span className="text-xs text-gray-600">({row.totalKills} Kills)</span>
                                    </td>
                                    <td className="p-4 text-center hidden sm:table-cell">
                                        {row.booyahs > 0 ? <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs font-bold">{row.booyahs}</span> : <span className="text-gray-600">-</span>}
                                    </td>
                                    <td className="p-4 text-center hidden lg:table-cell text-xs font-mono text-gray-500">
                                        #{row.lastMatchRank}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40 text-xs text-muted uppercase font-bold border-b border-gray-800">
                                <th className="p-4 text-center">Rank</th>
                                <th className="p-4">Jogador</th>
                                <th className="p-4">Time</th>
                                <th className="p-4 text-center">MVP Score</th>
                                <th className="p-4 text-center">Kills</th>
                                <th className="p-4 text-center hidden md:table-cell">Dano</th>
                                <th className="p-4 text-center hidden md:table-cell">Tempo Vivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {playerStats.slice(0, 50).map((p, idx) => (
                                <tr key={idx} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-center font-mono text-muted">{idx + 1}</td>
                                    <td className="p-4 font-bold text-white">{p.name}</td>
                                    <td className="p-4 text-sm text-gray-400">
                                        <span style={{color: p.teamColor}}>{p.teamName}</span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-primary">{p.mvpScore?.toFixed(1) || 0}</td>
                                    <td className="p-4 text-center">{p.totalKills}</td>
                                    <td className="p-4 text-center hidden md:table-cell text-gray-500">{p.totalDamage ? p.totalDamage.toFixed(0) : '-'}</td>
                                    <td className="p-4 text-center hidden md:table-cell text-gray-500">{p.timeAlive ? `${(p.timeAlive / 60).toFixed(1)}m` : '-'}</td>
                                </tr>
                            ))}
                            {playerStats.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-muted">Nenhum dado de jogador registrado ainda. Use o modo Premium Plus ou insira kills manualmente.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between w-full">
             <Button variant="secondary" onClick={() => setStep(Step.SCORING)}><ArrowLeft size={18}/> Corrigir Pontos</Button>
             <div className="flex gap-4">
                 <Button onClick={() => setStep(Step.VIEWER)} className="bg-purple-600 hover:bg-purple-500 text-white border-none shadow-lg shadow-purple-900/20">
                     <Monitor size={18}/> MODO LEITURA
                 </Button>
                 <Button onClick={() => setStep(Step.REPORT)} className="shadow-lg shadow-primary/20">
                     GERAR RELATÓRIO <ArrowRight size={18}/>
                 </Button>
             </div>
        </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background text-main font-sans selection:bg-primary selection:text-black pb-20 md:pb-0 ${isDarkMode ? 'dark' : ''}`}>
      <ErrorBoundary>
        <div className="fixed top-4 right-4 z-50 no-print flex gap-2 bg-panel/80 backdrop-blur-md p-2 rounded-xl border border-theme shadow-lg items-center">
            {step !== Step.HOME && step !== Step.VIEWER && <Button variant="ghost" size="sm" onClick={handleBack} className="!p-2"><ArrowLeft size={18} /></Button>}
            {step !== Step.HOME && step !== Step.VIEWER && <Button variant="ghost" size="sm" onClick={handleHome} className="!p-2"><Home size={18} /></Button>}
            {step !== Step.HOME && step !== Step.VIEWER && <Button variant="ghost" size="sm" onClick={saveDraft} className="!p-2 text-yellow-500" title="Salvar Rascunho"><Save size={18} /></Button>}
            
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg hover:bg-background text-muted hover:text-main transition-colors">
                 {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className="group relative">
             <button className="p-2 rounded-lg hover:bg-background text-muted hover:text-main transition-colors">
               <Palette size={18}/>
             </button>
             <div className="absolute right-0 top-full mt-2 bg-panel border border-theme rounded-lg p-2 hidden group-hover:flex flex-col gap-2 shadow-xl min-w-[120px]">
                <span className="text-xs text-muted font-bold px-2 uppercase">Cor Destaque</span>
                {THEMES.map(theme => (
                  <button 
                    key={theme.name} 
                    onClick={() => setActiveTheme(theme)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-background text-sm"
                  >
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: theme.hex}}></div>
                    <span className={activeTheme.name === theme.name ? 'text-main font-bold' : 'text-muted'}>{theme.name}</span>
                  </button>
                ))}
             </div>
           </div>
        </div>

        {renderHelpModal()}
        {renderDeleteModal()}
        {renderVisualizerModal()}
        {renderSocialBanner()}

        {step === Step.VIEWER ? renderViewer() : (
            <div className="pt-24 px-4 md:px-8 pb-12 w-full max-w-[1920px] mx-auto flex flex-col items-center h-full">
                {step !== Step.HOME && step !== Step.PUBLIC_HUB && step !== Step.WAITING_LIST && renderStepper()}
                
                {step === Step.HOME && renderHome()}
                {step === Step.WAITING_LIST && renderWaitingList()}
                {step === Step.PUBLIC_HUB && renderPublicHub()}
                {step === Step.MODE_SELECT && renderModeSelect()}
                {step === Step.TEAM_REGISTER && renderTeamRegister()}
                {step === Step.MAP_SORT && renderMapSort()}
                {step === Step.STRATEGY && renderStrategy()}
                {step === Step.SCORING && renderScoring()}
                {step === Step.REPORT && renderReport()}
                {step === Step.DASHBOARD && renderDashboard()}
            </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

export default MainApp;