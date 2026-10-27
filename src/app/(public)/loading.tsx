export default function Loading() {
  return (
    <div aria-label="Đang tải nội dung" className="loading-skeleton" role="status">
      <span className="skeleton-block" />
      <span className="skeleton-block" />
      <span className="skeleton-block" />
    </div>
  );
}
