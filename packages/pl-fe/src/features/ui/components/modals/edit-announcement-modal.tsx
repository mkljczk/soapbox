import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Form from 'pl-fe/components/ui/form';
import FormGroup from 'pl-fe/components/ui/form-group';
import HStack from 'pl-fe/components/ui/hstack';
import Modal from 'pl-fe/components/ui/modal';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Textarea from 'pl-fe/components/ui/textarea';
import Toggle from 'pl-fe/components/ui/toggle';
import { DatePicker } from 'pl-fe/features/ui/util/async-components';
import { createAnnouncementMutationOptions, updateAnnouncementMutationOptions } from 'pl-fe/queries/admin/announcements';
import toast from 'pl-fe/toast';

import type { BaseModalProps } from '../modal-root';
import type { AdminAnnouncement } from 'pl-api';

const messages = defineMessages({
  save: { id: 'admin.edit_announcement.save', defaultMessage: 'Save' },
  announcementContentPlaceholder: { id: 'admin.edit_announcement.fields.content_placeholder', defaultMessage: 'Announcement content' },
  announcementStartTimePlaceholder: { id: 'admin.edit_announcement.fields.start_time_placeholder', defaultMessage: 'Announcement starts on:' },
  announcementEndTimePlaceholder: { id: 'admin.edit_announcement.fields.end_time_placeholder', defaultMessage: 'Announcement ends on:' },
  announcementCreateSuccess: { id: 'admin.edit_announcement.created', defaultMessage: 'Announcement created' },
  announcementUpdateSuccess: { id: 'admin.edit_announcement.updated', defaultMessage: 'Announcement edited' },
});

interface EditAnnouncementModalProps {
  announcement?: AdminAnnouncement;
}

const EditAnnouncementModal: React.FC<BaseModalProps & EditAnnouncementModalProps> = ({ onClose, announcement }) => {
  const { mutate: createAnnouncement } = useMutation(createAnnouncementMutationOptions);
  const { mutate: updateAnnouncement } = useMutation(updateAnnouncementMutationOptions);
  const intl = useIntl();

  const [content, setContent] = useState(announcement?.raw_content || '');
  const [startTime, setStartTime] = useState(announcement?.starts_at ? new Date(announcement.starts_at) : null);
  const [endTime, setEndTime] = useState(announcement?.ends_at ? new Date(announcement.ends_at) : null);
  const [allDay, setAllDay] = useState(announcement?.all_day || false);

  const onChangeContent: React.ChangeEventHandler<HTMLTextAreaElement> = ({ target }) => setContent(target.value);

  const onChangeStartTime = (date: Date | null) => setStartTime(date);

  const onChangeEndTime = (date: Date | null) => setEndTime(date);

  const onChangeAllDay: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => setAllDay(target.checked);

  const onClickClose = () => {
    onClose('EDIT_ANNOUNCEMENT');
  };

  const handleSubmit = () => {
    const form = {
      content,
      starts_at: startTime?.toISOString() || undefined,
      ends_at: endTime?.toISOString() || undefined,
      all_day: allDay,
    };

    if (announcement) {
      updateAnnouncement({ ...form, id: announcement.id }, {
        onSuccess: () => {
          onClose('EDIT_ANNOUNCEMENT');
          toast.success(messages.announcementUpdateSuccess);
        },
      });
    } else {
      createAnnouncement(form, {
        onSuccess: () => {
          onClose('EDIT_ANNOUNCEMENT');
          toast.success(messages.announcementCreateSuccess);
        },
      });
    }
  };

  return (
    <Modal
      onClose={onClickClose}
      title={announcement
        ? <FormattedMessage id='column.admin.edit_announcement' defaultMessage='Edit announcement' />
        : <FormattedMessage id='column.admin.create_announcement' defaultMessage='Create announcement' />}
      confirmationAction={handleSubmit}
      confirmationText={intl.formatMessage(messages.save)}
    >
      <Form>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_announcement.fields.content_label' defaultMessage='Content' />}
        >
          <Textarea
            autoComplete='off'
            placeholder={intl.formatMessage(messages.announcementContentPlaceholder)}
            value={content}
            onChange={onChangeContent}
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_announcement.fields.start_time_label' defaultMessage='Start date' />}
        >
          <DatePicker
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            placeholderText={intl.formatMessage(messages.announcementStartTimePlaceholder)}
            selected={startTime}
            onChange={onChangeStartTime}
            isClearable
          />
        </FormGroup>
        <FormGroup
          labelText={<FormattedMessage id='admin.edit_announcement.fields.end_time_label' defaultMessage='End date' />}
        >
          <DatePicker
            showTimeSelect
            dateFormat='MMMM d, yyyy h:mm aa'
            timeIntervals={15}
            wrapperClassName='react-datepicker-wrapper'
            placeholderText={intl.formatMessage(messages.announcementEndTimePlaceholder)}
            selected={endTime}
            onChange={onChangeEndTime}
            isClearable
          />
        </FormGroup>
        <HStack alignItems='center' space={2}>
          <Toggle
            checked={allDay}
            onChange={onChangeAllDay}
          />
          <Stack>
            <Text tag='span' theme='muted'>
              <FormattedMessage id='admin.edit_announcement.fields.all_day_label' defaultMessage='All-day event' />
            </Text>
            <Text size='xs' tag='span' theme='muted'>
              <FormattedMessage id='admin.edit_announcement.fields.all_day_hint' defaultMessage='When checked, only the dates of the time range will be displayed' />
            </Text>
          </Stack>
        </HStack>
      </Form>
    </Modal>
  );
};

export { EditAnnouncementModal as default, type EditAnnouncementModalProps };
