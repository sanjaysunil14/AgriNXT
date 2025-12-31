import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import BuyerSidebar from '../components/buyer/BuyerSidebar';
import BuyerTopBar from '../components/buyer/BuyerTopBar';

export default function BuyerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <BuyerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col">
                <BuyerTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
