import React, { PureComponent } from 'react';

export class Button extends PureComponent {
  static defaultProps = {
    content: 'primary',
  };
  render() {
    const {
      text,
      icon,
      loading,
      fluid,
      onClick,
      onDisabledClick,
      disabled,
      className,
      content,
      progress = null,
      ...rest
    } = this.props;
    return (
      <button
        className={`button-${content} ${className || ''} ${fluid ? 'fluid' : ''} `}
        onClick={!disabled ? onClick : onDisabledClick}
        disabled={disabled}
        {...rest}
      >
        {loading ? (
          <>
            <i className="fa fa-spinner fa-spin fa-fw" />
            {progress !== null ? <span className="progress">{progress}%</span> : ''}
          </>
        ) : (
          <>
            {icon && <i className={`fa fa-${icon}`} />}
            {text}
          </>
        )}
      </button>
    );
  }
}
