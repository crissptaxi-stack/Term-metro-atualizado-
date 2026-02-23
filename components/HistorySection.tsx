
import React from 'react';
import { DayHistory } from '../types';

interface HistorySectionProps {
  history: DayHistory[];
  breakEvenPoint: number; // Recebe a meta como prop
}

const HistorySection: React.FC<HistorySectionProps> = ({ history, breakEvenPoint }) => {
  const last7Days = history.slice(-7).reverse();
  const average = history.length > 0 
    ? history.reduce((acc, curr) => acc + curr.total, 0) / history.length 
    : 0;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  return (
    <div className="w-full mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-gray-500 dark:text-gray-300 text-sm font-bold uppercase tracking-wider mb-4">Histórico (Últimos 7 dias)</h3>
      
      <div className="space-y-3">
        {last7Days.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-300 text-sm italic">Nenhum histórico disponível ainda.</p>
        ) : (
          last7Days.map((day, idx) => (
            <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
              <span className="text-gray-600 dark:text-gray-200 font-medium">{formatDate(day.date)}</span>
              <span className={`font-bold ${day.total >= breakEvenPoint ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                R$ {day.total.toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <span className="text-gray-500 dark:text-gray-300 text-sm font-medium">Média Diária</span>
        <span className="text-lg font-bold text-gray-800 dark:text-gray-100">R$ {average.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default HistorySection;