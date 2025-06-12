import { Button, Row } from "antd";
import React from "react";
import useDomainsHandler from "../controllers/useDomainsHandler";

function Footer({ isSubmittable }) {
  // Retrieve necessary functions and state from the custom hook
  const { onCloseDomainHandler, addDomainHandler, isLoading } =
    useDomainsHandler();

  return (
    <Row
      justify="end"
      align="middle"
      style={{
        gap: 15,
        margin: "var(--mpr-3) 0px",
      }}
    >
      {/* "Cancel" button */}
      <Button
        onClick={onCloseDomainHandler}
        className="bottomButton"
        size="large"
      >
        Cancel
      </Button>

      {/* "Add" button */}
      <Button
        onClick={addDomainHandler}
        disabled={!isSubmittable}
        loading={isLoading}
        className="bottomButton"
        size="large"
        type="primary"
      >
        Add
      </Button>
    </Row>
  );
}

export default Footer;
