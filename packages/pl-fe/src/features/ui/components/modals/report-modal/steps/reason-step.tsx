import clsx from 'clsx';
import React, { useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useInstance } from 'pl-fe/api/hooks/instance/use-instance';
import FormGroup from 'pl-fe/components/ui/form-group';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import Textarea from 'pl-fe/components/ui/textarea';

import type { Account } from 'pl-fe/normalizers/account';

const messages = defineMessages({
  placeholder: { id: 'report.placeholder', defaultMessage: 'Additional comments' },
  reasonForReporting: { id: 'report.reason.title', defaultMessage: 'Reason for reporting' },
});

interface IReasonStep {
  account?: Account;
  comment: string;
  setComment: (value: string) => void;
  ruleIds: Array<string>;
  setRuleIds: (value: Array<string>) => void;
}

const RULES_HEIGHT = 385;

const ReasonStep: React.FC<IReasonStep> = ({ comment, setComment, ruleIds, setRuleIds }) => {
  const intl = useIntl();

  const rulesListRef = useRef(null);

  const [isNearBottom, setNearBottom] = useState<boolean>(false);
  const [isNearTop, setNearTop] = useState<boolean>(true);

  const { rules } = useInstance().data;
  const shouldRequireRule = rules.length > 0;

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleRuleChange = (ruleId: string) => {
    let newRuleIds;
    if (ruleIds.includes(ruleId)) newRuleIds = ruleIds.filter(id => id !== ruleId);
    else newRuleIds = [...ruleIds, ruleId];
    setRuleIds(newRuleIds);
  };

  const handleRulesScrolling = () => {
    if (rulesListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = rulesListRef.current;

      if (scrollTop + clientHeight > scrollHeight - 24) {
        setNearBottom(true);
      } else {
        setNearBottom(false);
      }

      if (scrollTop < 24) {
        setNearTop(true);
      } else {
        setNearTop(false);
      }
    }
  };

  useEffect(() => {
    if (rules.length > 0 && rulesListRef.current) {
      const { clientHeight } = rulesListRef.current;

      if (clientHeight <= RULES_HEIGHT) {
        setNearBottom(true);
      }
    }
  }, [rules, rulesListRef.current]);

  return (
    <Stack space={4}>
      {shouldRequireRule && (
        <Stack space={2}>
          <Text size='xl' weight='semibold' tag='h1'>
            {intl.formatMessage(messages.reasonForReporting)}
          </Text>

          <div className='relative'>
            <div
              style={{ maxHeight: RULES_HEIGHT }}
              className='-space-y-px overflow-y-auto rounded-lg'
              onScroll={handleRulesScrolling}
              ref={rulesListRef}
            >
              {rules.map((rule, idx) => {
                const isSelected = ruleIds.includes(rule.id);

                return (
                  <button
                    key={idx}
                    data-testid={`rule-${rule.id}`}
                    onClick={() => handleRuleChange(rule.id)}
                    className={clsx({
                      'relative border border-solid border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-primary-800/30 text-start w-full p-4 flex justify-between items-center cursor-pointer': true,
                      'rounded-tl-lg rounded-tr-lg': idx === 0,
                      'rounded-bl-lg rounded-br-lg': idx === rules.length - 1,
                      'bg-gray-200 hover:bg-gray-200 dark:bg-primary-800/50': isSelected,
                    })}
                  >
                    <Stack className='mr-3'>
                      <Text
                        tag='span'
                        size='sm'
                        weight='medium'
                        theme={isSelected ? 'primary' : 'default'}
                      >
                        {rule.text}
                      </Text>
                      <Text tag='span' theme='muted' size='sm'>{rule.hint}</Text>
                    </Stack>

                    <input
                      name='reason'
                      type='checkbox'
                      value={rule.id}
                      checked={isSelected}
                      readOnly
                      className='size-4 rounded border-2 border-gray-300 text-primary-600 checked:bg-primary-500 focus:ring-primary-500 dark:border-gray-800 dark:bg-gray-900 dark:checked:bg-primary-500 dark:focus:ring-primary-500'
                    />
                  </button>
                );
              })}
            </div>

            <div
              className={clsx('pointer-events-none absolute inset-x-0 top-0 flex justify-center rounded-t-lg bg-gradient-to-b from-white pb-12 pt-8 transition-opacity duration-500 dark:from-gray-900', {
                'opacity-0': isNearTop,
                'opacity-100': !isNearTop,
              })}
            />
            <div
              className={clsx('pointer-events-none absolute inset-x-0 bottom-0 flex justify-center rounded-b-lg bg-gradient-to-t from-white pb-8 pt-12 transition-opacity duration-500 dark:from-gray-900', {
                'opacity-0': isNearBottom,
                'opacity-100': !isNearBottom,
              })}
            />
          </div>
        </Stack>
      )}

      <FormGroup labelText={intl.formatMessage(messages.placeholder)}>
        <Textarea
          placeholder={intl.formatMessage(messages.placeholder)}
          value={comment}
          onChange={handleCommentChange}
        />
      </FormGroup>
    </Stack>
  );
};

export { ReasonStep as default };
