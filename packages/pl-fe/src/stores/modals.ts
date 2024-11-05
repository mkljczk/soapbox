import { produce } from 'immer';
import { create } from 'zustand';

import type { ICryptoAddress } from 'pl-fe/features/crypto-donate/components/crypto-address';
import type { ModalType } from 'pl-fe/features/ui/components/modal-root';
import type { AccountModerationModalProps } from 'pl-fe/features/ui/components/modals/account-moderation-modal';
import type { BoostModalProps } from 'pl-fe/features/ui/components/modals/boost-modal';
import type { CompareHistoryModalProps } from 'pl-fe/features/ui/components/modals/compare-history-modal';
import type { ComponentModalProps } from 'pl-fe/features/ui/components/modals/component-modal';
import type { ComposeModalProps } from 'pl-fe/features/ui/components/modals/compose-modal';
import type { ConfirmationModalProps } from 'pl-fe/features/ui/components/modals/confirmation-modal';
import type { DislikesModalProps } from 'pl-fe/features/ui/components/modals/dislikes-modal';
import type { DropdownMenuModalProps } from 'pl-fe/features/ui/components/modals/dropdown-menu-modal';
import type { EditAnnouncementModalProps } from 'pl-fe/features/ui/components/modals/edit-announcement-modal';
import type { EditBookmarkFolderModalProps } from 'pl-fe/features/ui/components/modals/edit-bookmark-folder-modal';
import type { EditDomainModalProps } from 'pl-fe/features/ui/components/modals/edit-domain-modal';
import type { EditFederationModalProps } from 'pl-fe/features/ui/components/modals/edit-federation-modal';
import type { EditRuleModalProps } from 'pl-fe/features/ui/components/modals/edit-rule-modal';
import type { EmbedModalProps } from 'pl-fe/features/ui/components/modals/embed-modal';
import type { EventMapModalProps } from 'pl-fe/features/ui/components/modals/event-map-modal';
import type { EventParticipantsModalProps } from 'pl-fe/features/ui/components/modals/event-participants-modal';
import type { FamiliarFollowersModalProps } from 'pl-fe/features/ui/components/modals/familiar-followers-modal';
import type { FavouritesModalProps } from 'pl-fe/features/ui/components/modals/favourites-modal';
import type { JoinEventModalProps } from 'pl-fe/features/ui/components/modals/join-event-modal';
import type { ListAdderModalProps } from 'pl-fe/features/ui/components/modals/list-adder-modal';
import type { ListEditorModalProps } from 'pl-fe/features/ui/components/modals/list-editor-modal';
import type { MediaModalProps } from 'pl-fe/features/ui/components/modals/media-modal';
import type { MentionsModalProps } from 'pl-fe/features/ui/components/modals/mentions-modal';
import type { MissingDescriptionModalProps } from 'pl-fe/features/ui/components/modals/missing-description-modal';
import type { ReactionsModalProps } from 'pl-fe/features/ui/components/modals/reactions-modal';
import type { ReblogsModalProps } from 'pl-fe/features/ui/components/modals/reblogs-modal';
import type { ReplyMentionsModalProps } from 'pl-fe/features/ui/components/modals/reply-mentions-modal';
import type { ReportModalProps } from 'pl-fe/features/ui/components/modals/report-modal';
import type { SelectBookmarkFolderModalProps } from 'pl-fe/features/ui/components/modals/select-bookmark-folder-modal';
import type { TextFieldModalProps } from 'pl-fe/features/ui/components/modals/text-field-modal';
import type { UnauthorizedModalProps } from 'pl-fe/features/ui/components/modals/unauthorized-modal';
import type { VideoModalProps } from 'pl-fe/features/ui/components/modals/video-modal';

type OpenModalProps =
  | [type: 'ACCOUNT_MODERATION', props: AccountModerationModalProps]
  | [type: 'BIRTHDAYS' | 'CREATE_GROUP' | 'HOTKEYS']
  | [type: 'BOOST', props: BoostModalProps]
  | [type: 'COMPARE_HISTORY', props: CompareHistoryModalProps]
  | [type: 'COMPONENT', props: ComponentModalProps]
  | [type: 'COMPOSE', props?: ComposeModalProps]
  | [type: 'CONFIRM', props: ConfirmationModalProps]
  | [type: 'CRYPTO_DONATE', props: ICryptoAddress]
  | [type: 'DISLIKES', props: DislikesModalProps]
  | [type: 'DROPDOWN_MENU', props: DropdownMenuModalProps]
  | [type: 'EDIT_ANNOUNCEMENT', props?: EditAnnouncementModalProps]
  | [type: 'EDIT_BOOKMARK_FOLDER', props: EditBookmarkFolderModalProps]
  | [type: 'EDIT_DOMAIN', props?: EditDomainModalProps]
  | [type: 'EDIT_FEDERATION', props: EditFederationModalProps]
  | [type: 'EDIT_RULE', props?: EditRuleModalProps]
  | [type: 'EMBED', props: EmbedModalProps]
  | [type: 'EVENT_MAP', props: EventMapModalProps]
  | [type: 'EVENT_PARTICIPANTS', props: EventParticipantsModalProps]
  | [type: 'FAMILIAR_FOLLOWERS', props: FamiliarFollowersModalProps]
  | [type: 'FAVOURITES', props: FavouritesModalProps]
  | [type: 'JOIN_EVENT', props: JoinEventModalProps]
  | [type: 'LIST_ADDER', props: ListAdderModalProps]
  | [type: 'LIST_EDITOR', props: ListEditorModalProps]
  | [type: 'MEDIA', props: MediaModalProps]
  | [type: 'MENTIONS', props: MentionsModalProps]
  | [type: 'MISSING_DESCRIPTION', props: MissingDescriptionModalProps]
  | [type: 'MUTE']
  | [type: 'REACTIONS', props: ReactionsModalProps]
  | [type: 'REBLOGS', props: ReblogsModalProps]
  | [type: 'REPLY_MENTIONS', props: ReplyMentionsModalProps]
  | [type: 'REPORT', props: ReportModalProps]
  | [type: 'SELECT_BOOKMARK_FOLDER', props: SelectBookmarkFolderModalProps]
  | [type: 'TEXT_FIELD', props: TextFieldModalProps]
  | [type: 'UNAUTHORIZED', props?: UnauthorizedModalProps]
  | [type: 'VIDEO', props: VideoModalProps];

type Modals = Array<{
  modalType: ModalType;
  modalProps?: Record<string, any>;
}>;

type State = {
  modals: Modals;
  /** Open a modal of the given type */
  openModal: (...[modalType, modalProps]: OpenModalProps) => void;
  /** Close the modal */
  closeModal: (modalType?: ModalType) => void;
};

const useModalsStore = create<State>((set) => ({
  modals: [],
  openModal: (...[modalType, modalProps]) => set(produce((state: State) => {
    state.modals.push({ modalType, modalProps });
  })),
  closeModal: (modalType) => set(produce((state: State) => {
    if (state.modals.length === 0) {
      return;
    }
    if (modalType === undefined) {
      state.modals = state.modals.slice(0, -1);
    } else if (state.modals.some((modal) => modalType === modal.modalType)) {
      state.modals = state.modals.slice(0, state.modals.findLastIndex((modal) => modalType === modal.modalType));
    }
  })),
}));

export { useModalsStore };
