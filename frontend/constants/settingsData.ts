import type { LucideIcon } from 'lucide-react-native';
import {
  ClipboardCheck,
  Crown,
  FileText,
  IdCard,
  LayoutGrid,
  LogOut,
  MoreHorizontal,
  Sigma,
  TrendingUp,
  Type,
  UserPlus,
} from 'lucide-react-native';

export interface SettingsMenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  route?: string;
  isLogout?: boolean;
}

export const SETTINGS_MENU_ITEMS: SettingsMenuItem[] = [
  {
    id: 'business',
    title: 'Business Details',
    subtitle: 'Manage and Edit your Business Details',
    icon: IdCard,
    route: '/dashboard/business-profile',
  },
  {
    id: 'formulae',
    title: 'Manage Formulae',
    subtitle: 'Create, Edit and Delete Formulae',
    icon: Sigma,
  },
  {
    id: 'matrices',
    title: 'Home Dashboard Matrices Control',
    subtitle: 'Control the visibility of Home Screen Matrices',
    icon: LayoutGrid,
    route: '/dashboard/dashboard-matrices',
  },
  {
    id: 'market-rates',
    title: 'Market Rates Control',
    subtitle: 'Manage Gold, Diamond and Colorstone rates',
    icon: TrendingUp,
    route: '/dashboard/market-rates',
  },
  {
    id: 'inventory',
    title: 'Inventory Manager',
    subtitle: 'Manage and Create Inventory',
    icon: ClipboardCheck,
    route: '/dashboard/inventory',
  },
  {
    id: 'employee',
    title: 'Employee Manager',
    subtitle: 'Manage and Add Employees',
    icon: UserPlus,
    route: '/dashboard/employees',
  },
  {
    id: 'password',
    title: 'Password Manager',
    subtitle: 'Change or Reset Password',
    icon: MoreHorizontal,
    route: '/dashboard/password-manager',
  },
  {
    id: 'tunch',
    title: 'Tunch (Purity) Control',
    subtitle: 'Manage and Edit Tunch (Purity)',
    icon: Type,
    route: '/dashboard/purity-control',
  },
  {
    id: 'invoice',
    title: 'Invoice Formats',
    subtitle: 'Manage and access Invoice Formats',
    icon: FileText,
  },
  {
    id: 'subscription',
    title: 'Subscription Manager',
    subtitle: 'Manage and access your subscription',
    icon: Crown,
    route: '/dashboard/subscription-manager',
  },
  {
    id: 'logout',
    title: 'Logout Session',
    icon: LogOut,
    isLogout: true,
  },
];
