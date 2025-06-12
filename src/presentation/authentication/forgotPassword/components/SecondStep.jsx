import { Button, Col, Form, Input, Row } from 'antd';
import React from 'react';

function SecondStep({ isSubmittable, forgotPasswordIsLoading, email }) {
  return (
    <>
      <Col style={{ alignSelf: 'center' }} span={24}>
        <Row gutter={[30, 15]}>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 24 }}>
            <Form.Item
              type="number"
              label={`Please enter five digit code sent to ${email}`}
              name="forgotCode"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input
                placeholder="Enter Verification Code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={5}
              />
            </Form.Item>
          </Col>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 24 }}>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.Password
                placeholder="Create a strong password"
                autoComplete="new-password"
                autoCorrect="off"
                spellCheck="false"
                autoCapitalize="off"
                data-1p-ignore
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col style={{ alignSelf: 'end' }} span={24}>
        <Form.Item>
          <Button
            disabled={!isSubmittable}
            loading={forgotPasswordIsLoading}
            style={{
              paddingLeft: 'var(--mpr-1)',
              paddingRight: 'var(--mpr-1)',
            }}
            block
            type="primary"
            htmlType="submit"
          >
            Reset Password
          </Button>
        </Form.Item>
      </Col>
    </>
  );
}

export default SecondStep;
