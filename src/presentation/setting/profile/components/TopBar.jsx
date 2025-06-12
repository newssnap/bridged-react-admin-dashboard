import { Affix, Button, Col, Row, Skeleton, Space, Typography, notification } from 'antd';
import React from 'react';
import { useUpdateUserInfoMutation } from '../../../../services/api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

function TopBar({ userData, isLoading: userIsLoading }) {
  const navigate = useNavigate();
  const [_UPDATE_USER, { isLoading }] = useUpdateUserInfoMutation();
  const updateProfileHandler = async () => {
    const response = await _UPDATE_USER(userData);

    if (response?.data?.success) {
      notification.success({
        message: 'User Profile updated',
        placement: 'bottomRight',
        showProgress: true,
      });
    }

    if (response?.error) {
      notification.error({
        message: response?.error?.data?.errorObject?.userErrorText,
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };
  return (
    <Col span={24}>
      <Row gutter={[0, 15]} justify="space-between" align="middle">
        <Title level={2} className="lightTitle">
          Profile
        </Title>
        {userIsLoading ? (
          <Space size={15}>
            <Skeleton.Button active size="large" style={{ width: '115px' }} />
            <Skeleton.Button active size="large" />
          </Space>
        ) : (
          <Affix offsetTop={30}>
            <Space size={15}>
              <Button
                size="large"
                onClick={() => {
                  navigate('/');
                }}
              >
                Discard Changes
              </Button>
              <Button
                onClick={updateProfileHandler}
                loading={isLoading}
                size="large"
                type="primary"
              >
                Save
              </Button>
            </Space>
          </Affix>
        )}
      </Row>
    </Col>
  );
}

export default TopBar;
