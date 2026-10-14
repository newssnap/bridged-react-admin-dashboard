import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { Form, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import CreditEntryFields, { toCreditEntryPayload } from './CreditEntryFields';
import { CreditSheetHeader, DiscardButton, sheetContentClasses } from './SheetParts';

/** Edits one ledger entry; sits on top of the Manage credits sheet. */
function EditLedgerEntrySheet({ open, record, teamId, onClose, onSubmit, isSubmitting }) {
  const [form] = useForm();

  useEffect(() => {
    if (open && record) {
      form.resetFields();
      form.setFieldsValue({
        amount: record?.amount,
        purchaseType: record?.purchaseType,
        reason: record?.reason || undefined,
        notes: record?.notes || undefined,
        purchaseDate: record?.purchaseDate ? dayjs(record.purchaseDate) : dayjs(),
      });
    }
  }, [open, record, form]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleFinish = async values => {
    if (!record?.creditPurchaseId || !onSubmit) return;

    const wasSuccessful = await onSubmit({
      creditPurchaseId: record.creditPurchaseId,
      ...toCreditEntryPayload(values),
      teamId: record.teamId || teamId,
    });

    if (wasSuccessful) handleClose();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) handleClose();
      }}
    >
      <SheetContent className={sheetContentClasses('sm')}>
        <CreditSheetHeader
          title="Edit ledger entry"
          description="Corrects this entry in the team's ledger."
        />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <Form
            form={form}
            onFinish={handleFinish}
            requiredMark="optional"
            scrollToFirstError
            autoComplete="off"
          >
            <CreditEntryFields />
          </Form>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <DiscardButton form={form} onDiscard={handleClose} disabled={isSubmitting} />
          <Button type="button" onClick={() => form.submit()} disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default EditLedgerEntrySheet;
