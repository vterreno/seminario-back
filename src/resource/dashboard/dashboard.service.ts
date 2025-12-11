import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ventaEntity } from 'src/database/core/venta.entity'
import { CompraEntity } from 'src/database/core/compra.entity'
import { UserEntity } from 'src/database/core/user.entity'
import { ProductoEntity } from 'src/database/core/producto.entity'
import { contactoEntity } from 'src/database/core/contacto.entity'
import { sucursalEntity } from 'src/database/core/sucursal.entity'
import { empresaEntity } from 'src/database/core/empresa.entity'
import { detalleVentaEntity } from 'src/database/core/detalleVenta.entity'
import {
  DashboardMonthlySalesPoint,
  DashboardRecentMovement,
  DashboardResponse,
  DashboardScope,
  DashboardTopProduct,
} from './dto/dashboard-response.dto'

interface DateRange {
  start: Date
  end: Date
}

interface MonthSlot extends DateRange {
  isoMonth: string
  label: string
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ventaEntity)
    private readonly ventasRepository: Repository<ventaEntity>,
    @InjectRepository(CompraEntity)
    private readonly comprasRepository: Repository<CompraEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(ProductoEntity)
    private readonly productosRepository: Repository<ProductoEntity>,
    @InjectRepository(contactoEntity)
    private readonly contactosRepository: Repository<contactoEntity>,
    @InjectRepository(sucursalEntity)
    private readonly sucursalesRepository: Repository<sucursalEntity>,
    @InjectRepository(empresaEntity)
    private readonly empresasRepository: Repository<empresaEntity>,
    @InjectRepository(detalleVentaEntity)
    private readonly detalleVentaRepository: Repository<detalleVentaEntity>,
  ) {}

  async getDashboard(user: UserEntity | undefined): Promise<DashboardResponse> {
    if (!this.canAccessDashboard(user)) {
      throw new ForbiddenException('Solo los administradores pueden acceder al dashboard')
    }

    const empresaId = user?.empresa?.id ?? null
    const scope: DashboardScope = empresaId
      ? {
          type: 'empresa',
          empresa: {
            id: empresaId,
            nombre: user?.empresa?.name ?? 'Mi empresa',
          },
        }
      : { type: 'global' }

    const now = new Date()
    const currentRange = this.getMonthRange(now)
    const previousRange = this.getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1))

    const [
      salesCurrentMonth,
      salesPreviousMonth,
      purchasesCurrentMonth,
      purchasesPreviousMonth,
      totalUsers,
      totalContacts,
      totalProducts,
      totalBranches,
      monthlySales,
      recentSales,
      recentPurchases,
      topProducts,
      totalCompanies,
    ] = await Promise.all([
      this.sumVentasByRange(currentRange, empresaId),
      this.sumVentasByRange(previousRange, empresaId),
      this.sumComprasByRange(currentRange, empresaId),
      this.sumComprasByRange(previousRange, empresaId),
      this.countUsers(empresaId),
      this.countContacts(empresaId),
      this.countProducts(empresaId),
      this.countBranches(empresaId),
      this.getMonthlySalesSeries(empresaId),
      this.getRecentSales(empresaId),
      this.getRecentPurchases(empresaId),
      this.getTopProducts(empresaId),
      scope.type === 'global' ? this.countCompanies() : Promise.resolve(undefined),
    ])

    return {
      scope,
      kpis: {
        salesCurrentMonth,
        salesPreviousMonth,
        purchasesCurrentMonth,
        purchasesPreviousMonth,
        netRevenue: salesCurrentMonth - purchasesCurrentMonth,
        totalUsers,
        totalContacts,
        totalProducts,
        totalBranches,
        totalCompanies,
      },
      charts: {
        monthlySales,
      },
      activity: {
        recentSales,
        recentPurchases,
        topProducts,
      },
      lastUpdated: new Date().toISOString(),
    }
  }

  private canAccessDashboard(user: UserEntity | undefined): boolean {
    if (!user) {
      return false
    }
    const isSuperAdmin = !user.empresa?.id
    const roleName = user.role?.nombre?.toLowerCase() ?? ''
    const isCompanyAdmin = roleName.includes('admin')
    return isSuperAdmin || isCompanyAdmin
  }

  private getMonthRange(reference: Date): DateRange {
    const start = new Date(reference.getFullYear(), reference.getMonth(), 1, 0, 0, 0, 0)
    const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999)
    return { start, end }
  }

  private async sumVentasByRange(range: DateRange, empresaId: number | null): Promise<number> {
    const qb = this.ventasRepository
      .createQueryBuilder('venta')
      .leftJoin('venta.sucursal', 'sucursal')
      .where('venta.fecha_venta BETWEEN :start AND :end', { start: range.start, end: range.end })
      .andWhere('venta.deleted_at IS NULL')

    if (empresaId) {
      qb.andWhere('sucursal.empresa_id = :empresaId', { empresaId })
    }

    const result = await qb.select('COALESCE(SUM(venta.monto_total), 0)', 'total').getRawOne()
    return Number(result?.total) || 0
  }

  private async sumComprasByRange(range: DateRange, empresaId: number | null): Promise<number> {
    const qb = this.comprasRepository
      .createQueryBuilder('compra')
      .leftJoin('compra.sucursal', 'sucursal')
      .where('compra.fecha_compra BETWEEN :start AND :end', { start: range.start, end: range.end })
      .andWhere('compra.deleted_at IS NULL')

    if (empresaId) {
      qb.andWhere('sucursal.empresa_id = :empresaId', { empresaId })
    }

    const result = await qb.select('COALESCE(SUM(compra.monto_total), 0)', 'total').getRawOne()
    return Number(result?.total) || 0
  }

  private async countUsers(empresaId: number | null): Promise<number> {
    const qb = this.usersRepository
      .createQueryBuilder('usuario')
      .where('usuario.status = :status', { status: true })
      .andWhere('usuario.deleted_at IS NULL')

    if (empresaId) {
      qb.andWhere('usuario.empresa_id = :empresaId', { empresaId })
    }

    return qb.getCount()
  }

  private async countContacts(empresaId: number | null): Promise<number> {
    const qb = this.contactosRepository
      .createQueryBuilder('contacto')
      .where('contacto.estado = :estado', { estado: true })
      .andWhere('contacto.deleted_at IS NULL')

    if (empresaId) {
      qb.andWhere('contacto.empresa_id = :empresaId', { empresaId })
    }

    return qb.getCount()
  }

  private async countProducts(empresaId: number | null): Promise<number> {
    const qb = this.productosRepository
      .createQueryBuilder('producto')
      .leftJoin('producto.sucursal', 'sucursal')
      .where('producto.estado = true')
      .andWhere('producto.deleted_at IS NULL')

    if (empresaId) {
      qb.andWhere('sucursal.empresa_id = :empresaId', { empresaId })
    }

    return qb.getCount()
  }

  private async countBranches(empresaId: number | null): Promise<number> {
    const qb = this.sucursalesRepository
      .createQueryBuilder('sucursal')
      .where('sucursal.estado = true')
      .andWhere('sucursal.deleted_at IS NULL')

    if (empresaId) {
      qb.andWhere('sucursal.empresa_id = :empresaId', { empresaId })
    }

    return qb.getCount()
  }

  private async countCompanies(): Promise<number> {
    return this.empresasRepository
      .createQueryBuilder('empresa')
      .where('empresa.estado = true')
      .andWhere('empresa.deleted_at IS NULL')
      .getCount()
  }

  private buildMonthSlots(monthsBack: number): MonthSlot[] {
    const slots: MonthSlot[] = []
    const formatter = new Intl.DateTimeFormat('es-AR', { month: 'short' })
    const today = new Date()

    for (let offset = monthsBack - 1; offset >= 0; offset -= 1) {
      const reference = new Date(today.getFullYear(), today.getMonth() - offset, 1)
      const { start, end } = this.getMonthRange(reference)
      const isoMonth = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`
      const labelRaw = formatter.format(start)
      const label = labelRaw.charAt(0).toUpperCase() + labelRaw.slice(1)
      slots.push({ isoMonth, label, start, end })
    }

    return slots
  }

  private async getMonthlySalesSeries(empresaId: number | null): Promise<DashboardMonthlySalesPoint[]> {
    const slots = this.buildMonthSlots(6)
    const firstSlot = slots[0]

    const qb = this.ventasRepository
      .createQueryBuilder('venta')
      .leftJoin('venta.sucursal', 'sucursal')
      .select("TO_CHAR(venta.fecha_venta, 'YYYY-MM')", 'period')
      .addSelect('COALESCE(SUM(venta.monto_total), 0)', 'total')
      .where('venta.fecha_venta >= :start', { start: firstSlot.start })
      .andWhere('venta.deleted_at IS NULL')

    if (empresaId) {
      qb.andWhere('sucursal.empresa_id = :empresaId', { empresaId })
    }

    const raw = await qb.groupBy('period').orderBy('period', 'ASC').getRawMany()

    const totalsByPeriod = raw.reduce<Record<string, number>>((acc, row) => {
      acc[row.period] = Number(row.total) || 0
      return acc
    }, {})

    return slots.map((slot) => ({
      label: slot.label,
      isoMonth: slot.isoMonth,
      total: totalsByPeriod[slot.isoMonth] ?? 0,
    }))
  }

  private async getRecentSales(empresaId: number | null): Promise<DashboardRecentMovement[]> {
    const qb = this.ventasRepository
      .createQueryBuilder('venta')
      .leftJoinAndSelect('venta.contacto', 'contacto')
      .leftJoinAndSelect('venta.sucursal', 'sucursal')
      .where('venta.deleted_at IS NULL')
      .orderBy('venta.fecha_venta', 'DESC')
      .limit(5)

    if (empresaId) {
      qb.andWhere('sucursal.empresa_id = :empresaId', { empresaId })
    }

    const ventas = await qb.getMany()

    return ventas.map<DashboardRecentMovement>((venta) => ({
      id: venta.id,
      reference: `#${venta.numero_venta}`,
      entity: venta.contacto?.nombre_razon_social ?? 'Consumidor final',
      sucursal: venta.sucursal?.nombre ?? 'Sin sucursal',
      amount: Number(venta.monto_total) || 0,
      date: venta.fecha_venta?.toISOString() ?? new Date().toISOString(),
      type: 'venta',
    }))
  }

  private async getRecentPurchases(empresaId: number | null): Promise<DashboardRecentMovement[]> {
    const qb = this.comprasRepository
      .createQueryBuilder('compra')
      .leftJoinAndSelect('compra.contacto', 'contacto')
      .leftJoinAndSelect('compra.sucursal', 'sucursal')
      .where('compra.deleted_at IS NULL')
      .orderBy('compra.fecha_compra', 'DESC')
      .limit(5)

    if (empresaId) {
      qb.andWhere('sucursal.empresa_id = :empresaId', { empresaId })
    }

    const compras = await qb.getMany()

    return compras.map<DashboardRecentMovement>((compra) => ({
      id: compra.id,
      reference: `#${compra.numero_compra}`,
      entity: compra.contacto?.nombre_razon_social ?? 'Proveedor',
      sucursal: compra.sucursal?.nombre ?? 'Sin sucursal',
      amount: Number(compra.monto_total) || 0,
      date: compra.fecha_compra?.toISOString() ?? new Date().toISOString(),
      type: 'compra',
      status: compra.estado,
    }))
  }

  private async getTopProducts(empresaId: number | null): Promise<DashboardTopProduct[]> {
    const qb = this.detalleVentaRepository
      .createQueryBuilder('detalle')
      .leftJoin('detalle.producto', 'producto')
      .leftJoin('detalle.venta', 'venta')
      .leftJoin('venta.sucursal', 'sucursal')
      .select('producto.id', 'id')
      .addSelect('producto.nombre', 'nombre')
      .addSelect('COALESCE(SUM(detalle.cantidad), 0)', 'unidades')
      .addSelect('COALESCE(SUM(detalle.subtotal), 0)', 'ingresos')
      .where('detalle.deleted_at IS NULL')
      .andWhere('venta.deleted_at IS NULL')
      .andWhere('producto.id IS NOT NULL')
      .groupBy('producto.id')
      .addGroupBy('producto.nombre')
      .orderBy('unidades', 'DESC')
      .limit(5)

    if (empresaId) {
      qb.andWhere('sucursal.empresa_id = :empresaId', { empresaId })
    }

    const raw = await qb.getRawMany()

    return raw.map<DashboardTopProduct>((row) => ({
      id: Number(row.id),
      nombre: row.nombre,
      unidades: Number(row.unidades) || 0,
      ingresos: Number(row.ingresos) || 0,
    }))
  }
}
