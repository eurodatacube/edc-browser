import React from 'react';
import ReactDOM from 'react-dom';
import './modal.scss';
export default function Modal({ children }) {
  return ReactDOM.createPortal(
    <div className="modal">
      <div className="modal-content">{children}</div>
    </div>,
    document.querySelector('#modal-portal'),
  );
}
