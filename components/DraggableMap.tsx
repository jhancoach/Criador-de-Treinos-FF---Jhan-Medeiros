import React, { useState, useRef, useEffect } from 'react';
import { Team, Position } from '../types';
import { Move, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

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
  const [zoomLevel, setZoomLevel] = useState(1);

  // Handle Zoom
  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(1, Math.min(3, prev + delta)));
  };

  // Handle local drag state
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, teamId: string) => {
    if (readOnly) return;
    e.stopPropagation(); // Prevent map panning if we implement it later
    setDraggingId(teamId);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (readOnly || !draggingId || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    // Calculate percentage relative to container
    // When zoomed, the container dimensions (getBoundingClientRect) reflect the zoomed size.
    // The relative math holds up: click relative to Top-Left of rect / width of rect = percentage.
    let x = ((clientX - container.left) / container.width) * 100;
    let y = ((clientY - container.top) / container.height) * 100;

    // Constrain
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    onPositionChange(draggingId, { x, y });
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingId]);

  return (
    <div className="bg-panel rounded-xl p-4 shadow-theme border border-theme flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
         <h3 className="text-primary font-display font-bold text-xl uppercase tracking-widest">{mapName}</h3>
         <div className="flex gap-1 bg-background rounded-lg border border-theme p-1">
            <button onClick={() => handleZoom(-0.5)} className="p-1 hover:text-primary disabled:opacity-30" disabled={zoomLevel <= 1}><ZoomOut size={16}/></button>
            <span className="text-xs font-mono w-8 text-center flex items-center justify-center">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => handleZoom(0.5)} className="p-1 hover:text-primary disabled:opacity-30" disabled={zoomLevel >= 3}><ZoomIn size={16}/></button>
         </div>
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-auto border border-gray-700 rounded-lg bg-gray-900 relative min-h-[300px]"
      >
        <div 
            ref={containerRef}
            className={`relative origin-top-left transition-all duration-200 ease-out select-none ${readOnly ? '' : 'cursor-crosshair'}`}
            style={{ 
              width: `${zoomLevel * 100}%`,
              height: `${zoomLevel * 100}%`, // Aspect ratio maintenance usually handled by padding-bottom trick or flex, here we explicitly scale
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
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-75 ${isDragging ? 'z-50 scale-125' : 'z-10'} ${readOnly ? '' : 'cursor-move'}`}
                style={{ 
                    left: `${pos.x}%`, 
                    top: `${pos.y}%`,
                    touchAction: 'none'
                }}
                >
                <div 
                    className={`
                    flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap shadow-md
                    border transition-colors
                    `}
                    style={{
                        backgroundColor: isDragging ? teamColor : 'rgba(0,0,0,0.8)',
                        color: isDragging ? '#000' : '#FFF',
                        borderColor: teamColor,
                        boxShadow: `0 0 10px ${teamColor}40`
                    }}
                >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }}></div>
                    {!readOnly && <Move size={8} className={isDragging ? 'opacity-100' : 'opacity-50'} />}
                    {team.name}
                </div>
                {/* Pin indicator for map */}
                <div className="w-0.5 h-3 bg-white absolute top-full left-1/2 -translate-x-1/2 opacity-50"></div>
                </div>
            );
            })}
        </div>
      </div>
      {!readOnly && <p className="text-muted text-xs text-center mt-2">Use zoom para ajustar. Arraste os nomes para posicionar.</p>}
    </div>
  );
};
