import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { PayoutsService } from './payouts.service'
import { SubmitKycDto } from './payouts.dto'

@ApiTags('Payouts')
@ApiCookieAuth()
@Controller('v1/payouts')
@UseGuards(AuthGuard, RolesGuard)
@Roles('creator')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('kyc')
  @ApiOperation({ summary: 'Submit KYC + bank → create Razorpay Route linked account' })
  submitKyc(@Session() session: AppUserSession, @Body() dto: SubmitKycDto) {
    return this.payoutsService.submitKyc(session.user.id, session.user.email, dto)
  }

  @Get('kyc')
  @ApiOperation({ summary: 'Current KYC + payout-eligibility status' })
  getKycStatus(@Session() session: AppUserSession) {
    return this.payoutsService.getKycStatus(session.user.id)
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Aggregate earnings (available / held / pending) from the ledger' })
  getEarnings(@Session() session: AppUserSession) {
    return this.payoutsService.getEarnings(session.user.id)
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Per-booking earnings ledger' })
  getLedger(@Session() session: AppUserSession) {
    return this.payoutsService.getLedger(session.user.id)
  }

  @Get('history')
  @ApiOperation({ summary: 'Settlement / payout history' })
  getPayouts(@Session() session: AppUserSession) {
    return this.payoutsService.getPayouts(session.user.id)
  }
}
