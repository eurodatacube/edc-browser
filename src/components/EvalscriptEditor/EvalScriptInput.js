import React from 'react';
import { CodeEditor, themeEdcBrowserLight, themeEdcBrowserDark } from '@sentinel-hub/evalscript-code-editor';
import { fetchEvalscriptFromEvalscripturl } from '../../utils/evalscript';
import './EvalScriptInput.scss';
import Switch from '../shared/Switch/Switch';
export class EvalScriptInput extends React.Component {
  constructor(props) {
    super(props);
    const { evalscript, isEvalUrl, evalscripturl = '' } = props;
    this.state = {
      evalscript,
      isEvalUrl,
      evalscripturl,
      error: '',
    };
  }

  updateCode = (evalscript) => {
    this.setState({ evalscript });
  };

  onCallback = () => {
    this.props.onChange(this.state);
  };

  selectEvalMode = (isEvalUrl) => {
    this.setState({ isEvalUrl }, this.onCallback);
  };

  updateUrl = (e) => {
    this.setState({ evalscripturl: e.target.value });
  };

  onKeyDown = (e) => {
    const { evalscripturl } = this.state;
    if (!evalscripturl || evalscripturl.trim() === '') {
      return;
    }
    e.key === 'Enter' && this.loadCode();
  };

  loadCode = () => {
    const { loading, evalscripturl } = this.state;
    if (loading) return;
    this.setState({ loading: true });
    if (evalscripturl.includes('http://')) {
      return;
    }
    fetchEvalscriptFromEvalscripturl(evalscripturl)
      .then((res) => {
        const { data: text } = res;
        this.updateCode(text);
        this.setState({ loading: false, success: true }, () => {
          this.onCallback();
          setTimeout(() => this.setState({ success: false }), 2000);
        });
      })
      .catch((e) => {
        console.error(e);
        this.setState({ loading: false });
        this.setState({ error: 'Error loading script. Check your URL.' }, () => {
          setTimeout(() => this.setState({ error: null }), 3000);
        });
      });
  };

  refreshEvalscriptDisabled = () => {
    const { evalscript, evalscripturl, isEvalUrl } = this.state;
    return (isEvalUrl && !evalscripturl) || (!isEvalUrl && !evalscript);
  };

  handleRefreshClick = (e) => {
    if (this.refreshEvalscriptDisabled()) {
      return;
    }
    this.onCallback();
  };

  handleURLSubmit = () => {
    const { evalscripturl } = this.state;

    const hasWarning = evalscripturl.length > 0 && !evalscripturl.startsWith('https://');

    if (hasWarning) {
      this.setState({ error: 'Only HTTPS domains are allowed.' });
    }
  };

  render() {
    const { error, evalscript, evalscripturl, isEvalUrl } = this.state;
    return (
      <div className="custom-script-wrap">
        <div className="code-editor-wrapper" style={{ clear: 'both' }}>
          <CodeEditor
            themeLight={themeEdcBrowserLight}
            themeDark={themeEdcBrowserDark}
            value={evalscript}
            onChange={(code) => this.updateCode(code)}
            onRunEvalscriptClick={this.handleRefreshClick}
            portalId="__evalscript_code_editor"
            isReadOnly={!!isEvalUrl}
          />
        </div>
        <div style={{ padding: '5px 0px 5px 0px', fontSize: 12, marginTop: '5px' }}>
          <span className="checkbox-holder use-url">
            <Switch
              id="evalscriptUrlCB"
              onChange={(e) => this.selectEvalMode(e.target.checked)}
              checked={isEvalUrl}
              label="Load script from URL"
            />
          </span>
          {isEvalUrl && (
            <div className="insert-url-block">
              <label className="label-primary" htmlFor="">
                Evalscript URL
              </label>
              <input
                className={`input-primary ${error ? 'evalscripturl-input-error' : ''}`}
                onKeyDown={this.onKeyDown}
                disabled={!isEvalUrl}
                value={evalscripturl}
                onChange={this.updateUrl}
                onBlur={this.handleURLSubmit}
                onFocus={() => this.setState({ error: '' })}
              />
              {error && <div className="evalscripturl-input-error-text">{error}</div>}
            </div>
          )}
        </div>
        <div className="scriptBtnPanel">
          {isEvalUrl ? (
            <button
              onClick={this.loadCode}
              className="btn button-primary"
              disabled={this.refreshEvalscriptDisabled()}
            >
              Load evalscript URL
            </button>
          ) : (
            <button
              onClick={this.handleRefreshClick}
              className="btn button-primary"
              disabled={this.refreshEvalscriptDisabled()}
            >
              Run evalscript
            </button>
          )}
        </div>
      </div>
    );
  }
}
