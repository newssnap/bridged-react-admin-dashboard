import { Col, Divider, Row, Typography } from "antd";
import React from "react";
import AccountInfo from "../components/AccountInfo";
import ResetPassword from "../components/ResetPassword";
const { Title } = Typography;

function SecurityWorkflow() {
  return (
    <Row gutter={[0, 30]}>
      <Col span={24}>
        <Title level={2} className="lightTitle">
          Security
        </Title>
      </Col>
      <AccountInfo />

      <Col span={24}>
        <Divider
          style={{
            margin: "0px",
          }}
        />
      </Col>
      <ResetPassword />
    </Row>
  );
}

export default SecurityWorkflow;
