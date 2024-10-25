import { GroupRoles } from 'pl-api';

import { __stub } from 'pl-fe/api';
import { buildGroupMember } from 'pl-fe/jest/factory';
import { renderHook, waitFor } from 'pl-fe/jest/test-helpers';

import { useGroupMembers } from './use-group-members';

const groupMember = buildGroupMember();
const groupId = '1';

describe('useGroupMembers hook', () => {
  describe('with a successful request', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/groups/${groupId}/memberships?role=${GroupRoles.ADMIN}`).reply(200, [groupMember]);
      });
    });

    it('is successful', async () => {
      const { result } = renderHook(() => useGroupMembers(groupId, GroupRoles.ADMIN));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.groupMembers.length).toBe(1);
      expect(result.current.groupMembers[0].id).toBe(groupMember.id);
    });
  });

  describe('with an unsuccessful query', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet(`/api/v1/groups/${groupId}/memberships?role=${GroupRoles.ADMIN}`).networkError();
      });
    });

    it('is has error state', async() => {
      const { result } = renderHook(() => useGroupMembers(groupId, GroupRoles.ADMIN));

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(result.current.groupMembers.length).toBe(0);
      expect(result.current.isError).toBeTruthy();
    });
  });
});
