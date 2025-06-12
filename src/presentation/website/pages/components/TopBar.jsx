import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Input,
  Row,
  Select,
  Skeleton,
  Space,
  notification,
} from 'antd';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useDebouncedInput from '../../../../utils/controllers/useDebouncedInput';
import { useGetAllDomainsQuery } from '../../../../services/api';

function TopBar({ setPageSearchTermHandler, setPagesDomainIdsHandler }) {
  const pagesData = useSelector(state => state.pages.data);
  const { domainIds, search } = pagesData;
  const { inputQuery, debouncedValue, inputHandler } = useDebouncedInput(search);
  const { data: domainsData = [], isLoading } = useGetAllDomainsQuery();

  useEffect(() => {
    setPageSearchTermHandler(debouncedValue);
  }, [debouncedValue]);

  return (
    <Col span={24}>
      <Row gutter={[30, 30]} justify="space-between" wrap={true} align="middle">
        <Col {...{ xs: 24, sm: 24, md: 12, lg: 12, xl: 12 }}>
          <Space size={30}>
            {isLoading ? (
              <Skeleton.Button size="large" style={{ width: '150px' }} active />
            ) : (
              <Select
                mode="multiple"
                style={{ width: '100%', minWidth: '200px' }}
                size="large"
                variant="filled"
                loading={isLoading}
                value={domainIds}
                onChange={e => {
                  if (e.length === 0) {
                    notification.warning({
                      message: 'At least one domain should be selected',
                      placement: 'bottomRight',
                      showProgress: true,
                    });
                    return;
                  }
                  setPagesDomainIdsHandler(e);
                }}
                options={domainsData?.data?.map(item => {
                  return {
                    label: item?.host,
                    value: item?._id,
                  };
                })}
                dropdownRender={menu => (
                  <>
                    <Row style={{ padding: '8px' }}>
                      <Checkbox
                        checked={domainIds?.length === domainsData?.data?.length}
                        onChange={e => {
                          if (e.target.checked) {
                            setPagesDomainIdsHandler(domainsData?.data?.map(item => item._id));
                          } else {
                            if (domainsData?.data?.length > 1) {
                              setPagesDomainIdsHandler([domainsData?.data[0]?._id]);
                            }
                          }
                        }}
                      >
                        Select All
                      </Checkbox>
                    </Row>
                    <Divider style={{ margin: '0' }} />
                    {menu}
                  </>
                )}
                maxTagCount="responsive"
              />
            )}
          </Space>
        </Col>
        <Col {...{ xs: 24, sm: 10, md: 10, lg: 7, xl: 5 }}>
          <Input
            prefix={<SearchOutlined style={{ opacity: 0.5, fontSize: '15px' }} />}
            placeholder="Search"
            size="large"
            style={{ width: '100%' }}
            value={inputQuery}
            onChange={e => inputHandler(e.target.value)}
          />
        </Col>
      </Row>
    </Col>
  );
}

export default TopBar;
