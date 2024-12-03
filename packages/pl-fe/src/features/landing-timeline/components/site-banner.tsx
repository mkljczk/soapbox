import React from 'react';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import Markup from 'pl-fe/components/markup';
import { ParsedContent } from 'pl-fe/components/parsed-content';
import Stack from 'pl-fe/components/ui/stack';
import { getTextDirection } from 'pl-fe/utils/rtl';

import { LogoText } from './logo-text';

const SiteBanner: React.FC = () => {
  const { data: instance } = useInstance();

  return (
    <Stack space={6}>
      <LogoText dir={getTextDirection(instance.title)}>
        {instance.title}
      </LogoText>

      {instance.description.trim().length > 0 && (
        <Markup
          size='lg'
          direction={getTextDirection(instance.description)}
        >
          <ParsedContent html={instance.description} />
        </Markup>
      )}
    </Stack>
  );
};

export { SiteBanner };
