import * as React from 'react';
import { flushSync } from 'react-dom';
import { Slot } from 'radix-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Attachment01Icon,
  Delete02Icon,
  Image01Icon,
  Loading03Icon,
  ViewIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Progress } from '@/components/ui/progress';

/**
 * File upload built from shadcn primitives.
 *
 *   <FileUpload accept=".csv" beforeUpload={file => { onUpload(file); return false; }}>
 *     <FileUploadDropzone icon={Upload04Icon} title="…" description="…" />
 *   </FileUpload>
 *
 * Parts: `FileUpload` (state + hidden file input), `FileUploadTrigger` (asChild: opens the
 * file dialog), `FileUploadDropzone` (click / keyboard / drag-and-drop zone), `FileUploadList`
 * (list of `fileList`, `variant` 'text' | 'picture-card').
 *
 * Upload pipeline and callback data (unchanged from the previous upload component):
 * - Each picked file gets a `uid` ('rc-upload-<ts>-<n>').
 * - `beforeUpload(file, files)`: `false` keeps the file in the list without uploading (and
 *   `onChange` receives a File clone carrying the `uid`); `LIST_IGNORE` drops it entirely;
 *   a rejected promise counts as `false`; a returned File / Blob is uploaded instead.
 * - `customRequest({ file, filename, data, action, headers, withCredentials, method,
 *   onProgress, onSuccess, onError })` performs the upload (no default request: without it,
 *   files that pass `beforeUpload` stay 'uploading').
 * - `onChange({ file, fileList, event? })` with list items `{ uid, name, size, type, status
 *   ('uploading' | 'done' | 'error' | 'removed'), percent, originFileObj, response, error }`.
 * - `fileList` (controlled) / `defaultFileList`, `maxCount` (1 = replace), `onRemove(file)`
 *   (false / promise resolving false keeps it), `onPreview(file)`.
 * - `accept` (also filters dropped files), `multiple` (a drop takes one file when false),
 *   `disabled`, `name` (the `filename` passed to `customRequest`), `data`, `action`.
 */

export const LIST_IGNORE = `__LIST_IGNORE_${Date.now()}__`;

const uidNow = +new Date();
let uidIndex = 0;
const getUid = () => {
  uidIndex += 1;
  return `rc-upload-${uidNow}-${uidIndex}`;
};

const isPlainObject = value =>
  !!value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;

function attrAccept(file, acceptedFiles) {
  if (!file || !acceptedFiles) return true;
  const list = Array.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(',');
  const fileName = (file.name || '').toLowerCase();
  const mimeType = file.type || '';
  const baseMimeType = mimeType.replace(/\/.*$/, '');
  return list.some(type => {
    const validType = type.trim();
    if (/^\*(\/\*)?$/.test(validType)) return true;
    if (validType.charAt(0) === '.') {
      const lowerType = validType.toLowerCase();
      const affixes =
        lowerType === '.jpg' || lowerType === '.jpeg' ? ['.jpg', '.jpeg'] : [lowerType];
      return affixes.some(affix => fileName.endsWith(affix));
    }
    if (/\/\*$/.test(validType)) return baseMimeType === validType.replace(/\/.*$/, '');
    if (mimeType === validType) return true;
    return /^\w+$/.test(validType);
  });
}

function file2Obj(file) {
  return {
    ...file,
    lastModified: file.lastModified,
    lastModifiedDate: file.lastModifiedDate,
    name: file.name,
    size: file.size,
    type: file.type,
    uid: file.uid,
    percent: 0,
    originFileObj: file,
  };
}

function updateFileList(file, fileList) {
  const next = [...fileList];
  const index = next.findIndex(({ uid }) => uid === file.uid);
  if (index === -1) next.push(file);
  else next[index] = file;
  return next;
}

const matchKeyOf = file => (file.uid !== undefined ? 'uid' : 'name');
const getFileItem = (file, fileList) =>
  fileList.find(item => item[matchKeyOf(file)] === file[matchKeyOf(file)]);
function removeFileItem(file, fileList) {
  const key = matchKeyOf(file);
  const removed = fileList.filter(item => item[key] !== file[key]);
  return removed.length === fileList.length ? null : removed;
}

const FileUploadContext = React.createContext(null);

function useFileUpload() {
  const context = React.useContext(FileUploadContext);
  if (!context) throw new Error('FileUpload parts must be used inside <FileUpload>.');
  return context;
}

