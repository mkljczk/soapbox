import {
  Map as ImmutableMap,
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
} from 'immutable';
import { AnyAction } from 'redux';

import {
  FOLLOW_REQUESTS_FETCH_SUCCESS,
  FOLLOW_REQUESTS_EXPAND_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
  PINNED_ACCOUNTS_FETCH_SUCCESS,
  BIRTHDAY_REMINDERS_FETCH_SUCCESS,
} from 'pl-fe/actions/accounts';
import {
  DIRECTORY_FETCH_REQUEST,
  DIRECTORY_FETCH_SUCCESS,
  DIRECTORY_FETCH_FAIL,
  DIRECTORY_EXPAND_REQUEST,
  DIRECTORY_EXPAND_SUCCESS,
  DIRECTORY_EXPAND_FAIL,
  DirectoryAction,
} from 'pl-fe/actions/directory';
import {
  EVENT_PARTICIPATIONS_EXPAND_SUCCESS,
  EVENT_PARTICIPATIONS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS,
} from 'pl-fe/actions/events';
import { FAMILIAR_FOLLOWERS_FETCH_SUCCESS } from 'pl-fe/actions/familiar-followers';
import {
  GROUP_BLOCKS_FETCH_REQUEST,
  GROUP_BLOCKS_FETCH_SUCCESS,
  GROUP_BLOCKS_FETCH_FAIL,
  GROUP_UNBLOCK_SUCCESS,
} from 'pl-fe/actions/groups';
import {
  REBLOGS_FETCH_SUCCESS,
  REBLOGS_EXPAND_SUCCESS,
  FAVOURITES_FETCH_SUCCESS,
  FAVOURITES_EXPAND_SUCCESS,
  DISLIKES_FETCH_SUCCESS,
  REACTIONS_FETCH_SUCCESS,
} from 'pl-fe/actions/interactions';
import { NOTIFICATIONS_UPDATE } from 'pl-fe/actions/notifications';

import type { Account, Notification, PaginatedResponse } from 'pl-api';
import type { APIEntity } from 'pl-fe/types/entities';

const ListRecord = ImmutableRecord({
  next: null as (() => Promise<PaginatedResponse<Account>>) | null,
  items: ImmutableOrderedSet<string>(),
  isLoading: false,
});

const ReactionRecord = ImmutableRecord({
  accounts: ImmutableOrderedSet<string>(),
  count: 0,
  name: '',
  url: null as string | null,
});

const ReactionListRecord = ImmutableRecord({
  next: null as (() => Promise<PaginatedResponse<Reaction>>) | null,
  items: ImmutableOrderedSet<Reaction>(),
  isLoading: false,
});

const ParticipationRequestRecord = ImmutableRecord({
  account: '',
  participation_message: null as string | null,
});

const ParticipationRequestListRecord = ImmutableRecord({
  next: null as (() => Promise<PaginatedResponse<any>>) | null,
  items: ImmutableOrderedSet<ParticipationRequest>(),
  isLoading: false,
});

const ReducerRecord = ImmutableRecord({
  followers: ImmutableMap<string, List>(),
  following: ImmutableMap<string, List>(),
  reblogged_by: ImmutableMap<string, List>(),
  favourited_by: ImmutableMap<string, List>(),
  disliked_by: ImmutableMap<string, List>(),
  reactions: ImmutableMap<string, ReactionList>(),
  follow_requests: ListRecord(),
  mutes: ListRecord(),
  directory: ListRecord({ isLoading: true }),
  pinned: ImmutableMap<string, List>(),
  birthday_reminders: ImmutableMap<string, List>(),
  familiar_followers: ImmutableMap<string, List>(),
  event_participations: ImmutableMap<string, List>(),
  event_participation_requests: ImmutableMap<string, ParticipationRequestList>(),
  membership_requests: ImmutableMap<string, List>(),
  group_blocks: ImmutableMap<string, List>(),
});

type State = ReturnType<typeof ReducerRecord>;
type List = ReturnType<typeof ListRecord>;
type Reaction = ReturnType<typeof ReactionRecord>;
type ReactionList = ReturnType<typeof ReactionListRecord>;
type ParticipationRequest = ReturnType<typeof ParticipationRequestRecord>;
type ParticipationRequestList = ReturnType<typeof ParticipationRequestListRecord>;
type Items = ImmutableOrderedSet<string>;
type NestedListPath = ['followers' | 'following' | 'reblogged_by' | 'favourited_by' | 'disliked_by' | 'reactions' | 'pinned' | 'birthday_reminders' | 'familiar_followers' | 'event_participations' | 'event_participation_requests' | 'membership_requests' | 'group_blocks', string];
type ListPath = ['follow_requests' | 'mutes' | 'directory'];

const normalizeList = (state: State, path: NestedListPath | ListPath, accounts: Array<Pick<Account, 'id'>>, next?: (() => any) | null) =>
  state.setIn(path, ListRecord({
    next,
    items: ImmutableOrderedSet(accounts.map(item => item.id)),
  }));

const appendToList = (state: State, path: NestedListPath | ListPath, accounts: Array<Pick<Account, 'id'>>, next: (() => any) | null) =>
  state.updateIn(path, map => (map as List)
    .set('next', next)
    .set('isLoading', false)
    .update('items', list => (list as Items).concat(accounts.map(item => item.id))),
  );

