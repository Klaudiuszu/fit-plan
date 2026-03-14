import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setTab } from '../../store/uiSlice';
import { NavTab } from '../../types';
import { Sun, Calendar, TrendingUp, Flame } from 'lucide-react';

const tabs: { id: NavTab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'today',    label: 'Dziś',      icon: Sun,        desc: 'Dieta · Trening · Zakupy' },
  { id: 'calendar', label: 'Kalendarz', icon: Calendar,   desc: '16 mar – 30 cze 2026' },
  { id: 'progress', label: 'Postępy',   icon: TrendingUp, desc: '93 → 85 kg · wykres' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const activeTab = useSelector((s: RootState) => s.ui.activeTab);

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-surface-900 border-r border-surface-700 min-h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-surface-700">
        <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
          <Flame size={18} className="text-accent" />
        </div>
        <div>
          <p className="font-bold text-gray-100 leading-tight">FitPlan</p>
          <p className="text-xs text-gray-500">93 → 85 kg · 4× trening</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            onClick={() => dispatch(setTab(id))}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
              activeTab === id
                ? 'bg-accent/15 text-accent'
                : 'text-gray-400 hover:text-gray-100 hover:bg-surface-700'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <div>
              <p className="text-sm font-medium leading-tight">{label}</p>
              <p className="text-[11px] text-gray-500 leading-tight">{desc}</p>
            </div>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-surface-700">
        <p className="text-xs text-gray-600">cel: –8 kg bez straty mięśni</p>
        <p className="text-xs text-gray-600">~0.6 kg/tydzień</p>
      </div>
    </aside>
  );
}
