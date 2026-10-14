import React, { useEffect } from 'react';
import { ConfirmPopover } from '@/components/confirm-popover';
import { Form, FormField, useForm, useWatch } from '@/components/form';
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

const NAME_RULES = [{ required: true, whitespace: true, message: 'Enter a company name' }];

/** One drawer for adding and renaming a company. */
const CompanyFormDrawer = ({ open, mode, initialValues, onClose, onSubmit, confirmLoading }) => {
  const [form] = useForm();
  const isEditing = mode === 'edit';
  const savedName = initialValues?.name || '';
  const name = useWatch('name', form);
  const isDirty = (name ?? '') !== savedName;

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: initialValues?.name || '' });
    }
  }, [form, open, initialValues]);

  const handleFinish = async values => {
    try {
      await onSubmit(values);
    } catch {
      // The controller already showed "Couldn't create the company"; keep the drawer open.
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) handleClose();
      }}
    >
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[400px]">
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
            {isEditing ? 'Edit company' : 'Add company'}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Rename the company. Its users stay as they are.'
              : 'The organisation your users belong to.'}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <Form form={form} onFinish={handleFinish} autoComplete="off">
            <FieldGroup>
              <FormField label="Company name" name="name" rules={NAME_RULES} bind="input">
                {control => <Input {...control} placeholder="e.g. Acme Media" autoFocus />}
              </FormField>
            </FieldGroup>
          </Form>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          {isDirty ? (
            <ConfirmPopover
              title="Discard changes?"
              description="The company name you typed will be lost."
              confirmText="Discard"
              cancelText="Keep editing"
              onConfirm={handleClose}
              side="top"
              align="end"
            >
              <Button type="button" variant="outline" disabled={confirmLoading}>
                Cancel
              </Button>
            </ConfirmPopover>
          ) : (
            <Button type="button" variant="outline" onClick={handleClose} disabled={confirmLoading}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={() => form.submit()}
            // Editing: nothing to save until the name changes (same as Save changes elsewhere).
            disabled={confirmLoading || (isEditing && !isDirty)}
          >
            {confirmLoading && <Spinner data-icon="inline-start" />}
            {isEditing ? 'Save changes' : 'Add company'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyFormDrawer;
