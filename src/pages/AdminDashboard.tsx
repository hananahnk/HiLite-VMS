import { useState, useEffect, useMemo } from 'react';
import { Row, Col, Card, Statistic, Typography, DatePicker, Layout, Table, Button ,Tag, Input} from 'antd'; // Added Button here
import { DownloadOutlined } from '@ant-design/icons';
import api from '../services/api';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import { AppHeader } from './AppHeader';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title } = Typography;
interface PageProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminDashboard = ({ isDark, setIsDark }: PageProps) => {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [visitorNameFilter, setVisitorNameFilter] = useState('');
  const [hostNameFilter, setHostNameFilter] = useState('');
  const [flatNumberFilter, setFlatNumberFilter] = useState('');

  useEffect(() => {
    const fetchVisitors = async () => {
      const { data } = await api.get('/visitors');
      setVisitors(data);
    };
    fetchVisitors();
  }, []);
  const getColumnSearchProps = (
    value: string, 
    setValue: (val: string) => void
  ) => ({
    filterDropdown: ({ confirm }: any) => (
      <div style={{ padding: 8 }}>
        <Input 
        value={value} 
        onChange={(e) => setValue(e.target.value)}
        onPressEnter={() => confirm()}
        style={{ marginBottom: 8, display: 'block' }}
      />
        <Button onClick={() => confirm()} size="small" style={{ width: 90 }}>Filter</Button>
      </div>
   ),
    filterIcon: (filtered: boolean) => (
      <span style={{ color: filtered ? '#1890ff' : '#bfbfbf', fontWeight: 'bold' }}>🔍</span>
    ),
  });

  const filteredVisitors = useMemo(() => {
    return visitors.filter(v => {
   
      const visitDate = dayjs(v.entryTime || v.scheduledTime);
      const matchesDate = !dateRange || 
        (visitDate.isSameOrAfter(dateRange[0], 'day') && visitDate.isSameOrBefore(dateRange[1], 'day'));


      const matchesVisitor = v.visitorName?.toLowerCase().includes(visitorNameFilter.toLowerCase());
      const matchesHost = v.hostName?.toLowerCase().includes(hostNameFilter.toLowerCase());
      const matchesFlat = v.flatNumber?.toString().includes(flatNumberFilter);

      return matchesDate && matchesVisitor && matchesHost && matchesFlat;
    });
  }, [visitors, dateRange, visitorNameFilter, hostNameFilter, flatNumberFilter]);

  const kpis = useMemo(() => ({
  total: { val: filteredVisitors.length, color: '#C69214' }, // Use .length here!
  pending: { val: filteredVisitors.filter(v => v.status === 'pending').length, color: '#C69214' },
  approved: { val: filteredVisitors.filter(v => v.status === 'approved').length, color: '#C69214' },
  completed: { val: filteredVisitors.filter(v => v.status === 'completed').length, color: '#C69214' },
  scheduled: { val: filteredVisitors.filter(v => v.status === 'scheduled').length, color: '#C69214' },
  rejected: { val: filteredVisitors.filter(v => v.status === 'rejected').length, color: '#C69214' }
  }), [filteredVisitors]);

  const statusColors: Record<string, string> = {
  pending: '#eeab63',
  approved: '#89d861',
  completed: '#7e62d5',
  scheduled: '#d4c95e',
  rejected: '#d16157'
  };
 
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader isDark={isDark} setIsDark={setIsDark} />
      <div style={{ padding: '20px' }}>
        {/* Top Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           
            <Title level={1} style={{ margin: 0 }}>Admin Dashboard</Title>
          </div>
          
          
        </div>

        {/* KPIs */}
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
            <CSVLink data={filteredVisitors} filename="admin_report.csv">
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

    
        <Table 
          dataSource={filteredVisitors} 
          rowKey="id" 
          columns={[
            { title: 'Visitor', dataIndex: 'visitorName' , align: 'center',...getColumnSearchProps(visitorNameFilter, setVisitorNameFilter)},
            { title: 'Phone', dataIndex: 'visitorPhone', align: 'center' },
            { title: 'Purpose', dataIndex: 'purpose' , align: 'center'},
            { title: 'Scheduled', dataIndex: 'scheduledTime', render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm') , align: 'center'},
            { title: 'Host', dataIndex: 'hostName' , align: 'center',...getColumnSearchProps(hostNameFilter, setHostNameFilter)},
            { title: 'Room', dataIndex: 'flatNumber' , align: 'center',...getColumnSearchProps(flatNumberFilter, setFlatNumberFilter)},
            { 
              title: 'Status', 
              dataIndex: 'status', 
              align: 'center',
              render: (s: string) => (
                <Tag color={statusColors[s] || '#d9d9d9'}>
                  {s?.toUpperCase()}
                </Tag>
              )
            },
            { 
              title: 'Entry', 
              dataIndex: 'entryTime', 
              align: 'center',
              render: (t) => t ? dayjs(t).format('HH:mm') : '-' 
            },
            { 
              title: 'Exit', 
              dataIndex: 'exitTime', 
              align: 'center',
              render: (t) => t ? dayjs(t).format('HH:mm') : '-' 
            },
            
            { title: 'Duration', dataIndex: 'duration' , align: 'center' ,render: (duration) => duration || '-'}
          ]} 
        />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
