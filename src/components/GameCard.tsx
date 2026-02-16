import { motion } from 'framer-motion';
import type { Track } from '../store/gameStore';
import { clsx } from 'clsx';

interface Props {
  track: Track;
  index?: number;
  isDraggable?: boolean;
  showYear?: boolean;
  onDragEnd?: (e: MouseEvent | TouchEvent | PointerEvent, info: { point: { x: number; y: number } }) => void;
}

export const GameCard = ({ track, index, isDraggable, showYear = true, onDragEnd }: Props) => {
  return (
    <motion.div
      layoutId={isDraggable ? undefined : track.id}
      data-index={index}
      data-year={track.year}
      initial={showYear ? { scale: 0.8, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      drag={isDraggable ? true : false}
      dragSnapToOrigin={true}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.05, cursor: 'grabbing', zIndex: 100 }}
      
      className={clsx(
        "relative flex items-center p-2 rounded-xl gap-3 w-full select-none touch-none transition-colors",
        isDraggable ? "bg-surface border-2 border-primary shadow-2xl shadow-primary/20" : "bg-white/5 border border-white/5",
        "backdrop-blur-md"
      )}
    >
      {/* Cover: Lazy Load in Liste, Eager beim Spielen */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
        <img 
          src={track.coverUrl} 
          alt={track.title}
          loading={isDraggable ? "eager" : "lazy"} 
          className="w-full h-full object-cover" 
          draggable={false}
        />
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <h3 className="text-white font-bold truncate text-sm leading-tight">{track.title}</h3>
        <p className="text-zinc-400 text-xs truncate">{track.artist}</p>
      </div>

      <div className={clsx(
        "font-mono text-xl font-bold ml-2",
        showYear ? "text-primary" : "text-zinc-600"
      )}>
        {showYear ? track.year : "????"}
      </div>
    </motion.div>
  );
};
