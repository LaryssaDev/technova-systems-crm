
import { User, UserRole } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin1',
    login: 'laryssagf19',
    name: 'Laryssa G.',
    role: UserRole.ADMIN,
    password: '19122002Laah'
  },
  {
    id: 'admin2',
    login: 'rafaely.silva',
    name: 'Rafaely Silva',
    role: UserRole.ADMIN,
    password: 'rafasilva2410'
  },
  {
    id: 'vendedor1',
    login: 'vendedor.demo',
    name: 'Vendedor Exemplo',
    role: UserRole.SELLER,
    password: 'demo123'
  }
];

export const STATUS_COLORS = {
  PROSPECT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  REUNIÃO: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  FECHADO: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PERDIDO: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
};
