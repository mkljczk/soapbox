import React from 'react';

import HStack from 'pl-fe/components/ui/hstack';
import IconButton from 'pl-fe/components/ui/icon-button';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

interface IWidgetTitle {
  /** Title text for the widget. */
  title: React.ReactNode;
}

/** Title of a widget. */
const WidgetTitle = ({ title }: IWidgetTitle): JSX.Element => (
  <Text size='xl' weight='bold' tag='h1'>{title}</Text>
);

interface IWidgetBody {
  children: React.ReactNode;
}

/** Body of a widget. */
const WidgetBody: React.FC<IWidgetBody> = ({ children }): JSX.Element => (
  <Stack space={3}>{children}</Stack>
);

interface IWidget {
  /** Widget title text. */
  title?: React.ReactNode;
  /** Callback when the widget action is clicked. */
  onActionClick?: () => void;
  /** URL to the svg icon for the widget action. */
  actionIcon?: string;
  /** Text for the action. */
  actionTitle?: string;
  action?: JSX.Element;
  children?: React.ReactNode;
}

/** Sidebar widget. */
const Widget: React.FC<IWidget> = ({
  title,
  children,
  onActionClick,
  actionIcon = require('@tabler/icons/outline/arrow-right.svg'),
  actionTitle,
  action,
}): JSX.Element => (
  <Stack space={4}>
    {(title || action || onActionClick) && (
      <HStack space={2} alignItems='center' justifyContent='between'>
        {title && <WidgetTitle title={title} />}
        {action || (onActionClick && (
          <IconButton
            className='ml-2 size-6 text-black dark:text-white rtl:rotate-180'
            src={actionIcon}
            onClick={onActionClick}
            title={actionTitle}
          />
        ))}
      </HStack>
    )}
    <WidgetBody>{children}</WidgetBody>
  </Stack>
);

export { Widget as default };
