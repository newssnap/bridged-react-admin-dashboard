import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { hasValue } from '../utils/creditFormat';
import CreditBalanceSummary from './CreditBalanceSummary';
import CreditEntryFields, { toCreditEntryPayload } from './CreditEntryFields';
import EditLedgerEntrySheet from './EditLedgerEntrySheet';
import LedgerTable from './LedgerTable';
import { CreditSheetHeader, SheetSection, sheetContentClasses } from './SheetParts';

/**
 * A team's credits in one sheet: balance and usage, a form to assign or deduct credits, and
 * the ledger (each entry editable in a sheet on top).
 */
const ManageCreditsDrawer = ({
  open,
  onClose,
  teamData,
  historyData,
  isLoadingHistory,
  onSubmit,
  isSubmitting,
  form,
  onEditHistorySubmit,
  isEditingHistorySubmitting,
}) => {
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState(null);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        purchaseDate: dayjs(),
      });
    }
  }, [open, form]);

  const handleFinish = values => {
    onSubmit({ teamId: teamData?.teamId, ...toCreditEntryPayload(values) });
  };

  const teamName = hasValue(teamData?.teamName) ? teamData.teamName : 'Unnamed team';
  const companyName = hasValue(teamData?.companyName) ? teamData.companyName : null;

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <SheetContent className={sheetContentClasses('lg')}>
        <CreditSheetHeader
          title="Manage credits"
          description={teamData ? [teamName, companyName].filter(Boolean).join(' · ') : null}
        />
        <div className="min-h-0 flex-1 overflow-y-auto" data-flat="true">
          <SheetSection>
            <CreditBalanceSummary
              balance={historyData?.creditBalance ?? teamData?.creditBalance}
              history={historyData?.history}
              loading={isLoadingHistory && !historyData}
            />
          </SheetSection>

          <SheetSection
            title="Adjust credits"
            description="Assign or deduct credits. The entry is added to the ledger."
          >
            <Form
              form={form}
              onFinish={handleFinish}
              requiredMark="optional"
              scrollToFirstError
              autoComplete="off"
            >
              <CreditEntryFields />
            </Form>
          </SheetSection>

          <SheetSection
            title="Ledger"
            description="Every credit assigned to or deducted from the team."
          >
            <LedgerTable
              history={historyData?.history || []}
              loading={isLoadingHistory}
              onEdit={setSelectedHistoryRecord}
            />
          </SheetSection>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Close
          </Button>
          <Button type="button" onClick={() => form.submit()} disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? 'Saving…' : 'Save adjustment'}
          </Button>
        </SheetFooter>

        <EditLedgerEntrySheet
          open={Boolean(selectedHistoryRecord)}
          record={selectedHistoryRecord}
          teamId={teamData?.teamId}
          onClose={() => setSelectedHistoryRecord(null)}
          onSubmit={onEditHistorySubmit}
          isSubmitting={isEditingHistorySubmitting}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ManageCreditsDrawer;
