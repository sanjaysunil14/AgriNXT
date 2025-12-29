import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    containerClassName = '',
    type,
    ...props
}, ref) => {
    const hasError = !!error;
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === 'password';
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
        <div className={containerClassName}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                {Icon && iconPosition === 'left' && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className={`h-5 w-5 ${hasError ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                )}

                <input
                    ref={ref}
                    type={inputType}
                    className={`
            block w-full rounded-lg border transition-colors
            ${Icon && iconPosition === 'left' ? 'pl-10' : 'pl-3'}
            ${isPasswordField ? 'pr-10' : Icon && iconPosition === 'right' ? 'pr-10' : 'pr-3'}
            py-2.5
            ${hasError
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                        }
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${className}
          `}
                    {...props}
                />

                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-primary-600 transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                    </button>
                )}

                {Icon && iconPosition === 'right' && !isPasswordField && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Icon className={`h-5 w-5 ${hasError ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;

