import { Card, Col, Divider, Flex, Row, Skeleton, Typography } from 'antd';
import React from 'react';
import useOnboardingHandler from '../../controllers/useOnboardingHandler';
import ProgressBar from './ProgressBar';
import Body from './Body';

const { Text } = Typography;

function Onboarding() {
  const props = useOnboardingHandler();

  if (props.isLoadingTasks) {
    return <Skeleton.Button block active style={{ height: 300 }} />;
  }

  return (
    <Card>
      <Row gutter={[0, 20]}>
        <Col span={24}>
          <Flex vertical>
            <Text style={{ fontSize: 17.5, fontWeight: 500 }}>Your onboarding plan!</Text>
            <Text>
              Find or align the onboarding plan below, feel free to do changes based on your
              timeline or team!
            </Text>
          </Flex>
        </Col>

        <Col span={24}>
          <ProgressBar {...props.progress} />
        </Col>
        <Col span={24}>
          <Divider style={{ margin: 0 }} />
        </Col>
        <Col span={24}>
          <Body tasks={props.tasks} />
        </Col>
      </Row>
    </Card>
  );
}

export default Onboarding;
