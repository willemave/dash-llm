import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import NavigationController from '../../controllers/NavigationController';
import Chat from '../chat/Chat';

const Layout = ({ children, ref }: { 
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const { navigateTo, currentRoute } = useNavigation();

  React.useEffect(() => {
    NavigationController.setNavigationCallback(navigateTo);
  }, [navigateTo]);

  return (
    <div className="grid grid-cols-[200px_1fr_300px] min-h-screen" ref={ref}>
      <nav className="bg-secondary p-4">
        <ul className="space-y-2">
          {['home', 'sales', 'account', 'reports'].map((route) => (
            <li key={route}>
              <button
                className={`w-full text-left p-2 rounded ${
                  currentRoute === route 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-secondary-foreground/10'
                }`}
                onClick={() => navigateTo(route as any)}
              >
                {route.charAt(0).toUpperCase() + route.slice(1)}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="p-6">
        {children}
      </main>
      <aside className="bg-secondary p-4">
        <h2 className="text-lg font-semibold mb-4">Chat Interface</h2>
        <Chat />
      </aside>
    </div>
  );
};

export default Layout;