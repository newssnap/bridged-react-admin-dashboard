import { Button, Col, Row, Table, Typography } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import useDomainsHandler from "../../controllers/useDomainsHandler";

const { Text } = Typography;

function DnsRecord() {
  // Retrieve the necessary functions and data from the custom hook
  const { verifyDomainHandler, isLoading } = useDomainsHandler();
  const currentDomain = useSelector(
    (state) => state.domain.data?.currentDomain
  );

  // Define columns for the Ant Design Table
  const columns = [
    {
      title: "Key",
      dataIndex: "TXTRecordKey",
      ellipsis: true,
      render: () => <span>BridgedVerification</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      ellipsis: true,
      render: () => <span>TXT</span>,
    },
    {
      title: "Value",
      dataIndex: "TXTRecordValue",
      render: (text) => <span>{text}</span>,
    },
  ];

  return (
    <Row
      style={{
        width: "100%",
      }}
      gutter={[15, 15]}
    >
      {/* Section for displaying information about DNS verification */}
      <Col span={24}>
        <Row
          style={{
            backgroundColor: "var(--primary-Color-Opacity)",
            padding: "20px var(--mpr-1)",
            borderRadius: "var(--mpr-2)",
            border: `0.3px solid var(--primary-Color)`,
          }}
        >
          <h3>
            These instructions require access to the DNS records of the domain.{" "}
            <span
              style={{
                fontWeight: 300,
              }}
            >
              Not your thing?
            </span>{" "}
            <span
              style={{
                fontWeight: 300,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Forward these instructions to one of our technical team members
            </span>
          </h3>
        </Row>
      </Col>
      {/* Header for the verification steps */}
      <Col span={24}>
        <h3
          style={{
            fontWeight: 300,
          }}
        >
          Steps to verify
        </h3>
      </Col>
      {/* List of verification steps */}
      <Col span={24}>
        <ul>
          <li>
            1. Sign in to your domain hosting site and locate the DNS management
            page
          </li>
          <li style={{ marginTop: "var(--mpr-3)" }}>
            2. Add the following <Text keyboard>TXT</Text> record
          </li>
        </ul>
      </Col>
      {/* Table displaying the TXT record details */}
      <Col span={24}>
        <Table
          className="tableBlueHead"
          size="small"
          bordered
          columns={columns}
          dataSource={[currentDomain]}
          pagination={false}
        />
      </Col>
      {/* Additional information and the verification button */}
      <Col span={24}>
        <span>
          3. Click on verify. If the verification process fails, please click
          later and try again after 1 hour.
        </span>
      </Col>
      <Col>
        <Button
          loading={isLoading}
          onClick={verifyDomainHandler}
          type="primary"
          size="large"
          className="bottomButton"
        >
          Verify
        </Button>
      </Col>
    </Row>
  );
}

export default DnsRecord;
