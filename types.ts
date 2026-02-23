
export type EarningCategory = 'Corrida' | 'Gorjeta' | 'Bônus' | 'Alimentação' | 'Combustível' | 'Manutenção' | 'Outros';

export const EARNING_CATEGORIES: EarningCategory[] = ['Corrida', 'Gorjeta', 'Bônus', 'Alimentação', 'Combustível', 'Manutenção', 'Outros'];

export interface Earning {
  id: string;
  value: number;
  timestamp: number;
  description?: string; // Campo opcional para descrição
  category: EarningCategory; // Novo campo para categoria
}

export interface DayHistory {
  date: string; // ISO string YYYY-MM-DD
  total: number;
}

export interface TimeMarker {
  id: string;
  time: string; // Formato HH:MM
}