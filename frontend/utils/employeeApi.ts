import { DEFAULT_EMPLOYEE_PERMISSIONS } from '@/constants/employeeData';
import { DEFAULT_MATRIX_VALUES } from '@/constants/dashboardMatrices';
import type { MatrixKey } from '@/constants/dashboardMatrices';
import type { Employee, EmployeeDraft, EmployeePermissions } from '@/types/employee';
import { apiRequest, ApiError } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';

type ApiEnvelope<T extends Record<string, unknown>> = T & {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
};

export type ApiEmployeePermissions = {
  businessDetails: boolean;
  manageFormulae: boolean;
  homeDashboardMetricsControls: boolean;
  inventoryManager: boolean;
  employeeManager: boolean;
  tunchPurity: boolean;
  invoiceFormat: boolean;
};

const MATRIX_KEYS = Object.keys(DEFAULT_MATRIX_VALUES) as MatrixKey[];

function readString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function unwrapEnvelope<T extends Record<string, unknown>>(response: ApiEnvelope<T>): T {
  return unwrapApiData(response) as T;
}

function isSuccessfulResponse(
  response: ApiEnvelope<Record<string, unknown>>,
  unwrapped: Record<string, unknown>,
): boolean {
  const unwrappedSuccess = unwrapped.success;
  if (typeof unwrappedSuccess === 'boolean') return unwrappedSuccess;
  if (typeof response.success === 'boolean') return response.success;
  return true;
}

function resolveApiMessage(
  response: ApiEnvelope<Record<string, unknown>>,
  unwrapped: Record<string, unknown>,
  fallback: string,
): string {
  return (
    readString(unwrapped, ['message', 'error']) ??
    readString(response as Record<string, unknown>, ['message', 'error']) ??
    fallback
  );
}

export function mapDraftPermissionsToApi(permissions: EmployeePermissions): ApiEmployeePermissions {
  const hasMatrixAccess = MATRIX_KEYS.some((key) => permissions[key]);

  return {
    businessDetails: false,
    manageFormulae: permissions.settings_formulae || permissions.edit_formulae,
    homeDashboardMetricsControls: hasMatrixAccess,
    inventoryManager: permissions.settings_inventory,
    employeeManager: false,
    tunchPurity: permissions.settings_purity,
    invoiceFormat: permissions.settings_invoice,
  };
}

export function mapApiPermissionsToEmployee(apiPermissions: Partial<ApiEmployeePermissions>): EmployeePermissions {
  const permissions: EmployeePermissions = { ...DEFAULT_EMPLOYEE_PERMISSIONS };

  if (apiPermissions.homeDashboardMetricsControls) {
    MATRIX_KEYS.forEach((key) => {
      permissions[key] = DEFAULT_MATRIX_VALUES[key];
    });
  } else {
    MATRIX_KEYS.forEach((key) => {
      permissions[key] = false;
    });
  }

  permissions.settings_formulae = Boolean(apiPermissions.manageFormulae);
  permissions.edit_formulae = Boolean(apiPermissions.manageFormulae);
  permissions.settings_inventory = Boolean(apiPermissions.inventoryManager);
  permissions.settings_purity = Boolean(apiPermissions.tunchPurity);
  permissions.settings_invoice = Boolean(apiPermissions.invoiceFormat);

  return permissions;
}

export function mapApiEmployeeToEmployee(raw: Record<string, unknown>): Employee {
  const permissionsRaw = raw.permissions;
  const apiPermissions =
    permissionsRaw && typeof permissionsRaw === 'object'
      ? (permissionsRaw as Partial<ApiEmployeePermissions>)
      : {};

  const id =
    readString(raw, ['id', '_id', 'employeeId']) ??
    `emp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const employeeId = readString(raw, ['employeeId', 'employeeCode', 'code']) ?? id;

  return {
    id,
    employeeId,
    fullName: readString(raw, ['name', 'fullName']) ?? 'Employee',
    designation: readString(raw, ['designation', 'role']) ?? 'Employee',
    phone: readString(raw, ['phone'])?.replace(/\D/g, '').slice(-10) ?? '',
    email: readString(raw, ['email']) ?? '',
    gender: 'Male',
    password: '',
    permissions: mapApiPermissionsToEmployee(apiPermissions),
  };
}

function normalizeEmployeeList(raw: unknown): Employee[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map(mapApiEmployeeToEmployee);
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    const nested = record.employees ?? record.items ?? record.results;
    if (Array.isArray(nested)) {
      return normalizeEmployeeList(nested);
    }
  }

  return [];
}

export async function createEmployeeDraft(payload: {
  name: string;
  phone: string;
  email: string;
  permissions: EmployeePermissions;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/employees', {
      method: 'POST',
      body: {
        name: payload.name.trim(),
        phone: payload.phone.replace(/\D/g, '').slice(-10),
        email: payload.email.trim().toLowerCase(),
        permissions: mapDraftPermissionsToApi(payload.permissions),
      },
    });
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'Failed to create employee draft.'),
      };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to create employee draft.',
    };
  }
}

export async function finalizeEmployeeCreation(password: string): Promise<{
  success: boolean;
  employeeId?: string;
  error?: string;
}> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/employees', {
      method: 'POST',
      body: { password },
    });
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'Failed to finalize employee creation.'),
      };
    }
    const employeeId = readString(unwrapped, ['employeeId', 'employeeCode', 'code']);
    if (!employeeId) {
      return { success: false, error: 'Employee ID missing in server response.' };
    }
    return { success: true, employeeId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to finalize employee creation.',
    };
  }
}

export async function fetchEmployees(): Promise<{
  success: boolean;
  data?: Employee[];
  error?: string;
}> {
  try {
    const response = await apiRequest<ApiEnvelope<Record<string, unknown>>>('/employees', {
      method: 'GET',
    });
    const unwrapped = unwrapEnvelope(response);
    if (!isSuccessfulResponse(response, unwrapped)) {
      return {
        success: false,
        error: resolveApiMessage(response, unwrapped, 'Failed to load employees.'),
      };
    }

    const employees = normalizeEmployeeList(unwrapped.data ?? unwrapped);
    return { success: true, data: employees };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ApiError ? error.message : 'Failed to load employees.',
    };
  }
}

export function buildEmployeeDraftPayload(draft: EmployeeDraft) {
  return {
    name: draft.fullName,
    phone: draft.phone,
    email:
      draft.email.trim() ||
      `${draft.fullName.split(' ')[0]?.toLowerCase() || 'employee'}@pratham.gmail.com`,
    permissions: draft.permissions,
  };
}
