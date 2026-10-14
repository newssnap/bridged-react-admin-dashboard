/**
 * Forms: shadcn Field markup (`@/components/ui/field`) on the headless `@rc-component/form`
 * engine, so values, rules, dependencies and the form instance API stay the same.
 *
 *   const [form] = useForm();
 *   <Form form={form} onFinish={handleSubmit}>
 *     <FieldGroup>
 *       <FormField name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
 *         <Input placeholder="you@company.com" />
 *       </FormField>
 *       <FormField name="enabled" label="Enabled" orientation="horizontal">
 *         <Switch />
 *       </FormField>
 *     </FieldGroup>
 *   </Form>
 *
 * Exports: Form, FormField, FormList, useForm, useWatch, useFormInstance, useFormDisabled,
 * fieldBindings. See `src/components/form/bindings.js` for how controls are wired.
 */
import * as React from 'react';
import RcForm, {
  Field as RcField,
  FieldContext,
  List as RcList,
  useForm as useRcForm,
  useWatch,
} from '@rc-component/form';
import { HugeiconsIcon } from '@hugeicons/react';
import { InformationCircleIcon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fieldBindings, getBindingName } from '@/components/form/bindings';
import { defaultValidateMessages, OPTIONAL_TEXT } from '@/components/form/messages';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const isNil = value => value === undefined || value === null;
const isFunction = value => typeof value === 'function';
const isPlainObject = value =>
  !!value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;

function toArray(value) {
  if (value === undefined || value === false) return [];
  return Array.isArray(value) ? value : [value];
}

/** Control id: `${formName}_${path}` or `path` joined with `_`. */
function getFieldId(namePath, formName) {
  if (!namePath.length) return undefined;
  const id = namePath.join('_');
  if (formName) return `${formName}_${id}`;
  return id === 'parentNode' ? `form_item_${id}` : id;
}

/** Drops `undefined` entries so the engine's own defaults apply. */
function definedProps(props) {
  const result = {};
  Object.keys(props).forEach(key => {
    if (props[key] !== undefined) result[key] = props[key];
  });
  return result;
}

/** setState batched to the next animation frame (sub-field meta can arrive mid-render). */
function useFrameState(defaultValue) {
  const [value, setValue] = React.useState(defaultValue);
  const frameRef = React.useRef(null);
  const batchRef = React.useRef([]);
  const destroyRef = React.useRef(false);
  React.useEffect(() => {
    destroyRef.current = false;
    return () => {
      destroyRef.current = true;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, []);
  const setFrameValue = React.useCallback(updater => {
    if (destroyRef.current) return;
    if (frameRef.current === null) {
      batchRef.current = [];
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        setValue(prev => batchRef.current.reduce((current, fn) => fn(current), prev));
      });
    }
    batchRef.current.push(updater);
  }, []);
  return [value, setFrameValue];
}

/* ------------------------------------------------------------------ */
/* Contexts                                                            */
/* ------------------------------------------------------------------ */

const FormContext = React.createContext({
  layout: 'vertical',
  requiredMark: true,
  disabled: false,
});

/** A `noStyle` FormField reports its errors to the closest styled FormField through this. */
const NoStyleContext = React.createContext(null);

/* ------------------------------------------------------------------ */
/* useForm / hooks                                                     */
/* ------------------------------------------------------------------ */

/**
 * `const [form] = useForm()` — the engine's form instance (validateFields, setFieldsValue,
 * setFieldValue, getFieldValue, getFieldsValue, resetFields, submit, setFields, ...) plus
 * `scrollToField(name, options)` and `focusField(name)`.
 */
function useForm(form) {
  const [rcForm] = useRcForm();
  const instance = React.useMemo(() => {
    if (form) return form;
    const wrapped = {
      ...rcForm,
      __INTERNAL__: {},
      scrollToField: (name, options = {}) => {
        const { focus, ...scrollOptions } = options;
        const node = document.getElementById(getFieldId(toArray(name), wrapped.__INTERNAL__.name));
        if (node) {
          node.scrollIntoView?.({ block: 'nearest', inline: 'nearest', ...scrollOptions });
          if (focus) wrapped.focusField(name);
        }
      },
      focusField: name => {
        document.getElementById(getFieldId(toArray(name), wrapped.__INTERNAL__.name))?.focus?.();
      },
    };
    return wrapped;
  }, [form, rcForm]);
  return [instance];
}

