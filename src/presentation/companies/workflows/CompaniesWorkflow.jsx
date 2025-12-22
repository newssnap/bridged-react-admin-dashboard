import React, { useState } from 'react';
import { Col, Row } from 'antd';
import CompaniesTopbar from '../components/CompaniesTopbar';
import CompaniesTable from '../components/CompaniesTable';
import CompanyFormDrawer from '../components/CompanyFormDrawer';
import useCompaniesHandler from '../controllers/useCompaniesHandler';
import ManageUsersDrawer from '../components/ManageUsersDrawer';

const CompaniesWorkflow = () => {
  const [searchValue, setSearchValue] = useState('');

  const {
    drawerState,
    submitting,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    handleSubmitCompany,
    deleteCompany,
    manageUsersDrawer,
    setManageUsersDrawer,
  } = useCompaniesHandler();

  return (
    <Row gutter={[15, 30]}>
      <Col span={24}>
        <CompaniesTopbar onSearchChange={setSearchValue} onAddCompany={openCreateDrawer} />
      </Col>

      <Col span={24}>
        <CompaniesTable
          onEdit={openEditDrawer}
          onDelete={deleteCompany}
          searchValue={searchValue}
          setManageUsersDrawer={setManageUsersDrawer}
        />
      </Col>

      <CompanyFormDrawer
        open={drawerState?.open}
        mode={drawerState?.mode}
        initialValues={drawerState?.record}
        onClose={closeDrawer}
        onSubmit={handleSubmitCompany}
        confirmLoading={submitting}
      />

      <ManageUsersDrawer
        open={manageUsersDrawer?.open}
        setManageUsersDrawer={setManageUsersDrawer}
        companyId={manageUsersDrawer?.companyId}
      />
    </Row>
  );
};

export default CompaniesWorkflow;
