import React from 'react';
import { Button, Col, Row, Steps, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';
import useDraftsHandler from '../controllers/useDraftsHandler';

const { Title } = Typography;

function GlobalSubTopBar({
  data,
  currentStep,
  backRoute,
  steps,
  creationType,
  isAgentScreen = false,
  isAIAgent = false,
}) {
  const navigate = useNavigate();

  const { handleCreateDraft, isCreatingDraft } = useDraftsHandler({
    draftType: data?.draft?.value,
    navigateBack: backRoute,
  });

  const handleTitleClick = () => {
    if (isAgentScreen) {
      return;
    }

    if (creationType === 'draft') {
      navigate(data?.draftDashboardPath);
    } else {
      navigate(backRoute);
    }
  };

  const getCreationTypeText = () => {
    switch (creationType) {
      case 'create':
      case 'agentCreate':
        return 'New';
      case 'edit':
      case 'agentEdit':
        return 'Edit';
      case 'draft':
        return 'Draft';
      default:
        return '';
    }
  };

  return (
    <Col span={24}>
      <Row gutter={[30, 30]}>
        {/* Title Section */}
        <Col span={24}>
          <Row style={{ gap: 15 }} justify="start" align="middle" wrap={false}>
            {!isAgentScreen && (
              <Icon
                onClick={handleTitleClick}
                color="primary"
                size="small"
                name="ArrowRightOutlined"
                style={{ transform: 'rotate(180deg)', cursor: 'pointer' }}
              />
            )}
            <Title level={2} className="lightTitle">
              <span
                onClick={handleTitleClick}
                style={{
                  cursor: isAgentScreen ? 'auto' : 'pointer',
                }}
                className={isAgentScreen ? '' : 'hoverPrimary'}
              >
                {data?.title}
              </span>{' '}
              |{' '}
              <span style={{ textTransform: 'capitalize' }}>
                {getCreationTypeText()}
                {creationType && ' ' + data?.type}
              </span>
            </Title>
          </Row>
        </Col>

        {/* Steps and Draft Button Section */}
        <Col span={24}>
          <Row justify="space-between" align="middle">
            <Col {...{ xs: 0, sm: 0, md: 16, lg: 10, xl: 10, xxl: 10 }}>
              <Steps current={currentStep} size="small" items={steps} />
            </Col>
            <Col {...{ xs: 1, sm: 1, md: 0 }}></Col>
            {!isAgentScreen && data.draft && (
              <Col>
                <Button
                  size="large"
                  onClick={handleCreateDraft}
                  loading={isCreatingDraft}
                  style={{
                    visibility: isAIAgent ? 'hidden' : 'visible',
                  }}
                  disabled={currentStep === 0}
                >
                  Close and save as draft
                </Button>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Col>
  );
}

export default GlobalSubTopBar;
