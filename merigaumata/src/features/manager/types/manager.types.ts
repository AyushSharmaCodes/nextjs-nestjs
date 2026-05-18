export interface ManagerPermissions {
  events: boolean;
  products: boolean;
  welfare: boolean;
  donations: boolean;
}

export interface ManagerAccount {
  id: string;
  name: string;
  email: string;
  permissions: ManagerPermissions;
  createdAt: string;
}

export type EventStatus = 'Upcoming' | 'Scheduled' | 'Completed' | 'Cancelled';

export interface SanctuaryEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  status: EventStatus;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
}

export interface Donation {
  id: string;
  source: string;
  amount: string;
  purpose: string;
}
