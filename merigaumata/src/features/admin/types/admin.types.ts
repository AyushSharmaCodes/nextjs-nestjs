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
