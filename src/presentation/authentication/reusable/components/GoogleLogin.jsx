import React from "react";
import { Row, theme } from "antd";

function GoogleLogin({ googleLoginHandler }) {
  // Get token color for border
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

  return (
    <Row
      style={{
        border: `1px solid ${colorBorderSecondary}`,
        height: "40px",
        borderRadius: "var(--mpr-3)",
        cursor: "pointer",
      }}
      align="middle"
      justify="center"
      onClick={googleLoginHandler}
    >
      <img
        src="/icons/googleOutlined.svg"
        style={{
          height: "45%",
          marginRight: "var(--mpr-2)",
        }}
        alt="Google"
      />
      <p
        style={{
          fontSize: "0.8rem",
        }}
      >
        Sign in with Google
      </p>
    </Row>
  );
}

export default GoogleLogin;
