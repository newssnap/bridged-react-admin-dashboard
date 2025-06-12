import { Button, Col, Drawer, Form, Input, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import useSupportHandler from '../controllers/useSupportHandler';

function SupportAndFeedback({ isDrawerOpen, setIsDrawerOpen, supportType }) {
  const { supportHandler, feedbackHandler, isLoading } = useSupportHandler();
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
    <Drawer
      title={`Send an Email to our ${supportType} team`}
      onClose={() => {
        setIsDrawerOpen(false);
      }}
      closeIcon
      open={isDrawerOpen}
      footer={
        <Col
          style={{
            marginBottom: 'var(--mpr-3)',
            marginTop: 'var(--mpr-2)',
          }}
          span={24}
        >
          <Button
            loading={isLoading}
            disabled={!isSubmittable}
            block
            type="primary"
            htmlType="submit"
          >
            Send
          </Button>
        </Col>
      }
    >
      <Form
        form={form}
        onFinish={e => {
          if (supportType === 'Feedback') {
            feedbackHandler(e, setIsDrawerOpen);
          } else {
            supportHandler(e, setIsDrawerOpen);
          }
        }}
        size="large"
        layout="vertical"
      >
        <Row gutter={[15, 15]}>
          <Col span={24}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder="Enter your name" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Subject"
              name="subject"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder="Enter subject" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Message"
              name="body"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input.TextArea
                autoSize={{
                  minRows: 6,
                  maxRows: 6,
                }}
                placeholder="Enter Message"
              />
            </Form.Item>
          </Col>
          {/* <Col
            style={{
              marginTop: "var(--mpr-2)",
            }}
            span={24}
          >
            
          </Col> */}
        </Row>
      </Form>
    </Drawer>
  );
}

export default SupportAndFeedback;
