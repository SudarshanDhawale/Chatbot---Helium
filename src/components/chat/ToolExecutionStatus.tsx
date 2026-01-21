/**
 * Tool execution status component - displays when a tool/command is running or completed
 */

'use client';

interface ToolExecutionStatusProps {
  toolName: string;
  description?: string;
  status?: 'running' | 'completed' | 'failed';
}

export function ToolExecutionStatus({ toolName, description, status = 'running' }: ToolExecutionStatusProps) {
  const displayText = description || `${toolName} is running...`;
  
  // Different styles based on status
  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';

  return (
    <div 
      className={`inline-flex items-center gap-3 rounded-full px-4 py-3 transition-all duration-300 ${
        isRunning 
          ? 'bg-navy-800/60 border border-navy-700' 
          : isCompleted
          ? 'bg-navy-800/40 border border-navy-700/50'
          : 'bg-red-900/20 border border-red-800/50'
      }`}
    >
      {/* Icon in rounded square frame */}
      <div className={`flex-shrink-0 w-8 h-8 border rounded-lg flex items-center justify-center ${
        isRunning 
          ? 'border-navy-700' 
          : isCompleted
          ? 'border-navy-700/50'
          : 'border-red-700/50'
      }`}>
        {isRunning ? (
          <svg
            className="w-4 h-4 text-text-secondary animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            {/* Dashed circular spinner */}
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="3 4"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        ) : isCompleted ? (
          <svg
            className="w-4 h-4 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>
      
      {/* Text */}
      <span className={`text-sm font-semibold whitespace-nowrap ${
        isRunning 
          ? 'text-text-secondary' 
          : isCompleted
          ? 'text-text-muted'
          : 'text-red-300'
      }`}>
        {displayText}
      </span>
    </div>
  );
}
