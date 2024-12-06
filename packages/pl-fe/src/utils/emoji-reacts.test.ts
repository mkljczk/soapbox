import { List as ImmutableList, fromJS } from 'immutable';
import { emojiReactionSchema } from 'pl-api';
import * as v from 'valibot';

import {
  simulateEmojiReact,
  simulateUnEmojiReact,
} from './emoji-reacts';

describe('simulateEmojiReact', () => {
  it('adds the emoji to the list', () => {
    const emojiReacts = ImmutableList([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
    ].map((react) => v.parse(emojiReactionSchema, react)));
    expect(simulateEmojiReact(emojiReacts, '❤')).toEqual(fromJS([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 3, 'me': true, 'name': '❤', 'url': undefined },
    ]));
  });

  it('creates the emoji if it didn\'t already exist', () => {
    const emojiReacts = ImmutableList([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
    ].map((react) => v.parse(emojiReactionSchema, react)));
    expect(simulateEmojiReact(emojiReacts, '😯')).toEqual(fromJS([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
      { 'count': 1, 'me': true, 'name': '😯', 'url': undefined },
    ]));
  });

  it('adds a custom emoji to the list', () => {
    const emojiReacts = ImmutableList([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
    ].map((react) => v.parse(emojiReactionSchema, react)));
    expect(simulateEmojiReact(emojiReacts, 'soapbox', 'https://gleasonator.com/emoji/Gleasonator/soapbox.png')).toEqual(fromJS([
      { 'count': 2, 'me': false, 'name': '👍', 'url': undefined },
      { 'count': 2, 'me': false, 'name': '❤', 'url': undefined },
      { 'count': 1, 'me': true, 'name': 'soapbox', 'url': 'https://gleasonator.com/emoji/Gleasonator/soapbox.png' },
    ]));
  });
});

describe('simulateUnEmojiReact', () => {
  it('removes the emoji from the list', () => {
    const emojiReacts = ImmutableList([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 3, 'me': true, 'name': '❤' },
    ].map((react) => v.parse(emojiReactionSchema, react)));
    expect(simulateUnEmojiReact(emojiReacts, '❤')).toEqual(fromJS([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
    ]));
  });

  it('removes the emoji if it\'s the last one in the list', () => {
    const emojiReacts = ImmutableList([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
      { 'count': 1, 'me': true, 'name': '😯' },
    ].map((react) => v.parse(emojiReactionSchema, react)));
    expect(simulateUnEmojiReact(emojiReacts, '😯')).toEqual(fromJS([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
    ]));
  });

  it ('removes custom emoji from the list', () => {
    const emojiReacts = ImmutableList([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
      { 'count': 1, 'me': true, 'name': 'soapbox', 'url': 'https://gleasonator.com/emoji/Gleasonator/soapbox.png' },
    ].map((react) => v.parse(emojiReactionSchema, react)));
    expect(simulateUnEmojiReact(emojiReacts, 'soapbox')).toEqual(fromJS([
      { 'count': 2, 'me': false, 'name': '👍' },
      { 'count': 2, 'me': false, 'name': '❤' },
    ]));
  });
});
