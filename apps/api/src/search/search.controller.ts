import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { SearchService } from './search.service'

@ApiTags('Search')
@Controller('v1/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggestions')
  @ApiOperation({ summary: 'Typeahead suggestions for creators, courses, and topics' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (min 2 chars)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results (default 10)' })
  getSuggestions(
    @Query('q') q: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.searchService.getSuggestions(q ?? '', Math.min(limit, 30))
  }
}
