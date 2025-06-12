import { skipToken } from '@reduxjs/toolkit/query';
import {
  useDeleteEngMutation,
  useExcludePageFromCampaignMutation,
  useGetAllUserCtasQuery,
  useGetAllUserEngQuery,
  useGetSinglePageDataQuery,
} from '../../../../services/api';
import { useEffect, useState } from 'react';
import agentFinder from '../../../../constants/agents/agentFinder';
import engagementFinder from '../../../../constants/engagement/engagementFinder';
import ctaFinder from '../../../../constants/ctas/ctaFinder';
import { notification } from 'antd';

function convertData(data) {
  const agents = [];

  data?.campaigns?.forEach(campaign => {
    const agent = {
      key: campaign._id,
      _id: campaign._id,
      title: campaign.title,
      type: agentFinder(campaign.campaignType)?.name,
      children: [],
      devType: 'agent',
      pageIsExcluded: campaign?.pageIsExcluded,
    };

    const engagementScreens = data?.engagements?.filter(
      screen => screen.campaignId === campaign._id
    );
    engagementScreens?.forEach(engagementScreen => {
      // Add engagement screens as children
      agent.children.push({
        key: engagementScreen._id,
        _id: engagementScreen._id,
        title: 'Engagement: ' + engagementScreen.title,
        type: engagementFinder(engagementScreen.engagementType)?.name,
        devType: 'engagement',
        pageIsExcluded: false,
      });
    });

    const actionScreens = data?.actions?.filter(screen => screen.campaignId === campaign._id);
    actionScreens?.forEach(actionScreen => {
      agent.children.push({
        key: actionScreen._id,
        _id: actionScreen._id,
        title: 'Action: ' + actionScreen.title,
        type: ctaFinder(actionScreen.actionType)?.name,
        devType: 'cta',
        pageIsExcluded: false,
      });
    });

    agents.push(agent);
  });

  return agents;
}

function usePageDetailsHandler(pageId) {
  const [currentActionId, setCurrentActionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { refetch, isSuccess, data } = useGetSinglePageDataQuery(pageId || skipToken);

  const { data: allEngagements, isLoading: allEngagementsIsLoading } = useGetAllUserEngQuery();

  const { data: allCtas, isLoading: allCtasIsLoading } = useGetAllUserCtasQuery();
  const [_EXCLUDE, { isLoading: exludeIsLoading }] = useExcludePageFromCampaignMutation();
  const [_DELETE] = useDeleteEngMutation();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcludePage = async _id => {
    notification.info({
      message: 'Excluding Page',
      placement: 'bottomRight',
      showProgress: true,
    });

    const sentData = {
      pageId: pageId,
      campaignId: _id,
    };

    await _EXCLUDE(sentData);

    fetchData();
    notification.success({
      message: 'Page Excluded from agent',
      placement: 'bottomRight',
      showProgress: true,
    });
  };

  const handleDeleteEng = async _id => {
    notification.info({
      message: 'Deleting Engagement',
      placement: 'bottomRight',
      showProgress: true,
    });

    await _DELETE(_id);

    fetchData();
    notification.success({
      message: 'Engagement Deleted',
      placement: 'bottomRight',
      showProgress: true,
    });
  };

  useEffect(() => {
    if (pageId) {
      fetchData();
    }
  }, [pageId]);

  return {
    tableData: isSuccess ? convertData(isSuccess && data?.data) : [],
    tableIsLoading: isLoading,
    exludeIsLoading,
    previewLoading: allEngagementsIsLoading || allCtasIsLoading,
    handleExcludePage,
    handleDeleteEng,
  };
}

export default usePageDetailsHandler;
