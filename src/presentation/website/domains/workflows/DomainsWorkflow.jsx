import { Col, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import useDebouncedInput from '../../../../utils/controllers/useDebouncedInput';
import AllDomains from '../components/AllDomains';
import { useGetAllDomainsQuery } from '../../../../services/api';
import DomainDrawer from './DomainDrawer';
import { useDispatch } from 'react-redux';
import { setDomains } from '../../../../redux/slices/domains/domainSlice';
import ScriptsDrawer from '../components/ScriptsDrawer';

const { Title } = Typography;

function DomainsWorkflow() {
  const dispatch = useDispatch();
  const { data = [], isLoading } = useGetAllDomainsQuery();
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput();
  const [displayData, setDisplayData] = useState([]);

  // Effect for searching and filtering data
  useEffect(() => {
    // Ensure data is not null or undefined before dispatching
    if (data && data.data) {
      dispatch(setDomains(data.data));

      const searchHandler = () => {
        // Use lower case for case-insensitive search
        const filteredData = data.data.filter(item =>
          item.host.toLowerCase().includes(inputQuery.toLowerCase())
        );

        const sortedData = filteredData.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );

        setDisplayData(sortedData);
      };
      searchHandler();
    }
  }, [debouncedValue, data, dispatch]);

  return (
    <Row gutter={[30, 30]}>
      <Col span={24}>
        <Title level={2} className="lightTitle">
          Domains
        </Title>
      </Col>
      {/* TopBar component for search functionality */}
      <TopBar searchQuery={inputQuery} searchHandler={inputHandler} isLoading={isLoading} />

      {/* Component to display all domains */}
      <AllDomains data={displayData} isLoading={isLoading} />

      {/* Drawer for domain details */}
      <DomainDrawer />

      {/* Drawer for scripts */}
      <ScriptsDrawer />
    </Row>
  );
}

export default DomainsWorkflow;
