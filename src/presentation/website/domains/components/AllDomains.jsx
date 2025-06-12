import React from 'react';
import { Button, Col, Dropdown, Empty, Modal, Row, Table, Tooltip } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import useDomainsHandler from '../controllers/useDomainsHandler';
import { useDispatch } from 'react-redux';
import { setIsScriptsDrawerOpen } from '../../../../redux/slices/domains/domainSlice';
import Icon from '../../../../utils/components/Icon';
import { useNavigate } from 'react-router-dom';

function AllDomains({ data, isLoading }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { deleteDomainHandler, verifyClickHandler } = useDomainsHandler();

  // Find domain data by _id
  const onDomainFinder = _id => data?.find(item => item._id === _id);

  // Render dropdown menu for each domain item
  const renderDropdown = item => {
    const isVerified = item?.status === 'verified';

    const dropdownMenu = [
      {
        key: 2,
        label: 'Verify',
        disabled: isVerified,
        onClick: () => verifyClickHandler(item),
      },
      // {
      //   key: 3,
      //   label: 'Install scripts',
      //   disabled: true,
      //   onClick: () => dispatch(setIsScriptsDrawerOpen(true)),
      // },
      {
        key: 4,
        label: (
          <Row
            onClick={() => {
              Modal.confirm({
                title: 'Delete this domain',
                content: 'Are you sure you want to delete this domain?',
                onOk: () => deleteDomainHandler(item?._id),
                cancelText: 'Cancel',
                okText: 'Delete',
                centered: true,
              });
            }}
          >
            <span style={{ color: 'red' }}>Delete</span>
          </Row>
        ),
      },
    ];

    return (
      <Dropdown menu={{ items: dropdownMenu }} arrow trigger="click">
        <Button size="small" shape="circle" type="text">
          <MoreOutlined style={{ fontSize: '1rem' }} />
        </Button>
      </Dropdown>
    );
  };

  const columns = [
    {
      title: 'Domain URL',
      dataIndex: '_id',
      ellipsis: true,
      render: _id => {
        const data = onDomainFinder(_id);
        const host = data?.host;
        const isVerified = data?.status === 'verified';

        return (
          <Tooltip title={`Visit https://www.${host}`} placement="top">
            <p
              style={{
                cursor: 'pointer',
              }}
              onClick={() => {
                window.open('https://www.' + host, '_blank');
              }}
            >
              <Row justify="start" align="middle" style={{ gap: 15 }}>
                {isVerified ? (
                  <div className="greenDot"></div>
                ) : (
                  <Icon name="InfoCircleOutlinedRed" className="redIcon" />
                )}
                https://www.{host}
                <Icon name="LinkOutlined" style={{ opacity: 0.5 }} />
              </Row>
            </p>
          </Tooltip>
        );
      },
      width: '40%',
    },
    {
      title: 'Active Pages',
      dataIndex: 'activePages',
      ellipsis: true,
      render: (text, record) => {
        return (
          <p>
            <span style={{ fontWeight: 600 }}>{text}</span>{' '}
            <span
              className="linkTag"
              onClick={() => {
                navigate(`/pages?domainId=${record?._id}`);
              }}
            >
              View
            </span>
          </p>
        );
      },
    },
    {
      title: 'Verification status',
      dataIndex: 'status',
      ellipsis: true,
      render: text => (
        <p
          style={{
            color: text === 'pendingForAddingDNSRecords' ? 'red' : 'var(--primary-Color)',
          }}
          target="_blank"
          rel="noreferrer"
        >
          {text === 'pendingForAddingDNSRecords' ? 'Not Verified' : 'Verified'}
        </p>
      ),
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      ellipsis: true,
      render: _id => {
        const data = onDomainFinder(_id);

        return (
          <Row justify="space-between" align="middle">
            {renderDropdown(data)}
          </Row>
        );
      },
      width: '100px',
    },
  ];

  return (
    <Col span={24}>
      <Table
        className="domainTable"
        loading={isLoading}
        bordered
        columns={columns}
        dataSource={(data || []).map((item, index) => ({
          ...item,
          key: index + 1,
        }))}
        locale={{
          emptyText: (
            <Empty
              style={{ paddingTop: '70px', height: '100%', minHeight: '245px' }}
              description={<span>No Domains</span>}
            />
          ),
        }}
        pagination={{
          pageSize: 15,
          showSizeChanger: false,
          position: ['bottomLeft'],
        }}
        scroll={{
          x: 600,
        }}
      />
    </Col>
  );
}

export default AllDomains;
