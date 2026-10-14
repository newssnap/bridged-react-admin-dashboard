import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Globe02Icon, PaintBoardIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { ColorPicker } from '@/components/color-picker';
import { FormField, useWatch } from '@/components/form';
import { NumberInput } from '@/components/number-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import LogoField from './LogoField';
import { DrawerSection, SettingGroup, SettingRow } from './SettingParts';
import { useLogoUpload } from '../controllers/useLogoUpload';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/** A colour field: swatch picker plus the hex value beside it. */
function ColorField({ name, label }) {
  return (
    <FormField name={name} label={label} bind="valueChange">
      {control => (
        <div className="flex items-center gap-2">
          <ColorPicker
            id={control.id}
            value={control.value ?? ''}
            onValueChange={control.onValueChange}
            alpha={false}
            aria-label={`Pick the ${label.toLowerCase()}`}
          />
          <span className="font-mono text-xs text-muted-foreground uppercase tabular-nums">
            {control.value || 'Not set'}
          </span>
        </div>
      )}
    </FormField>
  );
}

/**
 * The branding section shared by the add and edit team drawers: whitelabeling (primary colour,
 * logo) and BrandSync (agent visualisation: colours, theme, font, scale, radius, logo), each
 * behind its switch, plus "Import from website". Field names and values are unchanged.
 */
function BrandSettings({ form, onOpenCrawl }) {
  const { processUploadedFile, isUploadingLogo } = useLogoUpload();
  const isWhitelabelingEnabled = useWatch('isWhitelabelingEnabled', form);
  const isBrandSyncEnabled = useWatch('isBrandSyncEnabled', form);

  const renderLogo = (name, label) => (
    <FormField name={name} label="Logo">
      {control => (
        <LogoField
          id={control.id}
          label={label}
          value={control.value}
          uploading={isUploadingLogo}
          onSelectFile={file =>
            processUploadedFile({ file, onSetValue: url => form.setFieldValue(name, url) })
          }
          onRemove={() => form.setFieldValue(name, undefined)}
        />
      )}
    </FormField>
  );

  return (
    <DrawerSection
      title="Branding"
      description="Set it up by hand or import it from the team's website."
      action={
        <Button type="button" variant="outline" size="sm" onClick={onOpenCrawl}>
          <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} data-icon="inline-start" />
          Import from website
        </Button>
      }
    >
      <SettingGroup>
        <SettingRow
          icon={<HugeiconsIcon icon={PaintBoardIcon} strokeWidth={2} className="size-4.5" />}
          title="Whitelabeling"
          description="Show the team's own colour and logo in the dashboard."
          control={
            <FormField name="isWhitelabelingEnabled" noStyle>
              <Switch aria-label="Whitelabeling" />
            </FormField>
          }
          panelOpen={!!isWhitelabelingEnabled}
          panel={
            <>
              <ColorField name="primaryColor" label="Primary colour" />
              {renderLogo('logoUrl', 'logo')}
            </>
          }
        />
        <SettingRow
          icon={<HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-4.5" />}
          title="BrandSync"
          description="Style the team's agents to match its brand."
          control={
            <FormField name="isBrandSyncEnabled" noStyle>
              <Switch aria-label="BrandSync" />
            </FormField>
          }
          panelOpen={!!isBrandSyncEnabled}
          panel={
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ColorField name="brandSyncPrimaryColor" label="Primary colour" />
                <ColorField name="brandSyncAccentColour" label="Accent colour" />
                <FormField name="brandSyncTheme" label="Theme">
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {THEME_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField name="brandSyncFontName" label="Font name">
                  <Input placeholder="e.g. Inter" />
                </FormField>
                <FormField name="brandSyncBaseFontScale" label="Base font scale">
                  <NumberInput min={1} max={12} className="w-full" placeholder="e.g. 4" />
                </FormField>
                <FormField name="brandSyncBorderRadius" label="Border radius">
                  <Input placeholder="e.g. 8px" />
                </FormField>
              </div>
              {renderLogo('brandSyncLogo', 'BrandSync logo')}
            </>
          }
        />
      </SettingGroup>
    </DrawerSection>
  );
}

export default BrandSettings;
