import React, { useState, useEffect, useMemo, ErrorInfo, useRef } from 'react';
import { Users, Trophy, Crown, AlertTriangle, ArrowRight, ArrowLeft, Home, Download, RefreshCw, BarChart2, Save, Trash2, Edit2, Play, LayoutGrid, HelpCircle, X, Info, FileText, Instagram, Eye, Check, Palette, Monitor, Moon, Sun, Medal, Target, Flame, Share2, Calendar, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
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

const TEAM_COLORS = [
    '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', 
    '#007AFF', '#5856D6', '#FF2D55', '#A2845E', '#8E8E93',
    '#E056FD', '#22A6B3', '#F0932B', '#6AB04C', '#EB4D4B'
];

// Error Boundary Component
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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

class ErrorBoundaryWrapper extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    render() {
        return <ErrorBoundary>{this.props.children}</ErrorBoundary>
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
  
  // Strategy State
  const [shuffledMaps, setShuffledMaps] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [basicSelections, setBasicSelections] = useState<Record<string, Record<string, string>>>({});
  const [premiumPositions, setPremiumPositions] = useState<Record<string, Record<string, Position>>>({});
  const [selectedWarnings, setSelectedWarnings] = useState<string[]>([]);
  const [activeStrategyMapIndex, setActiveStrategyMapIndex] = useState(0); // For mobile view

  // Scoring State
  const [matchScores, setMatchScores] = useState<Record<number, Record<string, MatchScore>>>({});
  const [currentMatchTab, setCurrentMatchTab] = useState(0);

  // Dashboard State
  const [dashboardTab, setDashboardTab] = useState<'leaderboard' | 'strategy'>('leaderboard');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getRandomColor = () => {
      return TEAM_COLORS[Math.floor(Math.random() * TEAM_COLORS.length)];
  }

  const addTeam = () => {
    if (newTeamName.trim() && teams.length < 15) {
      setTeams([...teams, { 
          id: Date.now().toString(), 
          name: newTeamName.trim(),
          color: getRandomColor()
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
              if(json.trainingName) setTrainingName(json.trainingName);
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

  // --- Render Functions ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-primary blur-[100px] opacity-20 rounded-full"></div>
        <Crown size={80} className="text-primary relative z-10 animate-bounce-slow" />
      </div>
      <h1 className="text-5xl md:text-7xl font-display font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
        Criador de <span className="text-primary">Treino</span>
      </h1>
      <p className="text-xl text-muted max-w-2xl mb-12 leading-relaxed">
        A plataforma definitiva para organizar seus treinos.
        <br/>Planeje rotas, sorteie mapas e gere leaderboards automáticos.
      </p>
      
      <Button size="lg" onClick={handleStart} className="group text-xl px-12 py-6">
        COMEÇAR AGORA 
        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
      </Button>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full">
        {[
          { icon: <LayoutGrid className="text-primary"/>, title: "Organização Completa", desc: "Gerencie times, pontos e tabelas em um só lugar." },
          { icon: <Target className="text-primary"/>, title: "Estratégia Visual", desc: "Defina calls arrastando os times direto no mapa." },
          { icon: <BarChart2 className="text-primary"/>, title: "Relatórios Automáticos", desc: "Gere imagens para story e textos para WhatsApp." }
        ].map((feat, i) => (
          <div key={i} className="bg-panel border border-theme p-6 rounded-xl hover:border-primary transition-colors">
            <div className="mb-4 bg-background w-12 h-12 flex items-center justify-center rounded-lg border border-theme">{feat.icon}</div>
            <h3 className="font-bold text-lg mb-2 text-main">{feat.title}</h3>
            <p className="text-sm text-muted">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in w-full max-w-5xl mx-auto">
      <h2 className="text-3xl font-display font-bold mb-12 text-center">ESCOLHA O MODO DE OPERAÇÃO</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Basic Mode */}
        <div 
          onClick={() => selectMode('basic')}
          className={`
            cursor-pointer group relative overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300
            ${mode === 'basic' ? 'border-primary bg-panel shadow-[0_0_30px_rgba(var(--color-primary),0.1)]' : 'border-theme bg-background hover:border-gray-600'}
          `}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileText size={120} />
          </div>
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <FileText className="text-primary" /> MODO BÁSICO
            </h3>
            <ul className="space-y-3 mb-8 text-muted">
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Seleção via Lista Suspensa</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Rápido e Leve</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Ideal para celulares fracos</li>
            </ul>
            <Button variant={mode === 'basic' ? 'primary' : 'secondary'} className="w-full">SELECIONAR BÁSICO</Button>
          </div>
        </div>

        {/* Premium Mode */}
        <div 
          onClick={() => selectMode('premium')}
          className={`
            cursor-pointer group relative overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300
            ${mode === 'premium' ? 'border-primary bg-panel shadow-[0_0_30px_rgba(var(--color-primary),0.1)]' : 'border-theme bg-background hover:border-gray-600'}
          `}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
               <h3 className="text-2xl font-bold flex items-center gap-3">
                 <Target className="text-primary" /> MODO PREMIUM
               </h3>
               <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">RECOMENDADO</span>
            </div>
            <ul className="space-y-3 mb-8 text-muted">
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Mapa Interativo (Drag & Drop)</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Zoom e Precisão</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Visualização Profissional</li>
            </ul>
            <Button variant={mode === 'premium' ? 'primary' : 'secondary'} className="w-full">SELECIONAR PREMIUM</Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMapSort = () => {
    const displayMaps = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);

    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-display font-bold mb-2 text-center">SORTEIO DE MAPAS</h2>
        <p className="text-muted mb-8 text-center">Defina a ordem das quedas para o treino.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full mb-12">
            {displayMaps.map((mapId, index) => {
                const mapData = MAPS.find(m => m.id === mapId);
                return (
                    <div key={index} className={`relative group aspect-[3/4] rounded-xl overflow-hidden border border-theme bg-panel ${isSpinning ? 'animate-pulse' : ''}`}>
                         <img src={mapData?.image} alt={mapData?.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                             <span className="text-3xl font-black text-white/20 absolute top-2 left-3">{index + 1}</span>
                             <h4 className="text-white font-bold uppercase tracking-widest text-sm shadow-black drop-shadow-md">{mapData?.name}</h4>
                         </div>
                    </div>
                )
            })}
        </div>

        <div className="flex gap-4">
             <Button variant="secondary" onClick={spinRoulette} disabled={isSpinning}>
                <RefreshCw size={20} className={isSpinning ? 'animate-spin' : ''} />
                {isSpinning ? 'SORTEANDO...' : 'GIRAR ROLETA'}
             </Button>
             <Button onClick={startStrategy} disabled={isSpinning}>
                CONTINUAR <ArrowRight size={20}/>
             </Button>
        </div>
      </div>
    );
  };
  
  const renderScoring = () => {
    const totalMatches = shuffledMaps.length > 0 ? shuffledMaps.length : MAPS.length;
    const matchIndices = Array.from({length: totalMatches}, (_, i) => i + 1);

    return (
      <div className="flex flex-col w-full max-w-5xl mx-auto p-4 md:p-6">
         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
             <div>
                <h2 className="text-2xl font-display font-bold">PONTUAÇÃO DAS QUEDAS</h2>
                <p className="text-muted text-sm">Insira os resultados de cada partida</p>
             </div>
             <div className="flex gap-2">
                 <Button variant="secondary" onClick={() => setStep(Step.DASHBOARD)}>
                     <BarChart2 size={18}/> RESULTADOS
                 </Button>
                 <Button variant="primary" onClick={() => setStep(Step.REPORT)}>
                     <FileText size={18}/> RELATÓRIO
                 </Button>
             </div>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
             {matchIndices.map(idx => (
                 <button
                    key={idx}
                    onClick={() => setCurrentMatchTab(idx)}
                    className={`
                        px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all border
                        ${currentMatchTab === idx 
                            ? 'bg-primary text-black border-primary' 
                            : 'bg-panel text-muted border-theme hover:border-primary/50'
                        }
                    `}
                 >
                    QUEDA {idx}
                 </button>
             ))}
         </div>

         {/* Table */}
         <div className="bg-panel rounded-xl border border-theme overflow-hidden">
             {currentMatchTab > 0 ? (
                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background border-b border-theme text-xs uppercase text-muted">
                                <th className="p-4 w-16 text-center">#</th>
                                <th className="p-4">TIME</th>
                                <th className="p-4 w-32 text-center">POSIÇÃO</th>
                                <th className="p-4 w-32 text-center">KILLS</th>
                                <th className="p-4 w-32 text-right">PTS TOTAL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {teams.map((team, idx) => {
                                const score = matchScores[currentMatchTab]?.[team.id] || {};
                                const rank = typeof score.rank === 'number' ? score.rank : '';
                                const kills = typeof score.kills === 'number' ? score.kills : '';
                                const pts = (typeof rank === 'number' ? (POINTS_SYSTEM[rank] || 0) : 0) + (typeof kills === 'number' ? kills : 0);
                                
                                return (
                                    <tr key={team.id} className="hover:bg-background/50 transition-colors">
                                        <td className="p-3 text-center text-muted font-mono">{String(idx+1).padStart(2,'0')}</td>
                                        <td className="p-3 font-semibold text-main flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: team.color}}></div>
                                            {team.name}
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="number" 
                                                className="w-full bg-background border border-theme rounded px-2 py-1 text-center focus:border-primary focus:outline-none"
                                                placeholder="-"
                                                value={rank}
                                                onChange={(e) => handleScoreChange(currentMatchTab, team.id, 'rank', e.target.value)}
                                                min="1"
                                                max="12"
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input 
                                                type="number" 
                                                className="w-full bg-background border border-theme rounded px-2 py-1 text-center focus:border-primary focus:outline-none"
                                                placeholder="0"
                                                value={kills}
                                                onChange={(e) => handleScoreChange(currentMatchTab, team.id, 'kills', e.target.value)}
                                                min="0"
                                            />
                                        </td>
                                        <td className="p-3 text-right font-bold text-primary">{pts > 0 ? pts : '-'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                     </table>
                 </div>
             ) : (
                 <div className="p-8 text-center text-muted">Selecione uma queda acima para editar a pontuação.</div>
             )}
         </div>
      </div>
    );
  };

  const renderDashboard = () => (
      <div className="flex flex-col w-full p-4 md:p-8">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold">DASHBOARD & RESULTADOS</h2>
              <div className="flex gap-2">
                 <Button variant="secondary" onClick={() => setShowSocialBanner(true)}>
                    <Share2 size={18} /> GERAR BANNER
                 </Button>
                 <Button variant="ghost" onClick={() => setStep(Step.SCORING)}>
                    <Edit2 size={18} /> EDITAR
                 </Button>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Leaderboard */}
              <div className="lg:col-span-2 bg-panel rounded-xl border border-theme overflow-hidden shadow-theme">
                  <div className="p-4 border-b border-theme bg-background/50 flex justify-between items-center">
                      <h3 className="font-bold text-main flex items-center gap-2"><Trophy size={18} className="text-yellow-500"/> TABELA DE CLASSIFICAÇÃO</h3>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="bg-background text-xs uppercase text-muted border-b border-theme">
                                  <th className="p-3 text-center w-12">#</th>
                                  <th className="p-3">TIME</th>
                                  <th className="p-3 text-center">BOOYAH</th>
                                  <th className="p-3 text-center">KILLS</th>
                                  <th className="p-3 text-center font-bold text-main">TOTAL</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800/30">
                              {leaderboard.map((team, idx) => {
                                  const teamColor = teams.find(t => t.id === team.teamId)?.color || '#fff';
                                  return (
                                  <tr key={team.teamId} className={`
                                      ${idx === 0 ? 'bg-yellow-500/10' : ''} 
                                      ${idx === 1 ? 'bg-gray-400/10' : ''}
                                      ${idx === 2 ? 'bg-orange-700/10' : ''}
                                      hover:bg-primary/5 transition-colors
                                  `}>
                                      <td className="p-3 text-center font-mono font-bold">
                                          {idx === 0 && <Crown size={14} className="inline text-yellow-500 mb-1"/>}
                                          {idx + 1}
                                      </td>
                                      <td className="p-3 font-medium text-main">
                                          <div className="flex items-center gap-2">
                                              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: teamColor }}></div>
                                              {team.teamName}
                                          </div>
                                      </td>
                                      <td className="p-3 text-center text-muted">{team.booyahs}</td>
                                      <td className="p-3 text-center text-muted">{team.totalKills}</td>
                                      <td className="p-3 text-center font-bold text-primary text-lg">{team.totalPoints}</td>
                                  </tr>
                              )})}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* Stats / Charts */}
              <div className="flex flex-col gap-6">
                 {/* Top Fragger (Team with most kills) */}
                 <div className="bg-panel rounded-xl border border-theme p-6">
                    <h4 className="text-muted text-xs uppercase font-bold mb-4">TIME MAIS AGRESSIVO</h4>
                    {(() => {
                        const topKiller = [...leaderboard].sort((a,b) => b.totalKills - a.totalKills)[0];
                        const topKillerTeam = topKiller ? teams.find(t => t.id === topKiller.teamId) : null;
                        
                        return topKiller ? (
                             <div className="text-center">
                                 <div className="text-4xl font-black text-red-500 mb-1">{topKiller.totalKills}</div>
                                 <div className="text-sm text-muted uppercase tracking-widest">KILLS TOTAIS</div>
                                 <div className="mt-4 font-bold text-xl text-main flex items-center justify-center gap-2">
                                     {topKillerTeam && <div className="w-4 h-4 rounded-full" style={{ backgroundColor: topKillerTeam.color }}></div>}
                                     {topKiller.teamName}
                                 </div>
                             </div>
                        ) : <div className="text-center text-muted">Sem dados</div>
                    })()}
                 </div>

                 {/* Chart */}
                 <div className="bg-panel rounded-xl border border-theme p-4 flex-1 min-h-[200px]">
                     <h4 className="text-muted text-xs uppercase font-bold mb-4">DISTRIBUIÇÃO DE PONTOS</h4>
                     <ResponsiveContainer width="100%" height={200}>
                         <BarChart data={leaderboard.slice(0,5)}>
                             <XAxis dataKey="teamName" hide />
                             <Tooltip 
                                contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px'}}
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                             />
                             <Bar dataKey="totalPoints" radius={[4, 4, 0, 0]}>
                                 {leaderboard.slice(0,5).map((entry, index) => {
                                     const tColor = teams.find(t => t.id === entry.teamId)?.color || 'var(--color-primary)';
                                     return <Cell key={`cell-${index}`} fill={tColor} />;
                                 })}
                             </Bar>
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
              </div>
          </div>
      </div>
  );

  const renderReport = () => {
    const textReport = useMemo(() => {
        let text = `*${trainingName.toUpperCase()}* - ${new Date().toLocaleDateString()}\n\n`;
        text += `*CLASSIFICAÇÃO GERAL*\n`;
        leaderboard.forEach((team, idx) => {
            let medal = '';
            if(idx === 0) medal = '🥇';
            else if(idx === 1) medal = '🥈';
            else if(idx === 2) medal = '🥉';
            else medal = `${idx+1}º`;
            
            text += `${medal} ${team.teamName}: ${team.totalPoints}pts (${team.booyahs} Booyahs)\n`;
        });
        text += `\nGerado por Criador de Treino`;
        return text;
    }, [leaderboard, trainingName]);

    return (
        <div className="flex flex-col items-center max-w-2xl mx-auto p-6 w-full">
            <h2 className="text-2xl font-display font-bold mb-6">RELATÓRIO DE TEXTO</h2>
            <div className="w-full bg-panel border border-theme rounded-xl p-4 mb-4 relative">
                <textarea 
                    readOnly 
                    value={textReport}
                    className="w-full h-96 bg-transparent border-none resize-none focus:outline-none text-sm font-mono text-muted"
                />
                <Button 
                    className="absolute top-4 right-4" 
                    size="sm"
                    onClick={() => {
                        try {
                           navigator.clipboard.writeText(textReport);
                           alert("Copiado para área de transferência!");
                        } catch (e) {
                           alert("Erro ao copiar. Selecione o texto manualmente.");
                        }
                    }}
                >
                    <Check size={16}/> COPIAR
                </Button>
            </div>
            <Button variant="secondary" onClick={() => setStep(Step.DASHBOARD)}>VOLTAR AO DASHBOARD</Button>
        </div>
    );
  };

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
                       <td className="p-3 font-semibold text-main border-r border-theme bg-panel">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: team.color}}></div>
                                {team.name}
                            </div>
                       </td>
                       {currentMapOrder.map(mapId => {
                         const currentSelection = basicSelections[mapId]?.[team.id] || "-";
                         const isConflict = Object.entries(basicSelections[mapId] || {}).some(
                           ([tId, city]) => tId !== team.id && city === currentSelection && city !== "-" && city !== ""
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
           
           {/* Banner Content Container */}
           <div className="bg-gradient-to-b from-gray-900 to-black p-6 md:p-8 text-center flex flex-col items-center">
              {/* Header */}
              <div className="mb-6 w-full border-b border-primary/30 pb-4">
                 <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="text-primary fill-primary" size={24}/>
                    <span className="font-bold text-primary tracking-widest text-sm uppercase">Criador de Treino</span>
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
                 Gerado por Criador de Treino <Flame size={10} className="text-primary"/>
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
           
           <h4 className="font-bold text-main">Cores dos Times</h4>
           <p className="text-muted text-sm">Ao cadastrar um time, uma cor é gerada automaticamente. Você pode alterá-la clicando no círculo colorido.</p>
        </div>
        <div className="p-6 border-t border-theme bg-background text-center">
          <Button onClick={() => setShowHelp(false)} className="w-full md:w-auto">Entendi</Button>
        </div>
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
                <div className="flex items-center gap-3 w-full">
                  <span className="text-muted font-mono text-sm w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                  {/* Color Picker / Display */}
                  <div className="relative group/color">
                      <div className="w-6 h-6 rounded-full cursor-pointer shadow-sm border border-white/20" style={{ backgroundColor: team.color }}></div>
                      <div className="absolute top-full left-0 z-20 hidden group-hover/color:flex flex-col gap-2 bg-panel border border-theme p-2 rounded-lg shadow-xl w-[160px]">
                          <div className="grid grid-cols-5 gap-1">
                            {TEAM_COLORS.map(c => (
                                <button 
                                    key={c} 
                                    className="w-5 h-5 rounded-full border border-white/10 hover:scale-110 transition-transform" 
                                    style={{backgroundColor: c}}
                                    onClick={() => updateTeamColor(team.id, c)}
                                />
                            ))}
                          </div>
                          <div className="relative h-8 rounded border border-theme overflow-hidden flex items-center justify-center bg-background cursor-pointer hover:bg-white/5 transition-colors">
                            <span className="text-[10px] text-muted font-bold uppercase pointer-events-none">Cor Personalizada</span>
                            <input 
                                type="color" 
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                value={team.color}
                                onChange={(e) => updateTeamColor(team.id, e.target.value)}
                            />
                          </div>
                      </div>
                  </div>
                  
                  <input className="bg-transparent border-none focus:outline-none text-main font-medium w-full" value={team.name} onChange={(e) => updateTeamName(team.id, e.target.value)} />
                  <Edit2 size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <button onClick={() => confirmDeleteTeam(team.id)} className="text-muted hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
         <div className="hidden">
             {/* Use hidden input for file upload */}
             <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
         </div>
         <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportStrategy} disabled={teams.length === 0}><Save size={18}/> Salvar</Button>
            <Button variant="secondary" onClick={handleImportClick}><Upload size={18}/> Carregar</Button>
         </div>
        <Button onClick={goToSort} size="lg" disabled={teams.length === 0}>GERAR TABELA DE TREINO <ArrowRight /></Button>
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
                     <td className="p-3 sticky left-0 bg-panel border-r border-theme z-10">
                        <div className="flex items-center gap-2 font-semibold text-main">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: team.color }}></div>
                            {team.name}
                        </div>
                     </td>
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
          <div className="w-full">
            {/* Desktop View: Grid */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        onPositionChange={() => {}}
                        readOnly={true}
                    />
                    </div>
                );
                })}
            </div>
            {/* Mobile View: Tabs/Carousel */}
            <div className="md:hidden flex flex-col gap-4">
                <div className="flex items-center justify-between bg-panel p-2 rounded-lg border border-theme">
                    <Button variant="ghost" size="sm" onClick={() => setActiveStrategyMapIndex(prev => Math.max(0, prev - 1))} disabled={activeStrategyMapIndex === 0}>
                        <ChevronLeft/>
                    </Button>
                    <span className="font-bold text-main">
                        MAPA {activeStrategyMapIndex + 1}: {MAPS.find(m => m.id === currentMapOrder[activeStrategyMapIndex])?.name}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setActiveStrategyMapIndex(prev => Math.min(currentMapOrder.length - 1, prev + 1))} disabled={activeStrategyMapIndex === currentMapOrder.length - 1}>
                        <ChevronRight/>
                    </Button>
                </div>
                
                <div className="flex-1">
                    {(() => {
                        const mapId = currentMapOrder[activeStrategyMapIndex];
                        const mapData = MAPS.find(m => m.id === mapId);
                        if (!mapData) return null;
                        return (
                             <DraggableMap
                                key={mapId}
                                mapName={mapData.name}
                                image={mapData.image}
                                teams={teams}
                                positions={premiumPositions[mapId] || {}}
                                onPositionChange={(tId, pos) => handlePremiumPosition(mapId, tId, pos)}
                            />
                        )
                    })()}
                </div>
                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 mt-2">
                    {currentMapOrder.map((_, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setActiveStrategyMapIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-colors ${idx === activeStrategyMapIndex ? 'bg-primary' : 'bg-gray-700'}`}
                        />
                    ))}
                </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Returning standard layout for other steps (same as before)
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
          <span className="font-semibold">Criador de Treino • {new Date().getFullYear()}</span>
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