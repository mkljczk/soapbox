import React, { useRef } from 'react';
import { useIntl, defineMessages } from 'react-intl';

import Button from './button';
import HStack from './hstack';
import IconButton from './icon-button';
import Stack from './stack';
import Text from './text';

const messages = defineMessages({
  add: { id: 'streamfield.add', defaultMessage: 'Add' },
  remove: { id: 'streamfield.remove', defaultMessage: 'Remove' },
});

/** Type of the inner Streamfield input component. */
type StreamfieldComponent<T> = React.ComponentType<{
  index: number;
  value: T;
  onChange: (value: T) => void;
  autoFocus: boolean;
}>;

interface IStreamfield {
  /** Array of values for the streamfield. */
  values: any[];
  /** Input label message. */
  label?: React.ReactNode;
  /** Input hint message. */
  hint?: React.ReactNode;
  /** Callback to add an item. */
  onAddItem?: () => void;
  /** Callback to remove an item by index. */
  onRemoveItem?: (i: number) => void;
  /** Callback when values are changed. */
  onChange: (values: any[]) => void;
  /** Input to render for each value. */
  component: StreamfieldComponent<any>;
  /** Minimum number of allowed inputs. */
  minItems?: number;
  /** Maximum number of allowed inputs. */
  maxItems?: number;
  /** Allow changing order of the items. */
  draggable?: boolean;
}

/** List of inputs that can be added or removed. */
const Streamfield: React.FC<IStreamfield> = ({
  values,
  label,
  hint,
  onAddItem,
  onRemoveItem,
  onChange,
  component: Component,
  maxItems = Infinity,
  minItems = 0,
  draggable,
}) => {
  const intl = useIntl();

  const dragItem = useRef<number | null>();
  const dragOverItem = useRef<number | null>();

  const handleDragStart = (i: number) => () => {
    dragItem.current = i;
  };

  const handleDragEnter = (i: number) => () => {
    dragOverItem.current = i;
  };

  const handleDragEnd = () => {
    const newData = [...values];
    const item = newData.splice(dragItem.current!, 1)[0];
    newData.splice(dragOverItem.current!, 0, item);

    onChange(newData);
  };

  const handleChange = (i: number) => (value: any) => {
    const newData = [...values];
    newData[i] = value;
    onChange(newData);
  };

  return (
    <Stack space={4}>
      <Stack>
        {label && <Text size='sm' weight='medium'>{label}</Text>}
        {hint && <Text size='xs' theme='muted'>{hint}</Text>}
      </Stack>

      {(values.length > 0) && (
        <Stack space={1}>
          {values.map((value, i) => value?._destroy ? null : (
            <HStack
              key={i}
              space={2}
              alignItems='center'
              draggable={draggable}
              onDragStart={handleDragStart(i)}
              onDragEnter={handleDragEnter(i)}
              onDragEnd={handleDragEnd}
            >
              <Component
                key={i}
                index={i}
                onChange={handleChange(i)}
                value={value}
                autoFocus={i > 0}
              />
              {values.length > minItems && onRemoveItem && (
                <IconButton
                  iconClassName='h-4 w-4'
                  className='bg-transparent text-gray-600 hover:text-gray-600'
                  src={require('@tabler/icons/outline/x.svg')}
                  onClick={() => onRemoveItem(i)}
                  title={intl.formatMessage(messages.remove)}
                />
              )}
            </HStack>
          ))}
        </Stack>
      )}

      {(onAddItem && (values.length < maxItems)) && (
        <Button
          onClick={onAddItem}
          theme='secondary'
          block
        >
          {intl.formatMessage(messages.add)}
        </Button>
      )}
    </Stack>
  );
};

export { type StreamfieldComponent, Streamfield as default };
