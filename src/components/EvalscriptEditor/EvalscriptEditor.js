import React from 'react';

import { BandsToRGB } from './BandsToRGB/BandsToRGB';
import { EvalScriptInput } from './EvalScriptInput';
import Accordion from '../../components/Accordion/Accordion';
import { IndexBands } from './BandsToRGB/IndexBands';
import { withRouter } from 'react-router-dom';

import './EvalscriptEditor.scss';

export const CUSTOM_VISUALIZATION_URL_ROUTES = ['#custom-composite', '#custom-index', '#custom-script'];
class EvalscriptEditor extends React.Component {
  state = {
    openAccordion: 0, // composite accordion displayed by default
  };

  toggleAccordion = (index) => {
    if (index !== this.state.openAccordion) {
      this.setState({ openAccordion: index });
      window.location.hash = CUSTOM_VISUALIZATION_URL_ROUTES[index];
    } else {
      this.setState({ openAccordion: null });
    }
  };

  initAccordion = () => {
    const hashIndex = CUSTOM_VISUALIZATION_URL_ROUTES.indexOf(this.props.location.hash);
    if (hashIndex !== -1) {
      this.setState({ openAccordion: hashIndex });
    }
  };

  componentDidMount() {
    if (this.props.location.hash) {
      this.initAccordion();
    } else {
      window.location.hash = CUSTOM_VISUALIZATION_URL_ROUTES[this.state.openAccordion];
    }
  }

  componentWillUnmount() {
    window.location.hash = '';
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.hash !== prevProps.location.hash) {
      this.initAccordion();
    }
  }

  onCompositeChange = (newBand, index) => {
    const newBands = [...this.props.selectedBands];
    newBands[index] = newBand;
    this.props.onChange(newBands);
  };

  render() {
    const {
      allBands,
      evalscript,
      evalscriptUrl,
      onBack,
      selectedBands,
      onSetEvalscript,
      onIndexScriptChange,
    } = this.props;

    return allBands.length > 0 ? (
      <div className="advancedPanel">
        <div className="header">
          <div onClick={onBack} className="back-button button-primary">
            <i className="fa fa-arrow-left" />
            Close
          </div>
        </div>
        <Accordion
          open={this.state.openAccordion === 0}
          title="Composite"
          toggleOpen={() => this.toggleAccordion(0)}
        >
          <BandsToRGB bands={allBands} selectedBands={selectedBands} onChange={this.onCompositeChange} />
        </Accordion>

        <Accordion
          open={this.state.openAccordion === 1}
          title="Index"
          toggleOpen={() => this.toggleAccordion(1)}
        >
          <IndexBands bands={allBands} onChange={onIndexScriptChange} evalscript={evalscript} />
        </Accordion>

        <Accordion
          open={this.state.openAccordion === 2}
          title="Custom script"
          toggleOpen={() => this.toggleAccordion(2)}
        >
          <EvalScriptInput
            evalscript={evalscript}
            evalscripturl={window.decodeURIComponent(evalscriptUrl || '')}
            isEvalUrl={!!evalscriptUrl}
            onChange={onSetEvalscript}
          />
        </Accordion>
      </div>
    ) : (
      <div />
    );
  }
}

export default withRouter(EvalscriptEditor);
