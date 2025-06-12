import { Button, Col, Form, Input, Row } from "antd";
import React from "react";

function FirstStep({ isSubmittable, verifyEmailIsLoading, setEmail }) {
  return (
    <>
      <Col style={{ alignSelf: "center" }} span={24}>
        <Row gutter={[30, 15]}>
          <Col {...{ xs: 24, sm: 24, md: 24, lg: 24 }}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  type: "email",
                  required: true,
                },
              ]}
            >
              <Input
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                placeholder="Enter your registered email"
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col style={{ alignSelf: "end" }} span={24}>
        <Form.Item>
          <Button
            disabled={!isSubmittable}
            loading={verifyEmailIsLoading}
            style={{
              paddingLeft: "var(--mpr-1)",
              paddingRight: "var(--mpr-1)",
            }}
            block
            type="primary"
            htmlType="submit"
          >
            Send Verification code
          </Button>
        </Form.Item>
      </Col>
    </>
  );
}

export default FirstStep;
