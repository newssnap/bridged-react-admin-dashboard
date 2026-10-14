import React from 'react';
import { Badge } from '@/components/badge';
import { getCustomWorkStatus } from '../constants/customWork';
import { hasValue } from '../utils/creditFormat';

/** Status of a custom work entry; "—" when it has none. */
function CustomWorkStatusBadge({ status }) {
  const meta = getCustomWorkStatus(status);
  if (meta) return <Badge variant={meta.variant}>{meta.label}</Badge>;
  if (hasValue(status)) return <Badge variant="outline">{status}</Badge>;
  return <span className="text-muted-foreground">—</span>;
}

export default CustomWorkStatusBadge;
