import React from 'react';

interface TimeRangeSelectorProps {
  value: '1h' | '24h' | '7d' | '30d';
  onChange: (range: '1h' | '24h' | '7d' | '30d') => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ value, onChange }) => {
  const timeRanges = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
  ] as const;

  return (
    <div className="inline-flex rounded-md shadow-sm">
      {timeRanges.map((range, index) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-4 py-2 text-sm font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 ${
            index === 0 ? 'rounded-l-md' : ''
          } ${index === timeRanges.length - 1 ? 'rounded-r-md' : ''} ${
            value === range.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
};

export default TimeRangeSelector; 