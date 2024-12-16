import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { resetCompose } from 'pl-fe/actions/compose';
import {
  cancelEventCompose,
  initEventEdit,
  submitEvent,
} from 'pl-fe/actions/events';
import { uploadFile } from 'pl-fe/actions/media';
import { fetchStatus } from 'pl-fe/actions/statuses';
import { ADDRESS_ICONS } from 'pl-fe/components/autosuggest-location';
import LocationSearch from 'pl-fe/components/location-search';
import Button from 'pl-fe/components/ui/button';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import HStack from 'pl-fe/components/ui/hstack';
import Icon from 'pl-fe/components/ui/icon';
import IconButton from 'pl-fe/components/ui/icon-button';
import Input from 'pl-fe/components/ui/input';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Toggle from 'pl-fe/components/ui/toggle';
import { isCurrentOrFutureDate } from 'pl-fe/features/compose/components/schedule-form';
import { ComposeEditor, DatePicker } from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { statusQueryOptions } from 'pl-fe/queries/statuses/status';
import toast from 'pl-fe/toast';

import UploadButton from '../components/upload-button';

import type { Location } from 'pl-api';

const messages = defineMessages({
  eventNamePlaceholder: { id: 'compose_event.fields.name_placeholder', defaultMessage: 'Name' },
  eventDescriptionPlaceholder: { id: 'compose_event.fields.description_placeholder', defaultMessage: 'Description' },
  eventStartTimePlaceholder: { id: 'compose_event.fields.start_time_placeholder', defaultMessage: 'Event begins on…' },
  eventEndTimePlaceholder: { id: 'compose_event.fields.end_time_placeholder', defaultMessage: 'Event ends on…' },
  resetLocation: { id: 'compose_event.reset_location', defaultMessage: 'Reset location' },
  eventFetchFail: { id: 'compose_event.fetch_fail', defaultMessage: 'Failed to fetch edited event information' },
});

interface IEditEvent {
  statusId: string | null;
}

