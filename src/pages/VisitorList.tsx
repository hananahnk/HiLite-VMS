import { Table, Tag, Button, Input, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import api from '../services/api';
import { EditOutlined, DeleteOutlined ,CheckOutlined, CloseOutlined, LogoutOutlined} from '@ant-design/icons';
import { Visitor } from '../types/visitors';
interface VisitorTableProps {
  visitors: any[];
  refreshData: () => void;
  onEdit: (visitor: any) => void;
  handleStatusChange: (id: string, status: string) => void; // Add this
  handleDelete: (id: string) => void;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  flatFilter: string;
  setFlatFilter: React.Dispatch<React.SetStateAction<string>>;
  hostFilter: string;
  sethostFilter: React.Dispatch<React.SetStateAction<string>>;
}
const statusColors: Record<string, string> = {
  pending: '#eeab63',
  approved: '#89d861',
  completed: '#7e62d5',
  scheduled: '#d4c95e',
  rejected: '#d16157'
};


const VisitorTable = ({ visitors, refreshData ,onEdit,handleStatusChange, handleDelete , searchText, setSearchText, flatFilter, setFlatFilter,hostFilter,sethostFilter}: VisitorTableProps) => {

  const handleExit = async (record: any) => {
  const entryTime = record.entryTime;  
  const exitTime = new Date().toISOString();
  if (!entryTime) {
    await api.patch(`/visitors/${record.id}`, { status: 'completed', exitTime, duration: '' });
    refreshData();
    return;
  }
  
  // 1. Calculate total minutes
  const totalMinutes = record.entryTime ? dayjs(exitTime).diff(dayjs(record.entryTime), 'minute') : 0;
  
  // 2. Format into "Xh Ym"
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const formattedDuration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  
    await api.patch(`/visitors/${record.id}`, { 
      status: 'completed', 
      exitTime, 
      duration: formattedDuration 
    });
    refreshData();
  };

 
  

  // Helper for text filtering
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



  const columns: ColumnsType<any> = [
  
  { 
    title: 'Visitor', 
    dataIndex: 'visitorName', 
    align: 'center',...getColumnSearchProps( searchText, setSearchText)
  },
  { title: 'Phone', dataIndex: 'visitorPhone', align: 'center' },
  { title: 'Purpose', dataIndex: 'purpose' , align: 'center'},
  { 
    title: 'Host', 
    dataIndex: 'hostName', 
   align: 'center' ,...getColumnSearchProps(hostFilter, sethostFilter)
  },
  { title: 'Host Phone', dataIndex: 'hostPhone' , align: 'center'},
  { 
    title: 'Room', 
    dataIndex: 'flatNumber', 
     align: 'center',...getColumnSearchProps(flatFilter, setFlatFilter)
  },
  { title: 'Scheduled', dataIndex: 'scheduledTime', render: (t) => t ? dayjs(t).format('HH:mm') : '-', align: 'center' },
  { 
      title: 'Status', 
      dataIndex: 'status', 
      render: (s: string) => (
        <Tag color={statusColors[s] || '#d9d9d9'}>
          {s?.toUpperCase()}
        </Tag>
      ) , align: 'center'
    },
  { title: 'Entry', dataIndex: 'entryTime', render: (t) => t ? dayjs(t).format('HH:mm') : '-' , align: 'center'},
  { title: 'Exit', dataIndex: 'exitTime', render: (t) => t ? dayjs(t).format('HH:mm') : '-' , align: 'center'},
  { title: 'Duration', dataIndex: 'duration' , align: 'center' ,render: (duration) => duration || '-'},
  { 
    title: 'Action', 
    render: (_: any, r: any) => (
      <Space size="small" style={{ display: 'flex', justifyContent: 'center' }}>
          {r.status === 'pending' && (
            <>
              <Button 
               size="small" 
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }} 
              icon={<CheckOutlined />} 
              onClick={() => handleStatusChange(r.id, 'approved')}
              >
               Approve
              </Button>
              <Button 
              size="small" 
               danger 
              icon={<CloseOutlined />} 
              onClick={() => handleStatusChange(r.id, 'rejected')} 
               >
               Reject
              </Button>
            </>
          )}
              <Button icon={<EditOutlined />} onClick={() => onEdit(r)} />
              <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}>
              <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
              <Button 
            onClick={() => handleExit(r)} 
            disabled={r.status !== 'approved'}
            style={{ backgroundColor: '#f58a2c', borderColor: '#f58a2c', color: 'white' }}
          >
            Exit
              </Button>
        </Space>
      )
    }
  ];

  return <Table dataSource={visitors} columns={columns} rowKey="id" scroll={{ x: 1200 }} />;
};

export default VisitorTable;


