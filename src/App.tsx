import { useState } from 'react';
import { ConfigProvider, theme, App } from 'antd'; // 1. Import App
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './assets/global.css';
import AdminDashboard from './pages/AdminDashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import EditProfile from './pages/EditProfile';

function AppRoot() { // Rename your component to keep App for the wrapper
  const [isDark, setIsDark] = useState(false);

  return (
    <ConfigProvider 
      theme={{ 
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { colorPrimary: '#1C2E5D' }
      }}
    >
      <App> {/* 2. Wrap your entire router with App */}
        <Router>
          <Routes>
            <Route path="/" element={<Login isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/dashboard" element={<Dashboard isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/admin" element={<AdminDashboard isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/resident" element={<ResidentDashboard isDark={isDark} setIsDark={setIsDark} />} />
            <Route path="/edit-profile" element={<EditProfile isDark={isDark} setIsDark={setIsDark}/>} />
          </Routes>
        </Router>
      </App>
    </ConfigProvider>
  );
}

export default AppRoot;