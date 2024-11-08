import React from 'react';

import Modal from 'pl-fe/components/ui/modal';
import Spinner from 'pl-fe/components/ui/spinner';

const ModalLoading = () => (
  <Modal>
    <Spinner />
  </Modal>
);

export { ModalLoading as default };
