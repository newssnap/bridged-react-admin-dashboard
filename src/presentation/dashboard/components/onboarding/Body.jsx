import { Col, Empty, Row } from 'antd';
import SingleTask from './SingleTask';

function Body({ tasks }) {
  if (tasks?.length === 0) {
    return <Empty description="No tasks assigned" />;
  }

  return (
    <Row gutter={[0, 20]}>
      {tasks?.map(task => (
        <Col key={task._id} span={24}>
          <SingleTask task={task} />
        </Col>
      ))}
    </Row>
  );
}

export default Body;
