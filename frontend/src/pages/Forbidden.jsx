import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Forbidden() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Access Forbidden</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                    You don't have permission to access this page. This area is restricted to administrators only.
                </p>

                <Link to="/">
                    <Button icon={Home} iconPosition="left">
                        Go to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
