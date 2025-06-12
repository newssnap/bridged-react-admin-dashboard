import { Col, Radio, Row } from "antd";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import DnsRecord from "./DnsRecord";

function VerifyDomain() {
  // Local state to manage the verification step
  const [step, setStep] = useState(1);

  // Handle change in the Radio.Group to update the verification step
  const onChange = (e) => {
    setStep(e.target.value);
  };

  return (
    <Row>
      {/* Radio.Group to choose the verification method */}
      <Radio.Group onChange={onChange} value={step}>
        <Row gutter={[15, 15]}>
          <Col span={24}>
            {/* Radio button for verifying with email */}
            <Radio value={1}>
              <h3
                style={{
                  fontWeight: 400,
                }}
              >
                Verify with email
              </h3>
            </Radio>
          </Col>

          <Col span={24}>
            {/* Radio button for verifying with DNS record */}
            <Radio value={2}>
              <h3
                style={{
                  fontWeight: 400,
                }}
              >
                Verify with DNS record
              </h3>
            </Radio>
          </Col>

          {/* Display DNSRecord component if step is 2 */}
          {step === 2 && (
            <Col
              style={{
                paddingLeft: "var(--mpr-1)",
              }}
              span={24}
            >
              {/* DNSRecord component for adding DNS records */}
              <DnsRecord />
            </Col>
          )}
        </Row>
      </Radio.Group>
    </Row>
  );
}

export default VerifyDomain;
