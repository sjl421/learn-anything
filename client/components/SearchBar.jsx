import { Component } from 'react';
import { connect } from 'react-redux';
import Autosuggest from 'react-autosuggest';

import { fetchSuggestions, clearSuggestions, updateQuery, clearQuery } from 'actions/Search';
// import { showUnmatched } from 'actions/Dialog';
import fetchMap from 'actions/fetchMap';
import 'sass/_SearchBar.sass';

import UnmatchedDialog from './dialogs/UnmatchedDialog';


// Functions for react-autosuggest component.
const renderSuggestion = ({ key }) => (<div className="searchbar-suggestion">{key}</div>);
const getSuggestionValue = suggestion => suggestion.key;

@connect(store => ({
  title: store.map.title,
  query: store.search.query,
  suggestions: store.search.suggestions,
  placeholder: store.search.placeholder,
}))
export default class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = { unmatchedDialog: false };

    // Bind component methods.
    this.onInputChange = this.onInputChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.dismissUnmatchedDialog = this.dismissUnmatchedDialog.bind(this);
  }

  dismissUnmatchedDialog() {
    this.setState({ unmatchedDialog: false });
    this.props.dispatch(clearQuery());
  }

  onInputChange(event) {
    this.props.dispatch(updateQuery(event.target.value));
  }

  onFormSubmit(event) {
    // Prevent from submitting form.
    event.preventDefault();

    // You haven't written anything; fetch random map indicated on placeholder
    // and get new placeholder.
    if (this.props.query === '') {
      this.props.dispatch(fetchMap(this.props.placeholder.id));
      this.props.dispatch(fetchSuggestions());
      return;
    }

    // There's no suggestion for what you're searching; show unmatched dialog.
    if (this.props.suggestions.length === 0) {
      this.setState({ unmatchedDialog: true });
    }
  }

  onSuggestionSelected(event, { suggestion }) {
    // Prevent from submitting form if suggestion is
    // selected pressing enter.
    event.preventDefault();

    this.props.dispatch(fetchMap(suggestion.id));
    this.props.dispatch(clearQuery());
  }

  onSuggestionsFetchRequested({ value }) {
    this.props.dispatch(fetchSuggestions(value));
  }

  onSuggestionsClearRequested() {
    this.props.dispatch(clearSuggestions());
  }

  render() {
    // If there's no placeholder, fetch it.
    if (this.props.placeholder.id === '') {
      this.props.dispatch(fetchSuggestions());
    }

    // Props for input field on autosuggest.
    const inputProps = {
      autoFocus: true,
      value: this.props.query,
      onChange: this.onInputChange,
      placeholder: this.props.placeholder.key,
    };

    let formClassName = 'searchbar-container';

    // If not on main page show the searchbar in exploring mode.
    if (this.props.title !== '') {
      formClassName += ' searchbar-container--exploring';
    }

    return (
      <form className={formClassName} onSubmit={this.onFormSubmit}>
        <Autosuggest
          inputProps={inputProps}
          renderSuggestion={renderSuggestion}
          highlightFirstSuggestion={true}
          suggestions={this.props.suggestions}
          getSuggestionValue={getSuggestionValue}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
        />

        <p className="helpText">
          Press Enter to open our randomly suggested map.<br/>
          Start writing to get a list of existing topics.
        </p>

        <UnmatchedDialog
          onReject={this.dismissUnmatchedDialog}
          visible={this.state.unmatchedDialog}
          query={this.props.query}
        />
      </form>
    );
  }
}
