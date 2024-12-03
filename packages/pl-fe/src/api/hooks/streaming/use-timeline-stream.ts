import { useEffect, useRef } from 'react';

import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useClient } from 'pl-fe/hooks/use-client';
import { useInstance } from 'pl-fe/hooks/use-instance';
import { getAccessToken } from 'pl-fe/utils/auth';

import type { StreamingEvent } from 'pl-api';

const useTimelineStream = (stream: string, params: { list?: string; tag?: string } = {}, enabled = true, listener?: (event: StreamingEvent) => any) => {
  const firstUpdate = useRef(true);

  const client = useClient();

  const instance = useInstance();
  const socket = useRef<({
    listen: (listener: any, stream?: string) => number;
    unlisten: (listener: any) => void;
    subscribe: (stream: string, params?: {
        list?: string;
        tag?: string;
    }) => void;
    unsubscribe: (stream: string, params?: {
        list?: string;
        tag?: string;
    }) => void;
    close: () => void;
  }) | null>(null);

  const accessToken = useAppSelector(getAccessToken);
  const streamingUrl = instance.configuration.urls.streaming;

  const connect = async () => {
    if (!socket.current && streamingUrl) {
      socket.current = client.streaming.connect();

      socket.current.subscribe(stream, params);
      if (listener) socket.current.listen(listener);
    }
  };

  const disconnect = () => {
    if (socket.current) {
      socket.current.close();
      socket.current = null;
    }
  };

  useEffect(() => {
    socket.current?.subscribe(stream, params);

    return () => socket.current?.unsubscribe(stream, params);
  }, [stream, params.list, params.tag, enabled]);

  useEffect(() => {
    if (enabled) {
      connect();

      return () => {
        if (listener) socket.current?.unlisten(listener);
      };
    }
  }, [enabled]);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      disconnect();
      connect();

      return () => {
        if (listener) socket.current?.unlisten(listener);
      };
    }
  }, [accessToken, streamingUrl]);

  useEffect(() => {
    if (!enabled) {
      disconnect();
    }
  }, [enabled]);

  return {
    disconnect,
  };
};

export { useTimelineStream };
