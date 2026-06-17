import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Button, Typography ,DatePicker, Layout} from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../services/api';
import VisitorTable from './VisitorList';
import AddVisitorModal from './AddVisitor';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import { AppHeader } from './AppHeader';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface PageProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const { Title } = Typography;

const Dashboard = ({ isDark, setIsDark }: PageProps) => {
 
  const [searchText, setSearchText] = useState('');
  const [flatFilter, setFlatFilter] = useState('');
  const [hostFilter, sethostFilter] = useState('');
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [editingVisitor, setEditingVisitor] = useState<any>(null);
  const fetchVisitors = async () => {
    try {
      const { data } = await api.get('/visitors');
      setVisitors(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchVisitors(); }, []);

  const filteredVisitors = useMemo(() => {
  return visitors.filter(v => {
    // 1. Date filter
    const visitDate = dayjs(v.entryTime || v.scheduledTime);
    const matchesDate = !dateRange || 
      (visitDate.isSameOrAfter(dateRange[0], 'day') && visitDate.isSameOrBefore(dateRange[1], 'day'));
    
    // 2. Name filter
    const matchesName = !searchText || v.visitorName?.toLowerCase().includes(searchText.toLowerCase());
    
    // 3. Flat filter (ADD THIS!)
    const matchesFlat = !flatFilter || v.flatNumber?.toString().includes(flatFilter);

    // 4. Host filter (ADD THIS IF NEEDED!)
    const matchesHost = !hostFilter || v.hostName?.toLowerCase().includes(hostFilter.toLowerCase());

    return matchesDate && matchesName && matchesFlat && matchesHost;
  });
}, [visitors, dateRange, searchText, flatFilter, hostFilter]);

  const handleEdit = (visitor: any) => {
  setEditingVisitor(visitor);
  setIsModalVisible(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
    // Create the payload object
      const payload: any = { status };

    // If status is approved, add current timestamp as entryTime
      if (status === 'approved') {
        payload.entryTime = new Date().toISOString();
      }

    // Patch the update
      await api.patch(`/visitors/${id}`, payload);
    
    // Refresh the table
      await fetchVisitors();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

 

  const handleDelete = async (id: string) => {
  try {
    await api.delete(`/visitors/${id}`);
    fetchVisitors();
  } catch (err) {
    console.error("Failed to delete", err);
  }
  };


  const kpis = useMemo(() => ({
    total: { val: filteredVisitors.length, color: '#C69214' },
    pending: { val: filteredVisitors.filter(v => v.status === 'pending').length, color: '#C69214' },
    approved: { val: filteredVisitors.filter(v => v.status === 'approved').length, color: '#C69214' },
    completed: { val: filteredVisitors.filter(v => v.status === 'completed').length, color: '#C69214' },
    scheduled: { val: filteredVisitors.filter(v => v.status === 'scheduled').length, color: '#C69214' },
    rejected: {val: filteredVisitors.filter(v => v.status === 'rejected').length, color: '#C69214' }
  }), [filteredVisitors]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader isDark={isDark} setIsDark={setIsDark} />
      <div style={{ padding: '20px' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <Title level={1}>Security Portal</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)} size="large" style={{ marginBottom: 20 }}>
        Add Visitor
        </Button>
      </div>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {Object.entries(kpis).map(([key, data]) => (
            <Col xs={12} sm={8} md={4} lg={4} key={key}>
              <Card style={{ backgroundColor: data.color, borderRadius: '8px', textAlign: 'center' }}>
                <Statistic 
          title={<span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{key.toUpperCase()}</span>} 
          value={data.val} 
          valueStyle={{ color: 'white', fontWeight: 'bold', fontSize: '30px' }} 
        />
              </Card>
            </Col>
          ))}
        </Row>

      
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' ,marginBottom: 16}}>
          <CSVLink data={visitors} filename="visitors.csv">
            <Button icon={<DownloadOutlined />}>Export CSV</Button>
          </CSVLink>
          
          <DatePicker.RangePicker 
            
            value={dateRange} 
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)} 
            renderExtraFooter={() => (
            <Button type="link" onClick={() => setDateRange(null)}>Clear Filter</Button>
            )}
            presets={[
            { label: 'Today', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
            { label: 'Last 7 Days', value: [dayjs().subtract(7, 'd'), dayjs()] },
            ]}
            size="middle"
            />
      </div>

      <VisitorTable 
       visitors={filteredVisitors} 
       searchText={searchText}
  setSearchText={setSearchText}
  flatFilter={flatFilter}
  setFlatFilter={setFlatFilter}
  hostFilter={hostFilter}
  sethostFilter={sethostFilter}
  refreshData={fetchVisitors} 
  
  onEdit={(visitor: any) => { setEditingVisitor(visitor); setIsModalVisible(true); }} 
  handleStatusChange={handleStatusChange}
  handleDelete={handleDelete}
      />
      <AddVisitorModal 
  isVisible={isModalVisible} 
  onClose={() => { setIsModalVisible(false); setEditingVisitor(null); }} 
  refreshData={fetchVisitors} 
  visitors={filteredVisitors} 
  editingVisitor={editingVisitor}
  isSecurity={true} 
  
/>
      </div>
    </Layout>
  );
};
export default Dashboard;