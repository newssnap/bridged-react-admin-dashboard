import { Drawer } from "antd";
import React, { useState } from "react";
import AddDomain from "../components/AddDomain";
import Footer from "../components/Footer";
import { useSelector } from "react-redux";
import VerifyDomain from "../components/verify/VerifyDomain";
import useDomainsHandler from "../controllers/useDomainsHandler";

function DomainDrawer() {
  // Retrieve necessary functions from the custom hook
  const { onCloseDomainHandler } = useDomainsHandler();

  // State for controlling the submittable status
  const [isSubmittable, setIsSubmittable] = useState(false);

  // Select domain data from the Redux store
  const domainData = useSelector((state) => state.domain.data);

  // Extract relevant data from the domain state
  const isOpen = domainData?.isDomainDrawerOpen;
  const domainStep = domainData?.domainStep;

  return (
    <Drawer
      title={<h2>{domainStep === 0 ? "Add Domain" : "Verify the domain"}</h2>}
      onClose={onCloseDomainHandler}
      closeIcon
      open={isOpen}
      width={700}
      footer={
        domainStep === 0 ? <Footer isSubmittable={isSubmittable} /> : null
      }
    >
      {/* Render Add Domain component for step 0 */}
      {domainStep === 0 && <AddDomain setIsSubmittable={setIsSubmittable} />}

      {/* Render Verify Domain component for step 1 */}
      {domainStep === 1 && <VerifyDomain setIsSubmittable={setIsSubmittable} />}
    </Drawer>
  );
}

export default DomainDrawer;
