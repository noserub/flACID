import { useState } from 'react';
import { useDescentIntensity } from '../contexts/DescentIntensityContext';
import { useDescentMode } from '../contexts/DescentModeContext';

export function DescentIntensityDebug() {
  const { isDescentMode } = useDescentMode();
  const { intensity } = useDescentIntensity();
  const [isVisible, setIsVisible] = useState(false);

  if (!isDescentMode) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-[10000] bg-black/80 text-cyan-400 px-3 py-2 rounded-md text-xs font-mono border border-cyan-500/50 hover:bg-black/90"
      >
        {isVisible ? 'Hide' : 'Show'} Debug
      </button>

      {/* Debug panel */}
      {isVisible && (
        <div className="fixed top-20 right-4 z-[10000] bg-black/90 text-white p-4 rounded-lg border border-cyan-500/50 font-mono text-xs space-y-2 backdrop-blur-sm max-w-xs">
          <div className="text-cyan-400 font-bold mb-2">DESCENT INTENSITY</div>
          
          {/* Overall Intensity */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Total:</span>
              <span className="text-cyan-300">{(intensity.totalIntensity * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-100"
                style={{ width: `${intensity.totalIntensity * 100}%` }}
              />
            </div>
          </div>

          {/* Breathing Pattern */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Breathing:</span>
              <span className="text-cyan-300">{(intensity.baseIntensity * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500 transition-all duration-100"
                style={{ width: `${intensity.baseIntensity * 100}%` }}
              />
            </div>
          </div>

          {/* Music Boost */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Music Boost:</span>
              <span className="text-fuchsia-300">{(intensity.musicBoost * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-fuchsia-500 transition-all duration-100"
                style={{ width: `${intensity.musicBoost * 100}%` }}
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-2 mt-2">
            <div className="text-gray-500 mb-1">EQ BANDS</div>
            
            {/* EQ Bands */}
            <div className="space-y-0.5">
              <EQBar label="Sub" value={intensity.eqBands.subBass} />
              <EQBar label="Bass" value={intensity.eqBands.bass} />
              <EQBar label="LowM" value={intensity.eqBands.lowMid} />
              <EQBar label="Mid" value={intensity.eqBands.mid} />
              <EQBar label="HiM" value={intensity.eqBands.highMid} />
              <EQBar label="Pres" value={intensity.eqBands.presence} />
              <EQBar label="Bril" value={intensity.eqBands.brilliance} />
            </div>
          </div>

          {/* Energy */}
          <div className="border-t border-gray-700 pt-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Energy:</span>
              <span className="text-orange-300">{(intensity.energy * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 transition-all duration-100"
                style={{ width: `${intensity.energy * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EQBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500 w-10 text-[10px]">{label}</span>
      <div className="flex-1 bg-gray-700 h-1 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400 transition-all duration-50"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-gray-400 w-8 text-[10px] text-right">{(value * 100).toFixed(0)}</span>
    </div>
  );
}
