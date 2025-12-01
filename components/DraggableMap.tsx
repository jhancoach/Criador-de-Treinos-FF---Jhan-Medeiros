import React, { useState, useRef, useEffect } from 'react';
import { Team, Position } from '../types';
import { Move } from 'lucide-react';

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
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Handle local drag state
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, teamId: string) => {
    if (readOnly) return;
    // e.preventDefault(); 
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
    <div className="bg-panel rounded-xl p-4 shadow-theme border border-theme">
      <h3 className="text-primary font-display font-bold text-xl mb-4 text-center uppercase tracking-widest">{mapName}</h3>
      
      <div 
        ref={containerRef}
        className={`relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden border border-gray-700 select-none ${readOnly ? '' : 'cursor-crosshair'}`}
        style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Teams List */}
        {teams.map((team) => {
          const pos = positions[team.id] || { x: 50, y: 50 };
          const isDragging = draggingId === team.id;

          return (
            <div
              key={team.id}
              onMouseDown={(e) => handleDragStart(e, team.id)}
              onTouchStart={(e) => handleDragStart(e, team.id)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-shadow ${isDragging ? 'z-50 scale-110' : 'z-10'} ${readOnly ? '' : 'cursor-move'}`}
              style={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`,
                touchAction: 'none'
              }}
            >
              <div className={`
                flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap
                ${isDragging ? 'bg-primary text-black shadow-[0_0_15px_rgba(var(--color-primary),0.6)]' : 'bg-black/80 text-white border border-gray-600 backdrop-blur-sm hover:border-primary'}
              `}>
                {!readOnly && <Move size={10} className={isDragging ? 'opacity-100' : 'opacity-50'} />}
                {team.name}
              </div>
            </div>
          );
        })}
      </div>
      {!readOnly && <p className="text-muted text-xs text-center mt-2">Arraste os nomes para posicionar</p>}
    </div>
  );
};