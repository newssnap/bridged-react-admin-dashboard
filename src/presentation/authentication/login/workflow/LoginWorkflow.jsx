import { Button, Col, Divider, Form, Input, Row } from 'antd';
import AuthenticationLayout from '../../../../layouts/AuthenticationLayout';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useLoginHandler from '../controller/useLoginHandler';
import GoogleLogin from '../../reusable/components/GoogleLogin';
import useGoogleLoginHandler from '../../reusable/controllers/useGoogleLoginHandler';
import useFacebookLoginHandler from '../../reusable/controllers/useFacebookLoginHandler';

function LoginWorkflow() {
  const { isLoading, loginHandler } = useLoginHandler();
  const { isLoading: isGoogleLoading, googleLoginHandler } = useGoogleLoginHandler();
  const { isLoading: isFacebookLoading } = useFacebookLoginHandler();
  const [form] = Form.useForm();

  return (
    <AuthenticationLayout Sidebarcontent="Creating AI-powered customer agents that engage, convert and retain your users">
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
            <p className="opacity05">Please enter your details</p>
          </Col>
          <Col style={{ alignSelf: 'center' }} span={24}>
            <Row gutter={[30, 15]}>
              <Col {...{ xs: 24, sm: 24, md: 24, lg: 24 }}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      type: 'email',
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder="Enter your email" />
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
                  <Input.Password placeholder="Enter your password" />
                </Form.Item>
                <Col
                  span={24}
                  style={{
                    marginTop: 'var(--mpr-3)',
                  }}
                >
                  <Row justify="end" align="middle">
                    <Link to="/forgotpassword" className="login-form-forgot" href="">
                      <p className="primaryTextColor">Forgot password?</p>
                    </Link>
                  </Row>
                </Col>
              </Col>
            </Row>
            <Divider style={{ margin: 'var(--mpr-1) 0px' }}>
              <p
                className="opacity05"
                style={{
                  fontSize: '0.7rem',
                }}
              >
                Or
              </p>
            </Divider>
            <Row gutter={[30, 30]}>
              {/* Google Sign-In */}
              <Col span={24}>
                <GoogleLogin googleLoginHandler={googleLoginHandler} />
              </Col>

              {/* Facebook Sign-In */}
              {/* <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
                <FacebookLoginComponent
                  facebookLoginHandler={facebookLoginHandler}
                />
              </Col> */}
            </Row>
          </Col>
          <Col style={{ alignSelf: 'end' }} span={24}>
            <Form.Item>
              <Button
                loading={isLoading || isGoogleLoading || isFacebookLoading}
                block
                type="primary"
                htmlType="submit"
              >
                Sign In
              </Button>
            </Form.Item>
            <p style={{ marginTop: 'var(--mpr-2)', textAlign: 'center' }}>
              Don’t have an account?{' '}
              <Link to="/register">
                <span
                  style={{
                    fontWeight: 600,
                  }}
                  className="primaryTextColor"
                >
                  Register
                </span>
              </Link>
            </p>
          </Col>
        </Row>
      </Form>
    </AuthenticationLayout>
  );
}

export default LoginWorkflow;
