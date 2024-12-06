import React from 'react';
import toast from 'react-hot-toast';
import { defineMessages, MessageDescriptor } from 'react-intl';

import Toast from './components/ui/toast';
import { httpErrorMessages } from './utils/errors';

import type { PlfeResponse } from './api';

type ToastText = string | MessageDescriptor
type ToastType = 'success' | 'error' | 'info'

interface IToastOptions {
  action?(): void;
  actionLink?: string;
  actionLabel?: ToastText;
  duration?: number;
  summary?: string;
}

const DEFAULT_DURATION = 4000;

const createToast = (type: ToastType, message: ToastText, opts?: IToastOptions) => {
  const duration = opts?.duration || DEFAULT_DURATION;

  toast.custom((t) => <Toast t={t} message={message} type={type} {...opts} />, {
    duration,
  });
};

const info = (message: ToastText, opts?: IToastOptions) =>
  createToast('info', message, opts);

const success = (message: ToastText, opts?: IToastOptions) =>
  createToast('success', message, opts);

const error = (message: ToastText, opts?: IToastOptions) =>
  createToast('error', message, opts);

const messages = defineMessages({
  unexpectedMessage: { id: 'alert.unexpected.message', defaultMessage: 'Something went wrong.' },
});

const showAlertForError = (networkError: { response: PlfeResponse }) => {
  if (networkError?.response) {
    const { json, status, statusText } = networkError.response;

    if (status === 502) {
      return error('The server is down');
    }

    if (status === 404 || status === 410) {
      // Skip these errors as they are reflected in the UI
      return null;
    }

    let message: string | undefined = statusText;

    if (json?.error) {
      message = json.error;
    }

    if (!message) {
      message = httpErrorMessages.find((httpError) => httpError.code === status)?.description;
    }

    if (message) {
      return error(message);
    }
  } else {
    console.error(networkError);
    return error(messages.unexpectedMessage);
  }
};

export {
  type ToastText,
  type IToastOptions,
  type ToastType,
};

export default {
  info,
  success,
  error,
  showAlertForError,
};
