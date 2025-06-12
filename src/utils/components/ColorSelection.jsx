import React from 'react';
import { Button, Col, ColorPicker, Row } from 'antd';
import { BgColorsOutlined } from '@ant-design/icons';
import colors from '../../constants/app/colors';
import getTextColor from '../controllers/getTextColorAsPerBg';

const ColorSelection = ({ color, setColor }) => {
  // Define column size for color options
  const col = { xs: 6, sm: 6, md: 6, lg: 6, xl: 3 };

  return (
    <Row
      align="start"
      justify="start"
      wrap
      // gutter={[15, 15]}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
      }}
      // gutter={[15, 15]}
    >
      {colors.map((data, index) => {
        return (
          <Col key={index} {...col}>
            <label
              key={index}
              className="customCheckBox"
              style={{
                height: '40px',
              }}
            >
              <input
                type="checkbox"
                value={data.color}
                checked={color === data.color}
                name="primaryColor"
                onChange={e => {
                  setColor(e.target.value);
                }}
                className="checkBox"
              />
              <div
                className="checkBoxInner"
                style={{
                  borderRadius: 'var(--mpr-3)',
                  padding: 'var(--mpr-4)',
                }}
              >
                <div
                  style={{
                    backgroundColor: data.color,
                    height: '100%',
                    width: '100%',
                    borderRadius: '3px',
                  }}
                ></div>
              </div>
            </label>
          </Col>
        );
      })}
      <Col {...col} style={{ height: '100%', marginTop: 'auto', marginBottom: 'auto', padding: 0 }}>
        <ColorPicker
          trigger="hover"
          value={color}
          onChange={e => {
            setColor(e.toHexString(e));
          }}
          format="hex"
          style={{ height: '100%' }}
        >
          <Button
            block
            style={{
              backgroundColor: color,
              color: getTextColor(color),
            }}
          >
            <BgColorsOutlined
              style={{
                color: getTextColor(color),
              }}
            />
          </Button>
        </ColorPicker>
      </Col>
    </Row>
  );
};

export default ColorSelection;
