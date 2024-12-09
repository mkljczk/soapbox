import { autoUpdate, shift, useFloating, useTransitionStyles } from '@floating-ui/react';
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { showStatusHoverCard } from 'pl-fe/components/hover-status-wrapper';
import Card, { CardBody } from 'pl-fe/components/ui/card';
import StatusContainer from 'pl-fe/containers/status-container';
import { useStatus } from 'pl-fe/queries/statuses/status';
import { useStatusHoverCardStore } from 'pl-fe/stores/status-hover-card';

interface IStatusHoverCard {
  visible?: boolean;
}

/** Popup status preview that appears when hovering reply to */
const StatusHoverCard: React.FC<IStatusHoverCard> = ({ visible = true }) => {
  const history = useHistory();

  const { statusId, ref, closeStatusHoverCard, updateStatusHoverCard } = useStatusHoverCardStore();

  useStatus(statusId || undefined);

  useEffect(() => {
    const unlisten = history.listen(() => {
      showStatusHoverCard.cancel();
      closeStatusHoverCard(true);
    });

    return () => {
      unlisten();
    };
  }, []);

  const { x, y, strategy, refs, context, placement } = useFloating({
    open: !!statusId,
    elements: {
      reference: ref?.current,
    },
    placement: 'top',
    middleware: [
      shift({
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
      transformOrigin: placement === 'bottom' ? 'top' : 'bottom',
    },
    duration: {
      open: 100,
      close: 100,
    },
  });

  const handleMouseEnter = () => {
    updateStatusHoverCard();
  };

  const handleMouseLeave = () => {
    closeStatusHoverCard(true);
  };

  if (!statusId) return null;

  const renderStatus = (statusId: string) => (
    // @ts-ignore
    <StatusContainer
      key={statusId}
      id={statusId}
      hoverable={false}
      hideActionBar
      muted
    />
  );

  return (
    <div
      className={clsx({
        'absolute transition-opacity w-[500px] z-50 top-0 left-0': true,
        'opacity-100': visible,
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        ...styles,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card className='relative overflow-hidden black:rounded-xl black:border black:border-gray-800'>
        <CardBody>
          {renderStatus(statusId)}
        </CardBody>
      </Card>
    </div>
  );
};

export { StatusHoverCard as default };
