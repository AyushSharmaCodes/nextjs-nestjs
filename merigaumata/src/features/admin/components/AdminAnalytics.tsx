'use client';

import { useTranslations } from 'next-intl';
import { 
  ShoppingBag, 
  Package, 
  Calendar, 
  Clock, 
  TrendingUp,
  Layers,
  Loader,
  Box,
  CheckCircle2
} from 'lucide-react';
import { 
  GradientKpiCard,
  SmallKpiCard,
  SalesRevenueChart, 
  TopCategoriesChart, 
  RecentActivityFeed, 
  TopProductsTable,
  RecentOrdersTable
} from './DashboardWidgets';

export function AdminAnalytics() {
  const t = useTranslations('admin.AdminDashboard');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
      </div>

      {/* Top Gradient KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <GradientKpiCard
          title="Today Orders"
          value="$0.00"
          icon={ShoppingBag}
          gradientFrom="from-[#B9D0FF]"
          gradientTo="to-[#E5EDFF]"
          cash="$0.00"
          card="$0.00"
          credit="$0.00"
        />
        <GradientKpiCard
          title="Yesterday Orders"
          value="$0.00"
          icon={Package}
          gradientFrom="from-[#BDF5D1]"
          gradientTo="to-[#D4F4FD]"
          cash="$0.00"
          card="$0.00"
          credit="$0.00"
        />
        <GradientKpiCard
          title="This Month"
          value="$6,155.56"
          icon={Calendar}
          gradientFrom="from-[#FBCFE8]"
          gradientTo="to-[#E9D5FF]"
        />
        <GradientKpiCard
          title="Last Month"
          value="$23,422.25"
          icon={Clock}
          gradientFrom="from-[#A9F5E8]"
          gradientTo="to-[#D6F8E8]"
        />
        <GradientKpiCard
          title="All-Time Sales"
          value="$1,328,698.95"
          icon={TrendingUp}
          gradientFrom="from-[#E8DBFD]"
          gradientTo="to-[#FAD4E4]"
        />
      </div>

      {/* Small KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SmallKpiCard
          title="Total Order"
          value="1404"
          icon={Layers}
          iconColor="text-orange-500"
        />
        <SmallKpiCard
          title="Orders Pending"
          value="107"
          icon={Loader}
          iconColor="text-blue-500"
          badgeText="$56,204.76"
          badgeColor="bg-red-50 text-red-500"
        />
        <SmallKpiCard
          title="Orders Processing"
          value="42"
          icon={Box}
          iconColor="text-purple-500"
        />
        <SmallKpiCard
          title="Orders Delivered"
          value="136"
          icon={CheckCircle2}
          iconColor="text-green-500"
        />
      </div>

      {/* Middle Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesRevenueChart />
        </div>
        <div className="lg:col-span-1">
          <TopCategoriesChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RecentActivityFeed />
        </div>
        <div className="lg:col-span-2">
          <TopProductsTable />
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="w-full">
        <RecentOrdersTable />
      </div>
    </div>
  );
}
