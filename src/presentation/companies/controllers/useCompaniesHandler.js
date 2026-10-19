import { useState } from 'react';
import { toast } from 'sonner';
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
      const result = await _CREATE_COMPANY(values.name).unwrap();

      toast.success('Company created');

      closeDrawer();
      return result;
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't create the company");
      throw error;
    }
  };

  const updateCompany = async values => {
    try {
      await _UPDATE_COMPANY({ id: values.id, name: values.name }).unwrap();

      toast.success('Company updated');

      closeDrawer();
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't update the company");
    }
  };

  const deleteCompany = async company => {
    try {
      await _DELETE_COMPANY(company.id).unwrap();

      toast.success('Company deleted');
    } catch (error) {
      toast.error(error?.data?.errorObject?.userErrorText || "Couldn't delete the company");
    }
  };

  const handleSubmitCompany = async values => {
    if (drawerState.mode === 'edit' && drawerState.record) {
      await updateCompany({ ...values, id: drawerState.record.id });
      return null;
    } else {
      const createdCompany = await createCompany(values);
      return createdCompany;
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
