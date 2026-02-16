import { motion } from 'framer-motion';
import type { Track } from '../store/gameStore';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface Props {
  timeline: Track[];
  currentTrack: Track;
  onPlace: (insertIndex: number) => void;
}

export const TimelinePlacement = ({ timeline, currentTrack, onPlace }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-sm mx-auto flex flex-col gap-2 px-4"
    >
      {/* Header */}
      <div className="text-center mb-2">
        <p className="text-primary text-sm font-bold uppercase tracking-widest">Wo gehört der Song hin?</p>
        <p className="text-zinc-400 text-xs mt-1">
          <span className="text-white font-bold">{currentTrack.title}</span> – {currentTrack.artist} ({currentTrack.year})
        </p>
      </div>

      {/* Timeline mit Insert-Buttons */}
      <div className="flex flex-col gap-1">
        {/* Insert Button: Ganz oben (ältester) */}
        <InsertButton
          label="↑ Hier einfügen (ältester)"
          onClick={() => onPlace(0)}
        />

        {timeline.map((track, i) => (
          <div key={track.id} className="flex flex-col gap-1">
            {/* Timeline Card */}
            <div className="flex items-center p-2 rounded-xl gap-3 bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-white text-xs font-bold truncate">{track.title}</span>
                <span className="text-zinc-500 text-[10px] truncate">{track.artist}</span>
              </div>
              <span className="text-primary font-mono text-sm font-bold">{track.year}</span>
            </div>

            {/* Insert Button: Nach dieser Karte */}
            <InsertButton
              label={i < timeline.length - 1
                ? `↓ Zwischen ${track.year} und ${timeline[i + 1].year}`
                : '↓ Hier einfügen (neuester)'
              }
              onClick={() => onPlace(i + 1)}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

function InsertButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={clsx(
        "w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-primary/30",
        "text-primary/60 text-xs font-mono",
        "hover:border-primary hover:text-primary hover:bg-primary/5",
        "active:bg-primary/10 transition-all",
        "flex items-center justify-center gap-1"
      )}
    >
      <ChevronDown className="w-3 h-3" />
      {label}
    </motion.button>
  );
}
