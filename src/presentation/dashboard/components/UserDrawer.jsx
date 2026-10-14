import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { RefreshIcon, Upload04Icon, UserIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { FileUpload, FileUploadTrigger } from '@/components/file-upload';
import { PasswordInput } from '@/components/password-input';
import { Form, FormField, useWatch } from '@/components/form';
import { cn } from '@/lib/utils';
import { useGetTeamsByCompanyQuery, useUploadImageMutation } from '../../../services/api';
import OptionCombobox from './OptionCombobox';
import { initialsOf } from './AccountParts';

const EMAIL_RULES = [
  { required: true, message: 'Enter an email address' },
  { type: 'email', message: 'Enter a valid email address' },
];
const PASSWORD_RULES = [{ required: true, message: 'Enter a password or generate one' }];

const PASSWORD_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
const generatePassword = () =>
  Array.from(
    { length: 12 },
    () => PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)]
  ).join('');

const getCreatedCompanyId = createdCompany =>
  createdCompany?.id ||
  createdCompany?.data?.id ||
  createdCompany?.data?.data?.id ||
  createdCompany?._id;

/**
 * The profile photo: a round preview (initials until there is one) and an Upload / Replace
 * button. Clicking either opens the file dialog.
 */
function ProfilePhotoPicker({ photoUrl, initials, isUploading, disabled, onPick }) {
  return (
    <FileUpload
      beforeUpload={() => false}
      onChange={onPick}
      accept="image/*"
      disabled={disabled || isUploading}
    >
      <div className="flex items-center gap-4">
        {isUploading ? (
          <Skeleton className="size-16 shrink-0 rounded-full" />
        ) : (
          <FileUploadTrigger
            aria-label={photoUrl ? 'Replace profile photo' : 'Upload profile photo'}
            className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground ring-1 ring-foreground/10 transition-shadow duration-150 ease-out-quad outline-none hover:ring-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed"
          >
            {photoUrl ? (
              <img alt="" src={photoUrl} className="size-full object-cover" />
            ) : initials === '?' ? (
              <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-6" />
            ) : (
              <span className="text-base font-semibold text-primary">{initials}</span>
            )}
          </FileUploadTrigger>
        )}
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <FileUploadTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={disabled || isUploading}>
              <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} data-icon="inline-start" />
              {isUploading ? 'Uploading…' : photoUrl ? 'Replace' : 'Upload'}
            </Button>
          </FileUploadTrigger>
          <p className="text-xs text-muted-foreground">Optional. A square image works best.</p>
        </div>
      </div>
    </FileUpload>
  );
}

/**
 * Add or edit a user (`isEditing`). Add asks for an email and password; edit loads the user
 * first (fields are busy until then), keeps the email fixed and takes an optional new password.
 * The company list searches on the server and, when adding, can create a company inline.
 */
