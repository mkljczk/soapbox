import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import HStack from 'pl-fe/components/ui/hstack';
import Input from 'pl-fe/components/ui/input';

import type { StreamfieldComponent } from 'pl-fe/components/ui/streamfield';
import type { FooterItem } from 'pl-fe/normalizers/pl-fe/pl-fe-config';

const messages = defineMessages({
  label: { id: 'plfe_config.home_footer.meta_fields.label_placeholder', defaultMessage: 'Label' },
  url: { id: 'plfe_config.home_footer.meta_fields.url_placeholder', defaultMessage: 'URL' },
});

const PromoPanelInput: StreamfieldComponent<FooterItem> = ({ value, onChange }) => {
  const intl = useIntl();

  const handleChange = (key: 'title' | 'url'): React.ChangeEventHandler<HTMLInputElement> => e => {
    onChange(value.set(key, e.currentTarget.value));
  };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-full grow'
        placeholder={intl.formatMessage(messages.label)}
        value={value.title}
        onChange={handleChange('title')}
      />
      <Input
        type='text'
        outerClassName='w-full grow'
        placeholder={intl.formatMessage(messages.url)}
        value={value.url}
        onChange={handleChange('url')}
      />
    </HStack>
  );
};

export { PromoPanelInput as default };
