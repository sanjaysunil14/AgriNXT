import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import FarmerSidebar from '../components/farmer/FarmerSidebar';
import FarmerTopBar from '../components/farmer/FarmerTopBar';

export default function FarmerLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <FarmerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col">
                <FarmerTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
