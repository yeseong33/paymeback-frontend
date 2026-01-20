import React from 'react';
import clsx from 'clsx';

const Input = ({
  label,
  error,
  shake = false,
  className = '',
  ...props
}) => {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
    'bg-white dark:bg-gray-700',
    'border-gray-300 dark:border-gray-600',
    'text-gray-900 dark:text-white',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'focus:ring-primary-500 dark:focus:ring-primary-400',
    'focus:border-primary-500 dark:focus:border-primary-400',
    {
      'border-red-500 dark:border-red-400 ring-2 ring-red-500/20 dark:ring-red-400/20 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400': error,
      'animate-shake': shake
    },
    className
  );

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input 
        className={inputClasses}
        {...props}
      />
      {error && (
        <div className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;