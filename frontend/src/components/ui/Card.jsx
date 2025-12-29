export default function Card({
    children,
    header,
    footer,
    className = ''
}) {
    return (
        <div className={`bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden ${className}`}>
            {header && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    {header}
                </div>
            )}

            <div className="p-6">
                {children}
            </div>

            {footer && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {footer}
                </div>
            )}
        </div>
    );
}
