import type { useUnsavedChangesGuard } from '../../app/useUnsavedChangesGuard';
import { useTranslation } from '../../i18n/Provider';
import { ConfirmDialog } from '../ConfirmDialog/ConfirmDialog';

type NavigationBlocker = ReturnType<typeof useUnsavedChangesGuard>;

export function UnsavedChangesDialog({
  blocker,
}: {
  blocker: NavigationBlocker;
}) {
  const { messages } = useTranslation();
  if (blocker.state !== 'blocked') return null;
  return (
    <ConfirmDialog
      open
      title={messages.common.discardTitle}
      body={messages.common.discardBody}
      confirmLabel={messages.common.discardConfirm}
      cancelLabel={messages.common.cancel}
      danger
      onConfirm={blocker.proceed}
      onCancel={blocker.reset}
    />
  );
}
