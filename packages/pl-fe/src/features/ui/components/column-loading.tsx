import React from 'react';

import Card, { CardBody } from 'pl-fe/components/ui/card';
import Spinner from 'pl-fe/components/ui/spinner';

const ColumnLoading = () => (
  <Card variant='rounded'>
    <CardBody>
      <Spinner />
    </CardBody>
  </Card>
);

export { ColumnLoading as default };
