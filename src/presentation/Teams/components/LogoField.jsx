import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Image01Icon, Upload04Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { FileUpload, FileUploadDropzone, FileUploadTrigger } from '@/components/file-upload';

const EMPTY_LIST = [];

/**
 * A logo picker: a dropzone while there is no logo, then the logo with Replace / Remove.
 * The file goes to `onSelectFile(file)`; the parent uploads it and stores the URL.
 */
function LogoField({ id, value, onSelectFile, onRemove, uploading = false, label = 'logo' }) {
  const handleFile = file => {
    onSelectFile?.(file);
    // Never keep the file in the upload list: the parent stores the hosted URL instead.
    return false;
  };

  return (
    <FileUpload
      accept="image/*"
      maxCount={1}
      fileList={EMPTY_LIST}
      disabled={uploading}
      beforeUpload={handleFile}
    >
      {value ? (
        <div className="flex items-center gap-4 rounded-lg bg-input/30 p-3 ring-1 ring-foreground/10">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background ring-1 ring-foreground/10">
            <img src={value} alt={`Current ${label}`} className="size-full object-contain p-1.5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
            <FileUploadTrigger asChild>
              <Button type="button" variant="outline" size="sm" id={id} disabled={uploading}>
                {uploading ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} data-icon="inline-start" />
                )}
                {uploading ? 'Uploading…' : 'Replace'}
              </Button>
            </FileUploadTrigger>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              onClick={onRemove}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/15"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <FileUploadDropzone
          id={id}
          icon={uploading ? <Spinner /> : Image01Icon}
          title={uploading ? 'Uploading…' : `Upload ${label}`}
          description="Click or drag an image here"
          className="p-5"
        />
      )}
    </FileUpload>
  );
}

export default LogoField;
