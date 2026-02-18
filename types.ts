
export enum UserRole {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER'
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
  responsibleId: string; // User ID
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
  date: string;
  time: string;
  clientId: string;
  clientName: string;
  type: string;
  responsibleId: string;
  responsibleName: string;
}
