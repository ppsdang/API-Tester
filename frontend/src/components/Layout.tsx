import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Workflow,
  Database,
  Settings,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'APIs', path: '/apis', icon: Globe },
  { name: 'Flows', path: '/flows', icon: Workflow },
  { name: 'Environments', path: '/environments', icon: Database },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-600">API Flow Tester</h1>
          <p className="text-sm text-gray-500 mt-1">Test API flows with AI</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