function FileUpload({
  accept = '',
  multiple = false,
  maxCount,
  disabled = false,
  name = 'file',
  data = {},
  action = '',
  headers = {},
  withCredentials = false,
  method = 'post',
  beforeUpload,
  customRequest,
  fileList,
  defaultFileList,
  onChange,
  onRemove,
  onPreview,
  className,
  children,
  ...props
}) {
  const [innerList, setInnerList] = React.useState(defaultFileList ?? []);
  const mergedFileList = fileList ?? innerList;
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef(null);
  const [inputKey, setInputKey] = React.useState(getUid);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Controlled lists get uids, so list operations can match items.
  React.useMemo(() => {
    const timestamp = Date.now();
    (fileList || []).forEach((file, index) => {
      if (!file.uid && !Object.isFrozen(file)) file.uid = `__AUTO__${timestamp}_${index}__`;
    });
  }, [fileList]);

  const onInternalChange = (file, changedFileList, event) => {
    let cloneList = [...changedFileList];
    let exceedMaxCount = false;
    if (maxCount === 1) cloneList = cloneList.slice(-1);
    else if (maxCount) {
      exceedMaxCount = cloneList.length > maxCount;
      cloneList = cloneList.slice(0, maxCount);
    }
    flushSync(() => setInnerList(cloneList));
    const info = { file, fileList: cloneList };
    if (event) info.event = event;
    if (!exceedMaxCount || file.status === 'removed' || cloneList.some(f => f.uid === file.uid)) {
      flushSync(() => onChange?.(info));
    }
  };

  // The handlers below read the latest props / list when async work completes.
  const latest = React.useRef({});

  const onBatchStart = batch => {
    const filtered = batch.filter(info => !info.file[LIST_IGNORE]);
    if (!filtered.length) return;
    const objects = filtered.map(info => file2Obj(info.file));
    let nextList = [...latest.current.mergedFileList];
    objects.forEach(obj => {
      nextList = updateFileList(obj, nextList);
    });
    objects.forEach((obj, index) => {
      let triggerFile = obj;
      if (!filtered[index].parsedFile) {
        const { originFileObj } = obj;
        let clone;
        try {
          clone = new File([originFileObj], originFileObj.name, { type: originFileObj.type });
        } catch (e) {
          clone = new Blob([originFileObj], { type: originFileObj.type });
          clone.name = originFileObj.name;
          clone.lastModifiedDate = new Date();
          clone.lastModified = new Date().getTime();
        }
        clone.uid = obj.uid;
        triggerFile = clone;
      } else {
        // eslint-disable-next-line no-param-reassign
        obj.status = 'uploading';
      }
      latest.current.onInternalChange(triggerFile, nextList);
    });
  };

  const settle = (file, patch, event) => {
    const list = latest.current.mergedFileList;
    if (!getFileItem(file, list)) return;
    const target = { ...file2Obj(file), ...patch };
    latest.current.onInternalChange(target, updateFileList(target, list), event);
  };

  latest.current = {
    mergedFileList,
    onInternalChange,
    onBatchStart,
    beforeUpload,
    customRequest,
    name,
    data,
    action,
    headers,
    withCredentials,
    method,
  };

  const processFile = async (file, files) => {
    const current = latest.current;
    let parsed = file;
    try {
      if (current.beforeUpload) {
        const result = await current.beforeUpload(file, files);
        if (result === false) parsed = false;
        else {
          // eslint-disable-next-line no-param-reassign
          delete file[LIST_IGNORE];
          if (result === LIST_IGNORE) {
            Object.defineProperty(file, LIST_IGNORE, { value: true, configurable: true });
            parsed = false;
          } else if (isPlainObject(result) || result instanceof Blob) parsed = result;
        }
      }
    } catch (e) {
      parsed = false;
    }
    if (parsed === false) return { origin: file, parsedFile: null };
    const mergedAction =
      typeof current.action === 'function' ? await current.action(file) : current.action;
    const mergedData = typeof current.data === 'function' ? await current.data(file) : current.data;
    const parsedFile =
      typeof File !== 'undefined' && parsed instanceof File
        ? parsed
        : new File([parsed], file.name, { type: file.type });
    parsedFile.uid = file.uid;
    return { origin: file, parsedFile, action: mergedAction, data: mergedData };
  };

  const post = ({ parsedFile, action: postAction, data: postData }) => {
    if (!mountedRef.current) return;
    const current = latest.current;
    current.customRequest?.({
      action: postAction,
      filename: current.name,
      data: postData,
      file: parsedFile,
      headers: current.headers,
      withCredentials: current.withCredentials,
      method: current.method,
      onProgress: event =>
        settle(parsedFile, { status: 'uploading', percent: event?.percent }, event),
      onSuccess: response => {
        let parsedResponse = response;
        try {
          if (typeof parsedResponse === 'string') parsedResponse = JSON.parse(parsedResponse);
        } catch (e) {
          /* keep the string */
        }
        settle(parsedFile, { status: 'done', percent: 100, response: parsedResponse });
      },
      onError: (error, response) => settle(parsedFile, { status: 'error', error, response }),
    });
  };

  const uploadFiles = files => {
    const originFiles = [...files];
    if (!originFiles.length) return;
    const pending = originFiles.map(file => {
      // eslint-disable-next-line no-param-reassign
      file.uid = getUid();
      return processFile(file, originFiles);
    });
    Promise.all(pending).then(results => {
      latest.current.onBatchStart(
        results.map(({ origin, parsedFile }) => ({ file: origin, parsedFile }))
      );
      results.filter(item => item.parsedFile !== null).forEach(post);
    });
  };

  const openDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const dropFiles = dataTransfer => {
    if (disabled || !dataTransfer) return;
    const files = [...(dataTransfer.files || [])];
    let accepted = files.filter(file => attrAccept(file, accept));
    if (!multiple) accepted = files.slice(0, 1);
    uploadFiles(accepted);
  };

  const removeFile = file => {
    Promise.resolve(typeof onRemove === 'function' ? onRemove(file) : onRemove).then(result => {
      if (result === false) return;
      const list = latest.current.mergedFileList;
      const removed = removeFileItem(file, list);
      if (!removed) return;
      const current = { ...file, status: 'removed' };
      list.forEach(item => {
        if (item[matchKeyOf(current)] === current[matchKeyOf(current)] && !Object.isFrozen(item)) {
          // eslint-disable-next-line no-param-reassign
          item.status = 'removed';
        }
      });
      latest.current.onInternalChange(current, removed);
    });
  };

  const context = {
    disabled,
    dragging,
    setDragging,
    openDialog,
    dropFiles,
    fileList: mergedFileList,
    removeFile,
    onPreview,
  };

  return (
    <FileUploadContext.Provider value={context}>
      <div
        data-slot="file-upload"
        data-disabled={disabled || undefined}
        className={className}
        {...props}
      >
        <input
          key={inputKey}
          ref={inputRef}
          type="file"
          name={name}
          accept={accept || undefined}
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          className="hidden"
          onClick={event => event.stopPropagation()}
          onChange={event => {
            uploadFiles(event.target.files || []);
            setInputKey(getUid());
          }}
        />
        {children}
      </div>
    </FileUploadContext.Provider>
  );
}

