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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, teamId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    setDraggingId(teamId);
  };

  const handlePanStart = (e: React.MouseEvent) => {
      if (readOnly) return;
      setIsPanning(true);
  };

  const snapToGrid = (val: number) => {
      const gridSize = 1; // Snap to nearest 1%
      return Math.round(val / gridSize) * gridSize;
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    // Handle Icon Dragging
    if (draggingId && containerRef.current) {
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

        // Apply Snapping
        x = snapToGrid(Math.max(0, Math.min(100, x)));
        y = snapToGrid(Math.max(0, Math.min(100, y)));

        onPositionChange(draggingId, { x, y });
    }

    // Handle Panning
    if (isPanning && scrollContainerRef.current && 'movementX' in e) {
        const me = e as MouseEvent;
        scrollContainerRef.current.scrollLeft -= me.movementX;
        scrollContainerRef.current.scrollTop -= me.movementY;
    }
  };

  const handleEnd = () => {
    setDraggingId(null);
    setIsPanning(false);
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
  }, [draggingId, isPanning]);

  return (
    <div className="bg-panel rounded-xl p-4 shadow-theme border border-theme flex flex-col h-full relative group/map">
      <div className="flex justify-between items-center mb-4 z-10">
         <h3 className="text-primary font-display font-bold text-xl uppercase tracking-widest">{mapName}</h3>
      </div>
      
      {/* Controls Overlay */}
      {!readOnly && (
          <div className="absolute top-16 right-6 z-20 flex flex-col gap-2 bg-black/80 backdrop-blur rounded-lg border border-gray-700 p-2 shadow-xl opacity-0 group-hover/map:opacity-100 transition-opacity">
              <Tooltip content="Zoom In" position="left">
                  <button onClick={() => handleZoom(0.5)} className="p-2 hover:bg-gray-700 rounded text-white disabled:opacity-30" disabled={zoomLevel >= 3}><ZoomIn size={20}/></button>
              </Tooltip>
              <div className="text-center text-[10px] font-mono font-bold text-gray-400">{Math.round(zoomLevel * 100)}%</div>
              <Tooltip content="Zoom Out" position="left">
                  <button onClick={() => handleZoom(-0.5)} className="p-2 hover:bg-gray-700 rounded text-white disabled:opacity-30" disabled={zoomLevel <= 1}><ZoomOut size={20}/></button>
              </Tooltip>
          </div>
      )}

      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-auto border border-gray-700 rounded-lg bg-gray-900 relative min-h-[300px] ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handlePanStart}
      >
        <div 
            ref={containerRef}
            className="relative origin-top-left transition-all duration-200 ease-out select-none"
            style={{ 
              width: `${zoomLevel * 100}%`,
              height: `${zoomLevel * 100}%`,
              minHeight: '100%',
              backgroundImage: `url(${image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              aspectRatio: '1 / 1'
            }}
        >
            {/* Teams List */}
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
                    // Logo Render
                    <div className="relative flex flex-col items-center">
                        <div 
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 md:border-4 shadow-lg overflow-hidden bg-black relative transition-shadow hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                            style={{ borderColor: teamColor }}
                        >
                            <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                            {isDragging && <div className="absolute inset-0 bg-white/20" />}
                        </div>
                        <span 
                            className="mt-1 px-2 py-0.5 bg-black/90 text-white text-[10px] md:text-xs font-bold rounded border border-gray-600 truncate max-w-[100px] pointer-events-none"
                            style={{ textShadow: '0 1px 2px black' }}
                        >
                            {team.name}
                        </span>
                        {/* Pin indicator line */}
                        <div className="w-0.5 h-4 bg-white/50 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none"></div>
                    </div>
                ) : (
                    // Default Pill Render
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
      {!readOnly && <p className="text-muted text-xs text-center mt-2 flex items-center justify-center gap-2 opacity-60"><Move size={12}/> Arraste o mapa para mover • Arraste os times para posicionar</p>}
    </div>
  );
};