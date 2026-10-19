/**
 * How `<FormField>` wires form state into a control. Each binding says which prop carries the
 * value (`valuePropName`), which callback reports a change (`trigger`), how the callback's
 * arguments become the stored value (`getValueFromEvent`), and how the stored value is shown
 * to the control (`toControl`, display only: the stored value is never rewritten).
 *
 * The binding is picked from the child's component (Input -> `input`, Switch -> `switch`, ...)
 * or set explicitly with `<FormField bind="...">`. Explicit `valuePropName` / `trigger` /
 * `getValueFromEvent` / `getValueProps` / `normalize` props on FormField win over the binding.
 */
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup } from '@/components/ui/radio-group';
import { ToggleGroup } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger } from '@/components/ui/select';
import { NativeSelect } from '@/components/ui/native-select';
import { PasswordInput } from '@/components/password-input';
import { NumberInput } from '@/components/number-input';

const isNil = value => value === undefined || value === null;

export const fieldBindings = {
  /** `onChange(event)` controls (Input, Textarea, PasswordInput, native select): string value. */
  input: {
    // A missing value shows as '' so the input stays controlled and clears on resetFields.
    toControl: value => (isNil(value) ? '' : value),
  },
  /** NumberInput and any control whose `onChange` receives the value itself. */
  value: {},
  /** Switch: `checked` + `onCheckedChange(boolean)`; stores a boolean. */
  switch: {
    valuePropName: 'checked',
    trigger: 'onCheckedChange',
    toControl: value => !!value,
  },
  /** Checkbox: `checked` + `onCheckedChange(boolean)`; stores a boolean. */
  checkbox: {
    valuePropName: 'checked',
    trigger: 'onCheckedChange',
    toControl: value => !!value,
    controlFirst: true,
    // Keep the box at its own size inside a vertical Field (which stretches its children).
    inline: true,
  },
  /**
   * Select: `value` + `onValueChange(string)`; nothing selected shows the placeholder. The id /
   * aria-* props go to its SelectTrigger (the Select root renders no element of its own).
   */
  select: {
    trigger: 'onValueChange',
    // Inside a <form> the Select syncs a hidden native <select>, which reports '' when the
    // value has no matching item (options still loading, after a reset). Users cannot pick
    // '', so those calls are dropped instead of overwriting (and validating) the value.
    ignoreChange: value => value === '',
    toControl: value => (isNil(value) ? '' : value),
    get labelTarget() {
      return SelectTrigger;
    },
  },
  /**
   * RadioGroup: `value` + `onValueChange(string)`. Item values are strings, so a stored
   * number is shown as String(value); pass `getValueFromEvent={Number}` to keep storing numbers.
   */
  radio: {
    trigger: 'onValueChange',
    toControl: value => (isNil(value) ? '' : String(value)),
  },
  /**
   * ToggleGroup (segmented / button radios). `type="single"`: like `radio`, and clicking the
   * active item keeps the value (radio buttons cannot be unselected). `type="multiple"`: arrays.
   */
  toggle: {
    trigger: 'onValueChange',
    toControl: (value, props) => {
      if (props.type === 'multiple') return isNil(value) ? [] : value;
      return isNil(value) ? '' : String(value);
    },
    ignoreChange: value => value === '',
  },
  /**
   * Slider: the control takes/reports arrays; the form stores a number for a single thumb and
   * the array for a range (2+ thumbs).
   */
  slider: {
    trigger: 'onValueChange',
    toControl: (value, props) => {
      if (Array.isArray(value)) return value;
      return [isNil(value) ? (props.min ?? 0) : value];
    },
    getValueFromEvent: values => (values.length > 1 ? values : values[0]),
  },
  /**
   * Composites whose change callback is `onValueChange(value, ...)` and that take `value` as is
   * (DatePicker / DateRangePicker: dayjs | null, MultiSelect: array, ...).
   */
  valueChange: {
    trigger: 'onValueChange',
  },
  /** Register the field (value + rules) without passing anything to the child. */
  none: { passive: true },
};

let componentBindings;

/** The binding name for a child element's component, `undefined` when unknown. */
export function getBindingName(element) {
  if (!element) return undefined;
  // A component can declare its own binding: `MyPicker.formBinding = 'valueChange'`.
  if (typeof element.type?.formBinding === 'string') return element.type.formBinding;
  if (!componentBindings) {
    componentBindings = new Map([
      [Input, 'input'],
      [Textarea, 'input'],
      [InputGroupInput, 'input'],
      [InputGroupTextarea, 'input'],
      [PasswordInput, 'input'],
      [NativeSelect, 'input'],
      [NumberInput, 'value'],
      [Switch, 'switch'],
      [Checkbox, 'checkbox'],
      [Select, 'select'],
      [RadioGroup, 'radio'],
      [ToggleGroup, 'toggle'],
      [Slider, 'slider'],
    ]);
  }
  return componentBindings.get(element.type);
}
