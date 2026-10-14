import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit02Icon } from '@hugeicons/core-free-icons';
import { Form, useForm } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import {
  addCategoryOption,
  DEFAULT_CATEGORY_OPTIONS,
  getCategoryLabel,
} from '../constants/customWork';
import { formatDateRange, formatNumber, hasValue } from '../utils/creditFormat';
import { resolveCustomWorkStatusForSubmit } from '../utils/resolveCustomWorkStatusForSubmit';
import CustomWorkFields from './CustomWorkFields';
import CustomWorkStatusBadge from './CustomWorkStatusBadge';
import { CreditSheetHeader, DiscardButton, sheetContentClasses } from './SheetParts';
import TeamIdentity from './TeamIdentity';

/** The read view, laid out like the portal's lead details: a hero block, then the notes. */
function CustomWorkDetails({ record }) {
  const title = hasValue(record.workProject) ? record.workProject : 'Untitled work';
  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-5 border-b p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Work or project</span>
          <h4 className="min-w-0 text-[17px] font-semibold tracking-[-0.01em] break-words">
            {title}
          </h4>
        </div>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-2.5 text-[13.5px]">
          <dt className="text-muted-foreground">Team</dt>
          <dd className="min-w-0">
            <TeamIdentity teamName={record.teamName} companyName={record.companyName} />
          </dd>
          <dt className="text-muted-foreground">Category</dt>
          <dd className="min-w-0 break-words">
            {hasValue(record.category) ? getCategoryLabel(record.category) : '—'}
          </dd>
          <dt className="text-muted-foreground">Credits used</dt>
          <dd className="font-medium tabular-nums">{formatNumber(Number(record.creditsUsed))}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <CustomWorkStatusBadge status={record.status} />
          </dd>
          <dt className="text-muted-foreground">Dates</dt>
          <dd className="tabular-nums">{formatDateRange(record.startDate, record.endDate)}</dd>
        </dl>
      </div>

      <div className="flex flex-col gap-2 p-6">
        <span className="text-xs font-medium text-muted-foreground">Notes</span>
        {hasValue(record.notes) ? (
          <p className="text-[13.5px] break-words whitespace-pre-wrap">{record.notes}</p>
        ) : (
          <div className="rounded-lg bg-muted/60 px-4 py-6 text-center text-[13.5px] text-muted-foreground">
            No notes were added to this entry.
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * One sheet for a custom work entry: read view first (with an outline Edit), then the edit
 * form in the same sheet. `mode` is 'preview' | 'edit'; `onEdit` switches to edit and
 * `onPreview` back to the read view.
 */
const PreviewEditCustomWorkDrawer = ({
  open,
  onClose,
  mode,
  initialRecord: recordProp,
  teamsData,
  onSubmit,
  isSubmitting,
  onEdit,
  onPreview,
}) => {
  const [form] = useForm();
  // Keep showing the last entry while the sheet animates out (the record is cleared on close).
  const lastRecord = useRef(recordProp);
  if (recordProp) lastRecord.current = recordProp;
  const initialRecord = recordProp ?? (open ? null : lastRecord.current);
  const isPreview = mode === 'preview';
  const [categoryOptions, setCategoryOptions] = useState(() => [...DEFAULT_CATEGORY_OPTIONS]);
  // Whether edit was opened from the read view, so Cancel goes back to it.
  const cameFromPreview = useRef(false);

  useEffect(() => {
    if (!open) cameFromPreview.current = false;
    else if (isPreview) cameFromPreview.current = true;
  }, [open, isPreview]);

  useEffect(() => {
    if (open && initialRecord && !isPreview) {
      form.resetFields();
      form.setFieldsValue({
        teamId: initialRecord.teamId,
        workProject: hasValue(initialRecord.workProject) ? initialRecord.workProject : undefined,
        category: hasValue(initialRecord.category) ? initialRecord.category : undefined,
        creditsUsed: initialRecord.creditsUsed,
        status: hasValue(initialRecord.status) ? initialRecord.status : 'pending',
        dateFrom: initialRecord.startDate ? dayjs(initialRecord.startDate) : null,
        dateTo: initialRecord.endDate ? dayjs(initialRecord.endDate) : null,
        notes: initialRecord.notes ?? undefined,
      });
    }
  }, [open, initialRecord, isPreview, form]);

  useEffect(() => {
    if (!open || !initialRecord || isPreview) return;
    const cat = initialRecord.category;
    const next = [...DEFAULT_CATEGORY_OPTIONS];
    if (hasValue(cat)) {
      const exists = next.some(o => o.value.toLowerCase() === String(cat).toLowerCase());
      if (!exists) next.push({ label: cat, value: cat });
    }
    setCategoryOptions(next);
  }, [open, initialRecord, isPreview]);

  const handleAddCategory = name => setCategoryOptions(prev => addCategoryOption(prev, name));

  const handleFinish = values => {
    const resolvedStatus = resolveCustomWorkStatusForSubmit(values.status, values.dateTo);

    const payload = {
      teamId: initialRecord.teamId,
      creditUsageId: initialRecord?.creditUsageId,
      creditUsed: values.creditsUsed,
      usageData: {
        type: 'customWork',
        customWorkTitle: values.workProject,
        customWorkCategory: values.category,
        customWorkStatus: resolvedStatus,
        customWorkStartDate: values.dateFrom ? values.dateFrom.toISOString() : null,
        customWorkEndDate: values.dateTo ? values.dateTo.toISOString() : null,
        customWorkNotes: values.notes || null,
      },
    };
    onSubmit(payload);
  };

  const handleCancelEdit = () => {
    if (cameFromPreview.current && onPreview && initialRecord) onPreview(initialRecord);
    else onClose();
  };

  const workTitle = hasValue(initialRecord?.workProject) ? initialRecord.workProject : null;

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        className={sheetContentClasses('md')}
        // Nothing is focused on open: the read view opens on its content, the form has several fields.
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <CreditSheetHeader
          title={isPreview ? 'Custom work details' : 'Edit custom work'}
          description={
            isPreview
              ? 'Work done for a team, and the credits it used.'
              : (workTitle ?? 'Change the details of this entry.')
          }
        />

        {isPreview ? (
          <div className="min-h-0 flex-1 overflow-y-auto" data-flat="true">
            {initialRecord ? <CustomWorkDetails record={initialRecord} /> : null}
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
            <Form form={form} onFinish={handleFinish} scrollToFirstError autoComplete="off">
              <CustomWorkFields
                teams={teamsData}
                categoryOptions={categoryOptions}
                onAddCategory={handleAddCategory}
                notesName="notes"
                teamLocked
              />
            </Form>
          </div>
        )}

        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          {isPreview ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit?.(initialRecord)}
                disabled={!initialRecord || !onEdit}
              >
                <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <DiscardButton form={form} onDiscard={handleCancelEdit} disabled={isSubmitting} />
              <Button type="button" onClick={() => form.submit()} disabled={isSubmitting}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default PreviewEditCustomWorkDrawer;