/** The form instance of the closest `<Form>`. */
function useFormInstance() {
  return React.useContext(FormContext).form;
}

/** `true` inside `<Form disabled>`: for custom controls that are not bound by FormField. */
function useFormDisabled() {
  return !!React.useContext(FormContext).disabled;
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

/**
 * `<form>` driven by the engine. Engine props: form, initialValues, onFinish, onFinishFailed,
 * onValuesChange, onFieldsChange, validateTrigger, preserve, clearOnDestroy, fields, name,
 * validateMessages. Presentation: `layout` ('vertical' | 'horizontal' | 'inline') sets the
 * default FormField orientation, `requiredMark` (true | false | 'optional'), `disabled`
 * disables every bound control (and native controls / buttons through a fieldset),
 * `scrollToFirstError` (true | scrollIntoView options). Other props go to the `<form>`.
 */
function Form({
  form,
  layout = 'vertical',
  requiredMark = true,
  disabled = false,
  name,
  className,
  children,
  onFinishFailed,
  scrollToFirstError,
  validateMessages,
  ref,
  ...props
}) {
  const [wrapForm] = useForm(form);
  if (wrapForm.__INTERNAL__) wrapForm.__INTERNAL__.name = name;

  const contextValue = React.useMemo(
    () => ({ form: wrapForm, name, layout, requiredMark, disabled: !!disabled }),
    [wrapForm, name, layout, requiredMark, disabled]
  );

  const mergedValidateMessages = React.useMemo(
    () =>
      validateMessages
        ? { ...defaultValidateMessages, ...validateMessages }
        : defaultValidateMessages,
    [validateMessages]
  );

  const handleFinishFailed = errorInfo => {
    onFinishFailed?.(errorInfo);
    if (scrollToFirstError && errorInfo.errorFields.length) {
      wrapForm.scrollToField?.(
        errorInfo.errorFields[0].name,
        isPlainObject(scrollToFirstError) ? scrollToFirstError : {}
      );
    }
  };

  const wrapDisabled = node =>
    disabled ? (
      <fieldset disabled data-slot="form-fieldset" className="contents">
        {node}
      </fieldset>
    ) : (
      node
    );

  return (
    <FormContext.Provider value={contextValue}>
      <NoStyleContext.Provider value={null}>
        <RcForm
          id={name}
          {...props}
          name={name}
          ref={ref}
          form={wrapForm}
          validateMessages={mergedValidateMessages}
          onFinishFailed={handleFinishFailed}
          data-slot="form"
          data-layout={layout}
          data-disabled={disabled || undefined}
          className={cn(
            layout === 'inline' && 'flex flex-row flex-wrap items-start gap-4',
            className
          )}
        >
          {isFunction(children)
            ? (...args) => wrapDisabled(children(...args))
            : wrapDisabled(children)}
        </RcForm>
      </NoStyleContext.Provider>
    </FormContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* FormList                                                            */
/* ------------------------------------------------------------------ */

/**
 * Array field. `children(fields, { add, remove, move }, { errors, warnings })`; spread each
 * `field` ({ key, name, isListField }) into the FormField of a row and use
 * `name={[field.name, 'prop']}` (or `name={field.name}` for a list of scalars).
 */
function FormList({ children, ...props }) {
  return (
    <RcList {...props}>
      {(fields, operation, meta) =>
        children(
          fields.map(field => ({ ...field, fieldKey: field.key })),
          operation,
          { errors: meta.errors, warnings: meta.warnings }
        )
      }
    </RcList>
  );
}

/* ------------------------------------------------------------------ */
/* FormField                                                           */
/* ------------------------------------------------------------------ */

function FieldTooltip({ children }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-slot="form-field-tooltip"
            className="inline-flex cursor-help text-muted-foreground"
            // Inside a <label>: do not focus / toggle the control.
            onClick={e => e.preventDefault()}
          >
            <HugeiconsIcon icon={InformationCircleIcon} size={14} strokeWidth={2} />
          </span>
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function isRuleRequired(rules, context) {
  return !!rules?.some(rule => {
    if (isPlainObject(rule) && rule.required && !rule.warningOnly) return true;
    if (isFunction(rule)) {
      const entity = rule(context);
      return entity?.required && !entity?.warningOnly;
    }
    return false;
  });
}

function toErrorItems(errors) {
  return toArray(errors)
    .filter(error => !isNil(error) && error !== false && error !== '')
    .map(error => ({ message: error }));
}

/** id is only filled in when the control has none; aria-* always reflect the field state. */
function assignA11yProps(target, ownProps, a11yProps) {
  Object.keys(a11yProps).forEach(key => {
    if (key === 'id') {
      if (ownProps.id === undefined) target.id = a11yProps.id;
    } else {
      target[key] = a11yProps[key];
    }
  });
}

/** Clones the first `type` element found in `children` (through fragments / wrappers) with the a11y props. */
function applyToTarget(children, type, a11yProps) {
  let applied = false;
  const visit = nodes =>
    React.Children.map(nodes, child => {
      if (applied || !React.isValidElement(child)) return child;
      if (child.type === type) {
        applied = true;
        const props = {};
        assignA11yProps(props, child.props, a11yProps);
        return React.cloneElement(child, props);
      }
      if (child.props?.children) {
        const nextChildren = visit(child.props.children);
        return applied ? React.cloneElement(child, undefined, nextChildren) : child;
      }
      return child;
    });
  const result = visit(children);
  return Array.isArray(children) || applied ? result : children;
}

/**
 * One form field: `Field` + `FieldLabel` + control + `FieldDescription` + `FieldError`.
 *
 * Engine props: name, rules, dependencies, shouldUpdate, initialValue, valuePropName, trigger,
 * getValueFromEvent, getValueProps, normalize, validateTrigger, validateFirst,
 * validateDebounce, preserve, messageVariables (+ the `field` props of a FormList row).
 *
 * Presentation: label, description (alias `extra`), error (shown instead of the rule errors
 * and marks the field invalid: for state validated outside the form), required (marker;
 * defaults to "rules contain required"), tooltip, orientation ('vertical' | 'horizontal' |
 * 'responsive'; default from Form `layout`), controlFirst (horizontal: control before the
 * label, default for Checkbox), noStyle (render only the control; errors go to the parent
 * FormField), hidden (keep the field registered but hide it), className / style / labelClassName.
 *
 * Children:
 * - one element: cloned with the value, change handler, id, aria-invalid / aria-describedby /
 *   aria-required (and disabled inside `<Form disabled>`); the wiring comes from `bind` or is
 *   detected from the component (see fieldBindings).
 * - `(control, meta, form) => node` with a `name`: wire `control` into any markup yourself.
 * - `(form) => node` without a `name`, with `shouldUpdate` / `dependencies`: re-renders when
 *   those values change.
 * - anything else without a `name`: layout only (label / description / error around it).
 */
function FormField(props) {
  const {
    name,
    label,
    description,
    extra,
    error,
    required,
    tooltip,
    orientation,
    controlFirst,
    noStyle,
    hidden,
    bind,
    className,
    style,
    labelClassName,
    children,
    rules,
    dependencies,
    shouldUpdate,
    valuePropName,
    trigger,
    getValueFromEvent,
    getValueProps,
    normalize,
    initialValue,
    validateTrigger,
    validateFirst,
    validateDebounce,
    preserve,
    messageVariables,
    isListField,
  } = props;

  const formContext = React.useContext(FormContext);
  const { validateTrigger: contextValidateTrigger } = React.useContext(FieldContext);
  const reportToParent = React.useContext(NoStyleContext);
  const hasName = !isNil(name);
  const isRenderFunction = isFunction(children);

  // ----------------------------- Sub-field errors (noStyle children)
  const [subMetas, setSubMetas] = useFrameState({});
  const onSubMetaChange = React.useCallback(
    (meta, key) => {
      setSubMetas(prev => {
        const next = { ...prev };
        if (meta.destroy) delete next[key];
        else next[key] = meta;
        return next;
      });
    },
    [setSubMetas]
  );
  const subErrors = React.useMemo(
    () => Object.values(subMetas).flatMap(meta => meta.errors || []),
    [subMetas]
  );

  // ----------------------------- Binding
  const childList = isRenderFunction ? [] : React.Children.toArray(children);
  const element =
    childList.length === 1 && React.isValidElement(childList[0]) ? childList[0] : null;
  const bindingName = bind ?? getBindingName(element) ?? 'value';
  const binding = fieldBindings[bindingName] || fieldBindings.value;
  const mergedValuePropName = valuePropName ?? binding.valuePropName ?? 'value';
  const mergedTrigger = trigger ?? binding.trigger ?? 'onChange';
  const mergedGetValueFromEvent = getValueFromEvent ?? binding.getValueFromEvent;
  const toControl = getValueProps ? undefined : binding.toControl;
  // Validate on the control's own change callback (onCheckedChange, onValueChange, ...).
  const mergedValidateTrigger =
    validateTrigger !== undefined
      ? validateTrigger
      : toArray(contextValidateTrigger ?? 'onChange').map(eventName =>
          eventName === 'onChange' ? mergedTrigger : eventName
        );
  const mergedOrientation =
    orientation ?? (formContext.layout === 'horizontal' ? 'horizontal' : 'vertical');
  const mergedControlFirst = controlFirst ?? !!binding.controlFirst;
  const formDisabled = !!formContext.disabled;

  // ----------------------------- Layout
  const renderLayout = (control, { fieldId, isRequired, errors }) => {
    const hasManualError = !isNil(error) && error !== false && error !== '';
    const errorItems = hasManualError ? toErrorItems(error) : toErrorItems(errors);
    const invalid = errorItems.length > 0;

    if (noStyle) {
      return hidden ? <div hidden>{control}</div> : control;
    }

    const mergedDescription = description ?? extra;
    const { requiredMark } = formContext;
    const labelNode =
      isNil(label) || label === false || label === '' ? null : (
        <FieldLabel htmlFor={fieldId} className={labelClassName}>
          {label}
          {requiredMark !== false && isRequired && (
            <span aria-hidden="true" className="-ms-1 text-destructive">
              *
            </span>
          )}
          {requiredMark === 'optional' && !isRequired && (
            <span className="font-normal text-muted-foreground">{OPTIONAL_TEXT}</span>
          )}
          {!isNil(tooltip) && tooltip !== false && tooltip !== '' && (
            <FieldTooltip>{tooltip}</FieldTooltip>
          )}
        </FieldLabel>
      );
    const descriptionNode = mergedDescription ? (
      <FieldDescription id={fieldId ? `${fieldId}_extra` : undefined}>
        {mergedDescription}
      </FieldDescription>
    ) : null;
    const errorNode = invalid ? (
      <FieldError id={fieldId ? `${fieldId}_help` : undefined} errors={errorItems} />
    ) : null;
    let controlNode = (
      <NoStyleContext.Provider value={onSubMetaChange}>{control}</NoStyleContext.Provider>
    );
    if (binding.inline && mergedOrientation === 'vertical') {
      controlNode = <div className="flex">{controlNode}</div>;
    }

    let content;
    if (mergedOrientation === 'vertical') {
      content = (
        <>
          {labelNode}
          {controlNode}
          {descriptionNode}
          {errorNode}
        </>
      );
    } else {
      const textNode =
        labelNode || descriptionNode || errorNode ? (
          <FieldContent>
            {labelNode}
            {descriptionNode}
            {errorNode}
          </FieldContent>
        ) : null;
      content = mergedControlFirst ? (
        <>
          {controlNode}
          {textNode}
        </>
      ) : (
        <>
          {textNode}
          {controlNode}
        </>
      );
    }

    return (
      <Field
        orientation={mergedOrientation}
        data-invalid={invalid}
        data-disabled={formDisabled || undefined}
        hidden={hidden}
        className={cn(hidden && 'hidden', className)}
        style={style}
      >
        {content}
      </Field>
    );
  };

  // Layout only: no field registration.
  if (!hasName && !isRenderFunction && !dependencies) {
    return renderLayout(children, {
      isRequired: !!required,
      errors: subErrors,
    });
  }

  let variables = {};
  if (typeof label === 'string') variables.label = label;
  else if (hasName) variables.label = String(name);
  if (messageVariables) variables = { ...variables, ...messageVariables };

  const onMetaChange =
    noStyle && reportToParent
      ? meta => reportToParent(meta, toArray(meta.name).join('__'))
      : undefined;

  const engineProps = definedProps({
    name,
    rules,
    dependencies,
    shouldUpdate,
    valuePropName: mergedValuePropName,
    trigger: mergedTrigger,
    getValueFromEvent: mergedGetValueFromEvent,
    getValueProps,
    normalize,
    initialValue,
    validateTrigger: mergedValidateTrigger,
    validateFirst,
    validateDebounce,
    preserve,
    isListField,
    messageVariables: variables,
    onMetaChange,
  });

  return (
    <RcField {...engineProps}>
      {(control, meta, context) => {
        const namePath = hasName && meta ? meta.name : [];
        const fieldId = getFieldId(namePath, formContext.name);
        const isRequired = required !== undefined ? required : isRuleRequired(rules, context);
        const errors = [...(meta?.errors || []), ...subErrors];
        const hasManualError = !isNil(error) && error !== false && error !== '';
        const invalid = hasManualError || errors.length > 0;
        const mergedDescription = description ?? extra;

        // Props for the control, beyond value + change handler.
        const extraProps = {};
        if (fieldId) extraProps.id = fieldId;
        if (fieldId && (invalid || mergedDescription)) {
          const describedBy = [];
          if (invalid) describedBy.push(`${fieldId}_help`);
          if (mergedDescription) describedBy.push(`${fieldId}_extra`);
          extraProps['aria-describedby'] = describedBy.join(' ');
        }
        if (invalid) extraProps['aria-invalid'] = true;
        if (isRequired) extraProps['aria-required'] = true;
        if (formDisabled) extraProps.disabled = true;

        const mergedControl = { ...control };
        if (binding.ignoreChange && hasName) {
          const handler = control[mergedTrigger];
          mergedControl[mergedTrigger] = (...args) => {
            if (!binding.ignoreChange(...args)) handler?.(...args);
          };
        }
        if (toControl && hasName) {
          mergedControl[mergedValuePropName] = toControl(
            control[mergedValuePropName],
            element?.props || {}
          );
        }

        let childNode;
        if (hasName && isRenderFunction) {
          childNode = children({ ...extraProps, ...mergedControl }, meta, context);
        } else if (isRenderFunction) {
          // `shouldUpdate` / `dependencies` render function.
          childNode = children(context);
        } else if (hasName && element && !binding.passive) {
          const childProps = { ...element.props, ...mergedControl };
          const { disabled: injectDisabled, ...a11yProps } = extraProps;
          if (injectDisabled && element.props.disabled === undefined) childProps.disabled = true;
          if (binding.labelTarget) {
            // id / aria-* belong on an inner element (e.g. SelectTrigger).
            childProps.children = applyToTarget(
              element.props.children,
              binding.labelTarget,
              a11yProps
            );
          } else {
            assignA11yProps(childProps, element.props, a11yProps);
          }
          // Keep the child's own handlers for the change / validate callbacks.
          new Set([mergedTrigger, ...toArray(mergedValidateTrigger)]).forEach(eventName => {
            childProps[eventName] = (...args) => {
              if (eventName === mergedTrigger && binding.ignoreChange?.(...args)) return;
              mergedControl[eventName]?.(...args);
              element.props[eventName]?.(...args);
            };
          });
          childNode = React.cloneElement(element, childProps);
        } else {
          childNode = children;
        }

        return renderLayout(childNode, { fieldId, isRequired, errors });
      }}
    </RcField>
  );
}

export {
  Form,
  FormField,
  FormList,
  useForm,
  useWatch,
  useFormInstance,
  useFormDisabled,
  fieldBindings,
};
