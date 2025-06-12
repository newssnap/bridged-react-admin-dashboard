import { Row } from "antd";
import React from "react";
import useProfileHandler from "../controllers/useProfileHandler";
import { ProfileSkeleton } from "../../reusable/skeletons/SettingSkeletons";
import ProfileForm from "../components/ProfileForm";
import TopBar from "../components/TopBar";
import { useSelector } from "react-redux";

function ProfileWorkflow() {
  const userData = useSelector((state) => state.user.data);
  const { isLoading } = useProfileHandler();

  return (
    <Row gutter={[30, 30]}>
      <TopBar userData={userData} isLoading={isLoading} />
      {isLoading && <ProfileSkeleton />}

      {!isLoading && <ProfileForm userData={userData} />}
    </Row>
  );
}

export default ProfileWorkflow;
