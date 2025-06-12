import { Col, Row } from "antd";
import React, { useEffect } from "react";
import Sidebar from "../presentation/authentication/reusable/components/Sidebar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function AuthenticationLayout({ children, Sidebarcontent }) {
  const isAuth = useSelector((state) => state.auth.data.isAuth);
  const navigate = useNavigate();

  // Redirect to the home page if the user is authenticated
  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  return (
    <Row
      style={{
        height: "100vh",
      }}
      align="stretch"
      justify="center"
    >
      {/* Sidebar */}
      <Col {...{ xs: 0, sm: 0, md: 0, lg: 12, xl: 12 }}>
        <Sidebar Sidebarcontent={Sidebarcontent} />
      </Col>

      {/* Main Content */}
      <Col {...{ xs: 24, sm: 24, md: 24, lg: 12, xl: 12 }}>
        <Row
          style={{
            height: "100%",
            width: "100%",
          }}
          className="authCardContent"
        >
          {children}
        </Row>
      </Col>
    </Row>
  );
}

export default AuthenticationLayout;
