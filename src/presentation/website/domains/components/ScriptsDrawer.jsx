import {
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Row,
  Typography,
  notification,
} from "antd";
import React from "react";
import { setIsScriptsDrawerOpen } from "../../../../redux/slices/domains/domainSlice";
import { useDispatch, useSelector } from "react-redux";
import { CopyBlock, sunburst } from "react-code-blocks";
import TitleLeftBorder from "../../../../utils/components/TitleLeftBorder";
import Icon from "../../../../utils/components/Icon";

const { Title } = Typography;

const script = `<script id="bridged-loader" src="https://loader.bridged.media/latest/bridged-loader.js"></script>`;

function ScriptsDrawer() {
  const dispatch = useDispatch();
  const domainData = useSelector((state) => state.domain.data);
  const isOpen = domainData?.isScriptsDrawerOpen;

  const onCloseDomainHandler = () => {
    dispatch(setIsScriptsDrawerOpen(false));
  };

  // Handle the "Check Code" button click
  const handleCheckCode = () => {
    // Add logic for checking the code here
    // For now, let's simulate success
    notification.success({
      message: "Code Checked Successfully",
      placement: "bottomRight",
      showProgress: true,
    });
  };

  return (
    <Drawer
      title={<h2>Install Script</h2>}
      onClose={onCloseDomainHandler}
      closeIcon
      open={isOpen}
      width={700}
    >
      <Row gutter={[30, 30]}>
        <Col span={24}>
          {/* Title section with code installation instructions */}
          <Title
            level={3}
            style={{
              fontWeight: 300,
              fontSize: "1.2rem",
            }}
          >
            Paste this code to the website where you want to display widgets. If
            you need help installing the code -{" "}
            <span
              className="primaryTextColor"
              style={{ textDecoration: "underline", cursor: "pointer" }}
            >
              check out the guide.
            </span>
          </Title>
        </Col>
        <Col span={24}>
          {/* Code block for the script */}
          <CopyBlock
            language="js"
            text={script}
            showLineNumbers={false}
            theme={sunburst}
            customStyle={{
              paddingTop: "var(--mpr-2)",
              paddingBottom: "var(--mpr-2)",
              borderRadius: "var(--mpr-3)",
            }}
            onCopy={() => {
              notification.success({
                message: "Code Copied",
                placement: "bottomRight",
                showProgress: true,
              });
            }}
            wrapLongLines={true}
            codeBlock
          />
        </Col>
        <Col span={24}>
          {/* Card section with additional information and a button */}
          <Card size="small" style={{ padding: "var(--mpr-3)" }}>
            <Row justify="space-between" align="middle">
              <TitleLeftBorder>
                <Col>
                  <Title
                    level={3}
                    style={{
                      fontWeight: 300,
                      fontSize: "1.2rem",
                    }}
                  >
                    Have you already installed the code?
                  </Title>
                  <p>
                    If you need help,{" "}
                    <span
                      className="primaryTextColor"
                      style={{ textDecoration: "underline", cursor: "pointer" }}
                    >
                      chat with us
                    </span>{" "}
                    to get set up.
                  </p>
                </Col>
              </TitleLeftBorder>
              <Col>
                <Button type="primary" size="large" onClick={handleCheckCode}>
                  Check Code
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          {/* Divider for separating installation guides */}
          <Divider>
            <span className="opacity05">Other Installation Guides</span>
          </Divider>
        </Col>
        {/* Installation guides for WordPress and Wix */}
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card style={{ padding: "var(--mpr-3)" }} size="small">
            <Row gutter={[5, 5]}>
              <Col span={24}>
                <img
                  style={{
                    height: "30px",
                    width: "30px",
                    borderRadius: "50%",
                  }}
                  src="https://academy.bindtuning.com/wp-content/uploads/2014/04/wplogoblue-notext-rgb.png?1698943156367"
                  alt="WordPress Logo"
                />
              </Col>
              <Col span={24}>
                <Row justify="space-between" align="middle">
                  <p>How to install on WordPress</p>
                  <Icon name="ArrowRightOutlined" style={{ width: "5px" }} />
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <Card style={{ padding: "var(--mpr-3)" }} size="small">
            <Row gutter={[5, 5]}>
              <Col span={24}>
                <img
                  style={{
                    height: "30px",
                    width: "30px",
                    borderRadius: "50%",
                  }}
                  src="https://cdn-icons-png.flaticon.com/512/5968/5968770.png"
                  alt="Wix Logo"
                />
              </Col>
              <Col span={24}>
                <Row justify="space-between" align="middle">
                  <p>How to install on Wix</p>
                  <Icon name="ArrowRightOutlined" style={{ width: "5px" }} />
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Drawer>
  );
}

export default ScriptsDrawer;
