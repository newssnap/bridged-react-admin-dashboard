import { theme } from 'antd';
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  ACTIVE_COLOR,
  PRIMARY_COLOR_OPACITY,
} from '../constants/DashboardColors';

export function getTheme(isDarkTheme, width) {
  const algorithm = isDarkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm;

  // Define component styles
  const components = {
    Menu: {
      controlItemBgActive: SECONDARY_COLOR,
      colorBgContainer: SECONDARY_COLOR,
      colorBgTextHover: PRIMARY_COLOR_OPACITY,
      colorPrimary: ACTIVE_COLOR,
      colorText: width <= 768 ? '#000' : '#fff',
    },
    Form: {
      itemMarginBottom: 15,
      // verticalLabelPadding: 5,
    },
    Table: {
      headerBg: 'rgba(250, 250, 250, 0)',
    },
  };

  // Define token styles
  const token = {
    colorPrimary: PRIMARY_COLOR,
    borderRadius: 5,
    fontFamily: 'Quicksand',
  };

  // Return the theme object
  return {
    algorithm,
    components,
    token,
  };
}
