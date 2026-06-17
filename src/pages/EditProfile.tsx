import { Form, Input, Button, Card, Typography, message, App, Switch } from 'antd'; // Import App
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { phoneRule } from '../utils/validation';
const { Title } = Typography;
interface PageProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditProfile = ({ isDark, setIsDark }: PageProps) => {
  const { message } = App.useApp(); // Use the hook instead of the static import
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const onFinish = async (values: any) => {
    // Check if ID exists before calling API
    if (!user.id) {
      message.error('User ID not found. Please log in again.');
      return;
    }

    try {
      await api.patch(`/users/${user.id}`, values);
      
      if (values.fullName !== user.fullName || values.flatNumber !== user.flatNumber) {
        const { data: allVisitors } = await api.get('/visitors');
        const myVisitors = allVisitors.filter((v: any) => v.hostId === user.id);
        
        for (const visitor of myVisitors) {
          await api.patch(`/visitors/${visitor.id}`, {
            hostName: values.fullName,
            flatNumber: values.flatNumber
          });
        }
        message.success('Profile and visitor history synchronized!');
      }

      localStorage.setItem('user', JSON.stringify({ ...user, ...values }));
      message.success('Profile updated!');
      navigate(-1);
    } catch (err: any) {
      console.error("API Error:", err.response?.status); // Log the status to help debug 404s
      message.error('Failed to update profile.');
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
          Edit Profile
        </Title>
    
        <Card className="login-card">
          <Form initialValues={user} onFinish={onFinish} layout="vertical">
            {/* Common Fields for Everyone */}
            <Form.Item name="username" label="Username"><Input /></Form.Item>
            <Form.Item name="password" label="Password"><Input.Password /></Form.Item>
            <Form.Item name="fullName" label="Full Name"><Input /></Form.Item>
            <Form.Item name="contactNumber" label="Phone" rules={[phoneRule]}><Input /></Form.Item>
            
            {/* Role-Specific Fields */}
            {user.role === 'resident' && (
              <Form.Item name="flatNumber" label="Flat Number"><Input /></Form.Item>
            )}
            {user.role === 'admin' && (
              <Form.Item name="designation" label="Designation"><Input /></Form.Item>
            )}
            
            

            <Button type="primary" htmlType="submit" block>Save Changes</Button>
            <Button type="link" onClick={() => navigate(-1)} block>Cancel</Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};
const Login = ({ isDark, setIsDark }: PageProps) => (
  <App>
    <EditProfile isDark={isDark} setIsDark={setIsDark} />
  </App>
);
export default EditProfile;