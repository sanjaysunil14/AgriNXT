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
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                    {label}
                </label>
            )}

            <div className="relative group">
                {Icon && iconPosition === 'left' && (
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Icon className={`h-5 w-5 transition-colors duration-200 ${hasError ? 'text-red-400' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                    </div>
                )}

                <input
                    ref={ref}
                    type={inputType}
                    className={`
            block w-full rounded-xl border transition-all duration-200
            ${Icon && iconPosition === 'left' ? 'pl-11' : 'pl-4'}
            ${isPasswordField ? 'pr-11' : Icon && iconPosition === 'right' ? 'pr-11' : 'pr-4'}
            py-3 bg-white
            text-gray-900 font-medium placeholder-gray-400
            ${hasError
                            ? 'border-red-300 focus:ring-4 focus:ring-red-100 focus:border-red-500'
                            : 'border-gray-200 hover:border-emerald-300 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500'
                        }
            disabled:bg-gray-50 disabled:cursor-not-allowed
            shadow-sm
            ${className}
          `}
                    {...props}
                />

                {isPasswordField && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer transition-colors"
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-emerald-600" />
                        )}
                    </button>
                )}

                {Icon && iconPosition === 'right' && !isPasswordField && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                        <Icon className={`h-5 w-5 transition-colors duration-200 ${hasError ? 'text-red-400' : 'text-gray-400 group-hover:text-emerald-500'}`} />
                    </div>
                )}
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

Input.displayName = 'Input';

export default Input;