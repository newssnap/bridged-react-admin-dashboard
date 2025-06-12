import { Button, Checkbox, Col, Divider, Form, Input, Row } from 'antd';
import AuthenticationLayout from '../../../../layouts/AuthenticationLayout';
import { Link } from 'react-router-dom';
import GoogleLogin from '../../reusable/components/GoogleLogin';
import useRegisterHandler from '../controller/useRegisterHandler';
import useGoogleLoginHandler from '../../reusable/controllers/useGoogleLoginHandler';
import useFacebookLoginHandler from '../../reusable/controllers/useFacebookLoginHandler';

function RegisterWorkflow({ teamMemberId }) {
  // Custom hooks for handling registration and social logins
  const { isLoading, registerHandler } = useRegisterHandler();
  const { isLoading: isGoogleLoading, googleLoginHandler } = useGoogleLoginHandler();
  const { isLoading: isFacebookLoading } = useFacebookLoginHandler();

  // Create a form instance and watch for changes
  const [form] = Form.useForm();

  return (
    <AuthenticationLayout Sidebarcontent="Creating AI-powered customer agents that engage, convert, and retain your users">
      <Form
        form={form}
        initialValues={{
          isSignedUpForNewsLetter: true,
        }}
        onFinish={e => {
          registerHandler(e, teamMemberId);
        }}
        size="large"
        layout="vertical"
      >
        <Row style={{ height: '100%', width: '100%' }}>
          <Col span={24}>
            <h1
              style={{
                fontWeight: 400,
              }}
            >
              Create your account
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
              <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                    },
                    {
                      min: 8,
                      max: 20,
                      message: 'Password must be between 8 and 20 characters',
                    },
                  ]}
                >
                  <Input.Password placeholder="Create a strong password" />
                </Form.Item>
              </Col>
              <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your password',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject('The two passwords do not match');
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Re-enter your password" />
                </Form.Item>
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
            <Row
              style={{
                width: '100%',
                marginBottom: 'var(--mpr-1)',
                marginTop: 'var(--mpr-2)',
              }}
            >
              <Form.Item
                name="isSignedUpForNewsLetter"
                valuePropName="checked"
                style={{ marginBottom: '0px' }}
              >
                <Checkbox>
                  <p>
                    I agree to receive occasional emails about product updates, promotions, and
                    important industry trends
                  </p>
                </Checkbox>
              </Form.Item>
              <Form.Item
                name="isTermsAndCondition"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value) {
                        return Promise.resolve();
                      }
                      return Promise.reject('You must agree to the terms and conditions');
                    },
                  },
                ]}
              >
                <Checkbox>
                  <p>
                    <span>I agree to all </span>
                    <a
                      href="https://bridged.media/terms-of-service"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        opacity: 1,
                        textDecoration: 'underline',
                      }}
                      className="linkTag"
                    >
                      Terms & Conditions{' '}
                    </a>
                    and{' '}
                    <a
                      href="https://bridged.media/privacy-policy"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        opacity: 1,
                        textDecoration: 'underline',
                      }}
                      className="linkTag"
                    >
                      Privacy policy
                    </a>
                  </p>
                </Checkbox>
              </Form.Item>
            </Row>
            <Form.Item>
              <Button
                loading={isLoading || isGoogleLoading || isFacebookLoading}
                block
                type="primary"
                htmlType="submit"
              >
                Register
              </Button>
            </Form.Item>
            <p style={{ marginTop: 'var(--mpr-2)', textAlign: 'center' }}>
              Already have an account?{' '}
              <Link to="/login">
                <span
                  style={{
                    fontWeight: 600,
                  }}
                  className="primaryTextColor"
                >
                  Log in
                </span>
              </Link>
            </p>
          </Col>
        </Row>
      </Form>
    </AuthenticationLayout>
  );
}

export default RegisterWorkflow;
