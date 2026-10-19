import React from 'react';
import { FieldGroup } from '@/components/ui/field';
import { Form, FormField } from '@/components/form';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';

const MEMBER_RULES = [
  { required: true, type: 'array', min: 1, message: 'Select at least one member' },
];

const AddMembersDrawer = ({
  open,
  form,
  availableUserOptions,
  isUsersLoading,
  handleFinish,
  handleAfterOpenChange,
  closeDrawer,
  isSubmitting,
}) => {
  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) closeDrawer();
      }}
    >
      <SheetContent
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[400px]"
        // Don't drop straight into the member picker; it would open its list on focus.
        onOpenAutoFocus={event => event.preventDefault()}
        onCloseAutoFocus={() => handleAfterOpenChange?.(false)}
      >
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
            Add members
          </SheetTitle>
          <SheetDescription>Only people who aren't in a team yet are listed.</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <Form form={form} onFinish={handleFinish} requiredMark={false}>
            <FieldGroup>
              <FormField label="Members" name="memberIds" bind="valueChange" rules={MEMBER_RULES}>
                {control => (
                  <MultiSelect
                    id={control.id}
                    aria-invalid={control['aria-invalid']}
                    options={availableUserOptions}
                    value={control.value ?? []}
                    onValueChange={values => control.onValueChange(values)}
                    placeholder="Search people"
                    emptyText={isUsersLoading ? 'Loading people…' : 'No one available to add.'}
                    loading={isUsersLoading}
                    allowClear
                  />
                )}
              </FormField>
            </FieldGroup>
          </Form>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={closeDrawer} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={() => form.submit()} disabled={isSubmitting}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? 'Adding…' : 'Add members'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddMembersDrawer;
