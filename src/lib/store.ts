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

export interface UsageRecord {
  id: string;
  userId: string;
  date: string;
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
export const getUsageRecords = (userId: string): UsageRecord[] => {
  const all = getItem<UsageRecord[]>('sep_usage', []);
  return all.filter(r => r.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const addUsageRecord = (userId: string, date: string, meterReading: number): UsageRecord => {
  const all = getItem<UsageRecord[]>('sep_usage', []);
  const userRecords = all.filter(r => r.userId === userId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const lastReading = userRecords.length > 0 ? userRecords[userRecords.length - 1].meterReading : 0;
  const dailyUsage = Math.max(0, meterReading - lastReading);
  const amount = calculateBill(dailyUsage);

  const record: UsageRecord = {
    id: crypto.randomUUID(),
    userId,
    date,
    meterReading,
    dailyUsage,
    amount,
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

export const getTotalUsage = (userId: string): { totalUnits: number; totalBill: number } => {
  const records = getUsageRecords(userId);
  const totalUnits = records.reduce((sum, r) => sum + r.dailyUsage, 0);
  const totalBill = calculateBill(totalUnits);
  return { totalUnits, totalBill };
};

// Budget
export const getBudget = (userId: string): BudgetPlan | null => {
  const budgets = getItem<BudgetPlan[]>('sep_budgets', []);
  const currentMonth = new Date().toISOString().slice(0, 7);
  return budgets.find(b => b.userId === userId && b.month === currentMonth) || null;
};

export const setBudget = (userId: string, monthlyLimit: number) => {
  const budgets = getItem<BudgetPlan[]>('sep_budgets', []);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const filtered = budgets.filter(b => !(b.userId === userId && b.month === currentMonth));
  setItem('sep_budgets', [...filtered, { userId, monthlyLimit, month: currentMonth }]);
};

// Alerts
export const getAlerts = (userId: string): string[] => {
  const alerts: string[] = [];
  const records = getUsageRecords(userId);
  const { totalBill } = getTotalUsage(userId);

  if (records.length > 0 && records[0].dailyUsage > 6) {
    alerts.push(`⚠️ High daily usage alert: ${records[0].dailyUsage} units on ${records[0].date}`);
  }
  if (totalBill > 1000) {
    alerts.push(`🚨 Bill exceeds ₹1000! Current bill: ₹${totalBill.toLocaleString()}`);
  }

  const budget = getBudget(userId);
  if (budget) {
    const { totalUnits } = getTotalUsage(userId);
    if (totalUnits > budget.monthlyLimit) {
      alerts.push(`📊 Budget exceeded! Usage: ${totalUnits} units vs limit: ${budget.monthlyLimit} units`);
    }
  }
  return alerts;
};
