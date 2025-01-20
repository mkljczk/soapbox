import React, { useState, useEffect } from 'react';
import { useIntl, defineMessages, FormattedMessage } from 'react-intl';

import { fetchCaptcha } from 'pl-fe/actions/auth';
import Input from 'pl-fe/components/ui/input';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';

const noOp = () => {};

const messages = defineMessages({
  captcha: { id: 'registration.captcha', defaultMessage: 'Captcha' },
  placeholder: { id: 'registration.captcha.placeholder', defaultMessage: 'Enter the pictured text' },
});

interface ICaptchaField {
  name?: string;
  value: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFetch?: (captcha: Record<string, any>) => void;
  onFetchFail?: (error: Error) => void;
  onClick?: React.MouseEventHandler;
  refreshInterval?: number;
  idempotencyKey: string;
}

const CaptchaField: React.FC<ICaptchaField> = ({
  name,
  value,
  onChange = noOp,
  onFetch = noOp,
  onFetchFail = noOp,
  onClick = noOp,
  refreshInterval = 5 * 60 * 1000, // 5 minutes, Pleroma default
  idempotencyKey,
}) => {
  const dispatch = useAppDispatch();

  const [captcha, setCaptcha] = useState<Record<string, any>>({});
  const [refresh, setRefresh] = useState<NodeJS.Timeout | undefined>(undefined);

  const getCaptcha = () => {
    dispatch(fetchCaptcha()).then((captcha) => {
      setCaptcha(captcha);
      onFetch(captcha);
    }).catch((error: Error) => {
      onFetchFail(error);
    });
  };

  const startRefresh = () => {
    if (refreshInterval) {
      const newRefresh = setInterval(getCaptcha, refreshInterval);
      setRefresh(newRefresh);
    }
  };

  const endRefresh = () => {
    if (refresh) {
      clearInterval(refresh);
    }
  };

  useEffect(() => {
    getCaptcha();
    endRefresh();
    startRefresh(); // Refresh periodically

    return () => {
      endRefresh();
    };
  }, [idempotencyKey]);

  switch (captcha.type) {
    case 'native':
      return (
        <div>
          <Text>
            <FormattedMessage id='registration.captcha.hint' defaultMessage='Click the image to get a new captcha' />
          </Text>

          <NativeCaptchaField
            captcha={captcha}
            onChange={onChange}
            onClick={onClick}
            name={name}
            value={value}
          />
        </div>
      );
    case 'none':
    default:
      return null;
  }
};

interface INativeCaptchaField {
  captcha: Record<string, any>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onClick: React.MouseEventHandler;
  name?: string;
  value: string;
}

const NativeCaptchaField: React.FC<INativeCaptchaField> = ({ captcha, onChange, onClick, name, value }) => {
  const intl = useIntl();

  return (
    <Stack space={2}>
      <div className='flex w-full items-center justify-center rounded-md border border-solid border-gray-300 bg-white dark:border-gray-600'>
        <img alt={intl.formatMessage(messages.captcha)} src={captcha.url} onClick={onClick} />
      </div>

      <Input
        type='text'
        placeholder={intl.formatMessage(messages.placeholder)}
        name={name}
        value={value}
        autoComplete='off'
        autoCorrect='off'
        autoCapitalize='off'
        onChange={onChange}
        required
      />
    </Stack>
  );
};

export { CaptchaField as default };
