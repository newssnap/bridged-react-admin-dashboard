import { Button, Col, Form, Input, Row, Typography, notification } from 'antd';
import { useChangeUserPasswordMutation } from '../../../../services/api';

const { Title } = Typography;
function ResetPassword() {
  const [_CHANGE_PASSWORD, { isLoading }] = useChangeUserPasswordMutation();

  const handleChangePassword = async e => {
    const response = await _CHANGE_PASSWORD(e);

    if (response?.data?.success) {
      notification.success({
        message: 'Password updated',
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
      <Row gutter={[30, 30]}>
        <Col span={24}>
          <Title level={3} style={{ fontWeight: 400 }}>
            Reset Password
          </Title>
          <p style={{ marginTop: 'var(--mpr-3)' }} className="opacity05">
            Your new password should be different from your previous one for security purposes.
          </p>
        </Col>
        <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
          <Form onFinish={handleChangePassword} size="large" layout="vertical">
            <Form.Item
              name="currentPassword"
              label="Current Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your current password!',
                },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters long!',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your new password!',
                },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters long!',
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please confirm your new password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item style={{ marginTop: 'var(--mpr-2)' }}>
              <Button loading={isLoading} type="primary" htmlType="submit">
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Col>
  );
}

export default ResetPassword;
