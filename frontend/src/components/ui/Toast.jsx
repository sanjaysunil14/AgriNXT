import { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ message, type, onClose }) {
    const types = {
        success: {
            bg: 'bg-green-50 border-green-200',
            text: 'text-green-800',
            icon: CheckCircle,
            iconColor: 'text-green-600'
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-800',
            icon: XCircle,
            iconColor: 'text-red-600'
        },
        warning: {
            bg: 'bg-yellow-50 border-yellow-200',
            text: 'text-yellow-800',
            icon: AlertCircle,
            iconColor: 'text-yellow-600'
        },
        info: {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-800',
            icon: Info,
            iconColor: 'text-blue-600'
        }
    };

    const config = types[type] || types.info;
    const Icon = config.icon;

    return (
        <div className={`${config.bg} border ${config.text} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-slideInRight`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button onClick={onClose} className="hover:opacity-70 transition-opacity">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
