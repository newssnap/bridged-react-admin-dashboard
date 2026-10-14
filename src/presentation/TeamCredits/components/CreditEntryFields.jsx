import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { MinusSignIcon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { DatePicker } from '@/components/date-picker';
import { FormField } from '@/components/form';
import { NumberInput } from '@/components/number-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const AMOUNT_RULES = [
  { required: true, message: 'Enter an amount' },
  { type: 'number', min: 1, message: 'Enter an amount of 1 or more' },
];

/**
 * The fields of a ledger entry (amount, assign / deduct, date, reason, notes), shared by the
 * add, adjust and edit forms. Goes inside a `<Form>`; lays out in two columns when the
 * container is wide enough.
 */
function CreditEntryFields() {
  return (
    <div className="@container flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 @sm:grid-cols-2">
        <FormField label="Amount" name="amount" rules={AMOUNT_RULES}>
          <NumberInput min={1} placeholder="e.g. 500" className="w-full" />
        </FormField>
        <FormField
          label="Type"
          name="purchaseType"
          rules={[{ required: true, message: 'Choose assign or deduct' }]}
        >
          <ToggleGroup type="single" variant="outline" className="w-full">
            <ToggleGroupItem value="assign" className="flex-1">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
              Assign
            </ToggleGroupItem>
            <ToggleGroupItem value="deduct" className="flex-1">
              <HugeiconsIcon icon={MinusSignIcon} strokeWidth={2} data-icon="inline-start" />
              Deduct
            </ToggleGroupItem>
          </ToggleGroup>
        </FormField>
      </div>
      <FormField
        label="Date"
        name="purchaseDate"
        bind="valueChange"
        rules={[{ required: true, message: 'Pick a date' }]}
      >
        <DatePicker
          showTime
          timeFormat="HH:mm"
          format="D MMM YYYY, HH:mm"
          allowClear={false}
          className="w-full"
        />
      </FormField>
      <FormField label="Reason" name="reason">
        <Input placeholder="e.g. Annual plan top-up" />
      </FormField>
      <FormField label="Notes" name="notes">
        <Textarea rows={3} placeholder="Anything worth keeping with this entry" />
      </FormField>
    </div>
  );
}

/** The ledger-entry payload the API expects, from the form values (same shape as before). */
export function toCreditEntryPayload(values) {
  return {
    amount: values.amount,
    purchaseType: values.purchaseType,
    reason: values.reason || null,
    notes: values.notes || null,
    purchaseDate: values.purchaseDate
      ? values.purchaseDate.toISOString()
      : new Date().toISOString(),
  };
}

export default CreditEntryFields;
