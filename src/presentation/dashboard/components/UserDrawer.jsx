import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { Camera01Icon, UserIcon } from '@hugeicons/core-free-icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { PasswordInput } from '@/components/password-input';
import { Form, FormField, useWatch } from '@/components/form';
import { cn } from '@/lib/utils';
import { useGetTeamsByCompanyQuery, useUploadImageMutation } from '../../../services/api';
import OptionCombobox from './OptionCombobox';

const EMAIL_RULES = [
  { required: true, message: 'Enter an email address' },
  { type: 'email', message: 'Enter a valid email address' },
];
const PASSWORD_RULES = [{ required: true, message: 'Enter a password' }];

const getCreatedCompanyId = createdCompany =>
  createdCompany?.id ||
  createdCompany?.data?.id ||
  createdCompany?.data?.data?.id ||
  createdCompany?._id;

/** The profile photo: a round preview and a button that uploads a new one. */
function ProfilePhotoPicker({ photoUrl, isUploading, disabled, onPick }) {
  const fileInputRef = useRef(null);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {photoUrl && <AvatarImage src={photoUrl} alt="" />}
        <AvatarFallback className="bg-muted text-muted-foreground">
          <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-start gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} data-icon="inline-start" />
          )}
          {isUploading ? 'Uploading…' : photoUrl ? 'Change photo' : 'Add photo'}
        </Button>
        <p className="text-xs text-muted-foreground">Optional. A square image works best.</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onPick}
      />
    </div>
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

  const handleFileChange = async event => {
    const file = event.target.files?.[0];
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
    event.target.value = '';
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
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]">
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">{title}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update their details, company and team. The email address stays the same.'
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
                  isUploading={isUploadingImage}
                  disabled={isBusy}
                  onPick={handleFileChange}
                />

                <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <FormField name="firstName" label="First name">
                    <Input placeholder="e.g. Jane" disabled={isBusy} />
                  </FormField>
                  <FormField name="lastName" label="Last name">
                    <Input placeholder="e.g. Smith" disabled={isBusy} />
                  </FormField>
                </div>

                <FormField
                  name="username"
                  label="Email"
                  rules={isEditing ? [EMAIL_RULES[0]] : EMAIL_RULES}
                  description={isEditing ? 'The email address can’t be changed.' : undefined}
                >
                  <Input type="email" placeholder="name@company.com" disabled={isEditing} />
                </FormField>

                <FormField
                  name="password"
                  label={isEditing ? 'New password' : 'Password'}
                  rules={isEditing ? undefined : PASSWORD_RULES}
                  description={
                    isEditing ? 'Leave blank to keep their current password.' : undefined
                  }
                >
                  <PasswordInput autoComplete="new-password" disabled={isBusy} />
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
          <Button type="button" onClick={() => form.submit()} disabled={isSubmitting || isBusy}>
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isEditing ? 'Save changes' : 'Add user'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default UserDrawer;
