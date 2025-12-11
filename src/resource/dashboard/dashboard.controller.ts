import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { AuthGuard } from 'src/middlewares/auth.middleware'
import { PermissionsGuard } from 'src/middlewares/permission.middleware'
import { Action } from 'src/middlewares/decorators/action.decorator'
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator'
import { RequestWithUser } from '../users/interface/request-user'

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Action('ver')
  getDashboard(@Req() req: RequestWithUser) {
    return this.dashboardService.getDashboard(req.user)
  }
}