const EditEvent: React.FC<IEditEvent> = ({ statusId }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const history = useHistory();

  const { data: status } = useQuery(statusQueryOptions(statusId || undefined));

  const [name, setName] = useState(status?.event?.name || '');
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState(status?.event?.start_time ? new Date(status.event.start_time) : new Date());
  const [endTime, setEndTime] = useState(status?.event?.end_time ? new Date(status.event.end_time) : null);
  const [approvalRequired, setApprovalRequired] = useState(status?.event?.join_mode !== 'free');
  const [banner, setBanner] = useState(status?.event?.banner || null);
  const [location, setLocation] = useState<Location | null>(null);

  const [isDisabled, setIsDisabled] = useState(!!statusId);
  const [isUploading, setIsUploading] = useState(false);

  const composeId = statusId ? `compose-event-modal-${statusId}` : 'compose-event-modal';

  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setName(target.value);
  };

  const onChangeStartTime = (date: Date | null) => {
    setStartTime(date === null ? new Date : date);
  };

  const onChangeEndTime = (date: Date | null) => {
    setEndTime(date);
  };

  const onChangeHasEndTime: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    if (target.checked) {
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      setEndTime(endTime);
    } else setEndTime(null);
  };

  const onChangeApprovalRequired: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setApprovalRequired(target.checked);
  };

  const onChangeLocation = (location: Location | null) => {
    setLocation(location);
  };

  const handleFiles = (files: FileList) => {
    setIsUploading(true);

    dispatch(uploadFile(
      files[0],
      intl,
      (data) => {
        setBanner(data);
        setIsUploading(false);
      },
      () => setIsUploading(false),
    ));
  };

  const handleClearBanner = () => {
    setBanner(null);
  };

  const handleSubmit = () => {
    setIsDisabled(true);

    dispatch(submitEvent({
      statusId,
      name,
      status: text,
      banner,
      startTime,
      endTime,
      joinMode: approvalRequired ? 'restricted' : 'free',
      location,
    })).then((status) => {
      if (status) history.push(`/@${status.account.acct}/events/${status.id}`);
      dispatch(resetCompose(composeId));
    }).catch(() => {
    });
  };

  useEffect(() => {
    if (statusId) {
      Promise.all([dispatch(initEventEdit(statusId)), dispatch(fetchStatus(statusId))])
        .then(([source, status]) => {
          if (!source || !status) throw new Error();

          setText(source.text);
          setLocation(source.location);

          setName(status?.event?.name || '');
          setStartTime(status?.event?.start_time ? new Date(status.event.start_time) : new Date());
          setEndTime(status?.event?.end_time ? new Date(status.event.end_time) : null);
          setApprovalRequired(status?.event?.join_mode !== 'free');
          setBanner(status?.media_attachments[0] || null);

          setIsDisabled(false);
        }).catch(() => {
          toast.error(messages.eventFetchFail);
        });
    }

    return () => {
      dispatch(cancelEventCompose());
    };
  }, [statusId]);

  const renderLocation = () => location && (
    <HStack className='h-[38px] text-gray-700 dark:text-gray-500' alignItems='center' space={2}>
      <Icon src={ADDRESS_ICONS[location.type] || require('@tabler/icons/outline/map-pin.svg')} />
      <Stack className='grow'>
        <Text>{location.description}</Text>
        <Text theme='muted' size='xs'>{[location.street, location.locality, location.country].filter(val => val?.trim()).join(' · ')}</Text>
      </Stack>
      <IconButton title={intl.formatMessage(messages.resetLocation)} src={require('@tabler/icons/outline/x.svg')} onClick={() => onChangeLocation(null)} />
    </HStack>
  );

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.banner_label' defaultMessage='Event banner' />}
        hintText={<FormattedMessage id='compose_event.fields.banner_hint' defaultMessage='PNG, GIF or JPG. Landscape format is preferred.' />}
      >
        <div className='dark:sm:shadow-inset relative flex h-24 items-center justify-center overflow-hidden rounded-lg bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-white sm:h-32 sm:shadow'>
          {banner ? (
            <>
              <img className='size-full object-cover' src={banner.url} alt='' />
              <IconButton className='absolute right-2 top-2' src={require('@tabler/icons/outline/x.svg')} onClick={handleClearBanner} />
            </>
          ) : (
            <UploadButton disabled={isUploading} onSelectFile={handleFiles} />
          )}
        </div>
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.name_label' defaultMessage='Event name' />}
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.eventNamePlaceholder)}
          value={name}
          onChange={onChangeName}
        />
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.description_label' defaultMessage='Event description' />}
      >
        <ComposeEditor
          key={String(isDisabled)}
          className='block w-full rounded-md border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 ring-1 placeholder:text-gray-600 focus-within:border-primary-500 focus-within:ring-primary-500 black:bg-black dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800 dark:placeholder:text-gray-600 dark:focus-within:border-primary-500 dark:focus-within:ring-primary-500 sm:text-sm'
          placeholderClassName='pt-2'
          composeId={composeId}
          placeholder={intl.formatMessage(messages.eventDescriptionPlaceholder)}
          handleSubmit={handleSubmit}
          onChange={setText}
        />
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.location_label' defaultMessage='Event location' />}
      >
        {location ? renderLocation() : (
          <LocationSearch
            onSelected={onChangeLocation}
          />
        )}
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.start_time_label' defaultMessage='Event start date' />}
      >
        <DatePicker
          showTimeSelect
          dateFormat='MMMM d, yyyy h:mm aa'
          timeIntervals={15}
          wrapperClassName='react-datepicker-wrapper'
          placeholderText={intl.formatMessage(messages.eventStartTimePlaceholder)}
          filterDate={isCurrentOrFutureDate}
          selected={startTime}
          onChange={onChangeStartTime}
        />
      </FormGroup>
      <HStack alignItems='center' space={2}>
        <Toggle
          checked={!!endTime}
          onChange={onChangeHasEndTime}
        />
        <Text tag='span' theme='muted'>
          <FormattedMessage id='compose_event.fields.has_end_time' defaultMessage='The event has an end date' />
        </Text>
      </HStack>
      {endTime && (
        <FormGroup
          labelText={<FormattedMessage id='compose_event.fields.end_time_label' defaultMessage='Event end date' />}
        >
          <DatePicker
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            placeholderText={intl.formatMessage(messages.eventEndTimePlaceholder)}
            filterDate={isCurrentOrFutureDate}
            selected={endTime}
            onChange={onChangeEndTime}
          />
        </FormGroup>
      )}
      {!statusId && (
        <HStack alignItems='center' space={2}>
          <Toggle
            checked={approvalRequired}
            onChange={onChangeApprovalRequired}
          />
          <Text tag='span' theme='muted'>
            <FormattedMessage id='compose_event.fields.approval_required' defaultMessage='I want to approve participation requests manually' />
          </Text>
        </HStack>
      )}
      <FormActions>
        <Button disabled={isDisabled} theme='primary' type='submit'>
          {statusId
            ? <FormattedMessage id='compose_event.update' defaultMessage='Update' />
            : <FormattedMessage id='compose_event.create' defaultMessage='Create' />}
        </Button>
      </FormActions>
    </Form>
  );
};

export { EditEvent };
