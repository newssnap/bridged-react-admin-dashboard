import React from "react";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { Row, theme } from "antd";

function FacebookLoginComponent({ facebookLoginHandler }) {
  // Get token color for border
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

  return (
    <FacebookLogin
      appId="5544864282280850"
      fields="name,email,picture"
      callback={(res) => {
        facebookLoginHandler(res?.accessToken);
      }}
      render={(renderProps) => (
        <Row
          style={{
            border: `1px solid ${colorBorderSecondary}`,
            height: "40px",
            borderRadius: "var(--mpr-3)",
            backgroundColor: "#3b5999",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={renderProps.onClick}
          align="middle"
          justify="center"
        >
          <div
            style={{
              height: "45%",
              width: "17px",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "2px",
              marginRight: "var(--mpr-2)",
            }}
          >
            <img
              src="/icons/facebookOutlined.svg"
              style={{
                height: "50%",
              }}
              alt="Facebook"
            />
          </div>
          <p
            style={{
              fontSize: "0.8rem",
            }}
          >
            Sign in with Facebook
          </p>
        </Row>
      )}
    />
  );
}

export default FacebookLoginComponent;
