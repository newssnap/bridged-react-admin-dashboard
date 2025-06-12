import { Button, Col, Dropdown, Empty, Row, Table } from 'antd';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import formatDate from '../../../../utils/formatting/formateDate';
import { MoreOutlined } from '@ant-design/icons';
import PageDetail from './PageDetail';

function AllPages({ isLoading, setPageNumberHandler }) {
  const [isPageDetailsOpen, setIsPageDetailsOpen] = useState(false);
  const [pageData, setPageData] = useState({});
  const { totalLength, pages, page } = useSelector(state => state.pages.data);

  const renderDropdown = data => {
    const dropdownMenu = [
      {
        key: 1,
        label: 'View details',
        onClick: () => {
          setPageData(data);
          setIsPageDetailsOpen(true);
        },
      },
    ];

    return (
      <Dropdown menu={{ items: dropdownMenu }} arrow trigger="click">
        <Button size="" shape="circle" type="text">
          <MoreOutlined style={{ fontSize: '1rem' }} />
        </Button>
      </Dropdown>
    );
  };

  const columns = [
    {
      title: 'Page URL',
      dataIndex: 'url',
      ellipsis: true,
      editable: true,
      width: '50%',
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      render: item => <p>{item?.join(', ')}</p>,
    },
    {
      title: 'Author',
      dataIndex: 'author',
    },
    {
      title: 'Indexed Date',
      dataIndex: 'indexedDate',
      render: (item, record) => {
        return (
          <Row align="middle" justify="space-between" style={{ gap: 15 }}>
            <p>{formatDate(item)}</p>
            {renderDropdown(record)}
          </Row>
        );
      },
    },
  ];

  return (
    <Col span={24}>
      <Table
        loading={isLoading}
        bordered
        columns={columns}
        dataSource={(pages || []).map((item, index) => ({
          ...item,
          key: index + 1,
        }))}
        locale={{
          emptyText: (
            <Empty
              style={{ paddingTop: '70px', height: '100%', minHeight: '245px' }}
              description={<span>No Pages</span>}
            />
          ),
        }}
        pagination={{
          current: page,
          pageSize: 10,
          showSizeChanger: false,
          total: totalLength,
          onChange: e => {
            setPageNumberHandler(e);
          },
          position: ['bottomLeft'],
        }}
        scroll={{
          x: 600,
        }}
      />
      <PageDetail isOpen={isPageDetailsOpen} setIsOpen={setIsPageDetailsOpen} pageData={pageData} />
    </Col>
  );
}

export default AllPages;
