import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export default function Dropdown({ trigger, children, align = 'right' }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const alignmentClasses = {
        left: 'left-0',
        right: 'right-0'
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger || (
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className={`absolute ${alignmentClasses[align]} mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-fadeIn`}>
                    {children}
                </div>
            )}
        </div>
    );
}

export function DropdownItem({ icon: Icon, children, onClick, variant = 'default' }) {
    const variants = {
        default: 'text-gray-700 hover:bg-gray-100',
        danger: 'text-red-600 hover:bg-red-50'
    };

    return (
        <button
            onClick={onClick}
            className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors ${variants[variant]}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
}
