export default function Radio({ checked, value, onChange, label, id }) {
  return (
    <div className="radio-wrap">
      <div className={`radio-primary`}>
        {checked && <i className="fas fa-circle"></i>}
        <input id={id} checked={checked} onChange={onChange} value={value} type="radio" />
        <div className={`radio-primary-background`}></div>
      </div>
      <label className="radio-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
