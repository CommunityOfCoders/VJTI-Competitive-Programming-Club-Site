export default function Loading() {
  return (
    <div className="ld" role="status" aria-live="polite">
      <div>
        <div className="ld__bar">
          <span />
        </div>
        <p className="ld__label">Loading</p>
      </div>
    </div>
  );
}
