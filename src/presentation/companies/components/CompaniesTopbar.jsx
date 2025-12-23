import React, { useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Typography } from 'antd';
import useDebouncedInput from '../../../utils/controllers/useDebouncedInput';

const { Title } = Typography;

const CompaniesTopbar = ({ onSearchChange, onAddCompany }) => {
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput('');

  // Notify parent when debounced value changes
  useEffect(() => {
    onSearchChange?.(debouncedValue);
  }, [debouncedValue, onSearchChange]);

  const handleChange = event => {
    inputHandler(event.target.value);
  };

  return (
    <Row gutter={[15, 30]} justify="space-between" align="middle">
      <Col span={24}>
        <Title level={2} style={{ margin: 0, fontWeight: 300 }}>
          Companies
        </Title>
      </Col>
      <Col span={6}>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={onAddCompany}>
          Add Company
        </Button>
      </Col>
      <Col span={6}>
        <Input
          allowClear
          size="large"
          value={inputQuery}
          placeholder="Search companiy"
          onChange={handleChange}
        />
      </Col>
    </Row>
  );
};

export default CompaniesTopbar;
