import { useEffect, useState, useMemo } from 'react';
import { notification } from 'antd';
import { useGetCompaniesQuery } from '../../../services/api';

const PAGE_SIZE = 10;

const useCompaniesTableHandler = searchValue => {
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);

  // Use RTK Query hook with parameters - it will automatically refetch when params change or tag is invalidated
  const {
    data: response,
    isLoading,
    isFetching: isCompaniesFetchingQuery,
    isError,
    error,
  } = useGetCompaniesQuery({
    page,
    limit,
    search: searchValue || '',
  });

  // Process response data
  const { companies, total } = useMemo(() => {
    const companiesData =
      response?.data?.data ?? response?.data ?? (Array.isArray(response) ? response : []);

    return {
      companies: Array.isArray(companiesData) ? companiesData : [],
      total:
        response?.total ??
        response?.totalLength ??
        response?.data?.total ??
        response?.data?.totalLength ??
        companiesData.length ??
        0,
    };
  }, [response]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchValue]);

  // Handle error
  useEffect(() => {
    if (isError && error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to fetch companies',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  }, [isError, error]);

  const handlePageChange = newPage => {
    setPage(newPage);
  };

  return {
    companies,
    total,
    page,
    limit,
    handlePageChange,
    isLoading: isLoading || isCompaniesFetchingQuery,
  };
};

export default useCompaniesTableHandler;
