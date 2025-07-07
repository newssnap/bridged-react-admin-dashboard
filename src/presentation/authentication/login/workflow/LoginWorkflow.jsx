import { Button, Col, Divider, Form, Input, Row } from 'antd';
import AuthenticationLayout from '../../../../layouts/AuthenticationLayout';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useLoginHandler from '../controller/useLoginHandler';

function LoginWorkflow() {
  const { isLoading, loginHandler } = useLoginHandler();
  const [form] = Form.useForm();

  return (
    <AuthenticationLayout Sidebarcontent="Empower your team with full control over user access and roles in a powerful admin dashboard.">
      <Form
        form={form}
        onFinish={loginHandler}
        size="large"
        layout="vertical"
        style={{ height: '100%', width: '100%' }}
      >
        <Row style={{ height: '100%', width: '100%' }}>
          <Col span={24}>
            <h1
              style={{
                fontWeight: 400,
              }}
            >
              Welcome back
            </h1>
            <p className="opacity05">Access your dashboard to manage users and system settings.</p>
          </Col>
          <Col style={{ alignSelf: 'center' }} span={24}>
            <Row gutter={[30, 15]}>
              <Col {...{ xs: 24, sm: 24, md: 24, lg: 24 }}>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    {
                      type: 'username',
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Enter your username" size="large" />
                </Form.Item>
              </Col>
              <Col {...{ xs: 24, sm: 24, md: 24, lg: 24 }}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input.Password placeholder="Enter your password" size="large" />
                </Form.Item>
                <Col
                  span={24}
                  style={{
                    marginTop: 'var(--mpr-3)',
                  }}
                ></Col>
              </Col>
            </Row>
          </Col>
          <Col style={{ alignSelf: 'end' }} span={24}>
            <Form.Item>
              <Button loading={isLoading} block type="primary" htmlType="submit">
                Sign In
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </AuthenticationLayout>
  );
}

export default LoginWorkflow;
