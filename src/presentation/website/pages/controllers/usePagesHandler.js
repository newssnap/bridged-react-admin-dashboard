import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setPageData,
  setPageNumber,
  setPageSearchTerm,
  setPages,
  setPagesDomainIds,
  setPagesLength,
} from '../../../../redux/slices/pages/pagesSlice';
import { useGetAllDomainsQuery, useGetAllPagesMutation } from '../../../../services/api';
import { notification } from 'antd';
import { useLocation } from 'react-router-dom';

const usePagesHandler = () => {
  const urlSearch = useLocation().search;
  const urlDomainId = new URLSearchParams(urlSearch).get('domainId');
  const abortControllerRef = useRef(null);
  const currentRequestIdRef = useRef(0);

  // Redux hooks
  const dispatch = useDispatch();
  const pagesData = useSelector(state => state.pages.data);
  const { domainIds, page, search } = pagesData;

  // API hooks
  const [_PAGES, { isLoading: isPagesLoading }] = useGetAllPagesMutation();
  const { data: domainsData, isSuccess, isLoading: isDomainsLoading } = useGetAllDomainsQuery();

  // Function to set page data
  const setPageDataHandler = data => {
    dispatch(setPageData(data));
  };

  // Function to set page number
  const setPageNumberHandler = number => {
    dispatch(setPageNumber(number));
  };

  // Function to set search term
  const setPageSearchTermHandler = term => {
    dispatch(setPageSearchTerm(term));
  };

  // Function to set domain ids
  const setPagesDomainIdsHandler = ids => {
    dispatch(setPagesDomainIds(ids));
  };

  // Function to fetch page data from API and update state
  const fetchPageData = async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    const currentRequestId = ++currentRequestIdRef.current;

    try {
      const response = await _PAGES({
        domainIds: domainIds,
        page: page,
        search: search,
        signal: abortControllerRef.current.signal,
      });

      // Only update state if this is the most recent request
      if (currentRequestId === currentRequestIdRef.current) {
        if (response?.data) {
          dispatch(setPages(response?.data?.data?.data));
          dispatch(setPagesLength(response?.data?.data?.totalLength));
        }

        if (response?.error) {
          notification.error({
            message: response?.error?.data?.errorObject?.userErrorText,
            placement: 'bottomRight',
            showProgress: true,
          });
        }
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name !== 'AbortError') {
        notification.error({
          message: 'Failed to fetch pages data',
          placement: 'bottomRight',
          showProgress: true,
        });
      }
    }
  };

  // Effect to update domainIds when domainsData changes
  useEffect(() => {
    if (urlDomainId && isSuccess) {
      setPagesDomainIdsHandler([urlDomainId]);
      return;
    }

    if (isSuccess && domainsData) {
      let domainIds = domainsData?.data?.map(domain => domain?._id);
      setPagesDomainIdsHandler(domainIds);
    }
  }, [isSuccess, domainsData, urlDomainId]);

  // Effect to fetch page data when necessary data changes
  useEffect(() => {
    if (isSuccess && domainIds.length > 0) {
      fetchPageData();
    }
  }, [domainIds, page, search, isSuccess]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Return necessary handlers and loading state
  return {
    setPageDataHandler,
    setPageNumberHandler,
    setPageSearchTermHandler,
    setPagesDomainIdsHandler,
    isLoading: isPagesLoading || isDomainsLoading,
  };
};

export default usePagesHandler;
