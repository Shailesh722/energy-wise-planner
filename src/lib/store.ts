// Types
export interface User {
  id: string;
  serviceNumber: string;
  name: string;
  location: string;
  mobile: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface AdminSession {
  username: string;
  loggedInAt: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  date: string;
  month: string;
  meterReading: number;
  dailyUsage: number;
  amount: number;
}

export interface BudgetPlan {
  userId: string;
  monthlyLimit: number;
  month: string;
}

// Helpers
const getItem = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setItem = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getMonthFromDate = (date: string): string => date.slice(0, 7);
export const getCurrentMonth = (): string => new Date().toISOString().slice(0, 7);

const normalizeUsageRecord = (record: Partial<UsageRecord> & { id: string; userId: string; date: string }): UsageRecord => ({
  id: record.id,
  userId: record.userId,
  date: record.date,
  month: record.month || getMonthFromDate(record.date),
  meterReading: Number(record.meterReading ?? 0),
  dailyUsage: Number(record.dailyUsage ?? 0),
  amount: Number(record.amount ?? 0),
});

const readAllUsageRecords = (): UsageRecord[] => {
  const all = getItem<Array<Partial<UsageRecord> & { id: string; userId: string; date: string }>>('sep_usage', []);
  return all
    .map(normalizeUsageRecord)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Auth
export const getUsers = (): User[] => getItem('sep_users', []);
export const setUsers = (users: User[]) => setItem('sep_users', users);

export const getCurrentUser = (): User | null => getItem('sep_current_user', null);
export const setCurrentUser = (user: User | null) => setItem('sep_current_user', user);

export const registerUser = (userData: Omit<User, 'id' | 'createdAt'>): { success: boolean; message: string } => {
  const users = getUsers();
  if (users.find(u => u.serviceNumber === userData.serviceNumber)) {
    return { success: false, message: 'Service number already registered' };
  }
  if (users.find(u => u.email === userData.email)) {
    return { success: false, message: 'Email already registered' };
  }
  const newUser: User = {
    ...userData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  setUsers([...users, newUser]);
  return { success: true, message: 'Registration successful' };
};

export const loginUser = (serviceNumber: string, password: string): { success: boolean; user?: User; message: string } => {
  const users = getUsers();
  const user = users.find(u => u.serviceNumber === serviceNumber && u.password === password);
  if (user) {
    setCurrentUser(user);
    return { success: true, user, message: 'Login successful' };
  }
  return { success: false, message: 'Invalid service number or password' };
};

export const logoutUser = () => {
  localStorage.removeItem('sep_current_user');
  localStorage.removeItem('sep_otp');
  localStorage.removeItem('sep_otp_verified');
};

// Admin Auth (separate from user login)
interface AdminCredentials {
  username: string;
  password: string;
}

const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'admin123',
};

const getAdminCredentials = (): AdminCredentials => {
  // Check if credentials need auto-reset (every 30 days)
  const lastReset = getItem<string | null>('sep_admin_reset_at', null);
  if (lastReset) {
    const daysSinceReset = (Date.now() - new Date(lastReset).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= 30) {
      resetAdminCredentials();
      return DEFAULT_ADMIN_CREDENTIALS;
    }
  }
  const creds = getItem<AdminCredentials | null>('sep_admin_credentials', null);
  if (creds?.username && creds?.password) return creds;
  resetAdminCredentials();
  return DEFAULT_ADMIN_CREDENTIALS;
};

export const resetAdminCredentials = () => {
  setItem('sep_admin_credentials', DEFAULT_ADMIN_CREDENTIALS);
  setItem('sep_admin_reset_at', new Date().toISOString());
};

export const loginAdmin = (username: string, password: string): { success: boolean; message: string } => {
  const creds = getAdminCredentials();
  if (username === creds.username && password === creds.password) {
    setItem('sep_current_admin', { username, loggedInAt: new Date().toISOString() } as AdminSession);
    return { success: true, message: 'Admin login successful' };
  }
  return { success: false, message: 'Invalid admin username or password' };
};

export const getCurrentAdmin = (): AdminSession | null => getItem('sep_current_admin', null);
export const logoutAdmin = () => localStorage.removeItem('sep_current_admin');

// OTP
export const generateOTP = (): string => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  setItem('sep_otp', { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  return otp;
};

export const verifyOTP = (input: string): boolean => {
  const otpData = getItem<{ code: string; expiresAt: number } | null>('sep_otp', null);
  if (!otpData) return false;
  if (Date.now() > otpData.expiresAt) return false;
  if (otpData.code === input) {
    setItem('sep_otp_verified', true);
    return true;
  }
  return false;
};

export const isOTPVerified = (): boolean => getItem('sep_otp_verified', false);

// Usage
export const getUsageRecords = (userId: string, month: string = getCurrentMonth()): UsageRecord[] => {
  const all = readAllUsageRecords();
  return all.filter(r => r.userId === userId && r.month === month);
};

export const getUsageRecordsForAdmin = (month?: string): UsageRecord[] => {
  const all = readAllUsageRecords();
  return month ? all.filter(r => r.month === month) : all;
};

export const getAvailableMonths = (userId: string): string[] => {
  const months = new Set(readAllUsageRecords().filter(r => r.userId === userId).map(r => r.month));
  months.add(getCurrentMonth());
  return Array.from(months).sort((a, b) => b.localeCompare(a));
};

export const getAvailableMonthsForAdmin = (): string[] => {
  const months = new Set(readAllUsageRecords().map(r => r.month));
  months.add(getCurrentMonth());
  return Array.from(months).sort((a, b) => b.localeCompare(a));
};

export const getUsagePreview = (
  userId: string,
  date: string,
  meterReading: number,
): { month: string; dailyUsage: number; amount: number; totalUnits: number; totalBill: number } => {
  const month = getMonthFromDate(date);
  const monthRecords = readAllUsageRecords()
    .filter(r => r.userId === userId && r.month === month)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const lastReading = monthRecords.length > 0 ? monthRecords[monthRecords.length - 1].meterReading : 0;
  const dailyUsage = Math.max(0, meterReading - lastReading);

  const previousMonthUnits = monthRecords.reduce((sum, r) => sum + r.dailyUsage, 0);
  const totalUnits = previousMonthUnits + dailyUsage;
  const amount = calculateBill(totalUnits) - calculateBill(previousMonthUnits);
  const totalBill = calculateBill(totalUnits);

  return { month, dailyUsage, amount, totalUnits, totalBill };
};

export const addUsageRecord = (userId: string, date: string, meterReading: number): UsageRecord => {
  const all = readAllUsageRecords();
  const preview = getUsagePreview(userId, date, meterReading);

  const record: UsageRecord = {
    id: crypto.randomUUID(),
    userId,
    date,
    month: preview.month,
    meterReading,
    dailyUsage: preview.dailyUsage,
    amount: preview.amount,
  };
  setItem('sep_usage', [...all, record]);
  return record;
};

// Bill calculation (slab-based)
export const calculateBill = (units: number): number => {
  if (units <= 100) return 0;
  if (units <= 200) return (units - 100) * 5;
  return 100 * 5 + (units - 200) * 7;
};

export const getTotalUsage = (userId: string, month: string = getCurrentMonth()): { totalUnits: number; totalBill: number } => {
  const records = getUsageRecords(userId, month);
  const totalUnits = records.reduce((sum, r) => sum + r.dailyUsage, 0);
  const totalBill = calculateBill(totalUnits);
  return { totalUnits, totalBill };
};

// Budget
export const getBudget = (userId: string, month: string = getCurrentMonth()): BudgetPlan | null => {
  const budgets = getItem<BudgetPlan[]>('sep_budgets', []);
  return budgets.find(b => b.userId === userId && b.month === month) || null;
};

export const setBudget = (userId: string, monthlyLimit: number, month: string = getCurrentMonth()) => {
  const budgets = getItem<BudgetPlan[]>('sep_budgets', []);
  const filtered = budgets.filter(b => !(b.userId === userId && b.month === month));
  setItem('sep_budgets', [...filtered, { userId, monthlyLimit, month }]);
};

// Alerts
export const getAlerts = (userId: string, month: string = getCurrentMonth()): string[] => {
  const alerts: string[] = [];
  const records = getUsageRecords(userId, month);
  const { totalBill, totalUnits } = getTotalUsage(userId, month);

  if (records.length > 0 && records[0].dailyUsage > 6) {
    alerts.push(`⚠️ High daily usage alert: ${records[0].dailyUsage} units on ${records[0].date}`);
  }
  if (totalBill > 1000) {
    alerts.push(`🚨 Bill exceeds ₹1000! Current bill: ₹${totalBill.toLocaleString()}`);
  }

  const budget = getBudget(userId, month);
  if (budget) {
    if (totalUnits > budget.monthlyLimit) {
      alerts.push(`📊 Budget exceeded! Usage: ${totalUnits} units vs limit: ${budget.monthlyLimit} units`);
    }
  }
  return alerts;
};

export interface HighUsageUser {
  userId: string;
  serviceNumber: string;
  name: string;
  totalUnits: number;
  totalBill: number;
  maxDailyUsage: number;
  month: string;
}

export const getHighUsageUsers = (month: string = getCurrentMonth()): HighUsageUser[] => {
  return getUsers()
    .map(user => {
      const records = getUsageRecords(user.id, month);
      const totals = getTotalUsage(user.id, month);
      const maxDailyUsage = records.reduce((max, r) => Math.max(max, r.dailyUsage), 0);
      return {
        userId: user.id,
        serviceNumber: user.serviceNumber,
        name: user.name,
        totalUnits: totals.totalUnits,
        totalBill: totals.totalBill,
        maxDailyUsage,
        month,
      };
    })
    .filter(entry => entry.maxDailyUsage > 6 || entry.totalBill > 1000)
    .sort((a, b) => b.totalBill - a.totalBill);
};
