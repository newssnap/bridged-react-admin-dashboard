import { theme, Typography } from 'antd';

const { Title } = Typography;

function DashboardWorkflow() {

  const {
    token: { colorBgLayout },
  } = theme.useToken();

  return (
    <div>
      This is the dashboard workflow
    </div>
  );
}

export default DashboardWorkflow;
