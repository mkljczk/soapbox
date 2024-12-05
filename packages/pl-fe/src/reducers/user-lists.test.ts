import reducer from './user-lists';

describe('user_lists reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toMatchObject({
      group_blocks: {},
    });
  });
});
