import { Col, Row, Typography, theme } from 'antd';
import TitleLeftBorder from './TitleLeftBorder';
import PremiumBadge from './PremiumBadge';
import { useDispatch } from 'react-redux';
import { setIsSchedulingFormOpen } from '../../redux/slices/schedulingFormSlice';

const { Paragraph, Title } = Typography;

function SelectGoalType({ onChangeHandler, type, checkboxArray, onDoubleClickHandler }) {
  // Theme color for the background of the container
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const dispatch = useDispatch();

  return (
    <Row
      style={{
        marginTop: 'var(--mpr-2)',
      }}
      justify="start"
      align="middle"
      gutter={[30, 30]}
    >
      {checkboxArray.map((item, index) => {
        return (
          <Col key={index} xs={24} sm={24} md={12} lg={12} xl={8}>
            <label
              key={index}
              className={`customCheckBox ${item.isLocked ? 'locked' : ''}`}
              style={{
                height: '95px',
              }}
              onDoubleClick={() => {
                if (onDoubleClickHandler && !item.isLocked) {
                  onDoubleClickHandler(item.value);
                }
              }}
            >
              {item.isLocked && <PremiumBadge />}
              <input
                type="checkbox"
                value={item.value}
                checked={item.value === type}
                onChange={() => {
                  if (!item.isLocked) {
                    onChangeHandler(item.value);
                  }
                }}
                onClick={() => {
                  if (item.isLocked) {
                    dispatch(setIsSchedulingFormOpen(true));
                  }
                }}
                className="checkBox"
              />
              <div
                className="checkBoxInner"
                style={{
                  backgroundColor: colorBgContainer,
                }}
              >
                <TitleLeftBorder isError={item.isLocked}>
                  <Title className="checkBoxTitle" level={5}>
                    {item.name}
                  </Title>
                </TitleLeftBorder>
                <Paragraph className="checkBoxParagraph secondLine">{item.description}</Paragraph>
              </div>
            </label>
          </Col>
        );
      })}
    </Row>
  );
}

export default SelectGoalType;
