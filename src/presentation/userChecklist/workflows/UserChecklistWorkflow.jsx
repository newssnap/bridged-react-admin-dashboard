import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
const UserChecklistWorkflow = UserDetails => {
  const { id } = useParams();
  useEffect(() => {
    console.log(id);
  }, []);
  return <div>User Checklist {id}</div>;
};

export default UserChecklistWorkflow;
