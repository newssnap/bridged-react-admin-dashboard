import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, Image01Icon, Upload04Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUpload, FileUploadTrigger } from '@/components/file-upload';
import { cn } from '@/lib/utils';

const EMPTY_LIST = [];

/**
 * A logo picker, shaped like the portal's profile ImagePicker: the logo tile (click to pick a
 * file), then Upload / Replace and Remove beside it. The file goes to `onSelectFile(file)`; the
 * parent uploads it and stores the URL.
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
      <div className="flex items-center gap-4">
        {uploading ? (
          <Skeleton className="h-16 w-28 shrink-0 rounded-md" />
        ) : (
          <FileUploadTrigger
            aria-label={value ? `Replace ${label}` : `Upload ${label}`}
            className={cn(
              'relative flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground ring-1 ring-foreground/10 transition-shadow duration-150 ease-out-quad outline-none hover:ring-foreground/25 focus-visible:ring-2 focus-visible:ring-ring/50',
              value && 'bg-white'
            )}
          >
            {value ? (
              <img alt="" src={value} className="size-full object-contain p-2" />
            ) : (
              <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-5" />
            )}
          </FileUploadTrigger>
        )}
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <FileUploadTrigger asChild>
              <Button type="button" variant="outline" size="sm" id={id} disabled={uploading}>
                <HugeiconsIcon icon={Upload04Icon} strokeWidth={2} data-icon="inline-start" />
                {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
              </Button>
            </FileUploadTrigger>
            {value && (
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
            )}
          </div>
          <p className="text-xs text-muted-foreground">An image file, such as PNG or SVG.</p>
        </div>
      </div>
    </FileUpload>
  );
}

export default LogoField;
