import React, { Component, useState, useEffect, useMemo, ErrorInfo, useRef } from 'react';
import { Users, Trophy, Crown, AlertTriangle, ArrowRight, ArrowLeft, Home, Download, RefreshCw, BarChart2, Save, Trash2, Edit2, Play, LayoutGrid, HelpCircle, X, Info, FileText, Instagram, Eye, Check, Palette, Monitor, Moon, Sun, Medal, Target, Flame, Share2, Calendar, Upload, ChevronLeft, ChevronRight, Maximize, Printer, UserPlus, ChevronDown, ChevronUp, Zap, UploadCloud, Binary, Image, Globe, Search } from 'lucide-react';
import { Team, TrainingMode, Step, MapData, MatchScore, ProcessedScore, Position, POINTS_SYSTEM, PlayerStats, SavedTrainingSession } from './types';
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

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
      const saved = localStorage.getItem('jhantraining_hub_data');
      if (saved) {
          try {
              setSavedTrainings(JSON.parse(saved));
          } catch (e) {
              console.error("Failed to load hub data", e);
          }
      }
  }, []);

  // --- Navigation Handlers ---
  const handleBack = () => {
    switch(step) {
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
    // Premium Plus allows skipping manual team entry
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

    // 1. Initialize Aggregators
    const players: Record<string, PlayerAnalysis> = {};
    const teamPlacement: {name: string, time: number}[] = [];

    // Helper to get or create player entry
    const getPlayer = (name: string) => {
        if (!players[name]) {
            // Extract Team Tag (Assuming format TAG.PLAYER or TAG PLAYER)
            // If no separator, assign to 'NO_TAG'
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

    // Helper to update event times for MVP calc
    const updateTime = (name: string, time: number) => {
        const p = getPlayer(name);
        if (time < p.firstEventTime) p.firstEventTime = time;
        if (time > p.lastEventTime) p.lastEventTime = time;
    };

    // 2. Process Events
    data.Events.forEach(e => {
        // Event 1: Team Elimination/Finished
        if (e.Event === 1 && e.SParam) {
            teamPlacement.push({ name: e.SParam, time: e.Time });
        }

        // Event 2: Damage
        // SParam: Attacker Name, FParam: Damage Amount
        if (e.Event === 2 && e.SParam && e.FParam) {
            const p = getPlayer(e.SParam);
            p.damage += e.FParam;
            updateTime(e.SParam, e.Time);
        }

        // Event 4: Kill
        // SParam: Killer Name
        if (e.Event === 4 && e.SParam) {
            const p = getPlayer(e.SParam);
            p.kills += 1;
            updateTime(e.SParam, e.Time);
        }
    });

    // 3. Process Teams (Auto-Registration if needed)
    let currentTeams = [...teams];
    const uniqueTags = new Set(Object.values(players).map(p => p.teamTag));

    // Ensure teams exist
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

    // Ensure players are in teams
    Object.values(players).forEach(p => {
        const team = currentTeams.find(t => t.name === p.teamTag);
        if (team && !team.players.includes(p.name) && team.players.length < 6) {
            team.players.push(p.name);
        }
    });

    setTeams(currentTeams);

    // 4. Calculate Scores & Ranks
    // Sort team placement by time desc (Last one to die is first)
    // Note: Replay structure varies. Usually Event 1 logs when a team is OUT.
    // The winner might not have an Event 1, or is the last one.
    // Let's assume the provided Event 1 list contains eliminated teams.
    // Winner is either the one not in the list, or the last one in list if format logs everyone.
    // Logic: Sort by Time. Last time = 2nd place (usually). 
    // We will assume standard BR logic: List of eliminations.
    // Rank = (Total Teams - Index in Sorted List).
    
    // Sort by Time (Earliest time = First eliminated = Last place)
    teamPlacement.sort((a, b) => a.time - b.time); 
    
    const newScores: Record<string, MatchScore> = { ...matchScores[currentMatchTab] };

    currentTeams.forEach(team => {
        // Find if team was eliminated
        const elimIndex = teamPlacement.findIndex(tp => tp.name === team.name || team.name.includes(tp.name));
        
        let rank: number | '' = '';
        if (elimIndex !== -1) {
            // If 12 teams, and this is the first elimination (index 0), rank is 12.
            // But we don't know total teams exactly. Let's assume 12 for Free Fire standard, or count identified teams.
            const totalTeams = Math.max(12, currentTeams.length);
            rank = totalTeams - elimIndex;
        } else {
            // Not eliminated? Maybe Booyah (Rank 1).
            // Only assign Rank 1 if they have active players/stats.
            const hasStats = Object.values(players).some(p => p.teamTag === team.name);
            if (hasStats) rank = 1;
        }

        // Aggregate Kills
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

    // 5. Update State
    setMatchScores(prev => ({
        ...prev,
        [currentMatchTab]: newScores
    }));

    // Update Extended Stats for MVP view
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

      // Integrate Replay Analysis Data if available
      Object.values(playerExtendedStats).forEach((analysis: PlayerAnalysis) => {
          // Find or create
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
          // Accumulate stats from analysis state (which represents latest parse)
          // Ideally, playerExtendedStats should be per match, but for simplicity we treat it as aggregate or latest update
          // MVP_SCORE = (Kills * 3) + (DanoTotal / 300) + (TempoVivo / 200)
          
          p.totalDamage = analysis.damage;
          p.timeAlive = Math.max(0, analysis.lastEventTime - analysis.firstEventTime);
          p.totalKills = analysis.kills; // Overwrite with precise replay data
          
          // MVP Formula
          p.mvpScore = (p.totalKills * 3) + (p.totalDamage / 300) + (p.timeAlive / 200);
      });
      
      // Fallback to manual entry if no replay data
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

  // --- Public Hub Logic ---
  const saveToHub = () => {
      // 1. Create Hub Data Object
      const hubData: SavedTrainingSession = {
          id: Date.now().toString(),
          name: trainingName,
          date: new Date().toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'}),
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

      // 2. Save to LocalStorage
      const currentSaved = JSON.parse(localStorage.getItem('jhantraining_hub_data') || '[]');
      // Filter out if existing ID (update logic) or just push new for now
      const updatedSaved = [hubData, ...currentSaved.filter((s: SavedTrainingSession) => s.name !== trainingName)];
      localStorage.setItem('jhantraining_hub_data', JSON.stringify(updatedSaved));
      
      setSavedTrainings(updatedSaved);
      alert("Treino publicado no Hub com sucesso!");
  };

  const loadFromHub = (session: SavedTrainingSession) => {
      try {
          const data = JSON.parse(session.data);
          setTrainingName(data.trainingName);
          setMode(data.mode);
          setTeams(data.teams);
          setShuffledMaps(data.shuffledMaps);
          setBasicSelections(data.basicSelections);
          setPremiumPositions(data.premiumPositions);
          setSelectedWarnings(data.selectedWarnings);
          setMatchScores(data.matchScores);
          setPlayerExtendedStats(data.playerExtendedStats || {});
          
          setStep(Step.VIEWER); // Go directly to viewer
      } catch (e) {
          alert("Erro ao carregar dados do treino.");
          console.error(e);
      }
  };

  const deleteFromHub = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(!window.confirm("Tem certeza que deseja apagar este treino do histórico?")) return;
      
      const newSaved = savedTrainings.filter(s => s.id !== id);
      setSavedTrainings(newSaved);
      localStorage.setItem('jhantraining_hub_data', JSON.stringify(newSaved));
  };

  const downloadSocialBanner = () => {
      if (bannerRef.current) {
          htmlToImage.toPng(bannerRef.current)
            .then(function (dataUrl) {
              const link = document.createElement('a');
              link.download = `banner_${trainingName}.png`;
              link.href = dataUrl;
              link.click();
            })
            .catch(function (error) {
              console.error('oops, something went wrong!', error);
            });
      }
  };

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
      
      <div className="flex flex-col md:flex-row gap-4">
          <Button size="lg" onClick={handleStart} className="group text-xl px-12 py-6">
            COMEÇAR AGORA 
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setStep(Step.PUBLIC_HUB)} className="group text-xl px-12 py-6">
            VER TREINOS ATIVOS
            <Globe className="group-hover:text-primary transition-colors" />
          </Button>
      </div>

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

  const renderPublicHub = () => (
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto p-6 animate-fade-in">
          <h2 className="text-3xl font-display font-bold mb-8 text-center flex items-center gap-3">
              <Globe className="text-primary animate-pulse" size={32} />
              HUB DE TREINOS
          </h2>
          
          {savedTrainings.length === 0 ? (
              <div className="text-center text-muted p-12 bg-panel border border-theme rounded-xl w-full">
                  <Info className="mx-auto mb-4" size={48} />
                  <p className="text-xl">Nenhum treino ativo encontrado no momento.</p>
                  <p className="text-sm mt-2">Crie um treino e clique em "Publicar" no Dashboard para ele aparecer aqui.</p>
                  <Button className="mt-6" onClick={handleStart}>Criar Novo Treino</Button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {savedTrainings.map((session) => (
                      <div key={session.id} className="bg-panel border border-theme rounded-xl overflow-hidden hover:border-primary transition-all hover:scale-[1.02] group flex flex-col relative">
                          <button 
                            onClick={(e) => deleteFromHub(session.id, e)}
                            className="absolute top-2 right-2 bg-black/50 p-2 rounded hover:bg-red-500 text-white z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Apagar Treino"
                          >
                              <Trash2 size={14}/>
                          </button>
                          
                          <div className="h-2 bg-gradient-to-r from-primary to-purple-600"></div>
                          <div className="p-6 flex-1 cursor-pointer" onClick={() => loadFromHub(session)}>
                              <div className="flex justify-between items-start mb-4">
                                  <h3 className="text-xl font-bold text-white uppercase tracking-wide truncate pr-2">{session.name}</h3>
                                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded animate-pulse">AO VIVO</span>
                              </div>
                              
                              <div className="text-sm text-muted mb-6 flex flex-col gap-2">
                                  <div className="flex items-center gap-2"><Calendar size={14}/> {session.date}</div>
                                  <div className="flex items-center gap-2"><Users size={14}/> {session.teamsCount} Times</div>
                                  <div className="flex items-center gap-2"><Target size={14}/> {session.matchesCount} Quedas</div>
                              </div>

                              <div className="bg-black/30 rounded-lg p-3 mb-4">
                                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">Top 3 Atual</div>
                                  {session.leaderboardTop3.map((t, i) => (
                                      <div key={i} className="flex justify-between text-sm mb-1 last:mb-0">
                                          <span className={`${i===0 ? 'text-[#FFD400]' : 'text-gray-300'}`}>{i+1}. {t.name}</span>
                                          <span className="font-mono text-gray-500">{t.points}pts</span>
                                      </div>
                                  ))}
                                  {session.leaderboardTop3.length === 0 && <span className="text-xs text-muted">Ainda sem pontuação</span>}
                              </div>
                          </div>
                          <div className="p-4 bg-black/20 border-t border-theme">
                              <Button className="w-full" onClick={() => loadFromHub(session)}>
                                  ACOMPANHAR AGORA <Eye size={16}/>
                              </Button>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderModeSelect = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 animate-fade-in w-full max-w-6xl mx-auto">
      <h2 className="text-3xl font-display font-bold mb-12 text-center">ESCOLHA O MODO DE OPERAÇÃO</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
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
                 <Target className="text-primary" /> PREMIUM
               </h3>
               <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">DRAG & DROP</span>
            </div>
            <ul className="space-y-3 mb-8 text-muted">
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Mapa Interativo</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Arraste os times na call</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-green-500"/> Visualização Profissional</li>
            </ul>
            <Button variant={mode === 'premium' ? 'primary' : 'secondary'} className="w-full">SELECIONAR PREMIUM</Button>
          </div>
        </div>

        {/* Premium Plus Mode */}
        <div 
          onClick={() => selectMode('premium_plus')}
          className={`
            cursor-pointer group relative overflow-hidden rounded-2xl border-2 p-8 transition-all duration-300
            ${mode === 'premium_plus' ? 'border-[#FFD400] bg-gray-900 shadow-[0_0_40px_rgba(255,212,0,0.2)]' : 'border-gray-700 bg-background hover:border-[#FFD400]/50'}
          `}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-[#FFD400]">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
               <h3 className="text-2xl font-bold flex items-center gap-2 text-white">
                 PREMIUM PLUS
               </h3>
               <span className="bg-[#FFD400] text-black text-xs font-bold px-2 py-1 rounded animate-pulse">NOVO</span>
            </div>
            
            <div className="text-[#FFD400] font-bold text-sm mb-6 flex items-center gap-2 uppercase tracking-wide">
                🔥 Leitura de Replay
            </div>

            <ul className="space-y-3 mb-8 text-sm text-gray-300">
              <li className="flex items-center gap-2"><Check size={16} className="text-[#FFD400]"/> Importação de arquivos (.json)</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-[#FFD400]"/> Análise de Kills / Dano / MVP</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-[#FFD400]"/> Detecção de ordem de eliminação</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-[#FFD400]"/> Processamento Inteligente</li>
            </ul>
            <Button 
                variant="primary" 
                className={`w-full ${mode === 'premium_plus' ? 'bg-[#FFD400] text-black hover:brightness-110' : 'bg-transparent border border-[#FFD400] text-[#FFD400] hover:bg-[#FFD400] hover:text-black'}`}
            >
                SELECIONAR PREMIUM PLUS
            </Button>
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

  const renderStrategy = () => {
    const currentMaps = shuffledMaps.length > 0 ? shuffledMaps : MAPS.map(m => m.id);
    const activeMapId = currentMaps[activeStrategyMapIndex];
    const activeMapData = MAPS.find(m => m.id === activeMapId);

    return (
        <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold">ESTRATÉGIA DE CALLS</h2>
                    <p className="text-muted text-sm">Defina onde cada time vai cair.</p>
                </div>
                
                <div className="flex gap-2">
                     {/* Mobile Navigation for Maps */}
                     <div className="md:hidden flex items-center bg-panel border border-theme rounded-lg">
                         <button 
                            onClick={() => setActiveStrategyMapIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeStrategyMapIndex === 0}
                            className="p-2 hover:bg-white/5 disabled:opacity-30"
                         >
                             <ChevronLeft size={20}/>
                         </button>
                         <span className="px-4 font-bold text-sm">QUEDA {activeStrategyMapIndex + 1}</span>
                         <button 
                            onClick={() => setActiveStrategyMapIndex(prev => Math.min(currentMaps.length - 1, prev + 1))}
                            disabled={activeStrategyMapIndex === currentMaps.length - 1}
                            className="p-2 hover:bg-white/5 disabled:opacity-30"
                         >
                             <ChevronRight size={20}/>
                         </button>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Map Area */}
                <div className="lg:col-span-8 bg-black/20 rounded-xl p-1 flex flex-col gap-8">
                    {/* Desktop: Show all maps or list? Mobile: Show active. 
                        Let's follow the design: "Basic" shows list, "Premium" shows map.
                    */}
                    
                    {mode === 'basic' ? (
                        <div className="bg-panel border border-theme rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                 <h3 className="text-xl font-bold flex items-center gap-2">
                                     <span className="bg-primary text-black text-xs font-bold px-2 py-1 rounded">QUEDA {activeStrategyMapIndex + 1}</span>
                                     {activeMapData?.name}
                                 </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teams.map(team => (
                                    <div key={team.id} className="flex items-center gap-2 bg-background p-2 rounded border border-theme">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{backgroundColor: team.color}}></div>
                                        <span className="font-bold text-sm w-1/3 truncate">{team.name}</span>
                                        <select 
                                            className="flex-1 bg-panel border border-theme text-xs rounded p-1 focus:border-primary focus:outline-none"
                                            value={basicSelections[activeMapId]?.[team.id] || ''}
                                            onChange={(e) => handleCitySelect(activeMapId, team.id, e.target.value)}
                                        >
                                            <option value="">Selecione a Call...</option>
                                            {activeMapData?.cities.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-square w-full max-w-[800px] mx-auto relative">
                            {activeMapData && (
                                <DraggableMap
                                    mapName={activeMapData.name}
                                    image={activeMapData.image}
                                    teams={teams}
                                    positions={premiumPositions[activeMapId] || {}}
                                    onPositionChange={(tid, pos) => handlePremiumPosition(activeMapId, tid, pos)}
                                />
                            )}
                        </div>
                    )}
                    
                    {/* Desktop Navigation for Maps (thumbnails) */}
                    <div className="hidden md:flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
                        {currentMaps.map((mid, idx) => {
                            const m = MAPS.find(x => x.id === mid);
                            return (
                                <button 
                                    key={idx}
                                    onClick={() => setActiveStrategyMapIndex(idx)}
                                    className={`
                                        relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0
                                        ${activeStrategyMapIndex === idx ? 'border-primary scale-110 z-10' : 'border-transparent opacity-50 hover:opacity-100'}
                                    `}
                                >
                                    <img src={m?.image} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] font-bold text-center text-white p-0.5">
                                        {idx + 1}. {m?.name}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Sidebar / Rules */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-panel border border-theme rounded-xl p-6">
                         <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                             <AlertTriangle size={18} className="text-yellow-500"/> REGRAS & AVISOS
                         </h3>
                         <div className="flex flex-col gap-2">
                             {WARNINGS.map((w, i) => (
                                 <label key={i} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded cursor-pointer group">
                                     <div className={`
                                        w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors
                                        ${selectedWarnings.includes(w) ? 'bg-primary border-primary text-black' : 'border-gray-600 bg-black/40'}
                                     `}>
                                         {selectedWarnings.includes(w) && <Check size={14} strokeWidth={4} />}
                                         <input type="checkbox" className="hidden" checked={selectedWarnings.includes(w)} onChange={() => toggleWarning(w)} />
                                     </div>
                                     <span className={`text-sm ${selectedWarnings.includes(w) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{w}</span>
                                 </label>
                             ))}
                         </div>
                    </div>

                    <div className="bg-panel border border-theme rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-2">Resumo</h3>
                        <div className="text-sm text-muted mb-4">
                            {teams.length} Times cadastrados.<br/>
                            {currentMaps.length} Quedas definidas.<br/>
                            Modo: <span className="text-primary capitalize">{mode.replace('_', ' ')}</span>
                        </div>
                        <Button className="w-full" onClick={() => setStep(Step.SCORING)}>
                            IR PARA PONTUAÇÃO <ArrowRight size={16}/>
                        </Button>
                    </div>
                </div>
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
             <div className="flex gap-2 items-center">
                 {mode === 'premium_plus' && (
                    <div className="relative">
                        <input 
                            type="file" 
                            accept=".json" 
                            className="hidden" 
                            ref={replayInputRef}
                            onChange={handleReplayUpload}
                        />
                        <Button 
                            variant="primary" 
                            className="bg-[#FFD400] text-black hover:bg-yellow-400"
                            onClick={() => replayInputRef.current?.click()}
                        >
                             <UploadCloud size={18} /> UPLOAD REPLAY (.JSON)
                        </Button>
                    </div>
                 )}
                 <Button variant="secondary" onClick={() => setStep(Step.DASHBOARD)}>
                     <BarChart2 size={18}/> RESULTADOS
                 </Button>
                 <Button variant="secondary" onClick={() => setStep(Step.REPORT)}>
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
                                <th className="p-4 w-12"></th> {/* Expand Button */}
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
                                const kills = typeof score.kills === 'number' ? score.kills : 0;
                                const pts = (typeof rank === 'number' ? (POINTS_SYSTEM[rank] || 0) : 0) + kills;
                                const isExpanded = expandedTeamId === team.id;
                                
                                return (
                                    <React.Fragment key={team.id}>
                                    <tr className="hover:bg-background/50 transition-colors">
                                        <td className="p-2 text-center">
                                            <button onClick={() => setExpandedTeamId(isExpanded ? null : team.id)} className="text-muted hover:text-primary">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </td>
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
                                    {isExpanded && (
                                        <tr className="bg-background/30">
                                            <td colSpan={6} className="p-4 border-b border-theme/50">
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    {team.players.length > 0 ? (
                                                        team.players.map(player => (
                                                            <div key={player} className="flex items-center gap-2 bg-panel p-2 rounded border border-theme">
                                                                <span className="text-sm font-bold flex-1 truncate" title={player}>{player}</span>
                                                                <input 
                                                                    type="number" 
                                                                    placeholder="Kills"
                                                                    className="w-16 bg-background border border-theme rounded px-1 py-0.5 text-center text-sm"
                                                                    value={score.playerKills?.[player] || ''}
                                                                    onChange={(e) => handlePlayerKillChange(currentMatchTab, team.id, player, e.target.value)}
                                                                />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-sm text-muted col-span-3">
                                                            Nenhum jogador cadastrado para este time. Adicione jogadores no cadastro ou insira kills manualmente no total.
                                                            {/* Allow manual entry of temporary players? For now, stick to registered. */}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    </React.Fragment>
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

  const renderTeamRegister = () => (
    <div className="flex-1 w-full p-6 max-w-4xl mx-auto flex flex-col h-full overflow-hidden">
      {/* Hidden File Input for Logos */}
      <input 
          type="file" 
          accept="image/*" 
          ref={logoInputRef} 
          className="hidden" 
          onChange={handleLogoChange} 
      />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 flex-shrink-0">
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
      
      {mode === 'premium_plus' && teams.length === 0 && (
          <div className="bg-[#FFD400]/10 border border-[#FFD400]/50 p-4 rounded-lg mb-6 flex flex-col md:flex-row items-center gap-4 text-center md:text-left flex-shrink-0">
              <div className="bg-[#FFD400]/20 p-2 rounded-full">
                <Zap className="text-[#FFD400]" size={24} />
              </div>
              <div className="text-sm text-gray-200">
                  <strong className="text-[#FFD400] block text-lg mb-1">Modo Premium Plus Ativo</strong>
                  Você pode pular o cadastro manual. Os times, jogadores e tags serão identificados automaticamente ao enviar o arquivo de replay na tela de Pontuação.
              </div>
              <Button onClick={goToSort} variant="primary" size="sm" className="md:ml-auto bg-[#FFD400] text-black border-none hover:bg-yellow-400">
                  Pular Cadastro
              </Button>
          </div>
      )}

      <div className="flex gap-4 mb-8 flex-shrink-0">
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

      <div className="flex-1 bg-panel rounded-xl border border-theme p-4 mb-8 overflow-y-auto shadow-theme custom-scrollbar">
        {teams.length === 0 ? <div className="h-full flex items-center justify-center text-muted">Nenhum time cadastrado ainda.</div> : (
          <div className="grid grid-cols-1 gap-3">
            {teams.map((team, idx) => (
              <div key={team.id} className="bg-background p-3 rounded border border-theme group hover:border-muted/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 w-full">
                    <span className="text-muted font-mono text-sm w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                    {/* Color Picker / Display */}
                    <div className="relative group/color">
                        <div className="w-6 h-6 rounded-full cursor-pointer shadow-sm border border-white/20" style={{ backgroundColor: team.color }}></div>
                        <div className="absolute top-full left-0 z-20 hidden group-hover/color:flex flex-col gap-2 bg-panel border border-theme p-2 rounded-lg shadow-xl w-[180px]">
                            <div className="grid grid-cols-5 gap-1 mb-2">
                                {TEAM_COLORS.map(c => (
                                    <button 
                                        key={c} 
                                        className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform" 
                                        style={{backgroundColor: c}}
                                        onClick={() => updateTeamColor(team.id, c)}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative h-8 w-8 rounded border border-theme overflow-hidden flex items-center justify-center bg-background cursor-pointer hover:bg-white/5 transition-colors shrink-0">
                                    <input 
                                        type="color" 
                                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        value={team.color}
                                        onChange={(e) => updateTeamColor(team.id, e.target.value)}
                                    />
                                    <Palette size={14} className="text-muted"/>
                                </div>
                                <input 
                                    type="text" 
                                    value={team.color}
                                    onChange={(e) => updateTeamColor(team.id, e.target.value)}
                                    className="w-full bg-background border border-theme rounded h-8 px-2 text-xs font-mono"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Logo Uploader */}
                    <div className="relative group/logo">
                        <button 
                            onClick={() => triggerLogoUpload(team.id)}
                            className="w-8 h-8 rounded-lg border border-theme bg-panel flex items-center justify-center hover:border-primary overflow-hidden"
                            title="Upload Logo do Time"
                        >
                            {team.logo ? (
                                <img src={team.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Image size={16} className="text-muted" />
                            )}
                        </button>
                    </div>

                    <input className="bg-transparent border-none focus:outline-none text-main font-medium w-full text-lg" value={team.name} onChange={(e) => updateTeamName(team.id, e.target.value)} />
                    </div>
                    <button onClick={() => confirmDeleteTeam(team.id)} className="text-muted hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
                
                {/* Player Registration Area */}
                <div className="pl-9 border-t border-theme/30 pt-2">
                    <div className="text-xs text-muted mb-2 font-bold uppercase flex items-center gap-2"><Users size={12}/> Jogadores ({team.players.length}/6)</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {team.players.map((player, pIdx) => (
                            <div key={pIdx} className="bg-panel border border-theme px-2 py-1 rounded-md text-sm flex items-center gap-1">
                                {player}
                                <button onClick={() => removePlayerFromTeam(team.id, pIdx)} className="hover:text-red-500"><X size={12}/></button>
                            </div>
                        ))}
                        {team.players.length < 6 && (
                            <div className="relative flex items-center">
                                <UserPlus size={14} className="absolute left-2 text-muted"/>
                                <input 
                                    type="text" 
                                    placeholder="Add Player" 
                                    className="bg-background border border-theme rounded-md py-1 pl-7 pr-2 text-sm w-32 focus:outline-none focus:border-primary"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            addPlayerToTeam(team.id, e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center flex-shrink-0">
         <div className="hidden">
             {/* Use hidden input for file upload */}
             <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
         </div>
         <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportStrategy} disabled={teams.length === 0 && mode !== 'premium_plus'}><Save size={18}/> Salvar</Button>
            <Button variant="secondary" onClick={handleImportClick}><Upload size={18}/> Carregar</Button>
         </div>
        <Button onClick={goToSort} size="lg" disabled={teams.length === 0 && mode !== 'premium_plus'}>GERAR TABELA DE TREINO <ArrowRight /></Button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background text-main font-sans selection:bg-primary selection:text-black pb-20 md:pb-0 ${isDarkMode ? 'dark' : ''}`}>
      <ErrorBoundary>
        {/* Simple Header for navigation */}
        <div className="fixed top-4 left-4 z-50 flex gap-2">
            {step !== Step.HOME && (
                <button 
                    onClick={handleBack} 
                    className="bg-panel border border-theme p-3 rounded-full shadow-lg hover:border-primary hover:text-white transition-all text-muted"
                    title="Voltar"
                >
                    <ArrowLeft size={20} />
                </button>
            )}
             <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="bg-panel border border-theme p-3 rounded-full shadow-lg hover:border-primary hover:text-white transition-all text-muted"
                title="Alternar Tema"
            >
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
        </div>

        <div className="pt-10 md:pt-0">
            {step === Step.HOME && renderHome()}
            {step === Step.PUBLIC_HUB && renderPublicHub()}
            {step === Step.MODE_SELECT && renderModeSelect()}
            {step === Step.TEAM_REGISTER && renderTeamRegister()}
            {step === Step.MAP_SORT && renderMapSort()}
            {step === Step.STRATEGY && renderStrategy()}
            {step === Step.SCORING && renderScoring()}
            {step === Step.DASHBOARD && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <BarChart2 size={48} className="text-muted" />
                    <h2 className="text-xl font-bold">Dashboard (Em Breve)</h2>
                    <Button onClick={handleBack}>Voltar</Button>
                </div>
            )}
            {step === Step.REPORT && (
                 <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <FileText size={48} className="text-muted" />
                    <h2 className="text-xl font-bold">Relatório (Em Breve)</h2>
                    <Button onClick={handleBack}>Voltar</Button>
                </div>
            )}
            {step === Step.VIEWER && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Eye size={48} className="text-muted" />
                    <h2 className="text-xl font-bold">Viewer (Em Breve)</h2>
                    <Button onClick={handleBack}>Voltar</Button>
                </div>
            )}
        </div>

      </ErrorBoundary>
    </div>
  );
}

export default MainApp;