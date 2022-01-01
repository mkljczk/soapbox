import React from 'react';
import { connect } from 'react-redux';
import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import ImmutablePureComponent from 'react-immutable-pure-component';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import LoadingIndicator from '../../components/loading_indicator';
import MissingIndicator from '../../components/missing_indicator';
import { fetchFavourites, fetchReactions } from '../../actions/interactions';
import { fetchStatus } from '../../actions/statuses';
import AccountContainer from '../../containers/account_container';
import Column from '../ui/components/column';
import ScrollableList from '../../components/scrollable_list';
import { makeGetStatus } from '../../selectors';

const messages = defineMessages({
  heading: { id: 'column.reactions', defaultMessage: 'Reactions' },
});

const mapStateToProps = (state, props) => {
  const getStatus = makeGetStatus();
  const status = getStatus(state, {
    id: props.params.statusId,
    username: props.params.username,
  });

  const favourites = state.getIn(['user_lists', 'favourited_by', props.params.statusId]);
  const reactions = state.getIn(['user_lists', 'reactions', props.params.statusId]);
  const allReactions = favourites && reactions && ImmutableOrderedSet(favourites ? [{ accounts: favourites, count: favourites.size, name: '👍' }] : []).union(reactions || []);

  return {
    status,
    reactions: allReactions,
    accounts: allReactions && (props.params.reaction
      ? allReactions.find(reaction => reaction.name === props.params.reaction).accounts.map(account => ({ id: account, reaction: props.params.reaction }))
      : allReactions.map(reaction => reaction.accounts.map(account => ({ id: account, reaction: reaction.name }))).flatten()),
  };
};

export default @connect(mapStateToProps)
@injectIntl
class Reactions extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  static propTypes = {
    params: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    reactions: ImmutablePropTypes.orderedSet,
    accounts: ImmutablePropTypes.orderedSet,
    status: ImmutablePropTypes.map,
  };

  fetchData = () => {
    const { dispatch, params } = this.props;
    const { statusId } = params;

    dispatch(fetchFavourites(statusId));
    dispatch(fetchReactions(statusId));
    dispatch(fetchStatus(statusId));
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const { params } = this.props;

    if (params.statusId !== prevProps.params.statusId) {
      this.fetchData();
    }
  }

  handleFilterChange = (reaction) => () => {
    const { params } = this.props;
    const { username, statusId } = params;

    this.context.router.history.replace(`/@${username}/posts/${statusId}/reactions/${reaction}`);
  };

  render() {
    const { intl, params, reactions, accounts, status } = this.props;

    if (!accounts) {
      return (
        <Column>
          <LoadingIndicator />
        </Column>
      );
    }

    if (!status) {
      return (
        <Column>
          <MissingIndicator />
        </Column>
      );
    }

    const emptyMessage = <FormattedMessage id='status.reactions.empty' defaultMessage='No one has reacted to this post yet. When someone does, they will show up here.' />;

    return (
      <Column heading={intl.formatMessage(messages.heading)}>
        {
          reactions.size > 0 && (
            <div className='reaction__filter-bar'>
              <button className={!params.reaction ? 'active' : ''} onClick={this.handleFilterChange('')}>All</button>
              {reactions?.filter(reaction => reaction.count).map(reaction => <button key={reaction.name} className={params.reaction === reaction.name ? 'active' : ''} onClick={this.handleFilterChange(reaction.name)}>{reaction.name} {reaction.count}</button>)}
            </div>
          )
        }
        <ScrollableList
          scrollKey='reactions'
          emptyMessage={emptyMessage}
        >
          {accounts.map((account) =>
            <AccountContainer key={`${account.id}-${account.reaction}`} id={account.id} withNote={false} reaction={account.reaction} />,
          )}
        </ScrollableList>
      </Column>
    );
  }

}
