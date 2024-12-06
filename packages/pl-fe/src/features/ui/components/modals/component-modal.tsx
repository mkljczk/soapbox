import React from 'react';

import Modal from 'pl-fe/components/ui/modal';

import type { BaseModalProps } from '../modal-root';

interface ComponentModalProps {
  component: React.ComponentType<BaseModalProps>;
  componentProps: Record<any, any>;
}

const ComponentModal: React.FC<BaseModalProps & ComponentModalProps> = ({ onClose, component: Component, componentProps = {} }) => (
  <Modal onClose={onClose} title=''>
    <Component onClose={onClose} {...componentProps} />
  </Modal>
);

export { ComponentModal as default, type ComponentModalProps };
