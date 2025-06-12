import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row } from 'antd';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setIsDomainDrawerOpen } from '../../../../redux/slices/domains/domainSlice';

function TopBar({ searchQuery, searchHandler, isLoading }) {
  const dispatch = useDispatch();

  const onAddDomainHandler = () => {
    dispatch(setIsDomainDrawerOpen(true));
  };
  return (
    <Col span={24}>
      <Row gutter={[15, 15]} justify="space-between" align="middle">
        {/* Create Button */}
        <Col>
          <Button disabled={isLoading} onClick={onAddDomainHandler} type="primary" size="large">
            <PlusOutlined style={{ opacity: 1 }} /> Add Domain
          </Button>
        </Col>

        {/* Search Input */}
        <Col {...{ xs: 24, sm: 10, md: 10, lg: 7, xl: 5 }}>
          <Input
            prefix={<SearchOutlined style={{ opacity: 0.5, fontSize: '15px' }} />}
            placeholder="Search"
            size="large"
            style={{ width: '100%' }}
            value={searchQuery}
            onChange={e => searchHandler(e.target.value)}
          />
        </Col>
      </Row>
    </Col>
  );
}

export default TopBar;
