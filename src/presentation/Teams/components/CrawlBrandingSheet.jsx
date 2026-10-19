import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Globe02Icon,
  PaintBoardIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
import { Badge } from '@/components/badge';
import { ColorPicker } from '@/components/color-picker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Field, FieldLabel } from '@/components/ui/field';
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
import { useCrawlBrandingMutation } from '../../../services/api';

const DEFAULT_BRAND_SYNC_THEME = 'light';
const DEFAULT_PRIMARY_COLOR = '#753fd0';

const CRAWL_PREVIEW_FIELDS = [
  { key: 'primaryColor', label: 'Primary colour', whitelabeling: true, brandSync: true },
  { key: 'accentColour', label: 'Accent colour', whitelabeling: false, brandSync: true },
  { key: 'logo', label: 'Logo', whitelabeling: true, brandSync: true },
  { key: 'theme', label: 'Theme', whitelabeling: false, brandSync: true },
  { key: 'fontName', label: 'Font name', whitelabeling: false, brandSync: true },
  { key: 'baseFontScale', label: 'Base font scale', whitelabeling: false, brandSync: true },
  { key: 'borderRadius', label: 'Border radius', whitelabeling: false, brandSync: true },
];

const ALL_CRAWL_FIELD_KEYS = CRAWL_PREVIEW_FIELDS.map(field => field.key);

const IMPORT_TARGETS = [
  { key: 'whitelabeling', label: 'Import to whitelabeling' },
  { key: 'brandSync', label: 'Import to BrandSync' },
  { key: 'both', label: 'Import to both' },
];

