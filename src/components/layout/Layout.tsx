import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import NavigationController from '../../controllers/NavigationController';
import './Layout.css';
import Chat from '../chat/Chat';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { navigateTo, currentRoute } = useNavigation();

  // Set up the navigation callback when the component mounts
  React.useEffect(() => {
    NavigationController.setNavigationCallback(navigateTo);
  }, [navigateTo]);

  return (
    <div className="layout">
      <nav className="sidebar">
        <ul>
          <li
            className={currentRoute === 'home' ? 'active' : ''}
            onClick={() => navigateTo('home')}
          >
            Home
          </li>
          <li
            className={currentRoute === 'sales' ? 'active' : ''}
            onClick={() => navigateTo('sales')}
          >
            Sales
          </li>
          <li
            className={currentRoute === 'account' ? 'active' : ''}
            onClick={() => navigateTo('account')}
          >
            Account
          </li>
        </ul>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <aside className="chat-interface">
        <h2>Chat Interface</h2>
        <Chat />
      </aside>
    </div>
  );
};

export default Layout;