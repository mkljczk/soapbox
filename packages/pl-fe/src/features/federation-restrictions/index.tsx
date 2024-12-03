import React, { useState, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Accordion from 'pl-fe/components/ui/accordion';
import Column from 'pl-fe/components/ui/column';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetHosts } from 'pl-fe/selectors';
import { federationRestrictionsDisclosed } from 'pl-fe/utils/state';

import RestrictedInstance from './components/restricted-instance';

const messages = defineMessages({
  heading: { id: 'column.federation_restrictions', defaultMessage: 'Federation restrictions' },
  boxTitle: { id: 'federation_restrictions.explanation_box.title', defaultMessage: 'Instance-specific policies' },
  boxMessage: { id: 'federation_restrictions.explanation_box.message', defaultMessage: 'Normally servers on the Fediverse can communicate freely. {siteTitle} has imposed restrictions on the following servers.' },
  emptyMessage: { id: 'federation_restrictions.empty_message', defaultMessage: '{siteTitle} has not restricted any instances.' },
  notDisclosed: { id: 'federation_restrictions.not_disclosed_message', defaultMessage: '{siteTitle} does not disclose federation restrictions through the API.' },
});

const FederationRestrictions = () => {
  const intl = useIntl();
  const { data: instance } = useInstance();

  const getHosts = useCallback(makeGetHosts(), []);

  const hosts = useAppSelector((state) => getHosts(state, instance));
  const disclosed = federationRestrictionsDisclosed(instance);

  const [explanationBoxExpanded, setExplanationBoxExpanded] = useState(true);

  const toggleExplanationBox = (setting: boolean) => {
    setExplanationBoxExpanded(setting);
  };

  const emptyMessage = disclosed ? messages.emptyMessage : messages.notDisclosed;

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Accordion
        headline={intl.formatMessage(messages.boxTitle)}
        expanded={explanationBoxExpanded}
        onToggle={toggleExplanationBox}
      >
        {intl.formatMessage(messages.boxMessage, { siteTitle: instance.title })}
      </Accordion>

      <div className='pt-4'>
        <ScrollableList emptyMessage={intl.formatMessage(emptyMessage, { siteTitle: instance.title })}>
          {hosts.map((host) => <RestrictedInstance key={host} host={host} />)}
        </ScrollableList>
      </div>
    </Column>
  );
};

export { FederationRestrictions as default };
