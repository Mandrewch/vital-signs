import { BpCategory } from '../types/vital';

export interface BpCategoryInfo {
  category: BpCategory;
  label: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export function calculateBpCategory(systolic?: number, diastolic?: number): BpCategory | undefined {
  if (systolic === undefined && diastolic === undefined) return undefined;
  const sys = systolic ?? 0;
  const dia = diastolic ?? 0;

  if (sys > 180 || dia > 120) {
    return 'crisis';
  }
  if (sys >= 140 || dia >= 90) {
    return 'stage2';
  }
  if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) {
    return 'stage1';
  }
  if (sys >= 120 && sys <= 129 && dia < 80) {
    return 'elevated';
  }
  if (sys < 120 && dia < 80 && sys > 0 && dia > 0) {
    return 'normal';
  }
  return undefined;
}

export function getBpCategoryInfo(category?: BpCategory): BpCategoryInfo | null {
  if (!category) return null;

  switch (category) {
    case 'normal':
      return {
        category,
        label: 'Normal',
        colorClass: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 border-emerald-500/40',
        badgeText: 'text-emerald-300',
        description: 'Systolic < 120 & Diastolic < 80'
      };
    case 'elevated':
      return {
        category,
        label: 'Elevated',
        colorClass: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 border-amber-500/40',
        badgeText: 'text-amber-300',
        description: 'Systolic 120-129 & Diastolic < 80'
      };
    case 'stage1':
      return {
        category,
        label: 'Stage 1 HTN',
        colorClass: 'text-orange-400',
        badgeBg: 'bg-orange-500/20 border-orange-500/40',
        badgeText: 'text-orange-300',
        description: 'Systolic 130-139 or Diastolic 80-89'
      };
    case 'stage2':
      return {
        category,
        label: 'Stage 2 HTN',
        colorClass: 'text-red-400',
        badgeBg: 'bg-red-500/20 border-red-500/40',
        badgeText: 'text-red-300',
        description: 'Systolic ≥ 140 or Diastolic ≥ 90'
      };
    case 'crisis':
      return {
        category,
        label: 'Hypertensive Crisis',
        colorClass: 'text-rose-500 font-bold',
        badgeBg: 'bg-rose-500/30 border-rose-500/60 animate-pulse',
        badgeText: 'text-rose-200',
        description: 'Systolic > 180 and/or Diastolic > 120'
      };
  }
}
