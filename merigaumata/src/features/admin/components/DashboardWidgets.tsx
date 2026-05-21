"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { AppIcon, type IconName } from '@/shared/icons';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import clsx from 'clsx';

// --- Gradient KPI Card Widget ---
interface GradientKpiCardProps {
  title: string;
  value: string;
  icon: IconName;
  gradientFrom: string;
  gradientTo: string;
  cash?: string;
  card?: string;
  credit?: string;
}

export function GradientKpiCard({ title, value, icon, gradientFrom, gradientTo, cash, card, credit }: GradientKpiCardProps) {
  const isBottomLayout = cash === undefined && card === undefined && credit === undefined;

  return (
    <div className={clsx(
      "rounded-[20px] p-5 shadow-sm border border-slate-200/30 flex flex-col justify-between h-[175px] transition-all duration-300 hover:shadow-md",
      `bg-gradient-to-br ${gradientFrom} ${gradientTo}`
    )}>
      {/* Top: Icon Badge */}
      <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 border border-slate-100/50 self-start">
        <AppIcon name={icon} className="h-4 w-4" />
      </div>

      {isBottomLayout ? (
        /* Layout for Card 3, 4, 5: Value and Title pushed to the bottom */
        <div className="mt-auto">
          <h3 className="text-2xl font-bold text-slate-800 leading-none tracking-tight mb-1.5">{value}</h3>
          <p className="text-[11px] font-semibold text-slate-500/90">{title}</p>
        </div>
      ) : (
        /* Layout for Card 1 & 2: Value and Title in the middle, stats at the bottom */
        <>
          <div className="my-auto py-1">
            <h3 className="text-2xl font-bold text-slate-800 leading-none tracking-tight mb-1">{value}</h3>
            <p className="text-[11px] font-semibold text-slate-500/90">{title}</p>
          </div>
          
          <div className="flex items-center justify-between text-left gap-4 mt-2">
             <div className="flex flex-col">
               <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Cash</span>
               <span className="text-xs font-bold text-slate-600 mt-0.5">{cash}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Card</span>
               <span className="text-xs font-bold text-slate-600 mt-0.5">{card}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Credit</span>
               <span className="text-xs font-bold text-slate-600 mt-0.5">{credit}</span>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Small KPI Card Widget ---
interface SmallKpiCardProps {
  title: string;
  value: string;
  icon: IconName;
  iconColor: string;
  badgeText?: string;
  badgeColor?: string;
}

export function SmallKpiCard({ title, value, icon, iconColor, badgeText, badgeColor }: SmallKpiCardProps) {
  const bgColorClass = iconColor.replace('text-', 'bg-').replace('-500', '-50').replace('-400', '-50');
  
  return (
    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200/30 flex flex-col justify-between h-[135px] transition-all duration-300 hover:shadow-md">
       {/* Rounded Square Icon Badge */}
       <div className={clsx("h-9 w-9 rounded-[12px] flex items-center justify-center self-start", bgColorClass, iconColor)}>
          <AppIcon name={icon} className="h-4.5 w-4.5" />
       </div>
       <div>
         <div className="flex items-center gap-1.5 mb-1.5">
           <p className="text-[12px] font-semibold text-slate-400">{title}</p>
           {badgeText && (
             <span className={clsx("text-[9px] px-2 py-0.5 rounded-full font-bold leading-none", badgeColor)}>
               {badgeText}
             </span>
           )}
         </div>
         <h3 className="text-xl font-bold text-slate-800 leading-none tracking-tight">{value}</h3>
       </div>
    </div>
  );
}

// --- Sales Revenue Chart Widget ---
const salesData = [
  { name: 'Jan', oneTime: 100000, recurring: 50000 },
  { name: 'Feb', oneTime: 40000, recurring: 120000 },
  { name: 'Mar', oneTime: 55000, recurring: 135000 },
  { name: 'Apr', oneTime: 110000, recurring: 140000 },
  { name: 'May', oneTime: 15000, recurring: 115000 },
  { name: 'Jun', lineTime: 12000, recurring: 65000 },
  { name: 'Jul', oneTime: 125000, recurring: 70000 },
  { name: 'Aug', oneTime: 55000, recurring: 120000 },
];

export function SalesRevenueChart() {
  const t = useTranslations('admin.AdminDashboard');

  return (
    <div className="bg-card rounded-2xl p-6 border border-earth-200 shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <AppIcon name="trendingUp" className="h-5 w-5 text-foreground/50" />
          {t.has('salesRevenue') ? t('salesRevenue') : 'Sales Revenue'}
        </h3>
        <div className="flex bg-earth-50 rounded-xl p-1">
          {['Monthly', 'Quarterly', 'Yearly'].map((period, i) => (
            <button 
              key={period}
              className={clsx(
                "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                i === 0 ? "bg-white text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-4 text-sm text-foreground/60">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-200"></span> One-Time Revenue
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Recurring Revenue
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={0}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-earth-200)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-foreground)', opacity: 0.5, fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-foreground)', opacity: 0.5, fontSize: 12 }} tickFormatter={(value) => `${value / 1000}K`} />
            <RechartsTooltip cursor={{ fill: 'var(--color-earth-50)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="oneTime" fill="#C7D2FE" radius={[4, 4, 4, 4]} barSize={32} />
            <Bar dataKey="recurring" fill="#6366F1" radius={[4, 4, 4, 4]} barSize={32} style={{ transform: 'translateX(-32px)', mixBlendMode: 'multiply', opacity: 0.8 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Top Categories Donut Chart ---
const categoryData = [
  { name: 'Electronics', value: 85000, color: '#6366F1' },
  { name: 'Fashion', value: 25000, color: '#A855F7' },
  { name: 'Health & Wellness', value: 10000, color: '#F59E0B' },
  { name: 'Home & Living', value: 5000, color: '#EC4899' },
];

export function TopCategoriesChart() {
  const total = categoryData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-card rounded-2xl p-6 border border-earth-200 shadow-sm flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className="h-5 w-5 rounded-full border-2 border-foreground/50 flex items-center justify-center"><AppIcon name="arrowUpRight" className="h-3 w-3" /></span>
          Top Categories
        </h3>
        <button className="text-sm font-semibold text-foreground/70 bg-earth-50 hover:bg-earth-100 px-3 py-1.5 rounded-lg transition-colors">
          See All
        </button>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-foreground/50 font-medium">Total Sales</span>
          <span className="text-xl font-bold text-foreground">$125,000</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {categoryData.map((category) => (
          <div key={category.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }}></span>
              <span className="text-foreground/80">{category.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-foreground/70">${category.value.toLocaleString()}</span>
              <span className="font-bold text-foreground w-8 text-right">{Math.round((category.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Recent Activity Widget ---
const activities = [
  { id: 1, type: 'order', title: 'Order #2048', subtitle: 'John Doe • 12 Jan 25', tag: 'New Order', tagColor: 'bg-indigo-50 text-indigo-600', icon: 'box' as IconName, iconColor: 'text-indigo-500 bg-indigo-50' },
  { id: 2, type: 'alert', title: 'Low Stock Alert', subtitle: 'MacBook Air M2 • 10 Jan 25', tag: 'Low Stock', tagColor: 'bg-red-50 text-red-600', icon: 'box' as IconName, iconColor: 'text-red-500 bg-red-50' },
  { id: 3, type: 'promo', title: 'Promo code "SUMMER20"', subtitle: 'Applied 52 times • 8 Jan 25', tag: 'Campaign', tagColor: 'bg-purple-50 text-purple-600', icon: 'dollar' as IconName, iconColor: 'text-purple-500 bg-purple-50' },
  { id: 4, type: 'system', title: 'System Update', subtitle: 'Version 1.2.1 • 2 Jan 25', tag: 'System', tagColor: 'bg-earth-100 text-foreground/70', icon: 'arrowUpRight' as IconName, iconColor: 'text-foreground/60 bg-earth-100' },
];

export function RecentActivityFeed() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-earth-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <AppIcon name="refresh" className="h-5 w-5 text-foreground/50" />
          Recent Activity
        </h3>
        <button className="text-sm font-semibold text-foreground/70 bg-earth-50 hover:bg-earth-100 px-3 py-1.5 rounded-lg transition-colors">
          See All
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {activities.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-earth-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={clsx("h-10 w-10 rounded-full flex items-center justify-center", item.iconColor)}>
                <AppIcon name={item.icon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{item.title}</p>
                <p className="text-xs text-foreground/50 mt-0.5">{item.subtitle}</p>
              </div>
            </div>
            <span className={clsx("px-2.5 py-1 text-xs font-semibold rounded-md", item.tagColor)}>
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Top Products Table ---
const productsData = [
  { id: 1, name: 'iPhone 15 Pro', image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=100&h=100&fit=crop', stock: '6,200', price: '$999.00', sales: '4,800', earnings: '$4,795,200' },
  { id: 2, name: 'MacBook Air M2', image: 'https://images.unsplash.com/photo-1661961112951-f2bfd1f253ce?w=100&h=100&fit=crop', stock: '1,020', price: '$1,299', sales: '3,200', earnings: '$4,156,800' },
  { id: 3, name: 'Google Pixel 8', image: 'https://images.unsplash.com/photo-1696446702388-7f989f663148?w=100&h=100&fit=crop', stock: '1,500', price: '$699.00', sales: '800', earnings: '$559,200' },
  { id: 4, name: 'Nike Air Max 90', image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=100&h=100&fit=crop', stock: '2,400', price: '$130.00', sales: '1,800', earnings: '$234,000' },
  { id: 5, name: 'Galaxy Buds Pro', image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=100&h=100&fit=crop', stock: '850', price: '$199.00', sales: '1,000', earnings: '$199,000' },
];

export function TopProductsTable() {
  return (
    <div className="bg-card rounded-2xl p-6 border border-earth-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <AppIcon name="box" className="h-5 w-5 text-foreground/50" />
          Top Products
        </h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-sm font-semibold text-foreground border border-earth-200 bg-white hover:bg-earth-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
            Sort <AppIcon name="chevronDown" className="h-4 w-4 text-foreground/50" />
          </button>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-foreground border border-earth-200 bg-white hover:bg-earth-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm">
            <AppIcon name="filter" className="h-4 w-4 text-foreground/50" /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="border-b border-earth-200 text-xs text-foreground/50 font-medium">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium text-right">Stocks</th>
              <th className="pb-3 font-medium text-right">Price</th>
              <th className="pb-3 font-medium text-right">Sales</th>
              <th className="pb-3 font-medium text-right">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {productsData.map((product) => (
              <tr key={product.id} className="border-b border-earth-100/50 hover:bg-earth-50/50 transition-colors last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-earth-100" />
                    <span className="font-semibold text-foreground">{product.name}</span>
                  </div>
                </td>
                <td className="py-3 text-right font-medium text-foreground/80">{product.stock}</td>
                <td className="py-3 text-right font-medium text-foreground/80">{product.price}</td>
                <td className="py-3 text-right font-medium text-foreground/80">{product.sales}</td>
                <td className="py-3 text-right font-semibold text-foreground">{product.earnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Recent Orders Table Widget ---
const recentOrders = [
  { no: '01', orderId: '#512743', orderDate: '06 Dec 2023', productName: 'Ipad 64GB Black', customer: { name: 'Jenny Wilson', avatar: 'https://i.pravatar.cc/100?img=1' }, amount: '$1600', status: 'Order Pending', statusColor: 'bg-red-50 text-red-600 border border-red-100/50' },
  { no: '02', orderId: '#374255', orderDate: '06 Dec 2023', productName: 'Iphone 15 Pro Max 128GB Black', customer: { name: 'Wade Warren', avatar: 'https://i.pravatar.cc/100?img=2' }, amount: '$2299', status: 'Order Processing', statusColor: 'bg-amber-50 text-amber-600 border border-amber-100/50' },
  { no: '03', orderId: '#975101', orderDate: '06 Dec 2023', productName: 'Mackbook Pro M1 Pro', customer: { name: 'Cameron Williamson', avatar: 'https://i.pravatar.cc/100?img=3' }, amount: '$3199', status: 'Order Shipped', statusColor: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' },
  { no: '04', orderId: '#358424', orderDate: '06 Dec 2023', productName: 'Asus Laptop', customer: { name: 'Robert Fox', avatar: 'https://i.pravatar.cc/100?img=4' }, amount: '$999', status: 'Order Delivered', statusColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' },
  { no: '05', orderId: '#975201', orderDate: '06 Dec 2023', productName: 'Apple Watch Series 9', customer: { name: 'Robert Fox', avatar: 'https://i.pravatar.cc/100?img=4' }, amount: '$1600', status: 'Order Shipped', statusColor: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' },
  { no: '06', orderId: '#576196', orderDate: '06 Dec 2023', productName: 'Apple Pencil 2', customer: { name: 'Robert Fox', avatar: 'https://i.pravatar.cc/100?img=4' }, amount: '$99', status: 'Order Delivered', statusColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' },
];

export function RecentOrdersTable() {
  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-200/30 flex flex-col w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          Recent Orders
        </h3>
        <button className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
          See All
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium">
              <th className="pb-3 font-semibold pl-2">No</th>
              <th className="pb-3 font-semibold">Order ID</th>
              <th className="pb-3 font-semibold">Order Date</th>
              <th className="pb-3 font-semibold">Product Name</th>
              <th className="pb-3 font-semibold">Customers</th>
              <th className="pb-3 font-semibold">Total Amount</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {recentOrders.map((order) => (
              <tr key={order.orderId} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors last:border-0">
                <td className="py-4 font-semibold text-slate-400 pl-2">{order.no}</td>
                <td className="py-4 font-semibold text-slate-700">{order.orderId}</td>
                <td className="py-4 text-slate-500">{order.orderDate}</td>
                <td className="py-4 font-semibold text-slate-700">{order.productName}</td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    <img src={order.customer.avatar} alt={order.customer.name} className="h-6 w-6 rounded-full object-cover" />
                    <span className="font-semibold text-slate-600">{order.customer.name}</span>
                  </div>
                </td>
                <td className="py-4 font-semibold text-slate-700">{order.amount}</td>
                <td className="py-4">
                  <span className={clsx("px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center justify-center", order.statusColor)}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-center gap-3">
                    <button className="text-slate-400 hover:text-red-500 transition-colors">
                      <AppIcon name="trash" className="h-4.5 w-4.5" />
                    </button>
                    <button className="text-slate-400 hover:text-purple-600 transition-colors">
                      <AppIcon name="edit" className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
