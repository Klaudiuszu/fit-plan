import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TodayView from '../Today/TodayView';
import CalendarView from '../Calendar/CalendarView';
import ProgressView from '../Progress/ProgressView';

export default function Layout() {
  const activeTab = useSelector((s: RootState) => s.ui.activeTab);

  const views: Record<string, React.ReactNode> = {
    today:    <TodayView />,
    calendar: <CalendarView />,
    progress: <ProgressView />,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
        <div className="max-w-5xl mx-auto px-3 py-4 lg:px-5 lg:py-5 animate-fade-in">
          {views[activeTab]}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
