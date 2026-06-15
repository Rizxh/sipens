export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  }[size] ?? 'h-8 w-8 border-[3px]';

  return (
    <div
      className={`inline-block animate-spin rounded-full border-brand-200 border-t-brand-600 ${sizeClass} ${className}`}
      role="status"
      aria-label="Memuat"
    />
  );
}
