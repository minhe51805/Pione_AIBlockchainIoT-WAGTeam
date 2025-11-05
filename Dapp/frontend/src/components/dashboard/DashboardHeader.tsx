'use client';

import { Button } from '@/components/ui/button';
import { formatAddress } from '@/services/walletFromPasskey';

interface UserInfo {
  id: number;
  full_name: string;
  wallet_address: string;
  phone?: string;
  farm_name?: string;
  current_crop?: string;
}

interface DashboardHeaderProps {
  user: UserInfo;
  onLogout: () => void;
}

export default function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🌾 Pione Soil Analysis Dashboard
          </h1>
          <div className="text-gray-600 space-y-1">
            <p className="text-lg">
              👨‍🌾 <span className="font-semibold">{user.full_name}</span>
              {user.farm_name && (
                <span className="ml-2 text-sm text-gray-500">({user.farm_name})</span>
              )}
            </p>
            <p className="text-sm">
              💰 Ví: <span className="font-mono">{formatAddress(user.wallet_address, 6)}</span>
            </p>
            {user.current_crop && (
              <p className="text-sm">
                🌱 Cây trồng: <span className="capitalize font-medium">{user.current_crop}</span>
              </p>
            )}
          </div>
        </div>
        
        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          🚪 Đăng xuất
        </Button>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          🔄 Dashboard tự động cập nhật: Overview (60s) | Realtime IoT (30s) | AI History (60s)
        </p>
      </div>
    </div>
  );
}

