
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Earning, DayHistory, TimeMarker, EarningCategory } from './types'; 
import Thermometer from './components/Thermometer';
import EarningForm from './components/EarningForm';
import HistorySection from './components/HistorySection';
import EarningsList from './components/EarningsList';

const DEFAULT_BREAK_EVEN_POINT = 385; 


// Função para gerar os marcadores de tempo com um horário de início fixo (08:00)
const generateTimeMarkers = (): TimeMarker[] => {
  const markers: TimeMarker[] = [];
  const DEFAULT_START_HOUR = 8;
  const DEFAULT_START_MINUTE = 0;

  let currentHour = DEFAULT_START_HOUR;
  let currentMinute = DEFAULT_START_MINUTE;

  for (let i = 0; i < 12; i++) { // 12 marcadores, incrementando a cada hora
    const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    markers.push({ id: `marker-${i}`, time });

    currentHour = (currentHour + 1) % 24; // Incrementa a hora, volta para 0 se passar de 23
  }
  return markers;
};

const App: React.FC = () => {
  // --- State ---
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [history, setHistory] = useState<DayHistory[]>([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [editingEarning, setEditingEarning] = useState<Earning | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  
  const [breakEvenPoint, setBreakEvenPoint] = useState<number>(() => {
    const savedBreakEvenPoint = localStorage.getItem('break_even_point');
    return savedBreakEvenPoint ? parseFloat(savedBreakEvenPoint) : DEFAULT_BREAK_EVEN_POINT;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoalInput, setNewGoalInput] = useState('');

  // Novos estados para o horário de início da jornada


  // --- Persistence & Theme Effect ---
  useEffect(() => {
    const savedEarnings = localStorage.getItem('earnings');
    const savedHistory = localStorage.getItem('history');
    
    if (savedEarnings) setEarnings(JSON.parse(savedEarnings));
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const lastSessionDate = localStorage.getItem('last_session_date');
    const today = new Date().toISOString().split('T')[0];

    if (lastSessionDate && lastSessionDate !== today) {
        if (savedEarnings) {
            const oldEarnings: Earning[] = JSON.parse(savedEarnings);
            if (oldEarnings.length > 0) {
                const oldTotal = oldEarnings.reduce((acc, curr) => acc + curr.value, 0);
                const updatedHistory = [...(savedHistory ? JSON.parse(savedHistory) : []), { date: lastSessionDate, total: oldTotal }];
                setHistory(updatedHistory);
                localStorage.setItem('history', JSON.stringify(updatedHistory));
                setEarnings([]);
                localStorage.setItem('earnings', JSON.stringify([]));
            }
        }
    }
    localStorage.setItem('last_session_date', today);
  }, []); 

  useEffect(() => {
    localStorage.setItem('earnings', JSON.stringify(earnings));
  }, [earnings]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('break_even_point', breakEvenPoint.toString());
  }, [breakEvenPoint]);



  // --- Computations ---
  const totalToday = useMemo(() => earnings.reduce((acc, curr) => acc + curr.value, 0), [earnings]);
  const remaining = Math.max(0, breakEvenPoint - totalToday);
  const profit = Math.max(0, totalToday - breakEvenPoint);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    earnings.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.value;
    });
    return totals;
  }, [earnings]);
  
  const statusMessage = useMemo(() => {
    if (totalToday < breakEvenPoint) return "Ainda não bateu a meta";
    if (totalToday === breakEvenPoint) return "Sistema pago";
    return `Lucro do dia: R$ ${profit.toFixed(2)}`;
  }, [totalToday, profit]);

  // Marcadores de tempo gerados a partir do horário de início
  const timeMarkers = useMemo(() => generateTimeMarkers(), []);

  // --- Handlers ---
  const handleAddEarning = (value: number, category: EarningCategory, description?: string) => {
    const newEarning: Earning = {
      id: Math.random().toString(36).substring(2, 9),
      value,
      timestamp: Date.now(),
      description, // Inclui a descrição
      category,
    };
    setEarnings(prev => [...prev, newEarning]);
  };

  const handleUpdateEarning = (id: string, value: number, category: EarningCategory, description?: string) => {
    setEarnings(prev => prev.map(e => e.id === id ? { ...e, value, category, description } : e)); // Atualiza também a descrição e categoria
    setEditingEarning(null);
  };

  const handleDeleteEarning = (id: string) => {
    setEarnings(prev => prev.filter(e => e.id !== id));
    if (editingEarning?.id === id) {
      setEditingEarning(null);
    }
  };

  const handleResetDay = () => {
    if (totalToday > 0) {
      const today = new Date().toISOString().split('T')[0];
      const newHistoryEntry: DayHistory = { date: today, total: totalToday };
      const updatedHistory = [...history.filter(h => h.date !== today), newHistoryEntry];
      setHistory(updatedHistory);
      localStorage.setItem('history', JSON.stringify(updatedHistory));
    }
    setEarnings([]);
    setEditingEarning(null);
    setShowConfirmReset(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const handleShare = async () => {
    const shareText = `Termômetro Diário de Lucro: Acumulado hoje: R$ ${totalToday.toFixed(2)}. ${profit > 0 ? `Lucro: R$ ${profit.toFixed(2)}` : 'Ainda não atingiu o lucro.'} #TermometroDeLucro`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meu Progresso Diário de Lucro',
          text: shareText,
          // url: 'URL_DO_SEU_APP_AQUI' 
        });
        console.log('Conteúdo compartilhado com sucesso!');
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000); 
    }).catch(err => {
      console.error('Erro ao copiar para a área de transferência:', err);
      alert('Não foi possível copiar o texto. Por favor, tente manualmente.');
    });
  };

  const handleEditGoalClick = () => {
    setIsEditingGoal(true);
    setNewGoalInput(breakEvenPoint.toFixed(2));
  };

  const handleSaveGoal = () => {
    const parsedValue = parseFloat(newGoalInput.replace(',', '.'));
    if (!isNaN(parsedValue) && parsedValue > 0) {
      setBreakEvenPoint(parsedValue);
      setIsEditingGoal(false);
    } else {
      alert('Por favor, insira um valor numérico válido e maior que zero para a meta.');
    }
  };

  const handleCancelEditGoal = () => {
    setIsEditingGoal(false);
    setNewGoalInput('');
  };

  // Handlers para o horário de início da jornada (Removido conforme solicitado)

  return (
    <div className="min-h-screen max-w-md mx-auto px-6 py-8 flex flex-col items-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="w-full text-center mb-6 relative">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Termômetro de Lucro</h1>
        
        {/* Ponto de Equilíbrio e Botão de Edição */}
        <div className="flex items-center justify-center mt-2 gap-2">
          {isEditingGoal ? (
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                className="w-28 px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Editar Ponto de Equilíbrio"
              />
              <button 
                onClick={handleSaveGoal}
                className="px-3 py-1 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                aria-label="Salvar Ponto de Equilíbrio"
              >
                Salvar
              </button>
              <button 
                onClick={handleCancelEditGoal}
                className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors"
                aria-label="Cancelar Edição"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 dark:text-gray-300 text-sm">Ponto de Equilíbrio: R$ {breakEvenPoint.toFixed(2)}</p>
              <button 
                onClick={handleEditGoalClick}
                className="p-1 text-gray-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 rounded-full transition-colors"
                aria-label="Editar Ponto de Equilíbrio"
                title="Editar Ponto de Equilíbrio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode} 
          className="absolute top-0 right-0 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-full"
          aria-label={isDarkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m-.386-6.364l1.591 1.591M12 12a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.61.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
      </header>

      {/* Main Thermometer Area */}
      <main className="w-full flex-1 flex flex-col items-center">
        <Thermometer 
          total={totalToday} 
          breakEvenPoint={breakEvenPoint}
          timeMarkers={timeMarkers}
        />

        {/* Status Badge */}
        <div className={`mt-4 px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all duration-500 ${
          totalToday >= breakEvenPoint 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-700' 
            : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
        }`}>
          {statusMessage}
        </div>

        {/* Secondary Stats */}
        <div className="w-full grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest mb-1">Falta</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">R$ {remaining.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest mb-1">Lucro Real</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">R$ {profit.toFixed(2)}</p>
            </div>
        </div>

        {/* Category Summary */}
        {Object.keys(categoryTotals).length > 0 && (
          <div className="w-full mt-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-gray-500 dark:text-gray-300 text-xs font-bold uppercase tracking-wider mb-3">Resumo por Categoria</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(categoryTotals).map(([category, total]) => (
                <div key={category} className="flex flex-col">
                  <span className="text-[10px] text-gray-400 dark:text-gray-400 font-bold uppercase">{category}</span>
                  <span className={`text-sm font-bold ${(total as number) < 0 ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}>
                    R$ {(total as number).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Horário de Início da Jornada (Removido conforme solicitado) */}

        {/* Share Button */}
        <div className="relative w-full mt-8 flex flex-col items-center gap-2">
            <button 
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl active:scale-95 transition-all shadow-md hover:bg-blue-600 dark:bg-cyan-600 dark:hover:bg-cyan-700"
                aria-label="Compartilhar Progresso Diário"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 11.997v-1.006a3.5 3.5 0 017 0v1.006m4.992 0l-7.217 7.217-.996 1.006-2.504-2.505M14.25 12l2.165 2.165M12 11.25l4.623-4.623M15.75 12L12 11.25" />
                </svg>
                Compartilhar Progresso
            </button>
            {showCopyMessage && (
                <span className="absolute -bottom-8 px-3 py-1 bg-gray-700 text-white dark:bg-gray-200 dark:text-gray-800 rounded-lg text-xs font-medium animate-in fade-in duration-300">
                    Copiado!
                </span>
            )}
        </div>

        {/* Input Area */}
        <div className="w-full mt-8">
            <EarningForm 
              onAdd={handleAddEarning} 
              onUpdate={handleUpdateEarning}
              editingEarning={editingEarning}
              onCancelEdit={() => setEditingEarning(null)}
            />
        </div>

        {/* Individual Earnings List */}
        <EarningsList 
          earnings={earnings} 
          onEdit={setEditingEarning} 
          onDelete={handleDeleteEarning} 
        />

        {/* History */}
        <HistorySection history={history} breakEvenPoint={breakEvenPoint} />

        {/* Reset Button */}
        <div className="w-full mt-10 mb-8 flex justify-center">
            {showConfirmReset ? (
                <div className="flex flex-col items-center gap-3 bg-red-50 dark:bg-red-900 p-4 rounded-2xl border border-red-100 dark:border-red-800 w-full">
                    <p className="text-sm font-bold text-red-600 dark:text-red-300">Deseja zerar o dia e salvar no histórico?</p>
                    <div className="flex gap-2 w-full">
                        <button 
                            onClick={handleResetDay}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm"
                        >
                            Sim, Zerar
                        </button>
                        <button 
                            onClick={() => setShowConfirmReset(false)}
                            className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                        >
                            Não
                        </button>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={() => setShowConfirmReset(true)}
                    className="flex items-center gap-2 text-gray-400 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Zerar Dia
                </button>
            )}
        </div>
      </main>

      {/* Footer / Info */}
      <footer className="w-full text-center py-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <p className="text-[10px] text-gray-300 dark:text-gray-400 uppercase tracking-widest font-bold">Termômetro Diário de Lucro</p>
      </footer>
    </div>
  );
};

export default App;