const dragHandlers = ({ disabled, setDragging, dropFiles }) => ({
  onDragEnter: event => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  },
  onDragOver: event => event.preventDefault(),
  onDragLeave: event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
  },
  onDrop: event => {
    event.preventDefault();
    setDragging(false);
    dropFiles(event.dataTransfer);
  },
});

/** Opens the file dialog when its child is clicked (also accepts dropped files). */
function FileUploadTrigger({ asChild = false, onClick, ...props }) {
  const context = useFileUpload();
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="file-upload-trigger"
      type={asChild ? undefined : 'button'}
      disabled={context.disabled}
      aria-disabled={context.disabled || undefined}
      {...dragHandlers(context)}
      onClick={event => {
        onClick?.(event);
        if (!event.defaultPrevented) context.openDialog();
      }}
      {...props}
    />
  );
}

/** Drag-and-drop zone (Empty layout). `icon`, `title`, `description`, then `children`. */
function FileUploadDropzone({ icon, title, description, className, children, ...props }) {
  const context = useFileUpload();
  const hasHeader = icon || title || description;
  return (
    <Empty
      data-slot="file-upload-dropzone"
      role="button"
      tabIndex={context.disabled ? -1 : 0}
      aria-disabled={context.disabled || undefined}
      data-dragging={context.dragging || undefined}
      onClick={context.openDialog}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          context.openDialog();
        }
      }}
      {...dragHandlers(context)}
      className={cn(
        'cursor-pointer gap-3 border-2 border-dashed border-border bg-input/30 p-6 transition-[background-color,border-color,box-shadow] duration-150 ease-out-quad outline-none hover:border-primary/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 data-dragging:border-primary data-dragging:bg-primary/5 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 aria-disabled:hover:border-border',
        className
      )}
      {...props}
    >
      {hasHeader && (
        <EmptyHeader>
          {icon && (
            <EmptyMedia variant="icon" className="mb-0 bg-primary/10 text-primary">
              {React.isValidElement(icon) ? icon : <HugeiconsIcon icon={icon} strokeWidth={2} />}
            </EmptyMedia>
          )}
          {title && <EmptyTitle className="text-base">{title}</EmptyTitle>}
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>
      )}
      {children && (hasHeader ? <EmptyContent>{children}</EmptyContent> : children)}
    </Empty>
  );
}

