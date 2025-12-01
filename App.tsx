import React, { useState, useEffect, useMemo, ErrorInfo } from 'react';
import { Users, Trophy, Crown, AlertTriangle, ArrowRight, ArrowLeft, Home, Download, RefreshCw, BarChart2, Save, Trash2, Edit2, Play, LayoutGrid, HelpCircle, X, Info, FileText, Instagram, Eye, Check, Palette, Monitor, Moon, Sun, Medal, Target, Flame, Share2, Calendar } from 'lucide-react';
import { Team, TrainingMode, Step, MapData, MatchScore, ProcessedScore, Position, POINTS_SYSTEM } from './types';
import { MAPS, WARNINGS } from './constants';
import { Button } from './components/Button';
import { DraggableMap } from './components/DraggableMap';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// Theme Configuration
const THEMES = [
  { name: 'Yellow', color: '255 212 0', hex: '#FFD400' },
  { name: 'Blue', color: '59 130 246', hex: '#3B82F6' },
  { name: 'Red', color: '239 68 68', hex: '#EF4444' },
  { name: 'Green', color: '34 197 94', hex: '#22C55E' },
  { name: 'Purple', color: '168 85 247', hex: '#A855F7' },
];

// Error Boundary Component to prevent white/black screen
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

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
          <AlertTriangle size={48} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado.</h1>
          <p className="text-gray-400 mb-4 max-w-md">Ocorreu um erro inesperado na aplicação. Tente recarregar a página.</p>
          <div className="bg-gray-900 p-4 rounded text-left overflow-auto max-w-full text-xs font-mono text-red-300 border border-red-900">
            {this.state.error?.message}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2 bg-primary text-black font-bold rounded hover:opacity-90 transition"
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
  const [trainingName, setTrainingName] = useState('Treino Competitivo'); // New State
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Modals
  const [showHelp, setShowHelp] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [showStrategyVisualizer, setShowStrategyVisualizer] = useState(false);
  const [showSocialBanner, setShowSocialBanner] = useState(false); // New State
  
  // Strategy State
  const [shuffledMaps, setShuffledMaps] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [basicSelections, setBasicSelections] = useState<Record<string, Record<string, string>>>({});
  const [premiumPositions, setPremiumPositions] = useState<Record<string, Record<string, Position>>>({});
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);

  // Scoring State
  const [matchScores, setMatchScores] = useState<Record<number, Record<string, MatchScore>>>({});
  const [currentMatchTab, setCurrentMatchTab] = useState(0);

  // Dashboard State
  const [dashboardTab, setDashboardTab] = useState<'leaderboard' | 'strategy'>('leaderboard');

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

  // --- Navigation Handlers ---
  const handleBack = () => {
    switch(step) {
      case Step.MODE_SELECT: setStep(Step.HOME); break;
      case Step.TEAM_REGISTER: setStep(Step.MODE_SELECT); break;
      case Step.MAP_SORT: setStep(Step.TEAM_REGISTER); break;
      case Step.STRATEGY: setStep(Step.MAP_SORT); break;
      case Step.SCORING: setStep(Step.STRATEGY); break;
      case Step.REPORT: setStep(Step.SCORING); break;
      case Step.DASHBOARD: setStep(Step.SCORING); break;
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

  const addTeam = () => {
    if (newTeamName.trim() && teams.length < 15) {
      setTeams([...teams, { id: Date.now().toString(), name: newTeamName.trim() }]);
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

  const goToSort = () => {
    if (teams.length === 0) return;
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

  // Scoring Logic
  const handleScoreChange = (matchIdx: number, teamId: string, field: 'rank' | 'kills', value: string) => {
    const val = value === '' ? '' : parseInt(value);
    
    setMatchScores(prev => {
      const matchData = prev[matchIdx] || {};
      const teamData = matchData[teamId] || { teamId, rank: '', kills: '' };
      
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

    // Tiebreaker logic
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

  // --- Modals Render Helpers ---

  const renderDeleteModal = () => (
    teamToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-panel rounded-xl border border-theme p-6 max-w-sm w-full shadow-theme">
          <h3 className="text-xl font-bold mb-4 text-main">Confirmar Exclusão</h3>
          <p className="text-muted mb-6">Tem certeza que deseja remover este time? Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setTeamToDelete(null)}>Cancelar</Button>
            <Button variant="danger" onClick={executeDeleteTeam}>Sim, Excluir</Button>
          </div>
        </div>
      </div>
    )
  );

  const renderVisualizerModal = () => {
    if (!showStrategyVisualizer) return null;
    const currentMapOrder = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);

    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b border-theme bg-panel">
           <h2 className="text-xl font-bold text-primary flex items-center gap-2"><Eye size={20}/> Visualização de Estratégia</h2>
           <Button variant="secondary" size="sm" onClick={() => setShowStrategyVisualizer(false)}><X/></Button>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-8">
           {selectedWarnings.length > 0 && (
             <div className="mb-8 border border-primary/30 bg-primary/5 p-4 rounded-lg">
               <h4 className="text-primary font-bold mb-2 flex items-center gap-2"><AlertTriangle size={16}/> REGRAS ATIVAS</h4>
               <ul className="list-disc list-inside text-muted">
                 {selectedWarnings.map((w,i) => <li key={i}>{w}</li>)}
               </ul>
             </div>
           )}

           {mode === 'basic' ? (
              <div className="overflow-x-auto bg-panel rounded-xl border border-theme shadow-theme p-4">
               <table className="w-full text-left border-collapse min-w-[1000px]">
                 <thead>
                   <tr className="bg-background text-primary uppercase text-sm font-bold tracking-wider border-b border-theme">
                     <th className="p-4 border-r border-theme">TIME</th>
                     {currentMapOrder.map(mapId => (
                       <th key={mapId} className="p-4 border-r border-theme">{MAPS.find(m => m.id === mapId)?.name}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-800/20">
                   {teams.map(team => (
                     <tr key={team.id} className="hover:bg-primary/5">
                       <td className="p-3 font-semibold text-main border-r border-theme bg-panel">{team.name}</td>
                       {currentMapOrder.map(mapId => {
                         const currentSelection = basicSelections[mapId]?.[team.id] || "-";
                         const isConflict = Object.entries(basicSelections[mapId] || {}).some(
                           ([tId, city]) => tId !== team.id && city === currentSelection && city !== "" && city !== "-"
                         );
                         return (
                           <td key={mapId} className={`p-3 border-r border-theme ${isConflict ? 'text-red-500 font-bold bg-red-500/10' : 'text-muted'}`}>
                             {currentSelection}
                           </td>
                         )
                       })}
                     </tr>
                   ))}
                 </tbody>
               </table>
              </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentMapOrder.map(mapId => {
                  const mapData = MAPS.find(m => m.id === mapId);
                  return mapData ? (
                    <DraggableMap
                      key={mapId}
                      mapName={mapData.name}
                      image={mapData.image}
                      teams={teams}
                      positions={premiumPositions[mapId] || {}}
                      onPositionChange={() => {}}
                      readOnly={true}
                    />
                  ) : null;
                })}
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderSocialBanner = () => {
    if (!showSocialBanner) return null;
    const sortedLeaderboard = leaderboard;
    const champion = sortedLeaderboard[0];
    const secondPlace = sortedLeaderboard[1];
    const thirdPlace = sortedLeaderboard[2];
    const others = sortedLeaderboard.slice(3);

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-[500px] bg-black border-2 border-primary rounded-xl overflow-hidden shadow-[0_0_50px_rgba(var(--color-primary),0.3)]">
           <button onClick={() => setShowSocialBanner(false)} className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-white hover:text-black transition-colors"><X size={20}/></button>
           
           {/* Banner Content Container - Designed for Screenshot */}
           <div className="bg-gradient-to-b from-gray-900 to-black p-6 md:p-8 text-center flex flex-col items-center">
              {/* Header */}
              <div className="mb-6 w-full border-b border-primary/30 pb-4">
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="text-primary fill-primary" size={24}/>
                    <span className="font-bold text-primary tracking-widest text-sm uppercase">JhanTraining</span>
                 </div>
                 <h2 className="text-2xl font-black text-white uppercase leading-none mb-1">{trainingName}</h2>
                 <p className="text-xs text-gray-400 font-mono">{new Date().toLocaleDateString()}</p>
              </div>

              {/* Podium */}
              <div className="flex items-end justify-center gap-2 mb-6 w-full">
                 {/* 2nd */}
                 <div className="flex flex-col items-center w-1/3">
                    <div className="mb-1 text-[10px] font-bold text-gray-400">2º LUGAR</div>
                    <div className="w-full bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-lg h-24 flex flex-col justify-end pb-2 relative border-t-2 border-gray-400">
                       <span className="text-white font-bold text-sm leading-tight px-1 truncate w-full">{secondPlace?.teamName || '-'}</span>
                       <span className="text-xs text-gray-300">{secondPlace?.totalPoints || 0} pts</span>
                    </div>
                 </div>
                 {/* 1st */}
                 <div className="flex flex-col items-center w-1/3 -mt-4">
                    <Crown size={20} className="text-primary mb-1 animate-bounce"/>
                    <div className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-lg h-32 flex flex-col justify-end pb-3 relative border-t-2 border-yellow-200 shadow-[0_0_20px_rgba(var(--color-primary),0.4)]">
                       <span className="text-black font-black text-lg leading-tight px-1 truncate w-full">{champion?.teamName || '-'}</span>
                       <span className="text-sm font-bold text-black/70">{champion?.totalPoints || 0} pts</span>
                       <div className="text-[10px] font-bold text-black/60 mt-1">{champion?.booyahs || 0} Booyahs</div>
                    </div>
                 </div>
                 {/* 3rd */}
                 <div className="flex flex-col items-center w-1/3">
                    <div className="mb-1 text-[10px] font-bold text-orange-400">3º LUGAR</div>
                    <div className="w-full bg-gradient-to-t from-orange-800 to-orange-700 rounded-t-lg h-20 flex flex-col justify-end pb-2 relative border-t-2 border-orange-500">
                       <span className="text-white font-bold text-sm leading-tight px-1 truncate w-full">{thirdPlace?.teamName || '-'}</span>
                       <span className="text-xs text-orange-200">{thirdPlace?.totalPoints || 0} pts</span>
                    </div>
                 </div>
              </div>

              {/* List */}
              <div className="w-full bg-gray-900/50 rounded-lg border border-gray-800 p-3">
                 <div className="grid grid-cols-[20px_1fr_40px] gap-2 text-[10px] font-bold text-gray-500 uppercase mb-2 border-b border-gray-800 pb-1">
                    <div>#</div><div className="text-left">Time</div><div>Pts</div>
                 </div>
                 <div className="space-y-1.5">
                    {others.length === 0 ? <div className="text-xs text-gray-600 py-2">Sem mais times</div> : 
                      others.map((team, idx) => (
                        <div key={team.teamId} className="grid grid-cols-[20px_1fr_40px] gap-2 text-xs items-center">
                           <div className="font-mono text-gray-500">{idx + 4}</div>
                           <div className="text-left text-gray-200 font-medium truncate">{team.teamName}</div>
                           <div className="text-primary font-bold">{team.totalPoints}</div>
                        </div>
                      ))
                    }
                 </div>
              </div>

              <div className="mt-6 text-[10px] text-gray-600 font-mono flex items-center gap-1">
                 Gerado por JhanTraining <Flame size={10} className="text-primary"/>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderHelpModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-panel w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-theme shadow-theme relative flex flex-col">
        <div className="sticky top-0 bg-panel/95 backdrop-blur-md p-6 border-b border-theme flex justify-between items-center z-10">
          <h2 className="text-2xl font-display font-bold text-main flex items-center gap-2">
            <Info className="text-primary" /> Instruções & Ajuda
          </h2>
          <button 
            onClick={() => setShowHelp(false)}
            className="text-muted hover:text-main transition-colors bg-background p-2 rounded-full border border-theme"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
           <p className="text-muted">Utilize esta plataforma para organizar seus treinos. Cadastre times, sorteie mapas e gere relatórios automáticos.</p>
           <div className="bg-background p-4 rounded border border-theme">
             <h4 className="font-bold text-primary mb-2">Dica Rápida</h4>
             <p className="text-sm text-muted">No modo Premium, você pode arrastar os nomes dos times sobre a imagem do mapa para definir calls precisas.</p>
           </div>
           
           <h4 className="font-bold text-main">Temas</h4>
           <p className="text-muted text-sm">Use o botão de configurações no topo para alternar entre modo Claro e Escuro, ou mudar a cor de destaque.</p>
        </div>
        <div className="p-6 border-t border-theme bg-background text-center">
          <Button onClick={() => setShowHelp(false)} className="w-full md:w-auto">Entendi</Button>
        </div>
      </div>
    </div>
  );

  // --- Render Steps ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-6 space-y-8 animate-fade-in relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] transition-colors duration-500"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] transition-colors duration-500"></div>
      </div>

      <div className="relative z-10">
        <div className="relative inline-block">
          <div className="absolute -inset-6 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
          <Crown size={80} className="text-primary relative z-10 drop-shadow-[0_0_15px_rgba(var(--color-primary),0.5)] transition-colors duration-500" />
        </div>
      </div>
      
      <div className="z-10 space-y-4">
        <h1 className="flex flex-col items-center justify-center text-5xl md:text-8xl font-display font-extrabold tracking-tighter leading-tight drop-shadow-2xl">
          <span className="text-3xl md:text-5xl text-main font-extrabold tracking-widest mb-[-5px] md:mb-[-15px] z-10 opacity-90">FREE FIRE</span>
          <span className="text-primary transition-colors duration-500 drop-shadow-[0_0_20px_rgba(var(--color-primary),0.4)]">CRIADOR DE</span>
          <span className="text-primary transition-colors duration-500 drop-shadow-[0_0_20px_rgba(var(--color-primary),0.4)]">TREINOS</span>
        </h1>
        <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed border-t border-theme pt-6 mt-6">
          Para managers, Coachs e Analistas que buscam um treino organizado e profissional.
        </p>
      </div>

      <div className="z-10 flex flex-col items-center gap-6 mt-8">
        <div className="flex gap-4">
          <Button size="lg" onClick={handleStart} className="px-10">
            INICIAR PLATAFORMA <ArrowRight />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setShowHelp(true)}>
            <Info size={20} /> COMO FUNCIONA
          </Button>
        </div>

        <div className="flex items-center gap-4 bg-panel/50 p-2 rounded-xl border border-theme backdrop-blur-sm">
           <span className="text-xs text-muted uppercase font-bold tracking-widest px-2">Modo Visual</span>
           <button 
             onClick={() => setIsDarkMode(true)}
             className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm ${isDarkMode ? 'bg-primary text-black font-bold' : 'text-muted hover:text-main'}`}
           >
             <Moon size={16}/> Escuro
           </button>
           <button 
             onClick={() => setIsDarkMode(false)}
             className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm ${!isDarkMode ? 'bg-primary text-black font-bold' : 'text-muted hover:text-main'}`}
           >
             <Sun size={16}/> Claro
           </button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const currentMapOrder = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);
    const sortedLeaderboard = leaderboard;
    
    return (
      <div className="flex-1 flex flex-col bg-background p-4 animate-fade-in">
        <div className="flex justify-between items-center mb-6 bg-panel p-4 rounded-xl border border-theme">
           <h2 className="text-2xl font-bold text-primary flex items-center gap-3">
             <Monitor size={24} /> DASHBOARD EM TEMPO REAL
           </h2>
           <div className="flex gap-2">
              <div className="flex bg-background rounded-lg p-1 border border-theme">
                 <button 
                   onClick={() => setDashboardTab('leaderboard')}
                   className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${dashboardTab === 'leaderboard' ? 'bg-primary text-black' : 'text-muted hover:text-main'}`}
                 >
                   CLASSIFICAÇÃO
                 </button>
                 <button 
                   onClick={() => setDashboardTab('strategy')}
                   className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${dashboardTab === 'strategy' ? 'bg-primary text-black' : 'text-muted hover:text-main'}`}
                 >
                   ESTRATÉGIA
                 </button>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-hidden">
           {dashboardTab === 'leaderboard' ? (
             <div className="h-full overflow-y-auto bg-panel rounded-xl border border-theme shadow-theme p-6">
                <table className="w-full text-sm md:text-base">
                  <thead className="bg-background text-muted uppercase text-xs tracking-wider sticky top-0 z-10 border-b border-theme">
                    <tr>
                      <th className="p-4 text-center w-16">#</th>
                      <th className="p-4 text-left">Time</th>
                      <th className="p-4 text-center text-main">PTS</th>
                      <th className="p-4 text-center">Colocação</th>
                      <th className="p-4 text-center">Kills</th>
                      <th className="p-4 text-center">Booyahs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/20">
                    {sortedLeaderboard.map((data, index) => (
                      <tr key={data.teamId} className={`${index === 0 ? 'bg-primary/10' : 'hover:bg-primary/5'} transition-colors`}>
                        <td className="p-4 text-center font-mono font-bold text-muted">{index + 1}</td>
                        <td className="p-4 font-semibold text-main flex items-center gap-2">
                          {index === 0 && <Crown size={16} className="text-primary fill-current" />}
                          {data.teamName}
                        </td>
                        <td className="p-4 text-center font-bold text-xl text-primary">{data.totalPoints}</td>
                        <td className="p-4 text-center text-muted">{data.placementPoints}</td>
                        <td className="p-4 text-center text-muted">{data.totalKills}</td>
                        <td className="p-4 text-center text-muted">{data.booyahs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           ) : (
             <div className="h-full overflow-y-auto pr-2">
                {mode === 'basic' ? (
                   <div className="bg-panel rounded-xl border border-theme p-6">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-background text-primary uppercase text-sm font-bold tracking-wider border-b border-theme">
                            <th className="p-4 border-r border-theme">TIME</th>
                            {currentMapOrder.map(mapId => (
                              <th key={mapId} className="p-4 border-r border-theme">{MAPS.find(m => m.id === mapId)?.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/20">
                          {teams.map(team => (
                            <tr key={team.id} className="hover:bg-primary/5">
                              <td className="p-3 font-semibold text-main border-r border-theme bg-panel">{team.name}</td>
                              {currentMapOrder.map(mapId => {
                                const currentSelection = basicSelections[mapId]?.[team.id] || "-";
                                const isConflict = Object.entries(basicSelections[mapId] || {}).some(
                                  ([tId, city]) => tId !== team.id && city === currentSelection && city !== "" && city !== "-"
                                );
                                return (
                                  <td key={mapId} className={`p-3 border-r border-theme ${isConflict ? 'text-red-500 font-bold bg-red-500/10' : 'text-muted'}`}>
                                    {currentSelection}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                ) : (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {currentMapOrder.map(mapId => {
                        const mapData = MAPS.find(m => m.id === mapId);
                        return mapData ? (
                          <DraggableMap
                            key={mapId}
                            mapName={mapData.name}
                            image={mapData.image}
                            teams={teams}
                            positions={premiumPositions[mapId] || {}}
                            onPositionChange={() => {}}
                            readOnly={true}
                          />
                        ) : null;
                      })}
                   </div>
                )}
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderModeSelect = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <h2 className="text-4xl font-display font-bold mb-12 text-main">ESCOLHA O MODO</h2>
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button onClick={() => selectMode('basic')} className="group relative bg-panel p-8 rounded-2xl border border-theme hover:border-primary transition-all hover:scale-[1.02] text-left shadow-theme">
          <div className="mb-4 bg-background w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors border border-theme">
            <LayoutGrid className="text-muted group-hover:text-black"/>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-main">Treino Básico</h3>
          <ul className="text-muted space-y-2 text-sm"><li>• Até 15 times</li><li>• Tabela de Calls Clássica</li><li>• Roleta de Mapas</li></ul>
        </button>

        <button onClick={() => selectMode('premium')} className="group relative bg-gradient-to-br from-panel to-background p-8 rounded-2xl border border-primary/30 hover:border-primary transition-all hover:scale-[1.02] text-left shadow-[0_0_30px_rgba(var(--color-primary),0.1)]">
          <div className="absolute top-4 right-4 bg-primary text-black text-xs font-bold px-2 py-1 rounded">PREMIUM</div>
          <div className="mb-4 bg-background w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors border border-theme">
            <Trophy className="text-muted group-hover:text-black"/>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-main">Treino Premium</h3>
          <ul className="text-muted space-y-2 text-sm"><li>• Tudo do Básico</li><li>• <span className="text-primary">Posicionamento Visual</span></li><li>• Relatórios Completos</li></ul>
        </button>
      </div>
    </div>
  );

  const renderTeamRegister = () => (
    <div className="flex-1 w-full p-6 max-w-4xl mx-auto flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
           <h2 className="text-3xl font-display font-bold text-main">CADASTRO DE TIMES <span className="text-primary text-lg ml-2">({teams.length}/15)</span></h2>
           <div className="text-muted text-sm mt-1">Nome do Treino:</div>
        </div>
        
        {/* Input para Nome do Treino */}
        <div className="flex items-center gap-2 bg-panel border-b-2 border-primary px-3 py-2 w-full md:w-auto">
           <Edit2 size={16} className="text-primary"/>
           <input 
             type="text" 
             value={trainingName} 
             onChange={(e) => setTrainingName(e.target.value)}
             className="bg-transparent border-none text-xl font-bold text-main focus:outline-none placeholder-gray-600 w-full"
             placeholder="Nome do Evento/Treino"
           />
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <input 
          type="text" 
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTeam()}
          placeholder="Nome do Time..."
          className="flex-1 bg-panel border border-theme rounded-lg px-4 py-3 text-main focus:outline-none focus:border-primary transition-colors"
          disabled={teams.length >= 15}
        />
        <Button onClick={addTeam} disabled={!newTeamName.trim() || teams.length >= 15}>ADICIONAR</Button>
      </div>

      <div className="flex-1 bg-panel rounded-xl border border-theme p-4 mb-8 overflow-y-auto shadow-theme">
        {teams.length === 0 ? <div className="h-full flex items-center justify-center text-muted">Nenhum time cadastrado ainda.</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teams.map((team, idx) => (
              <div key={team.id} className="flex items-center justify-between bg-background p-3 rounded border border-theme group hover:border-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-muted font-mono text-sm w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                  <input className="bg-transparent border-none focus:outline-none text-main font-medium w-full" value={team.name} onChange={(e) => updateTeamName(team.id, e.target.value)} />
                  <Edit2 size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button onClick={() => confirmDeleteTeam(team.id)} className="text-muted hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={goToSort} size="lg" disabled={teams.length === 0}>GERAR TABELA DE TREINO <ArrowRight /></Button>
      </div>
    </div>
  );

  const renderMapSort = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-display font-bold mb-12 text-main">SORTEIO DOS MAPAS</h2>
      <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-5xl">
        {(shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id)).map((mapId, index) => {
           const mapData = MAPS.find(m => m.id === mapId);
           return (
             <div key={mapId} className={`w-32 h-40 md:w-40 md:h-56 rounded-xl overflow-hidden relative border-2 transition-all duration-300 transform ${isSpinning ? 'scale-95 opacity-70 border-theme' : 'scale-100 border-primary shadow-[0_0_20px_rgba(var(--color-primary),0.2)]'}`}>
                <img src={mapData?.image} alt={mapData?.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-center pb-4">
                  <span className="font-bold text-white uppercase text-sm md:text-lg">{index + 1}. {mapData?.name}</span>
                </div>
             </div>
           );
        })}
      </div>
      <div className="flex gap-4">
        <Button onClick={spinRoulette} disabled={isSpinning} variant="secondary"><RefreshCw className={isSpinning ? 'animate-spin' : ''} /> {shuffledMaps.length > 0 ? 'SORTEAR NOVAMENTE' : 'SORTEAR ORDEM'}</Button>
        {shuffledMaps.length > 0 && <Button onClick={startStrategy} disabled={isSpinning}>CONFIRMAR ORDEM <ArrowRight /></Button>}
      </div>
    </div>
  );

  const renderStrategy = () => {
    const currentMapOrder = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);

    return (
      <div className="flex-1 flex flex-col w-full p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 no-print gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-main">ESTRATÉGIA DE QUEDAS</h2>
            <p className="text-muted text-sm">Configure as calls e posicionamentos</p>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Button variant="secondary" onClick={() => setShowStrategyVisualizer(true)}>
              <Eye size={18} /> GERAR VISUALIZAÇÃO
            </Button>
            <Button onClick={() => setStep(Step.SCORING)}>
              INICIAR PARTIDAS <Play size={18} fill="currentColor" />
            </Button>
          </div>
        </div>

        {/* Warnings Selection */}
        <div className="mb-8 bg-panel p-4 rounded-xl border border-theme">
          <h3 className="text-primary font-bold mb-3 flex items-center gap-2"><AlertTriangle size={18}/> REGRAS & ATENÇÃO</h3>
          <div className="flex flex-wrap gap-2">
            {WARNINGS.map((warn, i) => (
              <button
                key={i}
                onClick={() => toggleWarning(warn)}
                className={`px-3 py-1.5 rounded text-xs md:text-sm font-medium border transition-all ${selectedWarnings.includes(warn) ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-background border-theme text-muted hover:border-muted'}`}
              >
                {warn}
              </button>
            ))}
          </div>
        </div>

        {mode === 'basic' ? (
          <div className="overflow-x-auto bg-panel rounded-xl border border-theme shadow-theme">
             <table className="w-full text-left border-collapse min-w-[1200px]">
               <thead>
                 <tr className="bg-background text-primary uppercase text-xs tracking-wider border-b border-theme">
                   <th className="p-4 sticky left-0 bg-background z-10 w-48 border-r border-theme">TIME</th>
                   {currentMapOrder.map(mapId => (
                     <th key={mapId} className="p-4 font-bold border-r border-theme">{MAPS.find(m => m.id === mapId)?.name}</th>
                   ))}
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-800/20">
                 {teams.map(team => (
                   <tr key={team.id} className="hover:bg-primary/5 transition-colors">
                     <td className="p-3 sticky left-0 bg-panel font-semibold text-main border-r border-theme z-10">{team.name}</td>
                     {currentMapOrder.map(mapId => {
                       const mapData = MAPS.find(m => m.id === mapId);
                       const currentSelection = basicSelections[mapId]?.[team.id] || "";
                       const isConflict = Object.entries(basicSelections[mapId] || {}).some(([tId, city]) => tId !== team.id && city === currentSelection && city !== "");

                       return (
                         <td key={`${team.id}-${mapId}`} className="p-2 border-r border-theme">
                           <select 
                            className={`w-full bg-background border rounded px-2 py-1.5 text-sm appearance-none cursor-pointer focus:outline-none focus:border-primary ${isConflict ? 'border-red-500 text-red-500 bg-red-500/10 font-bold animate-pulse' : 'border-theme text-muted'}`}
                            value={currentSelection}
                            onChange={(e) => handleCitySelect(mapId, team.id, e.target.value)}
                           >
                             <option value="">-- Selecione --</option>
                             {mapData?.cities.map(city => <option key={city} value={city}>{city}</option>)}
                           </select>
                         </td>
                       );
                     })}
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMapOrder.map((mapId, index) => {
              const mapData = MAPS.find(m => m.id === mapId);
              if (!mapData) return null;
              return (
                <div key={mapId} className="print-break">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-muted text-xs font-mono">MAPA {index + 1}</span>
                  </div>
                  <DraggableMap
                    mapName={mapData.name}
                    image={mapData.image}
                    teams={teams}
                    positions={premiumPositions[mapId] || {}}
                    onPositionChange={(tId, pos) => handlePremiumPosition(mapId, tId, pos)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderScoring = () => (
      <div className="flex-1 w-full p-6 max-w-6xl mx-auto">
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-3xl font-display font-bold text-main">REGISTRO DE PONTUAÇÃO</h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep(Step.DASHBOARD)}>
                 <Monitor size={18} /> MODO ESPECTADOR
              </Button>
              <Button onClick={() => setStep(Step.REPORT)}>FINALIZAR E VER RELATÓRIO <Trophy size={18} /></Button>
            </div>
         </div>
         <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
           {[0,1,2,3,4,5].map(idx => (
             <button key={idx} onClick={() => setCurrentMatchTab(idx)} className={`px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-all ${currentMatchTab === idx ? 'bg-primary text-black shadow-[0_0_15px_rgba(var(--color-primary),0.4)]' : 'bg-panel text-muted hover:bg-background border border-theme'}`}>
               QUEDA {idx + 1}
               <span className="block text-[10px] font-normal opacity-70">{shuffledMaps[idx] ? MAPS.find(m => m.id === shuffledMaps[idx])?.name : `Mapa ${idx+1}`}</span>
             </button>
           ))}
         </div>
         <div className="bg-panel rounded-xl border border-theme p-6 shadow-theme animate-fade-in">
            <div className="grid grid-cols-[3rem_1fr_1fr_1fr_4rem] gap-4 mb-4 px-4 text-muted text-sm font-bold uppercase tracking-wider border-b border-theme pb-2">
              <div className="text-center">#</div><div>TIME</div><div className="text-center">RANK (1-15)</div><div className="text-center">ABATES</div><div className="text-center">TOTAL</div>
            </div>
            <div className="space-y-2">
              {teams.map((team, idx) => {
                const score = matchScores[currentMatchTab]?.[team.id] || { rank: '', kills: '' };
                const rankPts = typeof score.rank === 'number' ? (POINTS_SYSTEM[score.rank] || 0) : 0;
                const killPts = typeof score.kills === 'number' ? score.kills : 0;
                const total = rankPts + killPts;
                const isBooyah = score.rank === 1;

                return (
                  <div key={team.id} className={`grid grid-cols-[3rem_1fr_1fr_1fr_4rem] gap-4 items-center bg-background p-3 rounded-lg border ${isBooyah ? 'border-primary/50 bg-primary/5' : 'border-theme'}`}>
                    <div className="text-center font-mono text-muted">{idx + 1}</div>
                    <div className="font-semibold text-main truncate">{team.name}</div>
                    <div className="flex justify-center"><input type="number" min="1" max="15" placeholder="Pos" className="w-20 bg-panel border border-theme rounded p-2 text-center text-main focus:border-primary focus:outline-none" value={score.rank} onChange={(e) => handleScoreChange(currentMatchTab, team.id, 'rank', e.target.value)} /></div>
                    <div className="flex justify-center"><input type="number" min="0" placeholder="Kills" className="w-20 bg-panel border border-theme rounded p-2 text-center text-main focus:border-primary focus:outline-none" value={score.kills} onChange={(e) => handleScoreChange(currentMatchTab, team.id, 'kills', e.target.value)} /></div>
                    <div className="text-center font-bold text-primary text-lg">{total}</div>
                  </div>
                );
              })}
            </div>
         </div>
      </div>
  );

  const renderReport = () => {
    const sortedLeaderboard = leaderboard;
    const champion = sortedLeaderboard[0];
    const secondPlace = sortedLeaderboard[1];
    const thirdPlace = sortedLeaderboard[2];

    const topFraggerTeam = [...sortedLeaderboard].sort((a,b) => b.totalKills - a.totalKills)[0];
    const topBooyahTeam = [...sortedLeaderboard].sort((a,b) => b.booyahs - a.booyahs)[0];

    return (
      <div className="flex-1 w-full p-4 md:p-8 bg-background">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-end border-b border-theme pb-6 gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold text-main mb-2 tracking-tight">RELATÓRIO <span className="text-primary">FINAL</span></h1>
              <p className="text-muted">Análise completa e resultados do treino: <span className="text-primary font-bold">{trainingName}</span></p>
            </div>
            <div className="flex gap-2">
               <Button onClick={() => setShowSocialBanner(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white shadow-lg hover:opacity-90"><Instagram size={18}/> GERAR BANNER SOCIAL</Button>
               <Button variant="secondary" onClick={() => window.print()}><Download size={18} /> SALVAR PDF</Button>
            </div>
          </div>

          {/* Podium Section */}
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pb-8 min-h-[300px]">
            {/* 2nd Place */}
            {secondPlace && (
              <div className="order-2 md:order-1 w-full md:w-1/4 bg-gradient-to-t from-gray-500/20 to-transparent p-6 rounded-t-2xl border-t-4 border-gray-400 flex flex-col items-center justify-end h-[220px] relative">
                <div className="text-gray-400 font-bold uppercase tracking-widest mb-2 text-sm">Vice-Campeão</div>
                <h3 className="text-2xl font-display font-bold text-white text-center mb-2 leading-tight">{secondPlace.teamName}</h3>
                <div className="text-3xl font-bold text-gray-300">{secondPlace.totalPoints}<span className="text-xs text-gray-500 ml-1">PTS</span></div>
                <div className="absolute -top-4 bg-gray-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border border-gray-500">2</div>
              </div>
            )}
            
            {/* 1st Place - Champion */}
            {champion && (
              <div className="order-1 md:order-2 w-full md:w-1/3 bg-gradient-to-t from-yellow-500/20 to-transparent p-8 rounded-t-2xl border-t-4 border-primary flex flex-col items-center justify-end h-[280px] relative shadow-[0_-10px_40px_rgba(var(--color-primary),0.1)]">
                <Crown size={48} className="text-primary mb-4 drop-shadow-[0_0_10px_rgba(var(--color-primary),0.5)] animate-bounce" />
                <h2 className="text-4xl font-display font-black text-white text-center mb-2 leading-none">{champion.teamName}</h2>
                <div className="text-5xl font-bold text-primary">{champion.totalPoints}<span className="text-sm text-yellow-200/50 ml-1">PTS</span></div>
                <div className="mt-4 flex gap-4 text-sm font-bold text-yellow-100/70">
                   <span className="flex items-center gap-1"><Target size={14}/> {champion.totalKills} Kills</span>
                   <span className="flex items-center gap-1"><Trophy size={14}/> {champion.booyahs} Booyahs</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {thirdPlace && (
               <div className="order-3 w-full md:w-1/4 bg-gradient-to-t from-orange-500/20 to-transparent p-6 rounded-t-2xl border-t-4 border-orange-600 flex flex-col items-center justify-end h-[180px] relative">
                <div className="text-orange-400 font-bold uppercase tracking-widest mb-2 text-sm">3º Lugar</div>
                <h3 className="text-xl font-display font-bold text-white text-center mb-2 leading-tight">{thirdPlace.teamName}</h3>
                <div className="text-3xl font-bold text-orange-200">{thirdPlace.totalPoints}<span className="text-xs text-orange-400 ml-1">PTS</span></div>
                <div className="absolute -top-4 bg-orange-800 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border border-orange-600">3</div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Leaderboard */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-main uppercase tracking-widest"><FileText className="text-primary" size={20}/> Classificação Geral</h2>
              <div className="bg-panel rounded-xl overflow-hidden border border-theme shadow-xl">
                <table className="w-full text-sm">
                  <thead className="bg-background text-muted uppercase text-xs tracking-wider border-b border-theme">
                    <tr>
                      <th className="p-4 text-center w-16">Rank</th>
                      <th className="p-4 text-left">Time</th>
                      <th className="p-4 text-center text-main">PTS</th>
                      <th className="p-4 text-center hidden sm:table-cell">Kills</th>
                      <th className="p-4 text-center hidden sm:table-cell">Booyahs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/20">
                    {sortedLeaderboard.map((data, index) => {
                      let rankBadge;
                      let rowClass = "hover:bg-primary/5 transition-colors";
                      if (index === 0) {
                         rankBadge = <div className="w-6 h-6 rounded bg-primary text-black font-bold flex items-center justify-center mx-auto text-xs">1</div>;
                         rowClass = "bg-primary/5 hover:bg-primary/10";
                      } else if (index === 1) {
                         rankBadge = <div className="w-6 h-6 rounded bg-gray-400 text-black font-bold flex items-center justify-center mx-auto text-xs">2</div>;
                      } else if (index === 2) {
                         rankBadge = <div className="w-6 h-6 rounded bg-orange-600 text-white font-bold flex items-center justify-center mx-auto text-xs">3</div>;
                      } else {
                         rankBadge = <span className="font-mono font-bold text-muted">{index + 1}</span>;
                      }

                      return (
                        <tr key={data.teamId} className={rowClass}>
                          <td className="p-4 text-center">{rankBadge}</td>
                          <td className="p-4 font-semibold text-main text-base">{data.teamName}</td>
                          <td className="p-4 text-center font-bold text-lg text-primary">{data.totalPoints}</td>
                          <td className="p-4 text-center text-muted hidden sm:table-cell">{data.totalKills}</td>
                          <td className="p-4 text-center text-muted hidden sm:table-cell">{data.booyahs}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Highlights & Stats */}
            <div className="space-y-6">
               <h2 className="text-xl font-bold flex items-center gap-2 text-main uppercase tracking-widest"><Medal className="text-primary" size={20}/> Destaques</h2>
              
              {/* MVP Kills */}
              {topFraggerTeam && (
                <div className="bg-panel p-6 rounded-xl border border-red-900/50 relative overflow-hidden group hover:border-red-500 transition-colors">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={60} className="text-red-500"/></div>
                   <div className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">MVP de Abates</div>
                   <div className="text-2xl font-bold text-white mb-2">{topFraggerTeam.teamName}</div>
                   <div className="flex items-center gap-2">
                      <span className="text-4xl font-black text-red-500">{topFraggerTeam.totalKills}</span>
                      <span className="text-xs text-muted uppercase">Abates<br/>Totais</span>
                   </div>
                </div>
              )}

              {/* MVP Booyah */}
              {topBooyahTeam && (
                <div className="bg-panel p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:border-primary transition-colors">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Trophy size={60} className="text-primary"/></div>
                   <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Rei do Booyah</div>
                   <div className="text-2xl font-bold text-white mb-2">{topBooyahTeam.teamName}</div>
                   <div className="flex items-center gap-2">
                      <span className="text-4xl font-black text-primary">{topBooyahTeam.booyahs}</span>
                      <span className="text-xs text-muted uppercase">Vitórias<br/>Conquistadas</span>
                   </div>
                </div>
              )}

              {/* Mini Chart */}
              <div className="bg-panel p-6 rounded-xl border border-theme h-64 flex flex-col">
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-4">Pontuação Top 5</h3>
                <div className="flex-1 -ml-4" style={{minHeight: '200px'}}>
                  {/* Fixed height to prevent collapse */}
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sortedLeaderboard.slice(0, 5)} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="teamName" type="category" width={80} tick={{fontSize: 10, fill: '#888'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)', color: 'var(--text-main)', fontSize: '12px' }} />
                        <Bar dataKey="totalPoints" fill="rgb(var(--color-primary))" radius={[0, 4, 4, 0]} barSize={15}>
                           {sortedLeaderboard.slice(0,5).map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? 'rgb(var(--color-primary))' : '#555'} />)}
                        </Bar>
                      </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    );
  };

  return (
    <div className="bg-background min-h-screen text-main font-sans selection:bg-primary selection:text-black relative flex flex-col transition-colors duration-300">
      {/* --- Top Floating Controls --- */}
      <div className="fixed top-4 right-4 z-50 no-print flex gap-2 bg-panel/80 backdrop-blur-md p-2 rounded-xl border border-theme shadow-lg items-center">
         {/* Back Button (Only if not Home) */}
         {step !== Step.HOME && (
           <Button variant="ghost" size="sm" onClick={handleBack} className="!p-2" title="Voltar">
             <ArrowLeft size={18} />
           </Button>
         )}

         {/* Home Button (Only if not Home) */}
         {step !== Step.HOME && (
           <Button variant="ghost" size="sm" onClick={handleHome} className="!p-2" title="Início">
             <Home size={18} />
           </Button>
         )}

         {/* Divider */}
         {step !== Step.HOME && <div className="w-px h-6 bg-theme/20 mx-1"></div>}

         {/* Help Button */}
         <Button variant="ghost" size="sm" onClick={() => setShowHelp(true)} className="!p-2" title="Ajuda">
           <HelpCircle size={18} /> <span className="hidden sm:inline text-xs font-bold">Ajuda</span>
         </Button>

         {/* Mode Toggle */}
         <button 
           onClick={() => setIsDarkMode(!isDarkMode)}
           className="p-2 rounded-lg hover:bg-background text-muted hover:text-main transition-colors"
           title={isDarkMode ? "Mudar para Claro" : "Mudar para Escuro"}
         >
           {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
         </button>

         {/* Theme Palette */}
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

      {showHelp && renderHelpModal()}
      {renderDeleteModal()}
      {renderVisualizerModal()}
      {renderSocialBanner()}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pt-24 px-4 md:px-0">
        {step === Step.HOME && renderHome()}
        {step === Step.MODE_SELECT && renderModeSelect()}
        {step === Step.TEAM_REGISTER && renderTeamRegister()}
        {step === Step.MAP_SORT && renderMapSort()}
        {step === Step.STRATEGY && renderStrategy()}
        {step === Step.SCORING && renderScoring()}
        {step === Step.REPORT && renderReport()}
        {step === Step.DASHBOARD && renderDashboard()}
      </div>

      {/* Persistent Footer */}
      <footer className="w-full py-6 text-center text-muted text-xs border-t border-theme mt-auto bg-panel/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-2">
          <span className="font-semibold">Free Fire Criador de Treinos • {new Date().getFullYear()}</span>
          <a 
            href="https://www.instagram.com/jhanmedeiros/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-primary transition-colors flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-theme hover:border-primary"
          >
            Desenvolvido por <span className="font-bold text-main">Jhan Medeiros</span> <Instagram size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
}

// Main App component wrapper with Error Boundary
function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

export default App;