
import React, { useMemo } from 'react';
import { TimeMarker } from '../types'; 

interface ThermometerProps {
  total: number;
  breakEvenPoint: number;
  timeMarkers: TimeMarker[]; // Agora apenas recebe os marcadores
}

const Thermometer: React.FC<ThermometerProps> = ({ 
  total, 
  breakEvenPoint, 
  timeMarkers,
}) => {
  const percentage = Math.min(100, (total / breakEvenPoint) * 100);
  const isExceedingProfit = total > breakEvenPoint; 
  
  // Limiares para as transições de cor
  const RED_THRESHOLD_PERCENTAGE = 40; // Abaixo de 40% = Vermelho
  const AMBER_THRESHOLD_PERCENTAGE = 99; // Entre 40% e 99% = Âmbar
  // 100% ou mais = Esmeralda

  let barColorClass = '';
  let bulbColorClass = '';
  let barShadowClass = '';
  let bulbAnimationClass = '';

  if (percentage < RED_THRESHOLD_PERCENTAGE) {
    barColorClass = 'bg-red-500';
    bulbColorClass = 'bg-red-500';
    barShadowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.5)]'; // Sombra vermelha
    bulbAnimationClass = ' animate-red-pulse';
  } else if (percentage <= AMBER_THRESHOLD_PERCENTAGE) {
    barColorClass = 'bg-amber-500';
    bulbColorClass = 'bg-amber-500';
    barShadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.5)]'; // Sombra âmbar
    bulbAnimationClass = ' animate-amber-pulse';
  } else { // percentage >= 100
    barColorClass = 'bg-emerald-500';
    bulbColorClass = 'bg-emerald-500';
    barShadowClass = 'shadow-[0_0_15px_rgba(16,185,129,0.5)]'; // Sombra esmeralda
    bulbAnimationClass = ' animate-emerald-pulse';
  }

  let barBaseClasses = `w-full transition-all duration-700 ease-out rounded-b-full relative overflow-hidden`;
  
  let barDynamicClasses = '';
  if (isExceedingProfit) {
    barDynamicClasses += ' exceeding-profit'; 
  }

  let bulbBaseClasses = `w-28 h-28 -mt-10 rounded-full border-4 border-white dark:border-gray-800 shadow-md flex items-center justify-center z-10 transition-colors duration-700`;

  // Calculate vertical positions for time markers
  // Distributed from 5% (bottom) to 95% (top) of the thermometer's height
  const markerPositions = useMemo(() => {
    return timeMarkers.map((_, index) => {
      // Ajuste para que o primeiro marcador (index 0) fique na parte inferior e o último na superior
      const positionPercentage = 10 + (index / (timeMarkers.length - 1)) * 80; // Distribui uniformemente, com mais margem vertical
      return { id: timeMarkers[index].id, top: `${100 - positionPercentage}%` }; // top: 100% é a base
    });
  }, [timeMarkers]);

  return (
    <div className="flex flex-col items-center justify-center w-full py-8">
      <div className="relative w-20 h-80 bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 shadow-inner flex items-end overflow-hidden">
        
        {/* Marcadores de Horário */}
        <div className="absolute left-0 w-full h-full z-20"> {/* Contêiner para os marcadores */}
            {markerPositions.map((markerPos, index) => {
                const marker = timeMarkers.find(m => m.id === markerPos.id);
                if (!marker) return null;

                return (
                    <div 
                        key={marker.id} 
                        className="absolute w-full flex items-center justify-center"
                        style={{ top: markerPos.top }}
                    >
                        <div className="h-0.5 w-3/4 bg-gray-400 dark:bg-gray-500 absolute"></div> {/* Pequena linha */}
                        <span className="relative z-10 px-1 mr-1 bg-gray-200 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap pointer-events-none">{marker.time}</span>
                    </div>
                );
            })}
        </div>

        {/* Progress Bar */}
        <div 
          className={`${barBaseClasses} ${barColorClass} ${barShadowClass} ${barDynamicClasses} profit-bar-fill`} 
          style={{ height: `${percentage}%` }}
        />
        
        {/* Goal Indicator Line */}
        <div className="absolute w-full border-t-2 border-dashed border-gray-400 top-0 pointer-events-none">
            <span className="absolute right-full mr-2 text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap -translate-y-1/2">META</span>
        </div>
      </div>
      
      {/* Bulb at bottom */}
      <div className={`${bulbBaseClasses} ${bulbColorClass} ${bulbAnimationClass}`}>
        <div className="text-white text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Total</p>
          <p className="text-xl font-bold">R$ {total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Thermometer;