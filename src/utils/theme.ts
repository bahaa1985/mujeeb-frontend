export const roleThemeMap: Record<number, { 
  shell: string; 
  accent: string; 
  accentSoft: string; 
  badge: string; 
  text: string;
  sidebar: string;
  active: string;
  ring: string;
  border:string
}> = {
  1: {
    shell: 'from-rose-500 to-rose-600',
    accent: 'bg-rose-600 hover:bg-rose-700',
    accentSoft: 'bg-rose-50 text-rose-700 border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    text: 'text-rose-700',
    sidebar: 'bg-white border-rose-100',
    active: 'bg-rose-600 text-white',
    ring: 'focus:ring-rose-500',
    border: 'border-rose-500',
  },
  2: {
    shell: 'from-emerald-500 to-emerald-600',
    accent: 'bg-emerald-600 hover:bg-emerald-700',
    accentSoft: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-700',
    sidebar: 'bg-white border-emerald-100',
    active: 'bg-emerald-600 text-white',
    ring: 'focus:ring-emerald-500',
    border: 'border-emerald-500', 
  },
  3: {
    shell: 'from-sky-500 to-sky-600',
    accent: 'bg-sky-600 hover:bg-sky-700',
    accentSoft: 'bg-sky-50 text-sky-700 border-sky-200',
    badge: 'bg-sky-100 text-sky-700',
    text: 'text-sky-700',
    sidebar: 'bg-white border-sky-100',
    active: 'bg-sky-600 text-white',
    ring: 'focus:ring-sky-500',
    border: 'border-sky-500',
  },
  4: {
    shell: 'from-amber-400 to-amber-500',
    accent: 'bg-amber-500 hover:bg-amber-600',
    accentSoft: 'bg-amber-50 text-amber-700 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-700',
    sidebar: 'bg-white border-amber-100',
    active: 'bg-amber-600 text-white',
    ring: 'focus:ring-amber-500',
    border: 'border-amber-500',
  },
};

export const getRoleTheme = (roleId?: number) => roleThemeMap[roleId ?? 2] ?? roleThemeMap[2];
