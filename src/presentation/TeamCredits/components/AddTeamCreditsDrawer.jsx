import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';
import { Form, FormField, useForm } from '@/components/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import CreditBalanceSummary from './CreditBalanceSummary';
import CreditEntryFields, { toCreditEntryPayload } from './CreditEntryFields';
import LedgerTable from './LedgerTable';
import { CreditSheetHeader, DiscardButton, SheetSection, sheetContentClasses } from './SheetParts';
import TeamCombobox from './TeamCombobox';

const AddTeamCreditsDrawer = ({
  open,
  onClose,
  teamsData,
  selectedTeamId,
  selectedTeamData,
  historyData,
  isLoadingHistory,
  onSubmit,
  isSubmitting,
  onTeamSelect,
}) => {
  const [form] = useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        teamId: undefined,
        purchaseDate: dayjs(),
      });
    }
  }, [open, form]);

  useEffect(() => {
    if (selectedTeamId && selectedTeamData) {
      form.setFieldsValue({
        teamId: selectedTeamId,
      });
    }
  }, [selectedTeamId, selectedTeamData, form]);

  const handleFinish = values => {
    onSubmit({ teamId: values.teamId, ...toCreditEntryPayload(values) });
  };

  const hasSelectedTeam = !!selectedTeamId;

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <SheetContent className={sheetContentClasses('md')}>
        <CreditSheetHeader
          title="Add credits"
          description="Assign credits to a team, or deduct them."
        />
        <div className="min-h-0 flex-1 overflow-y-auto" data-flat="true">
          <SheetSection>
            <Alert className="rounded-lg border-transparent bg-primary/[0.07] *:[svg]:text-primary">
              <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} />
              <AlertTitle>Credits turn on usage and reporting</AlertTitle>
              <AlertDescription>
                Once a team has credits, its credit usage and reports are switched on.
              </AlertDescription>
            </Alert>

            <Form
              form={form}
              onFinish={handleFinish}
              requiredMark="optional"
              scrollToFirstError
              autoComplete="off"
            >
              <div className="flex flex-col gap-5">
                <FormField
                  label="Team"
                  name="teamId"
                  bind="valueChange"
                  rules={[{ required: true, message: 'Choose a team' }]}
                >
                  {control => (
                    <TeamCombobox teams={teamsData} control={control} onChange={onTeamSelect} />
                  )}
                </FormField>

                {hasSelectedTeam && (
                  <div className="rounded-lg bg-muted/40 p-4">
                    <CreditBalanceSummary
                      balance={historyData?.creditBalance ?? selectedTeamData?.creditBalance}
                      history={historyData?.history}
                      loading={isLoadingHistory && !historyData}
                    />
                  </div>
                )}

                <CreditEntryFields />
              </div>
            </Form>
          </SheetSection>

          {hasSelectedTeam && (
            <SheetSection
              title="Ledger"
              description="Credits already assigned to or deducted from this team."
            >
              <LedgerTable history={historyData?.history || []} loading={isLoadingHistory} />
            </SheetSection>
          )}
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <DiscardButton form={form} onDiscard={onClose} disabled={isSubmitting} />
          <Button type="button" onClick={() => form.submit()} disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? 'Adding…' : 'Add credits'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddTeamCreditsDrawer;
