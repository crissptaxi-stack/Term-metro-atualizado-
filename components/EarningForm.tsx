
import React, { useState, useEffect } from 'react';
import { Earning, EarningCategory, EARNING_CATEGORIES } from '../types';

interface EarningFormProps {
  onAdd: (value: number, category: EarningCategory, description?: string) => void;
  onUpdate: (id: string, value: number, category: EarningCategory, description?: string) => void;
  editingEarning: Earning | null;
  onCancelEdit: () => void;
}

const EarningForm: React.FC<EarningFormProps> = ({ onAdd, onUpdate, editingEarning, onCancelEdit }) => {
  const [inputValue, setInputValue] = useState('');
  const [descriptionInput, setDescriptionInput] = useState(''); // Novo estado para a descrição
  const [categoryInput, setCategoryInput] = useState<EarningCategory>('Corrida');

  useEffect(() => {
    if (editingEarning) {
      setInputValue(editingEarning.value.toString());
      setDescriptionInput(editingEarning.description || ''); // Preenche a descrição se estiver editando
      setCategoryInput(editingEarning.category);
    } else {
      setInputValue('');
      setDescriptionInput(''); // Limpa a descrição ao sair do modo de edição
      setCategoryInput('Corrida');
    }
  }, [editingEarning]);

  const handleSubmit = (e: React.FormEvent, type: 'add' | 'subtract' | 'update') => {
    e.preventDefault();
    const val = parseFloat(inputValue.replace(',', '.'));
    if (!isNaN(val) && val !== 0) { // Permitir 0 pode ser um erro, então só > 0 ou < 0
      const description = descriptionInput.trim() || undefined; // Usa undefined se a descrição estiver vazia
      if (type === 'update' && editingEarning) {
        onUpdate(editingEarning.id, val, categoryInput, description);
      } else if (type === 'add') {
        onAdd(Math.abs(val), categoryInput, description); // Garante que o valor adicionado é sempre positivo
      } else if (type === 'subtract') {
        onAdd(-Math.abs(val), categoryInput, description); // Garante que o valor subtraído é sempre negativo
      }
      setInputValue('');
      setDescriptionInput(''); // Limpa a descrição após a submissão
      setCategoryInput('Corrida');
    } else {
      alert('Por favor, insira um valor numérico válido e diferente de zero.');
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="Valor (ex: 25,50)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`flex-1 px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 shadow-sm text-lg transition-colors ${
              editingEarning ? 'border-amber-300 focus:ring-amber-500' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
            }`}
            aria-label="Valor do ganho ou despesa"
          />
          <select
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value as EarningCategory)}
            className={`px-3 py-3 rounded-xl border bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 shadow-sm text-sm transition-colors ${
              editingEarning ? 'border-amber-300 focus:ring-amber-500' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
            }`}
            aria-label="Categoria"
          >
            {EARNING_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {editingEarning ? (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'update')}
            className="px-6 py-3 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md bg-amber-500 hover:bg-amber-600"
            aria-label="Salvar edição do ganho"
          >
            Salvar
          </button>
        ) : (
          <div className="flex rounded-xl shadow-md overflow-hidden"> {/* Segmented control container */}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'add')}
              className="px-4 py-3 text-white font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-1 rounded-l-xl border-r border-blue-700"
              aria-label="Adicionar ganho"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, 'subtract')}
              className="px-4 py-3 text-gray-800 dark:text-gray-100 font-bold bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 active:scale-95 transition-all flex items-center justify-center gap-1 rounded-r-xl"
              aria-label="Subtrair valor"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <textarea
        placeholder="Descrição (opcional)"
        value={descriptionInput}
        onChange={(e) => setDescriptionInput(e.target.value)}
        rows={2}
        className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 shadow-sm text-base resize-none transition-colors ${
          editingEarning ? 'border-amber-300 focus:ring-amber-500' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
        }`}
        aria-label="Descrição do ganho ou despesa"
      />
      {editingEarning && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="text-xs text-gray-400 dark:text-gray-300 font-medium hover:text-gray-600 dark:hover:text-gray-200 transition-colors underline"
          aria-label="Cancelar edição"
        >
          Cancelar edição
        </button>
      )}
    </form>
  );
};

export default EarningForm;