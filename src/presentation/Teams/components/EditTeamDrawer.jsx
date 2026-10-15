import React, { useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Coins01Icon,
  Megaphone01Icon,
  PlayListIcon,
  UserAdd01Icon,
  Wrench01Icon,
} from '@hugeicons/core-free-icons';
import { Form, FormField, useForm } from '@/components/form';
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
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import {
  useDisablePlaybookForTeamMutation,
  useEnablePlaybookForTeamMutation,
} from '../../../services/api';
import AddMembersDrawer from './AddMembersDrawer';
import BrandSettings from './BrandSettings';
import CompanyCombobox from './CompanyCombobox';
import CrawlBrandingSheet from './CrawlBrandingSheet';
import { DrawerSection, SettingGroup, SettingRow } from './SettingParts';
import TeamMembersTable from './TeamMembersTable';
import { plural } from './TeamParts';
import ManageCreditsDrawer from '../../TeamCredits/components/ManageCreditsDrawer';
import PreviewEditCustomWorkDrawer from '../../TeamCredits/components/PreviewEditCustomWorkDrawer';
import AssignPlaybookDrawer from '../../dashboard/components/AssignPlaybookDrawer';
import useAssignPlaybookDrawer from '../../dashboard/controllers/useAssignPlaybookDrawer';

const rowIcon = icon => <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4.5" />;

