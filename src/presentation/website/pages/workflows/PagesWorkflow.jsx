import { Col, Row, Typography } from "antd";
import React from "react";
import TopBar from "../components/TopBar";
import usePagesHandler from "../controllers/usePagesHandler";
import AllPages from "../components/AllPages";

const { Title } = Typography;

function PagesWorkflow() {
  const {
    setPageNumberHandler,
    setPageSearchTermHandler,
    setPagesDomainIdsHandler,
    isLoading,
  } = usePagesHandler();
  return (
    <Row gutter={[30, 30]}>
      <Col span={24}>
        <Title level={2} className="lightTitle">
          Pages
        </Title>
      </Col>

      <TopBar
        setPageSearchTermHandler={setPageSearchTermHandler}
        setPagesDomainIdsHandler={setPagesDomainIdsHandler}
      />

      <AllPages
        isLoading={isLoading}
        setPageNumberHandler={setPageNumberHandler}
      />
    </Row>
  );
}

export default PagesWorkflow;
