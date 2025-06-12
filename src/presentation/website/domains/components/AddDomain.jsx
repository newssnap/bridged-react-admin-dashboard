import { Col, Form, Input, Row } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDomainHost } from "../../../../redux/slices/domains/domainSlice";

function AddDomain({ setIsSubmittable }) {
  const dispatch = useDispatch();
  const domainData = useSelector((state) => state.domain.data);
  const domains = domainData?.domains;
  const host = domainData?.host;
  const domainTitles = domains?.map((item) => item?.host);

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

  // Handle changes in the input field
  const onChangeHandler = (e) => {
    dispatch(setDomainHost(e?.host));
  };

  return (
    <Form
      form={form}
      initialValues={{
        host: host,
      }}
      onValuesChange={onChangeHandler}
      size="large"
      layout="vertical"
    >
      <Row gutter={[15, 15]}>
        <Col span={24}>
          <Form.Item
            label="Domain URL"
            name="host"
            rules={[
              {
                required: true,
                message: "Please enter a domain",
              },
              {
                validator: (rule, value) => {
                  if (domainTitles && domainTitles.includes(value)) {
                    return Promise.reject("This domain already exists");
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            {/* Input for entering a domain */}
            <Input placeholder="Enter a Domain" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default AddDomain;
