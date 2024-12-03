import clsx from 'clsx';
import React, { useState } from 'react';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import Icon from 'pl-fe/components/icon';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { makeGetRemoteInstance } from 'pl-fe/selectors';

import InstanceRestrictions from './instance-restrictions';

const getRemoteInstance = makeGetRemoteInstance();

interface IRestrictedInstance {
  host: string;
}

const RestrictedInstance: React.FC<IRestrictedInstance> = ({ host }) => {
  const { data: instance } = useInstance();
  const remoteInstance: any = useAppSelector((state) => getRemoteInstance(state, host, instance));

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded: React.MouseEventHandler<HTMLAnchorElement> = e => {
    setExpanded((value) => !value);
    e.preventDefault();
  };

  return (
    <div>
      <a href='#' className='flex items-center gap-1 py-2.5 no-underline' onClick={toggleExpanded}>
        <Icon src={expanded ? require('@tabler/icons/outline/caret-down.svg') : require('@tabler/icons/outline/caret-right.svg')} />
        <div className={clsx({ 'line-through': remoteInstance.federation.reject })}>
          {remoteInstance.host}
        </div>
      </a>
      <div
        className={clsx({
          'h-0 overflow-hidden': !expanded,
          'h-auto': expanded,
        })}
      >
        <InstanceRestrictions remoteInstance={remoteInstance} />
      </div>
    </div>
  );
};

export { RestrictedInstance as default };
