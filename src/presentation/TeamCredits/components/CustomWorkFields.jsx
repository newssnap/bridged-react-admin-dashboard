import React from 'react';
import { DatePicker } from '@/components/date-picker';
import { FormField } from '@/components/form';
import { NumberInput } from '@/components/number-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CUSTOM_WORK_STATUS_OPTIONS } from '../constants/customWork';
import CategoryCombobox from './CategoryCombobox';
import TeamCombobox from './TeamCombobox';

const DATE_FORMAT = 'D MMM YYYY';

/**
 * The fields of a custom work entry, shared by the add and edit sheets. Goes inside a
 * `<Form>`. `notesName` keeps each form's own notes field name; `teamLocked` shows the team
 * read-only (an edit is always saved against the entry's own team).
 */
function CustomWorkFields({ teams, categoryOptions, onAddCategory, notesName, teamLocked }) {
  return (
    <div className="@container flex flex-col gap-5">
      <FormField
        label="Team"
        name="teamId"
        bind="valueChange"
        description={teamLocked ? 'An entry stays with the team it was logged for.' : undefined}
        rules={[{ required: true, message: 'Choose a team' }]}
      >
        {control => <TeamCombobox teams={teams} control={control} disabled={teamLocked} />}
      </FormField>

      <FormField
        label="Work or project"
        name="workProject"
        rules={[{ required: true, message: 'Enter the work or project title' }]}
      >
        <Input placeholder="e.g. Salesforce lead sync" />
      </FormField>

      <FormField
        label="Category"
        name="category"
        bind="valueChange"
        rules={[{ required: true, message: 'Choose or add a category' }]}
      >
        {control => (
          <CategoryCombobox
            options={categoryOptions}
            onAddOption={onAddCategory}
            control={control}
          />
        )}
      </FormField>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 @sm:grid-cols-2">
        <FormField
          label="Credits used"
          name="creditsUsed"
          rules={[
            { required: true, message: 'Enter the credits used' },
            { type: 'number', min: 0, message: "Credits used can't be negative" },
          ]}
        >
          <NumberInput min={0} placeholder="e.g. 120" className="w-full" />
        </FormField>
        <FormField
          label="Status"
          name="status"
          description="Work that ended in the past is saved as completed."
          rules={[{ required: true, message: 'Choose a status' }]}
        >
          <ToggleGroup type="single" variant="outline" className="w-full">
            {CUSTOM_WORK_STATUS_OPTIONS.map(option => (
              <ToggleGroupItem key={option.value} value={option.value} className="flex-1">
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 @sm:grid-cols-2">
        <FormField
          label="Start date"
          name="dateFrom"
          bind="valueChange"
          rules={[{ required: true, message: 'Pick a start date' }]}
        >
          <DatePicker format={DATE_FORMAT} allowClear={false} className="w-full" />
        </FormField>
        <FormField
          label="End date"
          name="dateTo"
          bind="valueChange"
          rules={[{ required: true, message: 'Pick an end date' }]}
        >
          <DatePicker format={DATE_FORMAT} allowClear={false} className="w-full" />
        </FormField>
      </div>

      <FormField label="Notes" name={notesName}>
        <Textarea rows={4} placeholder="Scope, links or anything worth keeping" />
      </FormField>
    </div>
  );
}

export default CustomWorkFields;
