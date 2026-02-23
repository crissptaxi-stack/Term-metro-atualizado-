
import React, { useState } from 'react';
import { Earning } from '../types';

interface EarningsListProps {
  earnings: Earning[];
  onEdit: (earning: Earning) => void;
  onDelete: (id: string) => void;
}

const EarningsList: React.FC<EarningsListProps> = ({ earnings, onEdit, onDelete }) => {
  const [earningToDeleteId, setEarningToDeleteId] = useState<string | null>(null);

  if (earnings.length === 0) return null;

  const handleConfirmDelete = () => {
    if (earningToDeleteId) {
      onDelete(earningToDeleteId);
      setEarningToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setEarningToDeleteId(null);
  };

  return (
    <div className="w-full mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-gray-500 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-3">Registros de Hoje</h3>
      <div className="space-y-2">
        {earnings.slice().reverse().map((earning) => (
          <div 
            key={earning.id} 
            className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`font-semibold ${earning.value < 0 ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}>
                  R$ {earning.value.toFixed(2)}
                </span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] font-bold uppercase rounded-md border border-gray-200 dark:border-gray-600">
                  {earning.category}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-400">
                  {new Date(earning.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {earning.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] break-words">
                  {earning.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(earning)}
                className="p-2 text-gray-400 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900 rounded-lg transition-colors"
                title="Editar"
                aria-label={`Editar ganho de R$ ${earning.value.toFixed(2)}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button 
                onClick={() => setEarningToDeleteId(earning.id)} // Abre o modal de confirmação
                className="p-2 text-gray-400 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                title="Excluir"
                aria-label={`Excluir registro de R$ ${earning.value.toFixed(2)}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {earningToDeleteId && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl max-w-sm w-full text-center border border-gray-100 dark:border-gray-700">
            <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Confirmar Exclusão</h4>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-sm"
                aria-label="Cancelar exclusão"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm"
                aria-label="Confirmar exclusão do registro"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsList;