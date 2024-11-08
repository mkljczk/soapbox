import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { blockAccount } from 'pl-fe/actions/accounts';
import { submitReport, submitReportSuccess, submitReportFail, ReportableEntities } from 'pl-fe/actions/reports';
import { fetchAccountTimeline } from 'pl-fe/actions/timelines';
import { useAccount } from 'pl-fe/api/hooks/accounts/use-account';
import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import StatusContent from 'pl-fe/components/status-content';
import Modal from 'pl-fe/components/ui/modal';
import ProgressBar from 'pl-fe/components/ui/progress-bar';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useInstance } from 'pl-fe/hooks/use-instance';

import ConfirmationStep from './steps/confirmation-step';
import OtherActionsStep from './steps/other-actions-step';
import ReasonStep from './steps/reason-step';

import type { BaseModalProps } from '../../modal-root';

const messages = defineMessages({
  blankslate: { id: 'report.reason.blankslate', defaultMessage: 'You have removed all statuses from being selected.' },
  done: { id: 'report.done', defaultMessage: 'Done' },
  next: { id: 'report.next', defaultMessage: 'Next' },
  submit: { id: 'report.submit', defaultMessage: 'Submit' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
  previous: { id: 'report.previous', defaultMessage: 'Previous' },
});

enum Steps {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
}

const reportSteps = {
  ONE: ReasonStep,
  TWO: OtherActionsStep,
  THREE: ConfirmationStep,
};

const SelectedStatus = ({ statusId }: { statusId: string }) => {
  const status = useAppSelector((state) => state.statuses[statusId]);

  if (!status) {
    return null;
  }

  return (
    <Stack space={2} className='rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
      <AccountContainer
        id={status.account_id}
        showAccountHoverCard={false}
        withLinkToProfile={false}
        timestamp={status.created_at}
        hideActions
      />

      <StatusContent status={status} />

      {status.media_attachments.length > 0 && (
        <AttachmentThumbs status={status} />
      )}
    </Stack>
  );
};

interface ReportModalProps {
  accountId: string;
  entityType: ReportableEntities;
  statusIds: Array<string>;
}

const ReportModal: React.FC<BaseModalProps & ReportModalProps> = ({ onClose, accountId, entityType, statusIds }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { account } = useAccount(accountId || undefined);

  const [block, setBlock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { rules } = useInstance();
  const [ruleIds, setRuleIds] = useState<Array<string>>([]);
  const [selectedStatusIds, setSelectedStatusIds] = useState(statusIds);
  const [comment, setComment] = useState('');
  const [forward, setForward] = useState(false);

  const shouldRequireRule = rules.length > 0;

  const isReportingAccount = entityType === ReportableEntities.ACCOUNT;
  const isReportingStatus = entityType === ReportableEntities.STATUS;

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.ONE);

  const handleSubmit = () => {
    setIsSubmitting(true);

    dispatch(submitReport(accountId, selectedStatusIds, [...ruleIds], comment, forward))
      .then(() => {
        setIsSubmitting(false);
        setCurrentStep(Steps.THREE);
      })
      .catch((error) => {
        setIsSubmitting(false);
        dispatch(submitReportFail(error));
      });

    if (block && account) {
      dispatch(blockAccount(account.id));
    }
  };

  const renderSelectedStatuses = useCallback(() => {
    switch (selectedStatusIds.length) {
      case 0:
        return (
          <div className='flex w-full items-center justify-center rounded-lg bg-gray-100 p-4 dark:bg-gray-800'>
            <Text theme='muted'>{intl.formatMessage(messages.blankslate)}</Text>
          </div>
        );
      default:
        return <SelectedStatus statusId={selectedStatusIds[0]} />;
    }
  }, [selectedStatusIds.length]);

  const cancelText = useMemo(() => {
    switch (currentStep) {
      case Steps.ONE:
        return intl.formatMessage(messages.cancel);
      default:
        return intl.formatMessage(messages.previous);
    }
  }, [currentStep]);

  const cancelAction = () => {
    switch (currentStep) {
      case Steps.ONE:
        onClose('REPORT');
        break;
      case Steps.TWO:
        setCurrentStep(Steps.ONE);
        break;
      default:
        break;
    }
  };

  const confirmationText = useMemo(() => {
    switch (currentStep) {
      case Steps.ONE:
        return intl.formatMessage(messages.next);
      case Steps.TWO:
        return intl.formatMessage(messages.submit);
      case Steps.THREE:
        return intl.formatMessage(messages.done);
      default:
        return intl.formatMessage(messages.next);
    }
  }, [currentStep]);

  const handleNextStep = () => {
    switch (currentStep) {
      case Steps.ONE:
        setCurrentStep(Steps.TWO);
        break;
      case Steps.TWO:
        handleSubmit();
        break;
      case Steps.THREE:
        dispatch(submitReportSuccess());
        onClose('REPORT');
        break;
      default:
        break;
    }
  };

  const renderSelectedEntity = () => {
    if (entityType === ReportableEntities.STATUS) return renderSelectedStatuses();
    return null;
  };

  const renderTitle = () => (
    <FormattedMessage id='report.target' defaultMessage='Reporting {target}' values={{ target: <strong>@{account?.acct}</strong> }} />
  );

  const isConfirmationButtonDisabled = useMemo(() => {
    if (currentStep === Steps.THREE) {
      return false;
    }

    return isSubmitting || (shouldRequireRule && ruleIds.length === 0) || (isReportingStatus && selectedStatusIds.length === 0);
  }, [currentStep, isSubmitting, shouldRequireRule, ruleIds.length, selectedStatusIds.length, isReportingStatus]);

  const calculateProgress = useCallback(() => {
    switch (currentStep) {
      case Steps.ONE:
        return 0.33;
      case Steps.TWO:
        return 0.66;
      case Steps.THREE:
        return 1;
      default:
        return 0;
    }
  }, [currentStep]);

  useEffect(() => {
    if (account?.id) {
      dispatch(fetchAccountTimeline(account.id, { exclude_replies: false }));
    }
  }, [account?.id]);

  if (!account) {
    return null;
  }

  const StepToRender = reportSteps[currentStep];

  return (
    <Modal
      title={renderTitle()}
      onClose={onClose}
      cancelText={cancelText}
      cancelAction={currentStep === Steps.THREE ? undefined : cancelAction}
      confirmationAction={handleNextStep}
      confirmationText={confirmationText}
      confirmationDisabled={isConfirmationButtonDisabled}
      skipFocus
    >
      <Stack space={4}>
        <ProgressBar progress={calculateProgress()} />

        {(currentStep !== Steps.THREE && !isReportingAccount) && renderSelectedEntity()}

        {StepToRender && (
          <StepToRender
            account={account}
            selectedStatusIds={selectedStatusIds}
            setSelectedStatusIds={setSelectedStatusIds}
            block={block}
            setBlock={setBlock}
            forward={forward}
            setForward={setForward}
            comment={comment}
            setComment={setComment}
            ruleIds={ruleIds}
            setRuleIds={setRuleIds}
            isSubmitting={isSubmitting}
          />
        )}
      </Stack>
    </Modal>
  );
};

export { ReportModal as default, type ReportModalProps };
