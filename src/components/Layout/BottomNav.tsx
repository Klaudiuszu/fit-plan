import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setTab } from '../../store/uiSlice';
import { NavTab } from '../../types';
import { Sun, Calendar, TrendingUp } from 'lucide-react';

const tabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
  { id: 'today',    label: 'Dziś',      icon: Sun },
  { id: 'calendar', label: 'Kalendarz', icon: Calendar },
  { id: 'progress', label: 'Postępy',   icon: TrendingUp },
];

export default function BottomNav() {
  const dispatch = useDispatch();
  const activeTab = useSelector((s: RootState) => s.ui.activeTab);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-900 border-t border-surface-700 lg:hidden">
      <div className="flex">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => dispatch(setTab(id))}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
              activeTab === id
                ? 'text-accent'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
