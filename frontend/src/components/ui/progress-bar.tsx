interface ProgressBarProps {
  percentage: number;
  className?: string;
}

export function ProgressBar({ percentage, className = "" }: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage || 0, 0), 100);
  
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 progress-bar-fill"
        data-progress={clampedPercentage}
      />
    </div>
  );
}
