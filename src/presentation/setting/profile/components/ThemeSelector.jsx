import React from "react";
import { Row, Col, Typography, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setIsDarkTheme } from "../../../../redux/slices/appSlice";

const { Title, Text } = Typography;

const ThemeSelector = () => {
  const dispatch = useDispatch();
  const isDarkTheme = useSelector((state) => state.app.isDarkTheme);

  const setThemeAndSaveToLocalStorage = (isDark) => {
    localStorage.setItem("isDarkTheme", isDark);
    dispatch(setIsDarkTheme(isDark));
    document.body.className = isDark ? "dark" : "light";
  };

  return (
    <div className="theme-selector">
      <Title level={5}>Theme</Title>

      <Radio.Group
        value={isDarkTheme}
        onChange={(e) => setThemeAndSaveToLocalStorage(e.target.value)}
        className="theme-options-group"
      >
        <Row gutter={[16, 16]} style={{ marginTop: "var(--mpr-2)" }}>
          <Col span={12}>
            <Radio.Button value={false} className="theme-option-button">
              <div className="theme-preview light-theme">
                <div className="theme-preview-content">
                  <div className="preview-line"></div>
                  <div className="preview-line-short"></div>
                  <div className="preview-dot"></div>
                  <div className="preview-line"></div>
                </div>
              </div>
              <Text>Light</Text>
            </Radio.Button>
          </Col>
          <Col span={12}>
            <Radio.Button value={true} className="theme-option-button">
              <div className="theme-preview dark-theme">
                <div className="theme-preview-content">
                  <div className="preview-line"></div>
                  <div className="preview-line-short"></div>
                  <div className="preview-dot"></div>
                  <div className="preview-line"></div>
                </div>
              </div>
              <Text>Dark</Text>
            </Radio.Button>
          </Col>
        </Row>
      </Radio.Group>
    </div>
  );
};

export default ThemeSelector;
