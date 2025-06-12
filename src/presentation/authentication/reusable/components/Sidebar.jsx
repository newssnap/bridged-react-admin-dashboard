import React, { useEffect, useRef } from "react";
import { Col, Row } from "antd";
import VanillaTilt from "vanilla-tilt";
import TitleLeftBorder from "../../../../utils/components/TitleLeftBorder";

function Sidebar({ Sidebarcontent }) {
  // Create a ref for VanillaTilt
  const tilt = useRef(null);

  useEffect(() => {
    // Initialize VanillaTilt with custom settings
    VanillaTilt.init(tilt.current, {
      scale: 1.2,
      max: 10,
      startX: 90,
      startY: 60,
      speed: 1000,
      glare: true,
    });
  }, []);

  return (
    <Row
      style={{
        backgroundColor: "var(--secondary-Color)",
        height: "100%",
        padding: "var(--mpr-large)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Col style={{ zIndex: 1 }} span={24}>
        <img
          src="/company/logo_White.png"
          style={{
            width: "130px",
          }}
        />
      </Col>

      <Col span={24} style={{ alignSelf: "center", zIndex: 1 }}>
        <Row justify="center" align="middle">
          <img
            ref={tilt}
            style={{
              width: "80%",
              borderRadius: "var(--mpr-3)",
              cursor: "pointer",
            }}
            className="whiteShadow"
            src="/company/sidebar.png"
          />
        </Row>
      </Col>

      <Col style={{ alignSelf: "end", color: "white", zIndex: 1 }} span={24}>
        <TitleLeftBorder
          style={{
            borderRadius: "50px",
            left: "-20px",
          }}
        >
          <Row
            style={{
              flexDirection: "column",
            }}
          >
            <h1>
              Join our <br /> community
            </h1>
            <h2
              style={{
                fontWeight: 300,
                marginTop: "var(--mpr-2)",
                fontSize: "1.3rem",
              }}
            >
              {Sidebarcontent}
            </h2>
          </Row>
        </TitleLeftBorder>
      </Col>

      {/* Blobs for decoration */}
      <div
        className="primaryBlob blobAnimate1"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: "1",
        }}
      ></div>
      <div
        className="primaryBlob primaryBlobSm blobAnimate2"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          opacity: "0.3",
        }}
      ></div>
    </Row>
  );
}

export default Sidebar;