function CrawledValue({ fieldKey, value }) {
  if (fieldKey === 'primaryColor' || fieldKey === 'accentColour') {
    return value ? (
      <span className="flex items-center gap-2">
        <ColorPicker
          value={value}
          disabled
          className="size-6 disabled:cursor-default disabled:opacity-100"
        />
        <span className="font-mono text-xs text-muted-foreground uppercase">{value}</span>
      </span>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }

  if (fieldKey === 'logo' && value) {
    return (
      <span className="flex min-w-0 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background ring-1 ring-foreground/10">
          <img src={value} alt="Logo found on the website" className="size-full object-contain" />
        </span>
        <span className="truncate text-xs text-muted-foreground">{value}</span>
      </span>
    );
  }

  const isEmpty = value === undefined || value === null || value === '';
  return (
    <span className={isEmpty ? 'text-muted-foreground' : 'text-foreground'}>
      {isEmpty ? '—' : String(value)}
    </span>
  );
}

/**
 * "Import from website": crawls a site's branding, lets you pick fields and writes them into
 * the team form's whitelabeling and/or BrandSync fields (switching those sections on).
 * `resetWhen` clears the crawl whenever it turns true (the add drawer opening).
 */
function CrawlBrandingSheet({ open, onOpenChange, form, resetWhen }) {
  const [crawlUrl, setCrawlUrl] = useState('');
  const [crawledBrandData, setCrawledBrandData] = useState(null);
  const [selectedCrawlFields, setSelectedCrawlFields] = useState([]);
  const [crawlBranding, { isLoading: isCrawlingBranding }] = useCrawlBrandingMutation();

  useEffect(() => {
    if (!resetWhen) return;
    onOpenChange(false);
    setCrawlUrl('');
    setCrawledBrandData(null);
    setSelectedCrawlFields([]);
    // Only when the parent opens, not when the callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetWhen]);

  const allCrawlFieldsSelected =
    ALL_CRAWL_FIELD_KEYS.length > 0 &&
    ALL_CRAWL_FIELD_KEYS.every(key => selectedCrawlFields.includes(key));

  const handleToggleCrawlField = (fieldKey, checked) => {
    setSelectedCrawlFields(prev =>
      checked ? [...new Set([...prev, fieldKey])] : prev.filter(key => key !== fieldKey)
    );
  };

  const handleToggleAllCrawlFields = () => {
    setSelectedCrawlFields(allCrawlFieldsSelected ? [] : [...ALL_CRAWL_FIELD_KEYS]);
  };

  const handleCrawlBranding = async () => {
    const trimmedUrl = crawlUrl?.trim();
    if (!trimmedUrl) {
      toast.warning('Enter a website URL');
      return;
    }

    try {
      const response = await crawlBranding({ url: trimmedUrl }).unwrap();
      if (!response?.success || !response?.data) {
        toast.error(response?.errorObject?.userErrorText || "Couldn't fetch the branding");
        return;
      }

      setCrawledBrandData({
        primaryColor: response.data.primaryColor || '',
        accentColour: response.data.accentColour || '',
        logo: response.data.logo || '',
        theme: response.data.theme || DEFAULT_BRAND_SYNC_THEME,
        fontName: response.data.fontName || '',
        baseFontScale: response.data.baseFontScale ?? undefined,
        borderRadius: response.data.borderRadius || '',
      });
      setSelectedCrawlFields([...ALL_CRAWL_FIELD_KEYS]);
      toast.success('Branding fetched');
    } catch (error) {
      toast.error(
        error?.data?.errorObject?.userErrorText ||
          error?.data?.message ||
          "Couldn't crawl the website"
      );
    }
  };

  const handleImportCrawledSettings = target => {
    if (!crawledBrandData) return;

    if (!selectedCrawlFields.length) {
      toast.warning('Select at least one field to import');
      return;
    }

    const applyToWhitelabeling = target === 'whitelabeling' || target === 'both';
    const applyToBrandSync = target === 'brandSync' || target === 'both';
    const isSelected = fieldKey => selectedCrawlFields.includes(fieldKey);

    let importedCount = 0;

    if (applyToWhitelabeling) {
      if (isSelected('primaryColor')) {
        form.setFieldValue('primaryColor', crawledBrandData.primaryColor || DEFAULT_PRIMARY_COLOR);
        importedCount += 1;
      }
      if (isSelected('logo') && crawledBrandData.logo) {
        form.setFieldValue('logoUrl', crawledBrandData.logo);
        importedCount += 1;
      }
    }

    if (applyToBrandSync) {
      const brandSyncUpdates = {};

      if (isSelected('primaryColor')) {
        brandSyncUpdates.brandSyncPrimaryColor = crawledBrandData.primaryColor || undefined;
      }
      if (isSelected('accentColour')) {
        brandSyncUpdates.brandSyncAccentColour = crawledBrandData.accentColour || undefined;
      }
      if (isSelected('logo') && crawledBrandData.logo) {
        brandSyncUpdates.brandSyncLogo = crawledBrandData.logo;
      }
      if (isSelected('theme')) {
        brandSyncUpdates.brandSyncTheme = crawledBrandData.theme || DEFAULT_BRAND_SYNC_THEME;
      }
      if (isSelected('fontName')) {
        brandSyncUpdates.brandSyncFontName = crawledBrandData.fontName || undefined;
      }
      if (isSelected('baseFontScale')) {
        brandSyncUpdates.brandSyncBaseFontScale = crawledBrandData.baseFontScale;
      }
      if (isSelected('borderRadius')) {
        brandSyncUpdates.brandSyncBorderRadius = crawledBrandData.borderRadius || undefined;
      }

      if (Object.keys(brandSyncUpdates).length) {
        form.setFieldsValue(brandSyncUpdates);
        importedCount += Object.keys(brandSyncUpdates).length;
      }
    }

    if (importedCount === 0) {
      toast.warning('Nothing to import there', {
        description: 'The selected fields aren’t used by that section.',
      });
      return;
    }

    if (applyToWhitelabeling) {
      form.setFieldValue('isWhitelabelingEnabled', true);
    }
    if (applyToBrandSync) {
      form.setFieldValue('isBrandSyncEnabled', true);
    }

    toast.success(
      target === 'both'
        ? 'Imported into whitelabeling and BrandSync'
        : target === 'whitelabeling'
          ? 'Imported into whitelabeling'
          : 'Imported into BrandSync'
    );
    onOpenChange(false);
  };

  const canImport = !!crawledBrandData && selectedCrawlFields.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[600px]">
        <SheetHeader className="border-b pe-14">
          <SheetTitle className="text-[17px] font-semibold tracking-[-0.01em]">
            Import branding from a website
          </SheetTitle>
          <SheetDescription>
            Crawl a site, pick the fields you want, then choose where to import them.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pt-4 pb-6">
          <form
            className="flex flex-col gap-2"
            onSubmit={event => {
              event.preventDefault();
              handleCrawlBranding();
            }}
          >
            <Field>
              <FieldLabel htmlFor="team-crawl-url">Website URL</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="team-crawl-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://example.com"
                  value={crawlUrl}
                  onChange={event => setCrawlUrl(event.target.value)}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1"
                />
                <Button type="submit" disabled={isCrawlingBranding}>
                  {isCrawlingBranding ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={2} data-icon="inline-start" />
                  )}
                  {isCrawlingBranding ? 'Crawling…' : 'Crawl'}
                </Button>
              </div>
            </Field>
          </form>

          {crawledBrandData ? (
            <section aria-labelledby="team-crawl-results" className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h3
                  id="team-crawl-results"
                  className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em]"
                >
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                    className="size-4 text-success"
                  />
                  Found on the website
                  <span
                    className="text-sm font-normal text-muted-foreground tabular-nums"
                    aria-live="polite"
                  >
                    {selectedCrawlFields.length} selected
                  </span>
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleAllCrawlFields}
                >
                  {allCrawlFieldsSelected ? 'Deselect all' : 'Select all'}
                </Button>
              </div>
              <ul className="divide-y overflow-hidden rounded-lg ring-1 ring-foreground/10">
                {CRAWL_PREVIEW_FIELDS.map(field => {
                  const checkboxId = `team-crawl-${field.key}`;
                  return (
                    <li key={field.key} className="flex items-start gap-3 px-4 py-3">
                      <Checkbox
                        id={checkboxId}
                        className="mt-0.5"
                        checked={selectedCrawlFields.includes(field.key)}
                        onCheckedChange={checked => handleToggleCrawlField(field.key, !!checked)}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label htmlFor={checkboxId} className="text-sm font-medium">
                            {field.label}
                          </label>
                          <span className="flex flex-wrap gap-1">
                            {field.whitelabeling && <Badge variant="outline">Whitelabeling</Badge>}
                            {field.brandSync && <Badge variant="outline">BrandSync</Badge>}
                          </span>
                        </div>
                        <div className="min-w-0 text-[13px]">
                          <CrawledValue fieldKey={field.key} value={crawledBrandData[field.key]} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : (
            <Empty className="border border-dashed bg-muted/30 py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon
                    icon={isCrawlingBranding ? PaintBoardIcon : Globe02Icon}
                    strokeWidth={2}
                  />
                </EmptyMedia>
                <EmptyTitle>
                  {isCrawlingBranding ? 'Reading the website…' : 'Nothing crawled yet'}
                </EmptyTitle>
                <EmptyDescription>
                  Enter a website URL and crawl it to preview its colours, logo and fonts.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild disabled={!canImport}>
              <Button type="button" disabled={!canImport}>
                Import settings
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              {IMPORT_TARGETS.map(target => (
                <DropdownMenuItem
                  key={target.key}
                  onSelect={() => handleImportCrawledSettings(target.key)}
                >
                  <HugeiconsIcon icon={PaintBoardIcon} strokeWidth={2} />
                  {target.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default CrawlBrandingSheet;
