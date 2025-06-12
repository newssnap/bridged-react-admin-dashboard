import { PRIMARY_COLOR } from '../DashboardColors';

const iframeState = {
  flipCard: {
    publisher: {
      name: 'Demo Name',
      logo: '',
    },
    actionPage: {
      title: 'Are you ready to take action?',
      description: 'You can be part of the solution. Take action now.',
    },
    theme: {
      primaryColor: PRIMARY_COLOR,
      darkTheme: false,
      secondaryColor: PRIMARY_COLOR,
      tertiaryColor: PRIMARY_COLOR,
      width: 0,
      height: 0,
      language: '',
      fontScale: 1,
      logoScale: 1,
    },
    title: '',
  },
  config: {
    mode: 'create',
    sessionId: '',
    embed: true,
    pageURL: '',
    previewConfig: {
      cardSide: 'front',
      selectedActionIndex: -1,
      showEndScreen: false,
    },
    gatedEngagement: false,
  },
};

export default iframeState;
