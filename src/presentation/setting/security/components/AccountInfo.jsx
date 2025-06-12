import React from "react";
import { useSelector } from "react-redux";
import useProfileHandler from "../../profile/controllers/useProfileHandler";
import { useDeleteUserAccountMutation } from "../../../../services/api";
import {
  Button,
  Col,
  Input,
  Popconfirm,
  Row,
  Skeleton,
  Tooltip,
  notification,
} from "antd";

function AccountInfo() {
  const userEmail = useSelector((state) => state.user.data.email);
  const { isLoading } = useProfileHandler();

  const [_DELETE_ACCOUNT, { isLoading: deleteIsLoading }] =
    useDeleteUserAccountMutation();
  const handleDeleteAccount = async () => {
    const response = await _DELETE_ACCOUNT();

    if (response?.data?.success) {
      notification.success({
        message: "Account deleted successfully",
        placement: "bottomRight",
        showProgress: true,
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }

    if (response?.error) {
      notification.error({
        message: response?.error?.data?.errorObject?.userErrorText,
        placement: "bottomRight",
        showProgress: true,
      });
    }
  };

  return (
    <Col span={24}>
      <Row gutter={[30, 15]}>
        <Col {...{ xs: 24, sm: 24, md: 12, lg: 12 }}>
          <p style={{ marginBottom: "var(--mpr-3)" }}>Account email:</p>
          {isLoading ? (
            <Skeleton.Button active size="large" block />
          ) : (
            <Tooltip title="Please contact our support to change the email address">
              <Input size="large" value={userEmail} disabled />
            </Tooltip>
          )}
        </Col>
        <Col span={24}>
          <Popconfirm
            title="Delete your account"
            description="Are you sure you want to delete your account permanently?"
            onConfirm={handleDeleteAccount}
          >
            <Button
              size="large"
              style={{
                backgroundColor: "#dc2626",
                color: "white",
              }}
              loading={deleteIsLoading}
            >
              Permanently delete my account
            </Button>
          </Popconfirm>
        </Col>
      </Row>
    </Col>
  );
}

export default AccountInfo;
