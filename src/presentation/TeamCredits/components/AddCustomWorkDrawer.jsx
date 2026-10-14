import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Form, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { addCategoryOption, DEFAULT_CATEGORY_OPTIONS } from '../constants/customWork';
import { resolveCustomWorkStatusForSubmit } from '../utils/resolveCustomWorkStatusForSubmit';
import CustomWorkFields from './CustomWorkFields';
import { CreditSheetHeader, DiscardButton, sheetContentClasses } from './SheetParts';

const AddCustomWorkDrawer = ({ open, onClose, teamsData, onSubmit, isSubmitting }) => {
  const [form] = useForm();
  const [categoryOptions, setCategoryOptions] = useState(() => [...DEFAULT_CATEGORY_OPTIONS]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        dateFrom: dayjs(),
        dateTo: dayjs(),
      });
    }
  }, [open, form]);

  const handleAddCategory = name => setCategoryOptions(prev => addCategoryOption(prev, name));

  const handleFinish = values => {
    const resolvedStatus = resolveCustomWorkStatusForSubmit(values.status, values.dateTo);

    const payload = {
      teamId: values.teamId,
      creditUsed: values.creditsUsed,
      usageData: {
        type: 'customWork',
        customWorkTitle: values.workProject,
        customWorkCategory: values.category,
        customWorkStatus: resolvedStatus,
        customWorkStartDate: values.dateFrom ? values.dateFrom.toISOString() : null,
        customWorkEndDate: values.dateTo ? values.dateTo.toISOString() : null,
        customWorkNotes: values.customWorkNotes || null,
      },
    };
    onSubmit(payload);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <SheetContent className={sheetContentClasses('md')}>
        <CreditSheetHeader
          title="Add custom work"
          description="Log work done for a team and the credits it used."
        />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <Form
            form={form}
            onFinish={handleFinish}
            requiredMark="optional"
            scrollToFirstError
            autoComplete="off"
          >
            <CustomWorkFields
              teams={teamsData}
              categoryOptions={categoryOptions}
              onAddCategory={handleAddCategory}
              notesName="customWorkNotes"
            />
          </Form>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <DiscardButton form={form} onDiscard={onClose} disabled={isSubmitting} />
          <Button type="button" onClick={() => form.submit()} disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? 'Adding…' : 'Add custom work'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddCustomWorkDrawer;