const EditTeamDrawer = ({
  open,
  team,
  onCompanyChange,
  form,
  companyOptions,
  isLoadingCompanies,
  companySearchText,
  onCompanySearch,
  onCreateCompany,
  isCreatingCompany,
  handleFinish,
  handleClose,
  handleAfterOpenChange,
  memberTableData,
  isLoadingMembers,
  isSubmitting,
  onMemberLogin,
  onMemberStatusChange,
  onRemoveMember,
  deletingMemberId,
  memberTokenUserId,
  memberTokenType,
  addMembersDrawerOpen,
  openAddMembersDrawer,
  closeAddMembersDrawer,
  addMembersForm,
  addMembersUserOptions,
  isAddMembersUsersLoading,
  handleAddMembersFinish,
  handleAddMembersAfterOpenChange,
  isAddMembersSubmitting,
  manageCreditsDrawerOpen,
  openManageCreditsDrawer,
  closeManageCreditsDrawer,
  manageCreditsTeamData,
  creditsHistoryData,
  isLoadingCreditsHistory,
  handleManageCreditsSubmit,
  isCreditsSubmitting,
  handleEditCreditsHistorySubmit,
  isEditingHistorySubmitting,
  creditsForm,
  customWorkEditDrawerOpen,
  openCustomWorkDrawer,
  closeCustomWorkEditDrawer,
  selectedCustomWorkEntry,
  teamsDataForCustomWorkDrawer,
  handleCustomWorkSubmit,
  isCustomWorkSubmitting,
}) => {
  const [isCrawlDrawerOpen, setIsCrawlDrawerOpen] = useState(false);
  const [isApplyingPlaybookChanges, setIsApplyingPlaybookChanges] = useState(false);
  const [assignPlaybookForm] = useForm();
  const [enablePlaybookForTeam] = useEnablePlaybookForTeamMutation();
  const [disablePlaybookForTeam] = useDisablePlaybookForTeamMutation();

  const {
    playbooks,
    playbookAgentLabelMap,
    isLoadingPlaybooks,
    draftSelectedPlaybooks,
    initialAssignedPlaybookTypes,
    teamAssignedPlaybookIdsByType,
    isPlaybookDrawerOpen,
    openPlaybooksDrawer,
    closePlaybooksDrawer,
    applyPlaybooksSelection,
    handlePlaybookToggle,
    handleTeamPlaybooksLoaded,
  } = useAssignPlaybookDrawer({ form: assignPlaybookForm });

  const handleAssignPlaybooks = async () => {
    const teamId = team?._id;
    if (!teamId) {
      toast.warning('Pick a team first');
      return;
    }

    const initialSet = new Set(initialAssignedPlaybookTypes);
    const draftSet = new Set(draftSelectedPlaybooks);

    const toEnableTypes = draftSelectedPlaybooks.filter(t => !initialSet.has(t));
    const toDisableTypes = initialAssignedPlaybookTypes.filter(t => !draftSet.has(t));

    if (toEnableTypes.length === 0 && toDisableTypes.length === 0) {
      applyPlaybooksSelection();
      return;
    }

    setIsApplyingPlaybookChanges(true);
    try {
      const enableTasks = toEnableTypes.map(playbookType => {
        const playbook = playbooks.find(p => p.value === playbookType);
        if (!playbook?.id) {
          return Promise.reject(new Error(`Missing playbook id for "${playbookType}"`));
        }
        return enablePlaybookForTeam({ teamId, playbookId: playbook.id }).unwrap();
      });

      const disableTasks = toDisableTypes.map(playbookType => {
        const playbookId = teamAssignedPlaybookIdsByType[playbookType];
        if (!playbookId) {
          return Promise.reject(new Error(`Missing team playbook id for "${playbookType}"`));
        }
        return disablePlaybookForTeam({ teamId, playbookId }).unwrap();
      });

      await Promise.all([...enableTasks, ...disableTasks]);

      applyPlaybooksSelection();
      toast.success('Team playbooks updated');
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Couldn't update the team's playbooks");
    } finally {
      setIsApplyingPlaybookChanges(false);
    }
  };

  const memberCount = memberTableData?.length ?? 0;

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={next => {
          if (!next) handleClose();
        }}
      >
        <SheetContent
          className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[900px]"
          // Open on the drawer, not inside the form: Radix would focus and select the team name.
          onOpenAutoFocus={event => event.preventDefault()}
          onCloseAutoFocus={() => handleAfterOpenChange?.(false)}
        >
          <SheetHeader className="border-b pe-14">
            <SheetTitle className="truncate text-[17px] font-semibold tracking-[-0.01em]">
              Edit team
            </SheetTitle>
            <SheetDescription className="truncate">
              {team
                ? [team.teamName, team.companyName].filter(v => v && v !== '—').join(' · ')
                : ''}
            </SheetDescription>
          </SheetHeader>

          <div
            data-flat="true"
            className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6 [--flat-gutter:--spacing(6)]"
          >
            {team ? (
              <>
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
                              onCompanyChange?.(companyId);
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

                  <DrawerSection title="Access">
                    <SettingGroup>
                      <SettingRow
                        icon={rowIcon(Megaphone01Icon)}
                        title="Sponsor access"
                        description="Let this team use the sponsor features."
                        control={
                          <FormField name="isSponsorsActive" noStyle>
                            <Switch aria-label="Sponsor access" />
                          </FormField>
                        }
                      />
                    </SettingGroup>
                  </DrawerSection>

                  <BrandSettings form={form} onOpenCrawl={() => setIsCrawlDrawerOpen(true)} />
                </Form>

                <DrawerSection title="Credits and playbooks">
                  <SettingGroup>
                    <SettingRow
                      icon={rowIcon(Coins01Icon)}
                      title="Credit balance"
                      description={
                        <span className="tabular-nums">
                          {plural(team.creditBalance ?? 0, 'credit')} available
                        </span>
                      }
                      control={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openManageCreditsDrawer?.(team)}
                        >
                          Manage credits
                        </Button>
                      }
                    />
                    <SettingRow
                      icon={rowIcon(Wrench01Icon)}
                      title="Custom work"
                      description={
                        team.customWork
                          ? `${plural(team.customWork, 'entry', 'entries')} logged. Track the credits custom work uses.`
                          : 'Track the credits custom work uses.'
                      }
                      control={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openCustomWorkDrawer?.(team)}
                        >
                          Manage custom work
                        </Button>
                      }
                    />
                    <SettingRow
                      icon={rowIcon(PlayListIcon)}
                      title="Playbooks"
                      description="Choose which playbooks this team can use."
                      control={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openPlaybooksDrawer?.()}
                        >
                          Manage playbooks
                        </Button>
                      }
                    />
                  </SettingGroup>
                </DrawerSection>

                <DrawerSection
                  title="Members"
                  description={
                    isLoadingMembers
                      ? 'The owner is listed first.'
                      : `${plural(memberCount, 'person', 'people')}. The owner is listed first.`
                  }
                  action={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openAddMembersDrawer?.()}
                    >
                      <HugeiconsIcon
                        icon={UserAdd01Icon}
                        strokeWidth={2}
                        data-icon="inline-start"
                      />
                      Add members
                    </Button>
                  }
                >
                  <TeamMembersTable
                    data={memberTableData}
                    loading={isLoadingMembers}
                    onAddMembers={() => openAddMembersDrawer?.()}
                    onLogin={onMemberLogin}
                    onUpdateStatus={onMemberStatusChange}
                    onRemove={onRemoveMember}
                    deletingId={deletingMemberId}
                    busyUserId={memberTokenUserId}
                    busyTokenType={memberTokenType}
                  />
                </DrawerSection>
              </>
            ) : null}
          </div>

          {team ? (
            <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="button" onClick={() => form.submit()} disabled={isSubmitting}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      <CrawlBrandingSheet
        open={open && isCrawlDrawerOpen}
        onOpenChange={setIsCrawlDrawerOpen}
        form={form}
      />

      <AddMembersDrawer
        open={open && addMembersDrawerOpen}
        form={addMembersForm}
        availableUserOptions={addMembersUserOptions}
        isUsersLoading={isAddMembersUsersLoading}
        handleFinish={handleAddMembersFinish}
        handleAfterOpenChange={handleAddMembersAfterOpenChange}
        closeDrawer={closeAddMembersDrawer}
        isSubmitting={isAddMembersSubmitting}
      />

      <ManageCreditsDrawer
        open={open && manageCreditsDrawerOpen}
        onClose={closeManageCreditsDrawer}
        teamData={manageCreditsTeamData}
        historyData={creditsHistoryData}
        isLoadingHistory={isLoadingCreditsHistory}
        onSubmit={handleManageCreditsSubmit}
        isSubmitting={isCreditsSubmitting}
        onEditHistorySubmit={handleEditCreditsHistorySubmit}
        isEditingHistorySubmitting={isEditingHistorySubmitting}
        form={creditsForm}
      />

      <PreviewEditCustomWorkDrawer
        open={open && customWorkEditDrawerOpen}
        onClose={closeCustomWorkEditDrawer}
        mode="edit"
        initialRecord={selectedCustomWorkEntry}
        teamsData={teamsDataForCustomWorkDrawer}
        onSubmit={handleCustomWorkSubmit}
        isSubmitting={isCustomWorkSubmitting}
      />

      <AssignPlaybookDrawer
        open={open && isPlaybookDrawerOpen}
        teamId={team?._id}
        playbooks={playbooks}
        playbookAgentLabelMap={playbookAgentLabelMap}
        draftSelectedPlaybooks={draftSelectedPlaybooks}
        isLoadingPlaybooks={isLoadingPlaybooks}
        isApplyingPlaybooks={isApplyingPlaybookChanges}
        onTeamPlaybooksLoaded={handleTeamPlaybooksLoaded}
        onClose={closePlaybooksDrawer}
        onApply={handleAssignPlaybooks}
        onToggle={handlePlaybookToggle}
      />
    </>
  );
};

export default EditTeamDrawer;
