import { useState } from 'react';
import { notification } from 'antd';
import {
  useCreateCompanyMutation,
  useDeleteCompanyMutation,
  useUpdateCompanyMutation,
} from '../../../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCompaniesDrawerState } from '../../../redux/slices/companiesSlice';

const useCompaniesHandler = () => {
  const dispatch = useDispatch();
  const drawerState = useSelector(state => state?.companies?.drawerState);

  const [manageUsersDrawer, setManageUsersDrawer] = useState({
    open: false,
    companyId: null,
  });

  const [_CREATE_COMPANY, { isLoading: isCreatingCompany }] = useCreateCompanyMutation();
  const [_UPDATE_COMPANY, { isLoading: isUpdatingCompany }] = useUpdateCompanyMutation();
  const [_DELETE_COMPANY, { isLoading: isDeletingCompany }] = useDeleteCompanyMutation();

  const openCreateDrawer = () =>
    dispatch(setCompaniesDrawerState({ open: true, mode: 'create', record: null }));
  const openEditDrawer = record =>
    dispatch(setCompaniesDrawerState({ open: true, mode: 'edit', record: record }));
  const closeDrawer = () =>
    dispatch(setCompaniesDrawerState({ open: false, mode: 'create', record: null }));

  const createCompany = async values => {
    try {
      await _CREATE_COMPANY(values.name).unwrap();

      notification.success({
        message: 'Company created successfully',
        placement: 'bottomRight',
        showProgress: true,
      });

      closeDrawer();
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to create company',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  const updateCompany = async values => {
    try {
      await _UPDATE_COMPANY({ id: values.id, name: values.name }).unwrap();

      notification.success({
        message: 'Company updated successfully',
        placement: 'bottomRight',
        showProgress: true,
      });

      closeDrawer();
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to update company',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  const deleteCompany = async company => {
    try {
      await _DELETE_COMPANY(company.id).unwrap();

      notification.success({
        message: 'Company deleted successfully',
        placement: 'bottomRight',
        showProgress: true,
      });
    } catch (error) {
      notification.error({
        message: error?.data?.errorObject?.userErrorText || 'Failed to delete company',
        placement: 'bottomRight',
        showProgress: true,
      });
    }
  };

  const handleSubmitCompany = async values => {
    if (drawerState.mode === 'edit' && drawerState.record) {
      await updateCompany({ ...values, id: drawerState.record.id });
    } else {
      await createCompany(values);
    }
  };

  return {
    drawerState,
    submitting: isCreatingCompany,
    isDeletingCompany,
    isUpdatingCompany,
    openCreateDrawer,
    openEditDrawer,
    closeDrawer,
    handleSubmitCompany,
    deleteCompany,
    manageUsersDrawer,
    setManageUsersDrawer,
  };
};

export default useCompaniesHandler;
