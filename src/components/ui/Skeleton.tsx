interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`rounded-md bg-[#161F2E] ${className}`}
      aria-hidden="true"
    />
  );
}