function UserDrawer({
  open,
  isEditing = false,
  onClose,
  form,
  onSubmit,
  isSubmitting = false,
  isLoadingUser = false,
  userData,
  companyOptions = [],
  isLoadingCompanies,
  onCompanySearch,
  createCompany,
  isCreatingCompany,
}) {
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const selectedCompanyId = useWatch('company', form);
  const firstName = useWatch('firstName', form);
  const lastName = useWatch('lastName', form);
  const email = useWatch('username', form);
  const { data: teamsResponse, isLoading: isLoadingTeams } = useGetTeamsByCompanyQuery(
    selectedCompanyId,
    { skip: !open || !selectedCompanyId }
  );
  const teamOptions = (teamsResponse?.data ?? []).map(team => ({
    label: team.title || team.companyName || team._id || '—',
    value: team._id,
  }));

  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();

  useEffect(() => {
    if (!open) {
      setProfilePhotoUrl('');
      return;
    }
    if (isEditing) {
      if (userData) setProfilePhotoUrl(userData.picture || userData.profilePhoto || '');
    } else {
      setProfilePhotoUrl(form.getFieldValue('profilePhoto') || '');
    }
  }, [open, isEditing, userData, form]);

  const displayPicture =
    profilePhotoUrl || (isEditing ? userData?.picture || userData?.profilePhoto : '');

  const handleFileChange = async ({ file }) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await uploadImage(formData).unwrap();
      if (response?.success && response?.data) {
        const url = typeof response.data === 'string' ? response.data : response.data?.url;
        if (url) {
          form.setFieldValue('profilePhoto', url);
          setProfilePhotoUrl(url);
        } else {
          toast.error("Couldn't upload the photo", {
            description: 'The server sent back an invalid response.',
          });
        }
      } else {
        toast.error(response?.message || "Couldn't upload the photo");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Couldn't upload the photo");
    }
  };

  // A new company means the team has to be picked again.
  const handleCompanyChange = () => {
    form.setFieldValue('teamId', undefined);
  };

  const handleCreateCompany = async name => {
    const createdCompany = await createCompany?.({ name });
    const createdCompanyId = getCreatedCompanyId(createdCompany);
    if (createdCompanyId) form.setFieldValue('teamId', undefined);
    return createdCompanyId;
  };

  const isBusy = isEditing && isLoadingUser;
  const title = isEditing ? 'Edit user' : 'Add user';

  return (
    <Sheet
      open={open}
      onOpenChange={next => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        onOpenAutoFocus={event => event.preventDefault()}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]"
      >
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">{title}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update their name, photo, password, company and team.'
              : 'Give someone a login to the dashboard, then place them in a company and team.'}
          </SheetDescription>
        </SheetHeader>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6" aria-busy={isBusy}>
          {isBusy && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          )}
          <div
            className={cn(
              'transition-opacity duration-150 ease-out-quad',
              isBusy && 'pointer-events-none opacity-50 select-none'
            )}
          >
            <Form form={form} onFinish={onSubmit} autoComplete="off" requiredMark={false}>
              <FieldGroup>
                <FormField name="profilePhoto" noStyle hidden bind="input">
                  <input type="hidden" />
                </FormField>

                <ProfilePhotoPicker
                  photoUrl={displayPicture}
                  initials={initialsOf(`${firstName ?? ''} ${lastName ?? ''}`, email)}
                  isUploading={isUploadingImage}
                  disabled={isBusy}
                  onPick={handleFileChange}
                />

                <div className="grid grid-cols-1 gap-x-3 gap-y-7 sm:grid-cols-2">
                  <FormField name="firstName" label="First name">
                    <Input placeholder="e.g. Jane" autoComplete="off" disabled={isBusy} />
                  </FormField>
                  <FormField name="lastName" label="Last name">
                    <Input placeholder="e.g. Smith" autoComplete="off" disabled={isBusy} />
                  </FormField>
                </div>

                <FormField
                  name="username"
                  label="Email"
                  rules={isEditing ? [EMAIL_RULES[0]] : EMAIL_RULES}
                  description={
                    isEditing
                      ? 'They sign in with this. It can’t be changed.'
                      : 'They sign in with this.'
                  }
                >
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    autoComplete="off"
                    readOnly={isEditing}
                    className={
                      isEditing
                        ? 'bg-muted/50 text-muted-foreground focus-visible:ring-0'
                        : undefined
                    }
                  />
                </FormField>

                <FormField
                  name="password"
                  label={isEditing ? 'New password' : 'Password'}
                  rules={isEditing ? undefined : PASSWORD_RULES}
                  description={
                    isEditing
                      ? 'Leave blank to keep their current password.'
                      : 'Share it with them; you can change it here later.'
                  }
                >
                  <PasswordInput autoComplete="new-password" disabled={isBusy}>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        className="text-primary"
                        disabled={isBusy}
                        onClick={() => form.setFieldValue('password', generatePassword())}
                      >
                        <HugeiconsIcon
                          icon={RefreshIcon}
                          strokeWidth={2}
                          data-icon="inline-start"
                        />
                        Generate
                      </InputGroupButton>
                    </InputGroupAddon>
                  </PasswordInput>
                </FormField>

                <FormField name="company" label="Company">
                  <OptionCombobox
                    placeholder="Pick a company"
                    options={companyOptions}
                    onValueChange={handleCompanyChange}
                    onSearch={onCompanySearch}
                    onCreate={isEditing ? undefined : handleCreateCompany}
                    isCreating={isCreatingCompany}
                    loading={isLoadingCompanies}
                    allowClear={isEditing}
                    disabled={isBusy || (isEditing && isSubmitting)}
                  />
                </FormField>

                <FormField
                  name="teamId"
                  label="Team"
                  description={selectedCompanyId ? undefined : 'Pick a company first.'}
                >
                  <OptionCombobox
                    placeholder="Pick a team"
                    options={teamOptions}
                    loading={isLoadingTeams}
                    allowClear
                    emptyText="No teams in this company"
                    unknownLabel="Not in this company"
                    disabled={!selectedCompanyId || isBusy || (isEditing && isSubmitting)}
                  />
                </FormField>
              </FieldGroup>
            </Form>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => form.submit()}
            disabled={isSubmitting || isBusy || isUploadingImage}
          >
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isEditing ? 'Save changes' : 'Add user'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default UserDrawer;
