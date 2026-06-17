import { useState } from 'react';
import { Form, Input, Button, Select, message, Card, App, Typography, Switch } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { phoneRule } from '../utils/validation';
interface PageProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}
const { Title } = Typography;

const LoginContent = ({ isDark, setIsDark }: PageProps) => {
  const { message: messageApi } = App.useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('resident');
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
  try {
    if (isRegister) {
      // Registration logic
      await api.post('/users', { ...values, id: Date.now().toString() });
      messageApi.success('Registration successful!');
      setIsRegister(false);
    } else {
      // Fetch users
      const { data } = await api.get('/users');
      
      // Look for the user matching all form inputs
      const user = data.find((u: any) => 
        u.username === values.username && 
        u.password === values.password && 
        u.role === values.role // Use the role from the form values directly!
      );

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        
        // Use a small timeout to ensure localStorage is written before redirecting
        setTimeout(() => {
          if (user.role === 'admin') navigate('/admin');
          else if (user.role === 'security') navigate('/dashboard');
          else if (user.role === 'resident') navigate('/resident');
          else messageApi.error('Unknown role!');
        }, 100);
      } else {
        messageApi.error('Invalid credentials or role!');
      }
    }
  } catch (err) {
    messageApi.error('Connection failed!');
    console.error(err);
  }
};

  return (
    <div className={`login-standalone ${isDark ? 'dark' : ''}`}>
      <div className="theme-toggle-standalone">
        <Switch 
          checked={isDark} 
          onChange={setIsDark} 
          checkedChildren={<MoonOutlined />} 
          unCheckedChildren={<SunOutlined />} 
        />
      </div>
      
      <div className="login-content-wrapper">
        <img src="/logo.png" alt="Logo" style={{ width: '120px', marginBottom: '10px' }} />
        {/* Use a simple Title and let CSS handle the color */}
        <Title level={2} style={{ marginBottom: '40px', color: 'inherit' }}>
          Visitor Management System
        </Title>


      <Card className="login-card">
          <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password /></Form.Item>
          
          {isRegister && (
            <>
              <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="contactNumber" label="Phone" rules={[{ required: true },phoneRule]}><Input /></Form.Item>
            </>
          )}

          <Form.Item 
            name="role" 
            label="Role" 
            initialValue="resident" // This ensures the form has a default value
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="security">Security</Select.Option>
              <Select.Option value="resident">Resident</Select.Option>
            </Select>
          </Form.Item>

          {isRegister && role === 'resident' && <Form.Item name="flatNumber" label="Flat Number" rules={[{ required: true }]}><Input /></Form.Item>}
          {isRegister && role === 'admin' && <Form.Item name="designation" label="Designation" rules={[{ required: true }]}><Input /></Form.Item>}

          <Button type="primary" htmlType="submit" block>{isRegister ? "Register" : "LOG IN"}</Button>
          <Button type="link" onClick={() => setIsRegister(!isRegister)} block>
            {isRegister ? "Back to Login" : "Not registered? Create account"}
          </Button>
        </Form>
      </Card>
      </div>
    </div>
  );
};

const Login = ({ isDark, setIsDark }: PageProps) => (
  <App>
    <LoginContent isDark={isDark} setIsDark={setIsDark} />
  </App>
);
export default Login;