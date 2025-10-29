import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { CoursePopularityRankingDto, CourseRatingRankingDto, UserRankingDto } from './dto/ranking.dto';

@Controller('ranking')
export class RankingController {
    constructor(private readonly rankingService: RankingService) {}

    @Get('students')
    async getTopStudents(
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ): Promise<UserRankingDto[]> {
        return this.rankingService.getTopStudentsByPoints(limit);
    }

    @Get('courses/rating')
    async getTopRatedCourses(
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ): Promise<CourseRatingRankingDto[]> {
        return this.rankingService.getTopRatedCourses(limit);
    }

    @Get('courses/popularity')
    async getMostPopularCourses(
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ): Promise<CoursePopularityRankingDto[]> {
        return this.rankingService.getMostPopularCourses(limit);
    }
}
