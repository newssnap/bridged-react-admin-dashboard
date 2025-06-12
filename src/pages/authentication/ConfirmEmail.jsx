import React from "react";
import ConfirmEmailWorkflow from "../../presentation/authentication/confirmEmail/workflow/ConfirmEmailWorkflow";
import { useLocation, useParams } from "react-router-dom";

function ConfirmEmail() {
  const { email } = useParams();
  const search = useLocation().search;
  const teamMemberId = new URLSearchParams(search).get("teamMemberId");

  return <ConfirmEmailWorkflow email={email} teamMemberId={teamMemberId} />;
}

export default ConfirmEmail;
