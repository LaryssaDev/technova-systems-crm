
export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'VENDEDOR',
  RH = 'RH',
  FINANCEIRO = 'FINANCEIRO'
}

export interface User {
  id: string;
  login: string;
  name: string;
  role: UserRole;
  password?: string;
}

export enum ClientStatus {
  PROSPECT = 'PROSPECT',
  MEETING = 'REUNIÃO',
  CLOSED = 'FECHADO',
  LOST = 'PERDIDO'
}

export enum ServiceType {
  SITE = 'SITE',
  SYSTEM = 'SISTEMA'
}

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  segment: string;
  serviceType: ServiceType;
  contractValue: number;
  status: ClientStatus;
  responsibleId: string;
  responsibleName: string;
  createdAt: string;
  notes: string;
}

export interface MonthlyGoal {
  month: string; // YYYY-MM
  targetValue: number;
  reachedValue: number;
  isCompleted: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  company: string;
  clientId: string;
  clientName: string;
  responsibleId: string;
  responsibleName: string;
  date: string;
  time: string;
  notes: string;
}

export enum FinanceType {
  INCOME = 'ENTRADA',
  EXPENSE = 'SAÍDA'
}

export enum FixedCostStatus {
  PENDING = 'PENDENTE',
  PAID = 'PAGO'
}

export interface FixedCost {
  id: string;
  description: string;
  amount: number;
  dueDate: string; // Day of month (1-31)
  status: FixedCostStatus;
  category: string;
  lastPaidMonth?: string; // YYYY-MM to prevent double payment in same month
}

export interface FinancialEntry {
  id: string;
  type: FinanceType;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  relatedClientId?: string;
  responsibleId: string;
  notes: string;
}
