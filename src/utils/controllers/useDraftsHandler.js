import { notification } from 'antd';
import {
  useCreateDraftMutation,
  useDeleteDraftMutation,
  useGetAllDraftsQuery,
} from '../../services/api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect, useState } from 'react';
import screenFinder from '../../constants/screens/screenFinder';
import agentData from '../../constants/agents/initialStates/agentData';

const PAGE_SIZE = 8;

const useDraftsHandler = ({ draftType = '', navigateBack = '', isReturnAllDrafts = false }) => {
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);
  const [paginationPage, setPaginationPage] = useState(1);
  const [displayData, setDisplayData] = useState([]);

  const ctaData = useSelector(state => state.cta);
  const engData = useSelector(state => state.eng);
  const endScreenData = useSelector(state => state.endScreen);
  const agentsData = useSelector(state => state.agent);

  const [_CREATE_DRAFT, { isLoading: isCreatingDraft }] = useCreateDraftMutation();
  const [_DELETE_DRAFT, { isLoading: isDeletingDraft }] = useDeleteDraftMutation();

  // Calculate startIndex and endIndex for pagination
  const startIndex = (paginationPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  // Slice the displayed items based on pagination
  const displayedItems = displayData.slice(startIndex, endIndex);

  // Handler function for pagination changes
  const handlePaginationChange = page => {
    setPaginationPage(page);
  };

  const handleDisplayDataChange = () => {
    if (displayedItems?.length === 1 && paginationPage !== 0) {
      setPaginationPage(paginationPage - 1);
    }
  };

  const {
    data: allDrafts,
    isLoading: isLoadingAllDrafts,
    isSuccess,
    refetch,
  } = useGetAllDraftsQuery(draftType && isReturnAllDrafts ? draftType : skipToken);

  // Effect to handle draft type changes and refetch
  useEffect(() => {
    if (draftType && isReturnAllDrafts) {
      setIsFetching(true);
      refetch()
        .then(() => setIsFetching(false))
        .catch(() => setIsFetching(false));
    }
  }, [draftType, isReturnAllDrafts, refetch]);

  useEffect(() => {
    if (isSuccess) {
      setDisplayData(allDrafts?.data || []);
    }
  }, [allDrafts, isSuccess]);

  const getCurrentData = () => {
    switch (draftType) {
      case 'action':
        return ctaData;
      case 'engagement':
        return engData;
      case 'endScreen':
        return endScreenData;
      case 'campaign':
        return agentsData;
      default:
        return {};
    }
  };

  const handleCreateDraft = async () => {
    const response = await _CREATE_DRAFT({
      draftType: draftType,
      draftString: JSON.stringify(getCurrentData()),
    });

    if (response?.data?.success) {
      notification.success({
        message: 'Draft created',
        placement: 'bottomRight',
        showProgress: true,
      });
      navigate(navigateBack);
    }
  };

  const handleDeleteDraft = async (draftId, showNotification = false) => {
    await _DELETE_DRAFT(draftId);

    if (showNotification) {
      notification.success({
        message: 'Draft deleted',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  const handleEditDraft = async _id => {
    switch (draftType) {
      case 'engagement':
        return navigate(`${screenFinder('engagement').draftPath}?_id=${_id}`);
      case 'endScreen':
        return navigate(`${screenFinder('endscreen').draftPath}?_id=${_id}`);
      case 'action':
        return navigate(`${screenFinder('cta').draftPath}?_id=${_id}`);
      case 'campaign':
        return navigate(`${agentData.draftPath}?_id=${_id}`);
      default:
        return navigate('');
    }
  };

  const processShowData = data => {
    let sentData = { _id: data?._id };
    const createdDate = data?.createdDate;
    const draftData = JSON.parse(data?.draftString);
    const ctaType = draftData?.etc?.ctaType;
    const engType = draftData?.etc?.engType;
    const agentType = draftData?.data?.campaignData?.campaignType;

    if (engType) {
      sentData = {
        ...draftData?.data[engType],
        ...sentData,
        screenshotImage: '',
        createdDate: createdDate,
      };
    } else if (ctaType) {
      sentData = {
        ...draftData?.data[ctaType],
        ...sentData,
        screenshotImage: '',
        createdDate: createdDate,
      };
    } else if (agentType) {
      const website = draftData?.data?.domainConfig?.domainId;

      sentData = {
        ...draftData?.data,
        ...sentData,
        screenshotImage: '',
        createdDate: createdDate,
        campaignType: agentType,
        website: website,
        domainConfig: {
          domainHost: website,
        },
      };
    }

    return sentData;
  };

  return {
    handleCreateDraft,
    isCreatingDraft,
    handleDeleteDraft,
    isDeletingDraft,
    isLoadingAllDrafts: isLoadingAllDrafts || isFetching,
    handlePaginationChange,
    handleDisplayDataChange,
    displayedItems,
    totalItems: allDrafts?.data?.length,
    pageSize: PAGE_SIZE,
    paginationPage,
    processShowData,
    handleEditDraft,
  };
};

export default useDraftsHandler;
