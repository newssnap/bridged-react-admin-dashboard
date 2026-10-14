import * as React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

/**
 * Password field: an InputGroup with a show / hide toggle at the end.
 *
 * Every `<input>` prop (value, onChange(event), placeholder, autoComplete, disabled, ref, id,
 * aria-*, ...) goes to the input; `className` styles the group. Extra addons can be passed as
 * children (e.g. `<InputGroupAddon align="inline-end">`); they render before the toggle.
 * Visibility is uncontrolled (`defaultVisible`) or controlled (`visible` + `onVisibleChange`);
 * `visibilityToggle={false}` hides the toggle.
 */
function PasswordInput({
  className,
  children,
  disabled,
  visible: visibleProp,
  defaultVisible = false,
  onVisibleChange,
  visibilityToggle = true,
  ...props
}) {
  const [uncontrolledVisible, setUncontrolledVisible] = React.useState(defaultVisible);
  const visible = visibleProp ?? uncontrolledVisible;

  const toggle = () => {
    if (disabled) return;
    const next = !visible;
    if (visibleProp === undefined) setUncontrolledVisible(next);
    onVisibleChange?.(next);
  };

  return (
    <InputGroup
      data-slot="password-input"
      data-disabled={disabled || undefined}
      className={className}
    >
      <InputGroupInput type={visible ? 'text' : 'password'} disabled={disabled} {...props} />
      {children}
      {visibilityToggle && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            disabled={disabled}
            // Keep focus (and the caret) in the input while toggling.
            onMouseDown={e => e.preventDefault()}
            onClick={toggle}
            className="text-muted-foreground"
          >
            <HugeiconsIcon icon={visible ? ViewIcon : ViewOffSlashIcon} strokeWidth={2} />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { PasswordInput };
