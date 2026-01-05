export default function Avatar({
    name,
    src,
    size = 'md',
    className = '',
    variant = 'avataaars' // Default to cartoon faces
}) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg'
    };

    // Generate DiceBear avatar URL (v9 API)
    // Styles: avataaars, initials, micah, adventurer, etc.
    const avatarUrl = src || `https://api.dicebear.com/9.x/${variant}/svg?seed=${encodeURIComponent(name || 'User')}`;

    // Get initials as fallback
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className={`${sizes[size]} rounded-full overflow-hidden bg-primary-100 flex items-center justify-center ${className}`}>
            <img
                src={avatarUrl}
                alt={name || 'User'}
                className="w-full h-full object-cover"
                onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="font-semibold text-primary-700">${getInitials(name)}</span>`;
                }}
            />
        </div>
    );
}
