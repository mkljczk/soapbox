import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';

import { changeSetting } from 'pl-fe/actions/settings';
import Column from 'pl-fe/components/ui/column';
import SvgIcon from 'pl-fe/components/ui/svg-icon';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import toast from 'pl-fe/toast';
import sourceCode from 'pl-fe/utils/code';

const messages = defineMessages({
  heading: { id: 'column.developers', defaultMessage: 'Developers' },
  leave: { id: 'developers.leave', defaultMessage: 'You have left developers' },
});

interface IDashWidget {
  to?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

const DashWidget: React.FC<IDashWidget> = ({ to, onClick, children }) => {
  const className = 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-800/75 p-4 rounded flex flex-col items-center justify-center space-y-2';

  if (to) {
    return <Link className={className} to={to}>{children}</Link>;
  } else {
    return <button className={className} onClick={onClick}>{children}</button>;
  }
};

const Developers: React.FC = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const leaveDevelopers = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    dispatch(changeSetting(['isDeveloper'], false));
    toast.success(intl.formatMessage(messages.leave));
    history.push('/');
  };

  const showToast = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    toast.success('Hello world!', {
      action: () => alert('hi'),
      actionLabel: 'Click me',
    });
  };

  return (
    <>
      <Column label={intl.formatMessage(messages.heading)}>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          <DashWidget to='/developers/apps/create'>
            <SvgIcon src={require('@tabler/icons/outline/apps.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.app_create_label' defaultMessage='Create an app' />
            </Text>
          </DashWidget>

          <DashWidget to='/developers/settings_store'>
            <SvgIcon src={require('@tabler/icons/outline/code-plus.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.settings_store_label' defaultMessage='Settings store' />
            </Text>
          </DashWidget>

          <DashWidget to='/developers/timeline'>
            <SvgIcon src={require('@tabler/icons/outline/home.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.test_timeline_label' defaultMessage='Test timeline' />
            </Text>
          </DashWidget>

          <DashWidget to='/error'>
            <SvgIcon src={require('@tabler/icons/outline/mood-sad.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.intentional_error_label' defaultMessage='Trigger an error' />
            </Text>
          </DashWidget>

          <DashWidget to='/error/network'>
            <SvgIcon src={require('@tabler/icons/outline/refresh.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.network_error_label' defaultMessage='Network error' />
            </Text>
          </DashWidget>

          <DashWidget to='/developers/sw'>
            <SvgIcon src={require('@tabler/icons/outline/script.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.service_worker_label' defaultMessage='Service Worker' />
            </Text>
          </DashWidget>

          <DashWidget onClick={leaveDevelopers}>
            <SvgIcon src={require('@tabler/icons/outline/logout.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.leave_developers_label' defaultMessage='Leave developers' />
            </Text>
          </DashWidget>

          <DashWidget onClick={showToast}>
            <SvgIcon src={require('@tabler/icons/outline/urgent.svg')} className='text-gray-700 dark:text-gray-600' />

            <Text>
              <FormattedMessage id='developers.navigation.show_toast' defaultMessage='Trigger Toast' />
            </Text>
          </DashWidget>
        </div>
      </Column>

      <div className='p-4'>
        <Text align='center' theme='subtle' size='sm'>
          {sourceCode.displayName} {sourceCode.version}
        </Text>
      </div>
    </>
  );
};

export { Developers as default };
