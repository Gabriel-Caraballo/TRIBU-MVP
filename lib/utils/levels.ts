// lib/utils/levels.ts
// Sistema de niveles unificado - Usar en TODO el codebase

export type UserLevel = {
  name: string;        // Nombre del nivel
  label: string;       // Label para mostrar (en español)
  minHours: number;
  maxHours: number;
  nextLevelHours: number;
  color: string;       // Color Tailwind
};

export const LEVELS: UserLevel[] = [
  { name: 'nuevo',   label: 'Nuevo',   minHours: 0,   maxHours: 9,   nextLevelHours: 10,  color: 'text-green-500' },
  { name: 'activo',  label: 'Activo',  minHours: 10,  maxHours: 49,  nextLevelHours: 50,  color: 'text-blue-500'  },
  { name: 'experto', label: 'Experto', minHours: 50,  maxHours: 999, nextLevelHours: 999, color: 'text-purple-500'},
];

export function getLevel(totalHours: number): UserLevel {
  return LEVELS.find(l => totalHours >= l.minHours && totalHours <= l.maxHours) ?? LEVELS[0];
}

export function getLevelProgress(totalHours: number): number {
  const level = getLevel(totalHours);
  if (level.nextLevelHours === 999) return 100;
  const range = level.nextLevelHours - level.minHours;
  const progress = totalHours - level.minHours;
  return Math.round((progress / range) * 100);
}