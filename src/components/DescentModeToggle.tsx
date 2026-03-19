import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { useDescentMode } from '../contexts/DescentModeContext';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';

export function DescentModeToggle() {
  const { isDescentMode, toggleDescentMode } = useDescentMode();
  const [hintOpen, setHintOpen] = useState(true);

  return (
    <Popover open={hintOpen} onOpenChange={setHintOpen}>
      <PopoverAnchor asChild>
        <motion.button
          onClick={toggleDescentMode}
          className={`
            relative px-4 py-2 rounded-lg font-medium transition-all duration-300
            ${isDescentMode 
              ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-900/50 hover:bg-fuchsia-500' 
              : 'bg-background/80 text-cyan-400 border border-cyan-400/30 hover:border-fuchsia-400/50 hover:text-fuchsia-400 hover:shadow-lg hover:shadow-fuchsia-500/20'
            }
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isDescentMode ? 'Exit Descent Mode' : 'Enter Descent Mode'}
        >
          <div className="flex items-center gap-2">
            {isDescentMode ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Ascend</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Descend</span>
              </>
            )}
          </div>
          
          {/* Glowing effect when active */}
          {isDescentMode && (
            <motion.div
              className="absolute inset-0 bg-fuchsia-500 rounded-lg blur-xl opacity-50 -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </motion.button>
      </PopoverAnchor>
      <PopoverContent
        side="bottom"
        align="center"
        sideOffset={8}
        className="relative w-64 rounded-lg border-cyan-500/30 bg-background/95 backdrop-blur-sm shadow-lg text-sm text-foreground"
      >
        {/* Caret pointing up at the button */}
        <div
          className="absolute left-1/2 -top-2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-background/95"
          aria-hidden
        />
        <div className="relative pt-0.5">
          Make your experience extra trippy with Descend!
        </div>
      </PopoverContent>
    </Popover>
  );
}