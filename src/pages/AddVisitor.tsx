import { Modal, Form, Input, Select, message, DatePicker} from 'antd';
import { useState, useEffect } from 'react';
import api from '../services/api';
import VisitorTable from './VisitorList';
import dayjs from 'dayjs';
import { phoneRule } from '../utils/validation';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  refreshData: () => void;
  visitors: any[];
}

const AddVisitorModal = ({ isVisible, onClose, refreshData,visitors, editingVisitor, isSecurity = false }: any) => {
  const [form] = Form.useForm();
  const [residents, setResidents] = useState<any[]>([]);
  const [showOther, setShowOther] = useState(false);
  const [filteredResidents, setFilteredResidents] = useState<any[]>([]);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isResident = user.role === 'resident';
  const showHostFields = isSecurity;

  useEffect(() => {
    if (showHostFields) {
      api.get('/users').then(res => {
        setResidents(res.data.filter((u: any) => u.role === 'resident'));
      });
    }
  }, [showHostFields]);

  useEffect(() => {
    if (isVisible && editingVisitor) {
      form.setFieldsValue({
        ...editingVisitor,
        scheduledTime: editingVisitor.scheduledTime ? dayjs(editingVisitor.scheduledTime) : null
      });
      setShowOther(!['Delivery', 'Guest', 'Maintenance'].includes(editingVisitor.purpose));
      
      if (showHostFields) {
        setFilteredResidents(residents.filter(r => r.flatNumber === editingVisitor.flatNumber));
      }
    } else {
      form.resetFields();
    }
  }, [isVisible, editingVisitor, form, residents, showHostFields]);

  const handleFinish = async (values: any) => {
    try {
      const selectedResident = showHostFields 
        ? residents.find(r => r.fullName === values.hostName) 
        : user;
      const payload = {
      ...values,
      scheduledTime: values.scheduledTime.toISOString(),
      purpose: values.purpose === 'Other' ? values.otherPurpose : values.purpose,
      
      // FIX: Ensure hostId is ALWAYS included, regardless of role
      hostId: selectedResident ? selectedResident.id : user.id,
      flatNumber: showHostFields ? values.flatNumber : user.flatNumber,
      hostName: showHostFields ? values.hostName : user.fullName,
      hostPhone: showHostFields ? values.hostPhone : user.contactNumber,
      otherPurpose: undefined 
      };

      if (editingVisitor) {
        await api.patch(`/visitors/${editingVisitor.id}`, payload);
        message.success('Visitor updated!');
      } else {
      // Keep your ID generation logic
        const maxId = visitors.length > 0 ? Math.max(...visitors.map((v: any) => parseInt(v.id.replace('v', '')) || 0)) : 0;
        await api.post('/visitors', { ...payload, id: `v${maxId + 1}`, status: 'pending', entryTime: null });
        message.success('Visitor registered!');
      }
      refreshData();
      onClose();
    } catch (error) {
      message.error('Failed to save.');
    }
  };

  return (
    <Modal title={editingVisitor ? "Edit Visitor" : "Register Visitor"} open={isVisible} onCancel={onClose} onOk={() => form.submit()}>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="visitorName" label="Visitor Name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="visitorPhone" label="Phone Number" rules={[{ required: true },phoneRule]} ><Input /></Form.Item>
        <Form.Item name="purpose" label="Purpose" rules={[{ required: true }]}>
          <Select onChange={(v) => setShowOther(v === 'Other')}>
            <Select.Option value="Delivery">Delivery</Select.Option>
            <Select.Option value="Guest">Guest</Select.Option>
            <Select.Option value="Maintenance">Maintenance</Select.Option>
            <Select.Option value="Other">Other</Select.Option>
          </Select>
        </Form.Item>
        {showOther && <Form.Item name="otherPurpose" label="Specify Purpose"><Input /></Form.Item>}
        <Form.Item name="scheduledTime" label="Schedule Date & Time" rules={[{ required: true }]}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
        </Form.Item>


        {showHostFields &&(
          <>
            <Form.Item name="flatNumber" label="Flat Number" rules={[{ required: true }]}>
              <Select onChange={(val) => {
                setFilteredResidents(residents.filter(r => r.flatNumber === val));
                form.setFieldsValue({ hostName: undefined, hostPhone: undefined });
              }}>
                {Array.from(new Set(residents.map(r => r.flatNumber))).map(f => <Select.Option key={f} value={f}>{f}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="hostName" label="Host Name" rules={[{ required: true }]}>
              <Select onChange={(val) => {
                const res = residents.find(r => r.fullName === val);
                if (res) form.setFieldsValue({ hostPhone: res.contactNumber });
              }}>
                {filteredResidents.map(r => <Select.Option key={r.id} value={r.fullName}>{r.fullName}</Select.Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="hostPhone" label="Host Phone" rules={[phoneRule]}><Input readOnly /></Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};
export default AddVisitorModal;