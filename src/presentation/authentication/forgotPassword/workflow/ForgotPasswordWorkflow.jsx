import React, { useEffect, useState } from 'react';
import AuthenticationLayout from '../../../../layouts/AuthenticationLayout';
import { Col, Form, Row } from 'antd';
import FirstStep from '../components/FirstStep';
import useForgotPasswordHandler from '../controller/useForgotPasswordHandler';
import SecondStep from '../components/SecondStep';

function ForgotPasswordWorkflow() {
  const [email, setEmail] = useState('');
  const {
    sendVerificationCode,
    verifyEmailIsLoading,
    verifyEmailIsSuccess,
    resetPasswordHandler,
    forgotPasswordIsLoading,
  } = useForgotPasswordHandler();
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

  const section = () => {
    switch (verifyEmailIsSuccess) {
      case true:
        return (
          <SecondStep
            email={email}
            isSubmittable={isSubmittable}
            forgotPasswordIsLoading={forgotPasswordIsLoading}
          />
        );
      case false:
        return (
          <FirstStep
            isSubmittable={isSubmittable}
            verifyEmailIsLoading={verifyEmailIsLoading}
            setEmail={setEmail}
          />
        );
      default:
        return (
          <SecondStep
            email={email}
            isSubmittable={isSubmittable}
            forgotPasswordIsLoading={forgotPasswordIsLoading}
          />
        );
    }
  };

  return (
    <AuthenticationLayout Sidebarcontent="Creating AI-powered customer agents that engage, convert, and retain your users">
      <Form
        form={form}
        onFinish={e => {
          // If email verification is successful, reset the password.
          if (verifyEmailIsSuccess) {
            resetPasswordHandler(e, email);
          } else {
            sendVerificationCode(e);
          }
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
              Forgot password?
            </h1>
            <p className="opacity05">
              Please enter your registered email address below. If your email is registered, you
              will receive a verification code in your inbox. Please check your inbox for the code.
            </p>
          </Col>

          {section()}
        </Row>
      </Form>
    </AuthenticationLayout>
  );
}

export default ForgotPasswordWorkflow;
