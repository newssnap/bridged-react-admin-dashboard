import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Image01Icon } from '@hugeicons/core-free-icons';
import { DatePicker } from '@/components/date-picker';
import { FileUpload, FileUploadDropzone } from '@/components/file-upload';
import { Form, FormField } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
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
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toComboboxValue } from '@/lib/combobox';

const NO_FILES = [];
const TITLE_RULES = [{ required: true, message: 'Enter a task title' }];
const DESCRIPTION_RULES = [{ required: true, message: 'Enter a description' }];
const ASSIGNEE_RULES = [{ required: true, message: 'Choose who the task is for' }];

/** One uploaded image: thumbnail, name and type, and a quiet remove button. */
function AttachmentRow({ file, onRemove }) {
  const name = file?.fileName || 'Image';
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      {file?.url ? (
        <img
          src={file.url}
          alt=""
          className="size-10 shrink-0 rounded-md bg-muted object-cover ring-1 ring-foreground/10"
        />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-4" />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium" title={name}>
          {name}
        </span>
        <span className="truncate text-xs text-muted-foreground">{file?.type || '—'}</span>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${name}`}
            onClick={() => onRemove(file)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove</TooltipContent>
      </Tooltip>
    </li>
  );
}

/**
 * Add or edit a task: one drawer for both, switched on `isEditing`. Default checklists ask for
 * a title, description and images; user checklists (`withAssignment`) also take a due date, an
 * assignee and a completed flag, and need a description.
 */
const TaskFormDrawer = ({
  isOpen,
  onClose,
  isEditing,
  form,
  onSubmit,
  isLoading,
  isUploadingImage,
  onFileUpload,
  uploadedFiles = NO_FILES,
  onRemoveFile,
  withAssignment = false,
  descriptionRequired = false,
  memberOptions = NO_FILES,
  checklistTitle,
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
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]">
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
            {isEditing ? 'Edit task' : 'Add task'}
          </SheetTitle>
          {checklistTitle && (
            <SheetDescription className="truncate">In {checklistTitle}</SheetDescription>
          )}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <Form form={form} onFinish={onSubmit} autoComplete="off">
            <FieldGroup>
              <FormField label="Title" name="title" rules={TITLE_RULES}>
                <Input placeholder="e.g. Connect your website" autoFocus />
              </FormField>

              <FormField
                label="Description"
                name="description"
                rules={descriptionRequired ? DESCRIPTION_RULES : undefined}
              >
                <Textarea placeholder="What needs doing, and how" className="min-h-24" />
              </FormField>

              {withAssignment && (
                <>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2">
                    <FormField
                      label="Due date"
                      name="dueDate"
                      bind="valueChange"
                      description={isEditing ? 'Set when the task is added' : undefined}
                    >
                      <DatePicker
                        placeholder="No due date"
                        className="w-full"
                        disabled={isEditing}
                      />
                    </FormField>
                    <FormField
                      label="Assign to"
                      name="assignedUser"
                      rules={isEditing ? undefined : ASSIGNEE_RULES}
                      bind="valueChange"
                      description={isEditing ? 'Set when the task is added' : undefined}
                    >
                      {control => (
                        <Combobox
                          items={memberOptions}
                          value={toComboboxValue(memberOptions, control.value)}
                          onValueChange={(option, details) => {
                            if (details?.reason !== 'input-clear') {
                              control.onValueChange(option?.value ?? undefined);
                            }
                          }}
                        >
                          <ComboboxInput
                            id={control.id}
                            aria-invalid={control['aria-invalid']}
                            aria-describedby={control['aria-describedby']}
                            placeholder="Choose a team member"
                            className="w-full"
                            disabled={isEditing}
                          />
                          <ComboboxContent>
                            <ComboboxEmpty>No team members match</ComboboxEmpty>
                            <ComboboxList>
                              {option => (
                                <ComboboxItem key={option.value} value={option}>
                                  {option.label}
                                </ComboboxItem>
                              )}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      )}
                    </FormField>
                  </div>

                  <FormField name="isCompleted" label="Mark as completed" orientation="horizontal">
                    <Checkbox />
                  </FormField>
                </>
              )}

              <Field>
                <FieldLabel>Images</FieldLabel>
                <FileUpload
                  accept="image/*"
                  fileList={NO_FILES}
                  disabled={isUploadingImage}
                  beforeUpload={file => {
                    onFileUpload(file);
                    return false; // Upload through our own endpoint, not the component's.
                  }}
                >
                  <FileUploadDropzone
                    icon={isUploadingImage ? <Spinner /> : Image01Icon}
                    title={isUploadingImage ? 'Uploading…' : 'Add an image'}
                    description="Click or drop an image here."
                  />
                </FileUpload>
                {uploadedFiles.length > 0 && (
                  <ul
                    aria-label="Uploaded images"
                    className="divide-y rounded-lg ring-1 ring-foreground/10"
                  >
                    {uploadedFiles.map((file, index) => (
                      <AttachmentRow key={file?.url || index} file={file} onRemove={onRemoveFile} />
                    ))}
                  </ul>
                )}
              </Field>
            </FieldGroup>
          </Form>
        </div>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => form.submit()}
            disabled={isLoading || isUploadingImage}
          >
            {isLoading && <Spinner data-icon="inline-start" />}
            {isEditing ? 'Save changes' : 'Add task'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default TaskFormDrawer;
