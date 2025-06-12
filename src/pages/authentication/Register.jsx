import React from "react";
import RegisterWorkflow from "../../presentation/authentication/register/workflow/RegisterWorkflow";
import { useLocation } from "react-router-dom";

function Register() {
  const search = useLocation().search;
  const teamMemberId = new URLSearchParams(search).get("teamMemberId");
  return <RegisterWorkflow teamMemberId={teamMemberId} />;
}

export default Register;
