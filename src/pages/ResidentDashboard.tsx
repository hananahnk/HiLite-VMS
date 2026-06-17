import { useState, useEffect, useMemo } from 'react';
import {Row, Col, Card, Statistic, Typography, Tag,  DatePicker,Layout, Table, Button, Space ,Popconfirm} from 'antd';
import { PlusOutlined, DownloadOutlined , CheckOutlined, CloseOutlined, LogoutOutlined, EditOutlined,DeleteOutlined} from '@ant-design/icons';
import api from '../services/api';
import { CSVLink } from 'react-csv';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import { AppHeader } from './AppHeader';
import AddVisitorModal from './AddVisitor';
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title } = Typography;
interface PageProps {
  isDark: boolean;
  setIsDark: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResidentDashboard = ({ isDark, setIsDark }: PageProps) => {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<any>(null); // ADDED THIS STATE
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchMyVisitors = async () => {
    const { data } = await api.get('/visitors');
  
    console.log("Current User ID:", user.id);

  // Filter and log the result
    const myVisitors = data.filter((v: any) => {
      const matchById = v.hostId === user.id;
      const matchByName = v.hostName === user.fullName;
      
      return matchById || matchByName;
    });
  
    setVisitors(myVisitors);
  };

  useEffect(() => { fetchMyVisitors(); }, []);

 

  const handleStatusChange = async (id: string, status: string) => {
  try {
    // Simply update the status and refresh the data
    await api.patch(`/visitors/${id}`, { status });
    fetchMyVisitors();
  } catch (err) { 
    console.error("Status update failed:", err); 
  }
};
  
 
  const statusColors: Record<string, string> = {
  pending: '#eeab63',
  approved: '#89d861',
  completed: '#7e62d5',
  scheduled: '#d4c95e',
  rejected: '#d16157'
  };

  const handleEdit = (visitor: any) => {
    setEditingVisitor(visitor); // Now this actually stores the data
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/visitors/${id}`);
      fetchMyVisitors(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const filteredVisitors = useMemo(() => {
    if (!dateRange) return visitors;
    const [start, end] = dateRange;
  
    return visitors.filter(v => {
      const visitDate = dayjs(v.entryTime || v.scheduledTime);
    // Check if visitDate is between start and end (inclusive)
      return visitDate.isSameOrAfter(start, 'day') && visitDate.isSameOrBefore(end, 'day');
    });
  }, [visitors, dateRange]);

  const kpis = useMemo(() => ({
  total: { val: filteredVisitors.length, color: '#C69214' }, // Use .length here!
  pending: { val: filteredVisitors.filter(v => v.status === 'pending').length, color: '#C69214' },
  approved: { val: filteredVisitors.filter(v => v.status === 'approved').length, color: '#C69214' },
  completed: { val: filteredVisitors.filter(v => v.status === 'completed').length, color: '#C69214' },
  scheduled: { val: filteredVisitors.filter(v => v.status === 'scheduled').length, color: '#C69214' },
  rejected: { val: filteredVisitors.filter(v => v.status === 'rejected').length, color: '#C69214' }
  }), [filteredVisitors]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader isDark={isDark} setIsDark={setIsDark}/>
      <div style={{ padding: '20px' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <Title level={1}>My Visitors</Title>
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
          <CSVLink data={filteredVisitors} filename="my_visitors.csv"><Button icon={<DownloadOutlined />}>Export</Button></CSVLink>
          <DatePicker.RangePicker 
            value={dateRange} 
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)} 
            renderExtraFooter={() => (
    <Button type="link" onClick={() => setDateRange(null)}>Clear Filter</Button>)}
            presets={[
            {
              label: 'Today',
              value: [dayjs().startOf('day'), dayjs().endOf('day')],
            },
            {
              label: 'Last 7 Days',
              value: [dayjs().subtract(7, 'd'), dayjs()],
            },
            
          ]}
  // This helps keep it compact
          size="middle"
          />
        </div>
        

        <Table 
        dataSource={filteredVisitors} 
        rowKey="id" 
        columns={[
          { title: 'Visitor', dataIndex: 'visitorName', align: 'center' },
          { title: 'Phone', dataIndex: 'visitorPhone', align: 'center' },
          { title: 'Purpose', dataIndex: 'purpose', align: 'center' },
          { title: 'Scheduled', dataIndex: 'scheduledTime', render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm') , align: 'center'},
          { title: 'Status', dataIndex: 'status', align: 'center',
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
          { 
            title: 'Duration', 
            dataIndex: 'duration', 
            align: 'center',
            render: (d) => d || '-' 
          },
          {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_: any, r: any) => (
              <Space size="small" style={{ display: 'flex', justifyContent: 'center' }}>
                {r.status === 'pending' && (
                <>
                  <Button size="small" style={{ backgroundColor: '#51962e', color: 'white' }} icon={<CheckOutlined />} 
                  onClick={() => {console.log("Record flatNumber:", r.hostName); // Debug here!
                                  handleStatusChange(r.id, 'approved');
                                  }}>Approve
                  </Button>


                  <Button size="small" style={{ backgroundColor: '#ee3131', color: 'white' }} 
                  icon={<CloseOutlined />} 
                  onClick={() => handleStatusChange(r.id, 'rejected')}>Reject
                  </Button>
          </>
                )}
        
        
                <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>Edit</Button>

    
                <Popconfirm title="Are you sure you want to delete this visitor?" onConfirm={() => handleDelete(r.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
        />
        <AddVisitorModal 
          isVisible={isModalVisible} 
          onClose={() => { setIsModalVisible(false); setEditingVisitor(null); }} 
          refreshData={fetchMyVisitors} 
          visitors={visitors}
          editingVisitor={editingVisitor} // Pass the data to the modal
        />
      </div>
    </Layout>
  );
};

export default ResidentDashboard;