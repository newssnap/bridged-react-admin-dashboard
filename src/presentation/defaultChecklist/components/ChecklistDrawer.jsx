import React from 'react';
import { Form, FormField } from '@/components/form';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
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

const TITLE_RULES = [{ required: true, message: 'Enter a checklist name' }];

/** Add or rename a checklist: one drawer for both, switched on `isEditing`. */
const ChecklistDrawer = ({
  isOpen,
  onClose,
  isEditing,
  form,
  onSubmit,
  isLoading,
  description,
}) => {
  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={next => {
        if (!next) handleClose();
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[400px]">
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
            {isEditing ? 'Rename checklist' : 'Add checklist'}
          </SheetTitle>
          <SheetDescription>
            {description ||
              (isEditing
                ? 'Give this checklist a clearer name.'
                : 'Name the checklist, then add its tasks.')}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <Form form={form} onFinish={onSubmit} autoComplete="off">
            <FieldGroup>
              <FormField label="Checklist name" name="title" rules={TITLE_RULES}>
                <Input placeholder="e.g. Onboarding" autoFocus />
              </FormField>
            </FieldGroup>
          </Form>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={() => form.submit()} disabled={isLoading}>
            {isLoading && <Spinner data-icon="inline-start" />}
            {isEditing ? 'Save changes' : 'Add checklist'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ChecklistDrawer;
