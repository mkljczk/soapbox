import clsx from 'clsx';
import React, { Suspense, useCallback } from 'react';
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
import { useFeatures } from 'pl-fe/hooks/use-features';

const isCurrentOrFutureDate = (date: Date) => (date && new Date().setHours(0, 0, 0, 0) <= new Date(date).setHours(0, 0, 0, 0));

const isFiveMinutesFromNow = (selectedDate: Date) => {
  const fiveMinutesFromNow = new Date(new Date().getTime() + 1000 * 60 * 5);

  return fiveMinutesFromNow.getTime() < selectedDate.getTime();
};

const messages = defineMessages({
  schedule: { id: 'schedule.post_time', defaultMessage: 'Post date/time' },
  remove: { id: 'schedule.remove', defaultMessage: 'Remove schedule' },
});

interface IScheduleForm {
  composeId: string;
}

const ScheduleForm: React.FC<IScheduleForm> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();

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

  const isValidTime = useCallback(
    (date: Date) => isFiveMinutesFromNow(date) || features.scheduledStatusesBackwards && new Date().getTime() > date.getTime(),
    [features.scheduledStatusesBackwards],
  );

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
            filterDate={features.scheduledStatusesBackwards ? undefined : isCurrentOrFutureDate}
            filterTime={isValidTime}
            className={clsx({
              'has-error': !isValidTime(scheduledAt),
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
