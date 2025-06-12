import { Empty, Row } from "antd";
import React from "react";

function NotFound() {
  return (
    <Row
      style={{ height: "100%", width: "100%" }}
      justify="center"
      align="middle"
    >
      <Empty description="No Such Page Found" />
    </Row>
  );
}

export default NotFound;
