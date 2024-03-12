import { NostrEvent, NostrFilter } from '@soapbox/nspec';
import isEqual from 'lodash/isEqual';
import { useEffect, useRef, useState } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';

/** Streams events from the relay for the given filters. */
export function useNostrReq(filters: NostrFilter[]): { events: NostrEvent[]; eose: boolean; closed: boolean } {
  const { relay } = useNostr();

  const [events, setEvents] = useState<NostrEvent[]>([]);
  const [closed, setClosed] = useState(false);
  const [eose, setEose] = useState(false);

  const controller = useRef<AbortController>(new AbortController());
  const signal = controller.current.signal;
  const value = useValue(filters);

  useEffect(() => {
    if (relay && value.length) {
      (async () => {
        for await (const msg of relay.req(value, { signal })) {
          if (msg[0] === 'EVENT') {
            setEvents((prev) => [msg[2], ...prev]);
          } else if (msg[0] === 'EOSE') {
            setEose(true);
          } else if (msg[0] === 'CLOSED') {
            setClosed(true);
            break;
          }
        }
      })();
    }

    return () => {
      controller.current.abort();
      controller.current = new AbortController();
      setEose(false);
      setClosed(false);
    };
  }, [relay, value]);

  return {
    events,
    eose,
    closed,
  };
}

/** Preserves the memory reference of a value across re-renders. */
function useValue<T>(value: T): T {
  const ref = useRef<T>(value);

  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}