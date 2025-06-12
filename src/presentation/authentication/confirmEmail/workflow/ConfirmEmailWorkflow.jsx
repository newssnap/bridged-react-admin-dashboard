import { Button, Col, Form, Input, Row } from 'antd';

import AuthenticationLayout from '../../../../layouts/AuthenticationLayout';
import { useEffect, useState } from 'react';
import useCustomResendVerificationCode from '../controller/useCustomResendVerificationCode';
import useVerifyEmail from '../controller/useVerifyEmail';

function ConfirmEmailWorkflow({ email, teamMemberId }) {
  const { resendCodeLoading, resendCodeBtnText, resendCode } = useCustomResendVerificationCode();
  const { isLoading, verifyEmailHandler } = useVerifyEmail();

  const [isSubmittable, setIsSubmittable] = useState(false);

  // Create a form instance and watch for changes
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  useEffect(() => {
    // Validate form fields to determine submittability
    form.validateFields({ validateOnly: true }).then(
      () => {
        setIsSubmittable(true);
      },
      () => {
        setIsSubmittable(false);
      }
    );
  }, [values]);

  return (
    <AuthenticationLayout Sidebarcontent="Create maximum conversions on your content">
      <Form
        form={form}
        onFinish={e => {
          verifyEmailHandler(
            {
              ...e,
              email: email,
            },
            teamMemberId
          );
        }}
        size="large"
        layout="vertical"
      >
        <Row style={{ height: '100%', width: '100%' }}>
          <Col span={24}>
            <h1>Confirm Email Address</h1>
            <h3 className="lightTitle">
              Please enter five digit code that is sent to:{' '}
              <a
                className="lightTitle linkTag"
                href={`mailto:${email}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {email}
              </a>
            </h3>
          </Col>
          <Col style={{ alignSelf: 'center' }} span={24}>
            <Row gutter={[30, 15]}>
              <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
                <Form.Item
                  label="Verification Code"
                  name="verificationCode"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input type="number" placeholder="Verification Code" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col style={{ alignSelf: 'end' }} span={24}>
            <Row
              justify="start"
              align="middle"
              style={{
                gap: 15,
              }}
            >
              <Form.Item>
                <Button
                  loading={resendCodeLoading}
                  disabled={resendCodeBtnText !== 'Resend code'}
                  style={{
                    paddingLeft: 'var(--mpr-1)',
                    paddingRight: 'var(--mpr-1)',
                  }}
                  onClick={() => {
                    resendCode(email);
                  }}
                  type="primary"
                >
                  {resendCodeBtnText}
                </Button>
              </Form.Item>
              <Form.Item>
                <Button
                  loading={isLoading}
                  disabled={!isSubmittable}
                  style={{
                    paddingLeft: 'var(--mpr-1)',
                    paddingRight: 'var(--mpr-1)',
                  }}
                  type="primary"
                  htmlType="submit"
                >
                  Submit
                </Button>
              </Form.Item>
            </Row>
          </Col>
        </Row>
      </Form>
    </AuthenticationLayout>
  );
}

export default ConfirmEmailWorkflow;
