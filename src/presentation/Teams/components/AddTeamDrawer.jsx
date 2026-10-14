import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Form, FormField, useForm, useWatch } from '@/components/form';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import useAssignPlaybookDrawer from '../../dashboard/controllers/useAssignPlaybookDrawer';
import PlaybookSelectionList from '../../dashboard/components/PlaybookSelectionList';
import BrandSettings from './BrandSettings';
import CompanyCombobox from './CompanyCombobox';
import CrawlBrandingSheet from './CrawlBrandingSheet';
import { DrawerSection } from './SettingParts';
import UserCombobox from './UserCombobox';

const defaultBrandSyncTheme = 'light';

const PLAYBOOK_RULES = [{ type: 'array', min: 1, message: 'Select at least one playbook' }];

function PlaybooksSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-20 rounded-lg" />
      ))}
    </div>
  );
}

const AddTeamDrawer = ({
  open,
  onClose,
  companyOptions,
  isLoadingCompanies,
  companySearchText,
  onCompanySearch,
  onCreateCompany,
  isCreatingCompany,
  userOptions,
  isUsersLoading,
  onCompanyChange,
  onSubmit,
  isSubmitting,
}) => {
  const [form] = useForm();
  const [isCrawlDrawerOpen, setIsCrawlDrawerOpen] = useState(false);

  const { playbooks, playbookAgentLabelMap, isLoadingPlaybooks } = useAssignPlaybookDrawer({
    form,
  });

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      teamName: undefined,
      companyId: undefined,
      teamOwnerId: undefined,
      memberIds: undefined,
      assignedPlaybooks: [],
      isWhitelabelingEnabled: false,
      isBrandSyncEnabled: false,
      dashboardURL: undefined,
      primaryColor: '#753fd0',
      logoUrl: undefined,
      brandSyncPrimaryColor: undefined,
      brandSyncAccentColour: undefined,
      brandSyncLogo: undefined,
      brandSyncTheme: defaultBrandSyncTheme,
      brandSyncFontName: undefined,
      brandSyncBaseFontScale: undefined,
      brandSyncBorderRadius: undefined,
    });
  }, [open, form]);

  const handleFinish = values => {
    const assignedPlaybookTypes = values.assignedPlaybooks ?? [];
    const playbookIds = assignedPlaybookTypes
      .map(playbookType => playbooks.find(playbook => playbook.value === playbookType)?.id)
      .filter(Boolean);

    if (playbookIds.length === 0) {
      toast.error('Select at least one playbook');
      return;
    }

    const primaryColor =
      typeof values.primaryColor === 'string'
        ? values.primaryColor
        : (values.primaryColor?.toHexString?.() ?? '');
    const dashboardURL = values.dashboardURL?.trim()
      ? `${values.dashboardURL.trim()}.bridged.media`
      : undefined;

    const agentVisualizationConfig = {
      primaryColor:
        typeof values.brandSyncPrimaryColor === 'string'
          ? values.brandSyncPrimaryColor
          : values.brandSyncPrimaryColor?.toHexString?.(),
      accentColour:
        typeof values.brandSyncAccentColour === 'string'
          ? values.brandSyncAccentColour
          : values.brandSyncAccentColour?.toHexString?.(),
      logo: values.brandSyncLogo?.trim() || '',
      theme: values.brandSyncTheme || defaultBrandSyncTheme,
      fontName: values.brandSyncFontName?.trim() || '',
      baseFontScale: values.brandSyncBaseFontScale,
      borderRadius: values.brandSyncBorderRadius?.trim() || '',
    };

    onSubmit({
      ...values,
      playbookIds,
      primaryColor,
      dashboardURL,
      isAgentVisualizationEnabled: !!values.isBrandSyncEnabled,
      agentVisualizationConfig,
    });
  };

  const selectedTeamOwnerId = useWatch('teamOwnerId', form);
  const assignedPlaybooks = useWatch('assignedPlaybooks', form);
  const memberOptions = (userOptions ?? []).filter(opt => opt.value !== selectedTeamOwnerId);

  const clearPeople = companyId => {
    form.setFieldValue('teamOwnerId', undefined);
    form.setFieldValue('memberIds', undefined);
    onCompanyChange(companyId);
  };

  const playbookCount = assignedPlaybooks?.length ?? 0;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={next => {
          if (!next) onClose();
        }}
      >
        <SheetContent
          className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]"
          onOpenAutoFocus={event => event.preventDefault()}
        >
          <SheetHeader className="border-b pe-14">
            <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
              Create team
            </SheetTitle>
            <SheetDescription>
              Set up the team, its owner and members, the playbooks it can use and its branding.
            </SheetDescription>
          </SheetHeader>

          <div
            data-flat="true"
            className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6 [--flat-gutter:--spacing(6)]"
          >
            <Form
              form={form}
              onFinish={handleFinish}
              requiredMark={false}
              scrollToFirstError
              autoComplete="off"
            >
              <DrawerSection title="Team details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Team name"
                    name="teamName"
                    rules={[{ required: true, message: 'Enter a team name' }]}
                  >
                    <Input placeholder="e.g. Acme newsroom" />
                  </FormField>
                  <FormField
                    label="Company"
                    name="companyId"
                    bind="valueChange"
                    rules={[{ required: true, message: 'Select a company' }]}
                  >
                    {control => (
                      <CompanyCombobox
                        id={control.id}
                        aria-invalid={control['aria-invalid']}
                        aria-describedby={control['aria-describedby']}
                        value={control.value}
                        onValueChange={companyId => {
                          control.onValueChange(companyId);
                          clearPeople(companyId);
                        }}
                        options={companyOptions}
                        loading={isLoadingCompanies}
                        searchText={companySearchText}
                        onSearch={onCompanySearch}
                        onCreate={onCreateCompany}
                        isCreating={isCreatingCompany}
                      />
                    )}
                  </FormField>
                </div>
              </DrawerSection>

              <DrawerSection
                title="People"
                description="The owner manages the team. You can add members later too."
              >
                <FormField
                  label="Team owner"
                  name="teamOwnerId"
                  bind="valueChange"
                  rules={[{ required: true, message: 'Select a team owner' }]}
                >
                  {control => (
                    <UserCombobox
                      id={control.id}
                      aria-invalid={control['aria-invalid']}
                      aria-describedby={control['aria-describedby']}
                      value={control.value}
                      onValueChange={control.onValueChange}
                      options={userOptions}
                      loading={isUsersLoading}
                      placeholder="Select the team owner"
                    />
                  )}
                </FormField>
                <FormField label="Members" name="memberIds" bind="valueChange">
                  {control => (
                    <MultiSelect
                      id={control.id}
                      aria-invalid={control['aria-invalid']}
                      options={memberOptions}
                      value={control.value ?? []}
                      onValueChange={values => control.onValueChange(values)}
                      placeholder="Select members (optional)"
                      loading={isUsersLoading}
                      allowClear
                    />
                  )}
                </FormField>
              </DrawerSection>

              <DrawerSection
                title="Playbooks"
                description={
                  playbookCount
                    ? `${playbookCount} selected. The team can use these playbooks.`
                    : 'Pick at least one playbook the team can use.'
                }
              >
                <FormField name="assignedPlaybooks" initialValue={[]} rules={PLAYBOOK_RULES}>
                  {control =>
                    isLoadingPlaybooks ? (
                      <PlaybooksSkeleton />
                    ) : (
                      <PlaybookSelectionList
                        playbooks={playbooks}
                        playbookAgentLabelMap={playbookAgentLabelMap}
                        selectedPlaybooks={control.value ?? []}
                        onToggle={(playbookValue, checked) => {
                          const current = control.value ?? [];
                          const nextValue = checked
                            ? [...new Set([...current, playbookValue])]
                            : current.filter(item => item !== playbookValue);
                          control.onChange(nextValue);
                        }}
                      />
                    )
                  }
                </FormField>
              </DrawerSection>

              <BrandSettings form={form} onOpenCrawl={() => setIsCrawlDrawerOpen(true)} />
            </Form>
          </div>

          <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" onClick={() => form.submit()} disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {isSubmitting ? 'Creating…' : 'Create team'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <CrawlBrandingSheet
        open={isCrawlDrawerOpen}
        onOpenChange={setIsCrawlDrawerOpen}
        form={form}
        resetWhen={open}
      />
    </>
  );
};

export default AddTeamDrawer;
