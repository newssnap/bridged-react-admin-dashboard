import { Button, Col, Drawer, Empty, Popconfirm, Row, Table, Tag } from 'antd';
import React, { useState } from 'react';
import usePageDetailsHandler from '../controllers/usePageDetailsHandler';
import { useNavigate } from 'react-router-dom';
import LivePreview from '../../../../utils/components/livePreview/workflow/LivePreview';

function generateRandomLightHexColor() {
  // Generate random values for red, green, and blue components
  var red = Math.floor(Math.random() * 128) + 128; // 128-255 for lighter shades
  var green = Math.floor(Math.random() * 128) + 128;
  var blue = Math.floor(Math.random() * 128) + 128;

  // Convert decimal to hexadecimal
  var redHex = red.toString(16).padStart(2, '0'); // Ensure two digits
  var greenHex = green.toString(16).padStart(2, '0');
  var blueHex = blue.toString(16).padStart(2, '0');

  // Concatenate to form the hex color code
  var hexColor = '#' + redHex + greenHex + blueHex;

  // Add opacity (alpha) value (50%)
  var opacityHex = Math.floor(0.3 * 255)
    .toString(16)
    .padStart(2, '0');
  hexColor += opacityHex;

  return hexColor;
}

function PageDetail({ isOpen, setIsOpen, pageData }) {
  const [isLivePreview, setIsLivePreview] = useState(false);
  const navigate = useNavigate();
  const {
    tableData,
    tableIsLoading,
    exludeIsLoading,
    previewLoading,
    handleExcludePage,
    handleDeleteEng,
  } = usePageDetailsHandler(pageData?._id);

  const columns = [
    {
      title: 'Agents',
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => {
        const pageIsExcluded = record?.pageIsExcluded;
        return (
          <Row justify="start" align="middle" style={{ gap: 5 }}>
            <p>{title}</p>

            {pageIsExcluded && <Tag color="orange"> Excluded </Tag>}
          </Row>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Actions',
      dataIndex: '_id',
      key: '_id',
      width: '200px',
      render: (_id, record) => {
        const pageIsExcluded = record?.pageIsExcluded;
        return (
          <Row justify="start" align="middle">
            {record?.devType === 'agent' ? (
              <>
                {!pageIsExcluded && (
                  <>
                    <Button
                      type="link"
                      onClick={() => handleExcludePage(_id)}
                      disabled={exludeIsLoading}
                    >
                      Exclude
                    </Button>
                    |
                  </>
                )}
                <Button
                  type="link"
                  onClick={() => {
                    navigate(`/agent/edit?_id=${_id}&redirect=website_pages`);
                  }}
                >
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsLivePreview(true);
                  }}
                  loading={previewLoading}
                  type="link"
                >
                  View
                </Button>
                |
                {record?.devType !== 'agent' && (
                  <Button
                    loading={previewLoading}
                    type="link"
                    onClick={() => {
                      if (record?.devType === 'cta') {
                        navigate(`/cta/edit?_id=${_id}&redirect=website_pages`);
                      } else {
                        navigate(`/engagement/edit?_id=${_id}&redirect=website_pages`);
                      }
                    }}
                  >
                    Edit
                  </Button>
                )}
                {record?.devType === 'engagement' && (
                  <>
                    |
                    <Popconfirm
                      title="Delete the engagement"
                      description="Are you sure you want to delete this engagement?"
                      onConfirm={() => handleDeleteEng(_id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="link"
                        style={{
                          color: 'red',
                        }}
                      >
                        delete
                      </Button>
                    </Popconfirm>
                  </>
                )}
              </>
            )}
          </Row>
        );
      },
    },
  ];

  return (
    <Drawer
      title={
        <h2 className="secondLine" style={{ overflow: 'hidden' }}>
          Page Details
        </h2>
      }
      onClose={() => {
        setIsOpen(false);
      }}
      closeIcon
      open={isOpen}
      width={900}
    >
      <Row gutter={[30, 30]}>
        <Col span={24}>
          <a target="_blank" href={pageData?.url} className="linkTag" rel="noreferrer">
            {pageData?.url}
          </a>
        </Col>
        <Col span={24}>
          <Row
            justify="start"
            align="middle"
            style={{
              gap: 15,
            }}
          >
            {pageData?.categories?.map((item, index) => {
              var randomColor = generateRandomLightHexColor();

              return (
                <Button
                  key={index}
                  style={{
                    backgroundColor: randomColor,
                    fontWeight: 600,
                  }}
                  size="large"
                  shape="round"
                  type="text"
                >
                  {item}
                </Button>
              );
            })}
          </Row>
        </Col>
        <Col span={24}>
          <Table
            loading={tableIsLoading}
            locale={{
              emptyText: (
                <Empty
                  style={{
                    paddingTop: '70px',
                    height: '100%',
                    minHeight: '245px',
                  }}
                  image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                  imageStyle={{
                    height: 60,
                  }}
                  description={<span>No Pages</span>}
                ></Empty>
              ),
            }}
            bordered
            dataSource={tableData}
            columns={columns}
            pagination={{
              size: 'small',
            }}
          />
        </Col>
      </Row>
    </Drawer>
  );
}

export default PageDetail;
