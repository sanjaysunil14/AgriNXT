import { forwardRef } from 'react';

const Select = forwardRef(({
    label,
    error,
    icon: Icon,
    className = '',
    containerClassName = '',
    options = [],
    placeholder = 'Select an option',
    ...props
}, ref) => {
    const hasError = !!error;

    return (
        <div className={containerClassName}>
            {label && (
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                    {label}
                </label>
            )}

            <div className="relative group">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                        <Icon className={`h-5 w-5 transition-colors duration-200 ${hasError ? 'text-red-400' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                    </div>
                )}

                <select
                    ref={ref}
                    className={`
            block w-full rounded-xl border transition-all duration-200
            ${Icon ? 'pl-11' : 'pl-4'}
            pr-10 py-3 bg-white
            text-gray-900 font-medium
            ${hasError
                            ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500'
                            : 'border-gray-200 hover:border-emerald-300 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500'
                        }
            disabled:bg-gray-50 disabled:cursor-not-allowed
            shadow-sm
            appearance-none
            ${className}
          `}
                    {...props}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {error}
                </p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
