import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/30',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
        outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-4 py-2.5 text-base gap-2',
        lg: 'px-6 py-3 text-lg gap-2.5'
    };

    const isDisabled = disabled || loading;

    return (
        <button
            ref={ref}
            disabled={isDisabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
