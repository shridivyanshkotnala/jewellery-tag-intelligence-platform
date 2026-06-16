import type { Employee } from '@/types/employee';

export function authenticateEmployee(
  employees: Employee[],
  method: 'employeeId' | 'contact',
  identifier: string,
  password: string,
): { success: true; employee: Employee } | { success: false; error: string } {
  const normalizedId = identifier.trim().toUpperCase();
  const normalizedPhone = identifier.replace(/\D/g, '');

  const employee =
    method === 'employeeId'
      ? employees.find((entry) => entry.employeeId.toUpperCase() === normalizedId)
      : employees.find((entry) => entry.phone === normalizedPhone);

  if (!employee) {
    return {
      success: false,
      error:
        method === 'employeeId'
          ? 'Employee ID not found. Check with your admin.'
          : 'Phone number not registered. Check with your admin.',
    };
  }

  if (employee.password !== password) {
    return { success: false, error: 'Invalid password. Please try again.' };
  }

  return { success: true, employee };
}
