export type DashboardScope =
  | { type: 'global' }
  | { type: 'empresa'; empresa: { id: number; nombre: string } }

export interface DashboardKpis {
  salesCurrentMonth: number
  salesPreviousMonth: number
  purchasesCurrentMonth: number
  purchasesPreviousMonth: number
  netRevenue: number
  totalUsers: number
  totalContacts: number
  totalProducts: number
  totalBranches: number
  totalCompanies?: number
}

export interface DashboardMonthlySalesPoint {
  label: string
  isoMonth: string
  total: number
}

export interface DashboardRecentMovement {
  id: number
  reference: string
  entity: string
  sucursal: string
  amount: number
  date: string
  type: 'venta' | 'compra'
  status?: string
}

export interface DashboardTopProduct {
  id: number
  nombre: string
  unidades: number
  ingresos: number
}

export interface DashboardResponse {
  scope: DashboardScope
  kpis: DashboardKpis
  charts: {
    monthlySales: DashboardMonthlySalesPoint[]
  }
  activity: {
    recentSales: DashboardRecentMovement[]
    recentPurchases: DashboardRecentMovement[]
    topProducts: DashboardTopProduct[]
  }
  lastUpdated: string
}