function useObjectUrl(file) {
  const source = file?.originFileObj;
  const [url, setUrl] = React.useState('');
  React.useEffect(() => {
    if (!source || typeof URL === 'undefined' || !URL.createObjectURL) return undefined;
    if (!(source.type || '').startsWith('image/')) return undefined;
    const objectUrl = URL.createObjectURL(source);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL?.(objectUrl);
  }, [source]);
  return file?.thumbUrl || file?.url || url;
}

function PictureCard({ file, onPreview, onRemove, disabled }) {
  const src = useObjectUrl(file);
  return (
    <div
      data-slot="file-upload-card"
      data-status={file.status}
      className="group/card relative size-24 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5 data-[status=error]:ring-destructive"
    >
      {src ? (
        <img src={src} alt={file.name} className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-muted-foreground">
          <HugeiconsIcon icon={Image01Icon} strokeWidth={2} className="size-6" />
        </span>
      )}
      {file.status === 'uploading' && (
        <span className="absolute inset-0 flex items-center justify-center bg-background/70">
          <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-5 animate-spin" />
        </span>
      )}
      <div className="absolute inset-0 flex items-center justify-center gap-1 bg-foreground/40 opacity-0 transition-opacity duration-150 ease-out-quad group-hover/card:opacity-100 focus-within:opacity-100">
        {onPreview && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Preview file"
            className="text-white hover:bg-white/20 hover:text-white"
            onClick={() => onPreview(file)}
          >
            <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
          </Button>
        )}
        {!disabled && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Remove file"
            className="text-white hover:bg-white/20 hover:text-white"
            onClick={() => onRemove(file)}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  );
}

/** The current `fileList` as Items ('text') or thumbnail tiles ('picture-card'). */
function FileUploadList({ variant = 'text', className }) {
  const { fileList, removeFile, onPreview, disabled } = useFileUpload();
  if (!fileList.length) return null;
  if (variant === 'picture-card') {
    return (
      <div data-slot="file-upload-list" className={cn('flex flex-wrap gap-2', className)}>
        {fileList.map(file => (
          <PictureCard
            key={file.uid}
            file={file}
            onPreview={onPreview}
            onRemove={removeFile}
            disabled={disabled}
          />
        ))}
      </div>
    );
  }
  return (
    <div data-slot="file-upload-list" className={cn('flex flex-col gap-1', className)}>
      {fileList.map(file => (
        <Item key={file.uid} size="xs" variant="muted" data-status={file.status}>
          <ItemMedia>
            <HugeiconsIcon
              icon={file.status === 'uploading' ? Loading03Icon : Attachment01Icon}
              strokeWidth={2}
              className={cn('size-4', file.status === 'uploading' && 'animate-spin')}
            />
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle
              className={cn(
                'w-full truncate',
                file.status === 'error' && 'text-destructive',
                onPreview && 'cursor-pointer hover:underline'
              )}
              onClick={onPreview ? () => onPreview(file) : undefined}
            >
              {file.name}
            </ItemTitle>
            {file.status === 'uploading' && <Progress value={file.percent ?? 0} className="h-1" />}
          </ItemContent>
          {!disabled && (
            <ItemActions>
              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                aria-label="Remove file"
                onClick={() => removeFile(file)}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              </Button>
            </ItemActions>
          )}
        </Item>
      ))}
    </div>
  );
}

export { FileUpload, FileUploadTrigger, FileUploadDropzone, FileUploadList };
