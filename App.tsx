import React, { useState } from 'react';
import { 
  Languages, 
  Zap, 
  ArrowRight, 
  ListPlus, 
  Globe, 
  Map as MapIcon, 
  Users, 
  BarChart2, 
  Share2, 
  Instagram 
} from 'lucide-react';
import { Step, Language } from './types';

const TRANSLATIONS = {
  pt: {
    hero: {
      subtitle: 'GERENCIADOR DE BATTLE ROYALE',
      title1: 'ORGANIZE SEU',
      title2: 'CAMPEONATO',
      desc: 'A plataforma mais completa para gestão competitiva. Sorteio de mapas, tabela automática e estatísticas detalhadas.',
      start: 'COMEÇAR',
      queue: 'LISTA DE ESPERA',
      hub: 'HUB PÚBLICO',
      footer: 'CRIADO POR JHAN'
    },
    steps: {
      maps: 'Sorteio de Mapas',
      teams: 'Times e Players'
    },
    features: {
      maps: 'Mapas interativos com Drag & Drop',
      teams: 'Gerencie logos e jogadores',
      stats: 'Pontuação automática e MVPs',
      share: 'Compartilhe resultados num clique'
    }
  },
  en: {
    hero: {
      subtitle: 'BATTLE ROYALE MANAGER',
      title1: 'ORGANIZE YOUR',
      title2: 'TOURNAMENT',
      desc: 'The most complete platform for competitive management. Map draw, automated leaderboard and detailed statistics.',
      start: 'START NOW',
      queue: 'WAITING LIST',
      hub: 'PUBLIC HUB',
      footer: 'CREATED BY JHAN'
    },
    steps: {
      maps: 'Map Draw',
      teams: 'Teams & Players'
    },
    features: {
      maps: 'Interactive Drag & Drop maps',
      teams: 'Manage logos and players',
      stats: 'Automated scoring & MVPs',
      share: 'Share results instantly'
    }
  },
  es: {
    hero: {
      subtitle: 'GESTOR DE BATTLE ROYALE',
      title1: 'ORGANIZA TU',
      title2: 'TORNEO',
      desc: 'La plataforma más completa para gestión competitiva. Sorteo de mapas, tabla automática y estadísticas detalladas.',
      start: 'EMPEZAR',
      queue: 'LISTA DE ESPERA',
      hub: 'HUB PÚBLICO',
      footer: 'CREADO POR JHAN'
    },
    steps: {
      maps: 'Sorteo de Mapas',
      teams: 'Equipos y Jugadores'
    },
    features: {
      maps: 'Mapas interactivos Drag & Drop',
      teams: 'Gestiona logos y jugadores',
      stats: 'Puntuación automática y MVPs',
      share: 'Comparte resultados al instante'
    }
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('pt');
  const [step, setStep] = useState<Step>(Step.HOME);

  const t = TRANSLATIONS[lang];

  const handleStart = () => {
    setStep(Step.MODE_SELECT);
  };

  const renderHome = () => (
    <div className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden bg-[#0a0a0a] text-white p-4 lg:p-12">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        {/* Language Selector */}
        <div className="absolute top-6 right-6 z-20">
            <button 
                onClick={() => setLang(lang === 'pt' ? 'en' : lang === 'en' ? 'es' : 'pt')} 
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/30"
            >
                <Languages size={14} />
                <span>{lang === 'pt' ? 'PT-BR' : lang === 'en' ? 'EN-US' : 'ES-ES'}</span>
            </button>
        </div>

        <div className="max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left Column - Hero Text */}
            <div className="space-y-8 animate-in slide-in-from-left duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1A1A] border border-white/10 text-xs font-bold text-yellow-500 uppercase tracking-widest shadow-lg">
                    <Zap size={14} fill="currentColor"/> {t.hero.subtitle}
                </div>
                
                <h1 className={`${lang === 'es' ? 'text-4xl md:text-5xl lg:text-7xl' : 'text-5xl md:text-6xl lg:text-8xl'} font-black leading-none tracking-tighter text-white transition-all duration-300`}>
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

  return (
    <>
      {step === Step.HOME && renderHome()}
      {step !== Step.HOME && (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Step: {step}</h1>
            <p className="mb-8">Content for this step is not implemented in this preview.</p>
            <button 
                onClick={() => setStep(Step.HOME)}
                className="px-6 py-2 bg-[#FFD400] text-black font-bold rounded-lg"
            >
                Back to Home
            </button>
        </div>
      )}
    </>
  );
};

export default App;