const removeFromList = (state: State, path: NestedListPath | ListPath, accountId: string) =>
  state.updateIn(path, map =>
    (map as List).update('items', list => (list as Items).filterNot(item => item === accountId)),
  );

const normalizeFollowRequest = (state: State, notification: Notification) =>
  state.updateIn(['follow_requests', 'items'], list =>
    ImmutableOrderedSet([notification.account.id]).union(list as Items),
  );

const userLists = (state = ReducerRecord(), action: DirectoryAction | AnyAction) => {
  switch (action.type) {
    case REBLOGS_FETCH_SUCCESS:
      return normalizeList(state, ['reblogged_by', action.statusId], action.accounts, action.next);
    case REBLOGS_EXPAND_SUCCESS:
      return appendToList(state, ['reblogged_by', action.statusId], action.accounts, action.next);
    case FAVOURITES_FETCH_SUCCESS:
      return normalizeList(state, ['favourited_by', action.statusId], action.accounts, action.next);
    case FAVOURITES_EXPAND_SUCCESS:
      return appendToList(state, ['favourited_by', action.statusId], action.accounts, action.next);
    case DISLIKES_FETCH_SUCCESS:
      return normalizeList(state, ['disliked_by', action.statusId], action.accounts);
    case REACTIONS_FETCH_SUCCESS:
      return state.setIn(['reactions', action.statusId], ReactionListRecord({
        items: ImmutableOrderedSet<Reaction>(action.reactions.map(({ accounts, ...reaction }: APIEntity) => ReactionRecord({
          ...reaction,
          accounts: ImmutableOrderedSet(accounts.map((account: APIEntity) => account.id)),
        }))),
      }));
    case NOTIFICATIONS_UPDATE:
      return action.notification.type === 'follow_request' ? normalizeFollowRequest(state, action.notification) : state;
    case FOLLOW_REQUESTS_FETCH_SUCCESS:
      return normalizeList(state, ['follow_requests'], action.accounts, action.next);
    case FOLLOW_REQUESTS_EXPAND_SUCCESS:
      return appendToList(state, ['follow_requests'], action.accounts, action.next);
    case FOLLOW_REQUEST_AUTHORIZE_SUCCESS:
    case FOLLOW_REQUEST_REJECT_SUCCESS:
      return removeFromList(state, ['follow_requests'], action.accountId);
    case DIRECTORY_FETCH_SUCCESS:
      return normalizeList(state, ['directory'], action.accounts);
    case DIRECTORY_EXPAND_SUCCESS:
      return appendToList(state, ['directory'], action.accounts, null);
    case DIRECTORY_FETCH_REQUEST:
    case DIRECTORY_EXPAND_REQUEST:
      return state.setIn(['directory', 'isLoading'], true);
    case DIRECTORY_FETCH_FAIL:
    case DIRECTORY_EXPAND_FAIL:
      return state.setIn(['directory', 'isLoading'], false);
    case PINNED_ACCOUNTS_FETCH_SUCCESS:
      return normalizeList(state, ['pinned', action.accountId], action.accounts, action.next);
    case BIRTHDAY_REMINDERS_FETCH_SUCCESS:
      return normalizeList(state, ['birthday_reminders', action.accountId], action.accounts, action.next);
    case FAMILIAR_FOLLOWERS_FETCH_SUCCESS:
      return normalizeList(state, ['familiar_followers', action.accountId], action.accounts, action.next);
    case EVENT_PARTICIPATIONS_FETCH_SUCCESS:
      return normalizeList(state, ['event_participations', action.statusId], action.accounts, action.next);
    case EVENT_PARTICIPATIONS_EXPAND_SUCCESS:
      return appendToList(state, ['event_participations', action.statusId], action.accounts, action.next);
    case EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS:
      return state.setIn(['event_participation_requests', action.statusId], ParticipationRequestListRecord({
        next: action.next,
        items: ImmutableOrderedSet(action.participations.map(({ account, participation_message }: APIEntity) => ParticipationRequestRecord({
          account: account.id,
          participation_message,
        }))),
      }));
    case EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS:
      return state.updateIn(
        ['event_participation_requests', action.statusId, 'items'],
        (items) => (items as ImmutableOrderedSet<ParticipationRequest>)
          .union(action.participations.map(({ account, participation_message }: APIEntity) => ParticipationRequestRecord({
            account: account.id,
            participation_message,
          }))),
      );
    case EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS:
    case EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS:
      return state.updateIn(
        ['event_participation_requests', action.statusId, 'items'],
        items => (items as ImmutableOrderedSet<ParticipationRequest>).filter(({ account }) => account !== action.accountId),
      );
    case GROUP_BLOCKS_FETCH_SUCCESS:
      return normalizeList(state, ['group_blocks', action.groupId], action.accounts, action.next);
    case GROUP_BLOCKS_FETCH_REQUEST:
      return state.setIn(['group_blocks', action.groupId, 'isLoading'], true);
    case GROUP_BLOCKS_FETCH_FAIL:
      return state.setIn(['group_blocks', action.groupId, 'isLoading'], false);
    case GROUP_UNBLOCK_SUCCESS:
      return state.updateIn(['group_blocks', action.groupId, 'items'], list => (list as ImmutableOrderedSet<string>).filterNot(item => item === action.accountId));
    default:
      return state;
  }
};

export {
  ListRecord,
  ReducerRecord,
  userLists as default,
};
