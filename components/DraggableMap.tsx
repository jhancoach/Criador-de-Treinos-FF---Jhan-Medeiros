import React, { useState, useRef, useEffect } from 'react';
import { Team, Position } from '../types';
import { Move, ZoomIn, ZoomOut, MousePointer2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface DraggableMapProps {
  mapName: string;
  image: string;
  teams: Team[];
  positions: Record<string, Position>;
  onPositionChange: (teamId: string, pos: Position) => void;
  readOnly?: boolean;
}

export const DraggableMap: React.FC<DraggableMapProps> = ({
  mapName,
  image,
  teams,
  positions,
  onPositionChange,
  readOnly = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const lastMousePos = useRef<{ x: number, y: number } | null>(null);

  // Center map on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth, scrollHeight, clientHeight } = scrollContainerRef.current;
        scrollContainerRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        scrollContainerRef.current.scrollTop = (scrollHeight - clientHeight) / 2;
    }
  }, []);

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(1, Math.min(3, prev + delta)));
  };

  // Mouse Wheel Zoom Handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
    }
    // Zoom in if scrolling up, out if scrolling down
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    handleZoom(delta);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, teamId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    setDraggingId(teamId);
  };

  const handlePanStart = (e: React.MouseEvent | React.TouchEvent) => {
      if (draggingId) return; 
      
      setIsPanning(true);
      
      let clientX, clientY;
      if ('touches' in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
      } else {
          clientX = (e as React.MouseEvent).clientX;
          clientY = (e as React.MouseEvent).clientY;
      }
      lastMousePos.current = { x: clientX, y: clientY };
  };

  const snapToGrid = (val: number) => {
      const gridSize = 1; 
      return Math.round(val / gridSize) * gridSize;
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (draggingId && containerRef.current && !readOnly) {
        const container = containerRef.current.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        let x = ((clientX - container.left) / container.width) * 100;
        let y = ((clientY - container.top) / container.height) * 100;

        x = snapToGrid(Math.max(0, Math.min(100, x)));
        y = snapToGrid(Math.max(0, Math.min(100, y)));

        onPositionChange(draggingId, { x, y });
    }

    if (isPanning && scrollContainerRef.current) {
        if (e.cancelable && 'touches' in e) e.preventDefault(); 

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        if (lastMousePos.current) {
            const deltaX = clientX - lastMousePos.current.x;
            const deltaY = clientY - lastMousePos.current.y;
            
            scrollContainerRef.current.scrollLeft -= deltaX;
            scrollContainerRef.current.scrollTop -= deltaY;
        }
        
        lastMousePos.current = { x: clientX, y: clientY };
    }
  };

  const handleEnd = () => {
    setDraggingId(null);
    setIsPanning(false);
    lastMousePos.current = null;
  };

  useEffect(() => {
    if (draggingId || isPanning) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    } 
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [draggingId, isPanning, readOnly]);

  return (
    <div className="bg-panel rounded-xl p-4 shadow-theme border border-theme flex flex-col h-full relative group/map overflow-hidden">
      <div className="flex justify-between items-center mb-4 z-10 pointer-events-none">
         <h3 className="text-primary font-display font-bold text-xl uppercase tracking-widest pointer-events-auto">{mapName}</h3>
      </div>
      
      <div className="absolute top-16 right-6 z-20 flex flex-col gap-2 bg-black/80 backdrop-blur rounded-lg border border-gray-700 p-2 shadow-xl opacity-0 group-hover/map:opacity-100 transition-opacity duration-300 pointer-events-auto">
          <Tooltip content="Zoom In" position="left">
              <button onClick={() => handleZoom(0.5)} className="p-2 hover:bg-gray-700 rounded text-white disabled:opacity-30" disabled={zoomLevel >= 3}><ZoomIn size={20}/></button>
          </Tooltip>
          <div className="text-center text-[10px] font-mono font-bold text-gray-400">{Math.round(zoomLevel * 100)}%</div>
          <Tooltip content="Zoom Out" position="left">
              <button onClick={() => handleZoom(-0.5)} className="p-2 hover:bg-gray-700 rounded text-white disabled:opacity-30" disabled={zoomLevel <= 1}><ZoomOut size={20}/></button>
          </Tooltip>
      </div>

      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-auto border border-gray-700 rounded-lg bg-gray-900 relative min-h-[300px] no-scrollbar ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} flex items-center justify-center`}
        onMouseDown={handlePanStart}
        onTouchStart={handlePanStart}
        onWheel={handleWheel}
      >
        <div 
            ref={containerRef}
            className="relative origin-top-left transition-all duration-200 ease-out select-none shadow-2xl"
            style={{ 
              width: `${zoomLevel * 100}%`,
              aspectRatio: '1 / 1', // Enforce square aspect ratio
              backgroundImage: `url(${image})`, 
              backgroundSize: '100% 100%', // Stretch to fill exactly
              backgroundPosition: 'center',
            }}
        >
            {teams.map((team) => {
            const pos = positions[team.id] || { x: 50, y: 50 };
            const isDragging = draggingId === team.id;
            const teamColor = team.color || '#ffffff';

            return (
                <div
                key={team.id}
                onMouseDown={(e) => handleDragStart(e, team.id)}
                onTouchStart={(e) => handleDragStart(e, team.id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-transform duration-75 ${isDragging ? 'z-50 scale-110' : 'z-10'} ${readOnly ? '' : 'cursor-move'}`}
                style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.y}%`,
                    touchAction: 'none'
                }}
                >
                {team.logo ? (
                    <div className="relative flex flex-col items-center">
                        <div 
                            className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 md:border-3 shadow-lg overflow-hidden bg-black relative transition-shadow hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                            style={{ borderColor: teamColor }}
                        >
                            <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                            {isDragging && <div className="absolute inset-0 bg-white/20" />}
                        </div>
                        <span 
                            className="mt-1 px-1.5 py-0.5 bg-black/90 text-white text-[8px] md:text-[10px] font-bold rounded border border-gray-600 truncate max-w-[80px] pointer-events-none"
                            style={{ textShadow: '0 1px 2px black' }}
                        >
                            {team.name}
                        </span>
                        <div className="w-0.5 h-3 bg-white/50 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none"></div>
                    </div>
                ) : (
                    <div className="relative">
                        <div 
                            className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap shadow-xl
                            border-2 transition-all hover:scale-105
                            `}
                            style={{
                                backgroundColor: isDragging ? teamColor : 'rgba(10,10,10,0.9)',
                                color: isDragging ? '#000' : '#FFF',
                                borderColor: teamColor,
                            }}
                        >
                            <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: teamColor }}></div>
                            {!readOnly && <MousePointer2 size={10} className={isDragging ? 'opacity-100' : 'opacity-50'} />}
                            {team.name}
                        </div>
                        <div className="w-0.5 h-3 bg-white absolute top-full left-1/2 -translate-x-1/2 opacity-50 pointer-events-none"></div>
                    </div>
                )}
                </div>
            );
            })}
        </div>
      </div>
      <p className="text-muted text-xs text-center mt-2 flex items-center justify-center gap-2 opacity-60">
          <Move size={12}/> {readOnly ? 'Use Scroll/Arraste para navegar' : 'Use Scroll para Zoom • Arraste o mapa ou times'}
      </p>
    </div>
  );
};