import { SETTINGS_MENU_ITEMS } from '@/constants/settingsData';
import {
  EMPLOYEE_ALWAYS_SETTINGS_IDS,
  OWNER_ONLY_SETTINGS_IDS,
  SETTINGS_PERMISSION_MAP,
} from '@/constants/settingsPermissions';
import type { Employee, EmployeePermissions } from '@/types/employee';
import type { UserRole } from '@/store/authStore';

export function resolveCurrentEmployee(
  employees: Employee[],
  loggedInEmployeeId: string | null,
  savedPhone: string,
): Employee | null {
  if (loggedInEmployeeId) {
    return employees.find((employee) => employee.id === loggedInEmployeeId) ?? null;
  }

  const normalizedPhone = savedPhone.replace(/\D/g, '').slice(-10);
  if (!normalizedPhone) {
    return null;
  }

  return (
    employees.find(
      (employee) => employee.phone.replace(/\D/g, '').slice(-10) === normalizedPhone,
    ) ?? null
  );
}

export function canAccessSettingsItem(
  itemId: string,
  userRole: UserRole,
  permissions?: EmployeePermissions | null,
): boolean {
  if (userRole !== 'employee') {
    return true;
  }

  if (itemId === 'market-rates') {
    return permissions?.edit_market_prices === true;
  }

  if (OWNER_ONLY_SETTINGS_IDS.has(itemId)) {
    return false;
  }

  if (EMPLOYEE_ALWAYS_SETTINGS_IDS.has(itemId)) {
    return true;
  }

  const permissionKey = SETTINGS_PERMISSION_MAP[itemId];
  if (!permissionKey) {
    return false;
  }

  return permissions?.[permissionKey] === true;
}

export function getVisibleSettingsMenuItems(
  userRole: UserRole,
  permissions?: EmployeePermissions | null,
) {
  return SETTINGS_MENU_ITEMS.filter((item) => canAccessSettingsItem(item.id, userRole, permissions));
}
