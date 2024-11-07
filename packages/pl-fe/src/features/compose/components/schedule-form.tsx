import clsx from 'clsx';
import React, { Suspense } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { setSchedule, removeSchedule } from 'pl-fe/actions/compose';
import IconButton from 'pl-fe/components/icon-button';
import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { DatePicker } from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useCompose } from 'pl-fe/hooks/use-compose';

const isCurrentOrFutureDate = (date: Date) =>
  date && new Date().setHours(0, 0, 0, 0) <= new Date(date).setHours(0, 0, 0, 0);

const isFiveMinutesFromNow = (time: Date) => {
  const fiveMinutesFromNow = new Date(new Date().getTime() + 300000); // now, plus five minutes (Pleroma won't schedule posts )
  const selectedDate = new Date(time);

  return fiveMinutesFromNow.getTime() < selectedDate.getTime();
};

const messages = defineMessages({
  schedule: { id: 'schedule.post_time', defaultMessage: 'Post Date/Time' },
  remove: { id: 'schedule.remove', defaultMessage: 'Remove schedule' },
});

interface IScheduleForm {
  composeId: string;
}

const ScheduleForm: React.FC<IScheduleForm> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const scheduledAt = useCompose(composeId).schedule;
  const active = !!scheduledAt;

  const onSchedule = (date: Date | null) => {
    if (date === null) dispatch(removeSchedule(composeId));
    else dispatch(setSchedule(composeId, date));
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(removeSchedule(composeId));
    e.preventDefault();
  };

  if (!active) {
    return null;
  }

  return (
    <Stack space={2}>
      <Text weight='medium'>
        <FormattedMessage id='datepicker.hint' defaultMessage='Scheduled to post at…' />
      </Text>
      <HStack space={2} alignItems='center'>
        <Suspense fallback={<Input type='text' disabled />}>
          <DatePicker
            selected={scheduledAt}
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            onChange={onSchedule}
            placeholderText={intl.formatMessage(messages.schedule)}
            filterDate={isCurrentOrFutureDate}
            filterTime={isFiveMinutesFromNow}
            className={clsx({
              'has-error': !isFiveMinutesFromNow(scheduledAt),
            })}
          />
        </Suspense>
        <IconButton
          iconClassName='h-4 w-4'
          className='bg-transparent text-gray-400 hover:text-gray-600'
          src={require('@tabler/icons/outline/x.svg')}
          onClick={handleRemove}
          title={intl.formatMessage(messages.remove)}
        />
      </HStack>
    </Stack>
  );
};

export { ScheduleForm as default, isCurrentOrFutureDate };
