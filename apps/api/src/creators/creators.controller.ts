import { Controller, Get, HttpCode, Param } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { CreatorsService } from './creators.service'

@ApiTags('Creators')
@Controller('v1/creators')
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Get(':username')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get public creator profile by username' })
  getByUsername(@Param('username') username: string) {
    return this.creatorsService.getPublicProfile(username)
  }
}
