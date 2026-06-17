import { Layout, Dropdown, Menu, Avatar, Switch, Button } from 'antd';
import { UserOutlined, LogoutOutlined, EditOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export const AppHeader = ({ isDark, setIsDark }: any) => {
  const navigate = useNavigate();

  return (
    <Layout.Header className="app-header">
      {/* Left: Logo */}
      <div className="header-left">
        <img src="/logo.png" alt="Logo" style={{ width: 45, marginRight: 15 }} />
      </div>

      {/* Center: Title */}
      <div className="header-center">
        <div className="header-title">Visitor Management System</div>
      </div>
      {/* Right: Actions */}
      <div className="header-actions">
        <Switch 
            checked={isDark} 
            onChange={setIsDark} 
            checkedChildren={<MoonOutlined />} 
            unCheckedChildren={<SunOutlined />} 
        />
        <Button type="text" icon={<EditOutlined style={{color: '#AC9055'}}/>} onClick={() => navigate('/edit-profile')} />
        <Button type="text" icon={<LogoutOutlined style={{color: '#AC9055'}}/>} onClick={() => { localStorage.removeItem('user'); navigate('/'); }} />
      </div>
    </Layout.Header>
  );
};