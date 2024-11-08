import clsx from 'clsx';
import MultiselectReactDropdown from 'multiselect-react-dropdown';
import React, { useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from 'pl-fe/components/ui/icon';
import Select from 'pl-fe/components/ui/select';

const messages = defineMessages({
  selectPlaceholder: { id: 'select.placeholder', defaultMessage: 'Select' },
  selectNoOptions: { id: 'select.no_options', defaultMessage: 'No options available' },
});

interface IInputContainer {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  required?: boolean;
  type?: string;
  extraClass?: string;
  error?: boolean;
  children: React.ReactNode;
}

const InputContainer: React.FC<IInputContainer> = (props) => {
  const containerClass = clsx('input', {
    'with_label': props.label,
    'required': props.required,
    'boolean': props.type === 'checkbox',
    'field_with_errors': props.error,
  }, props.extraClass);

  return (
    <div className={containerClass}>
      {props.children}
      {props.hint && <span className='hint'>{props.hint}</span>}
    </div>
  );
};

interface ILabelInputContainer {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

const LabelInputContainer: React.FC<ILabelInputContainer> = ({ label, hint, children }) => {
  const [id] = useState(crypto.randomUUID());
  const childrenWithProps = React.Children.map(children, child => (
    // @ts-ignore: not sure how to get the right type here
    React.cloneElement(child, { id, key: id })
  ));

  return (
    <div className='label_input'>
      <label htmlFor={id}>{label}</label>
      <div className='label_input__wrapper'>
        {childrenWithProps}
      </div>
      {hint && <span className='hint'>{hint}</span>}
    </div>
  );
};

interface ILabelInput {
  label?: React.ReactNode;
}

const LabelInput: React.FC<ILabelInput> = ({ label, ...props }) => (
  <LabelInputContainer label={label}>
    <input {...props} />
  </LabelInputContainer>
);

interface ISimpleInput {
  type: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: boolean;
  onChange?: React.ChangeEventHandler;
  min?: number;
  max?: number;
  pattern?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  autoComplete?: string;
  autoCorrect?: string;
  autoCapitalize?: string;
  required?: boolean;
}

const SimpleInput: React.FC<ISimpleInput> = (props) => {
  const { hint, error, ...rest } = props;
  const Input = props.label ? LabelInput : 'input';

  return (
    <InputContainer {...props}>
      <Input {...rest} />
    </InputContainer>
  );
};

interface ISelectDropdown {
  className?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  items: Record<string, string>;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler;
}

const SelectDropdown: React.FC<ISelectDropdown> = (props) => {
  const { label, hint, items, ...rest } = props;

  const optionElems = Object.keys(items).map(item => (
    <option key={item} value={item}>{items[item]}</option>
  ));

  // @ts-ignore
  const selectElem = <Select {...rest}>{optionElems}</Select>;

  return label ? (
    <LabelInputContainer label={label} hint={hint}>{selectElem}</LabelInputContainer>
  ) : selectElem;
};

interface IMultiselect {
  className?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  items: Record<string, string>;
  value?: string[];
  onChange?: ((values: string[]) => void);
  disabled?: boolean;
}

const Mutliselect: React.FC<IMultiselect> = (props) => {
  const intl = useIntl();
  const { label, hint, items, value, onChange, disabled } = props;

  const options = useMemo(() => Object.entries(items).map(([key, value]) => ({ key, value })), [items]);
  const selectedValues = value?.map(key => options.find(option => option.key === key)).filter(value => value);

  const handleChange = (values: Record<'key' | 'value', string>[]) => {
    onChange?.(values.map(({ key }) => key));
  };

  const selectElem = (
    <MultiselectReactDropdown
      className='plfe-multiselect'
      options={options}
      selectedValues={selectedValues}
      onSelect={handleChange}
      onRemove={handleChange}
      displayValue='value'
      disable={disabled}
      customCloseIcon={<Icon className='ml-1 size-4 hover:cursor-pointer' src={require('@fluentui/dismiss_circle_24_regular.svg')} />}
      placeholder={intl.formatMessage(messages.selectPlaceholder)}
      emptyRecordMsg={intl.formatMessage(messages.selectNoOptions)}
    />
  );

  return label ? (
    <LabelInputContainer label={label} hint={hint}>{selectElem}</LabelInputContainer>
  ) : selectElem;
};

const FileChooser : React.FC = (props) => (
  <SimpleInput type='file' {...props} />
);

FileChooser.defaultProps = {
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

interface IFileChooserLogo {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  name?: string;
  accept?: string[];
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

const FileChooserLogo: React.FC<IFileChooserLogo> = props => (
  <SimpleInput type='file' {...props} />
);

FileChooserLogo.defaultProps = {
  accept: ['image/svg', 'image/png'],
};

export {
  SelectDropdown,
  Mutliselect,
};
