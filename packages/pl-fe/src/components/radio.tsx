import React from 'react';

import List, { type IListItem, ListItem } from './list';

interface IRadioGroup {
  onChange: React.ChangeEventHandler;
  children: React.ReactElement<{ onChange: React.ChangeEventHandler }>[];
}

const RadioGroup = ({ onChange, children }: IRadioGroup) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { onChange }),
  );

  return <List>{childrenWithProps}</List>;
};

interface IRadioItem extends IListItem {
  label: React.ReactNode;
  hint?: React.ReactNode;
  value: string;
  checked: boolean;
  onChange?: React.ChangeEventHandler;
}

const RadioItem: React.FC<IRadioItem> = ({ label, hint, checked = false, onChange, value, ...props }) => (
  <ListItem label={label} hint={hint} {...props}>
    <input
      type='radio'
      checked={checked}
      onChange={onChange}
      value={value}
      className='text-primary-600 focus:ring-primary-500 size-4 border-gray-300'
    />
  </ListItem>
);

export {
  RadioGroup,
  RadioItem,
};
