import { useEffect, useState, useMemo } from 'react';
import { useGetCompaniesQuery } from '../../../services/api';
import { useLocation } from 'react-router-dom';

const PAGE_SIZE = 10;

const useCompaniesTableHandler = searchValue => {
  const { pathname } = useLocation();
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);

  // Use RTK Query hook with parameters - it will automatically refetch when params change or tag is invalidated
  const {
    data: response,
    isLoading,
    isFetching: isCompaniesFetchingQuery,
    isError,
    refetch,
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

  useEffect(() => {
    if (pathname === '/companies') {
      refetch();
    }
  }, [pathname, refetch]);

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
    // First load (no data yet) vs a refetch: the page shows a skeleton for the first, and dims
    // the table for the second.
    isInitialLoading: isLoading,
    // A failed load replaces the table with "Couldn't load companies" + Try again.
    isError,
    refetch,
  };
};

export default useCompaniesTableHandler;
