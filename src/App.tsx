import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavigationProvider } from './contexts/NavigationContext';
import Layout from './components/layout/Layout';
import Home from './components/pages/Home';
import Sales from './components/pages/Sales';
import Account from './components/pages/Account';
import Reports from './components/pages/Reports';

const App: React.FC = () => {
  return (
    <Router>
      <NavigationProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/account" element={<Account />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </NavigationProvider>
    </Router>
  );
};

export default App;