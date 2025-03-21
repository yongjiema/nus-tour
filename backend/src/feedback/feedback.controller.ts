import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from "@nestjs/common";
import { FeedbackService } from "./feedback.service";
import { CreateFeedbackDto } from "./dto/create-feedback.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/role.decorator";
import { Logger } from "@nestjs/common";

@Controller("feedback")
export class FeedbackController {
  private readonly logger = new Logger(FeedbackController.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    return this.feedbackService.create(createFeedbackDto, req.user.id);
  }

  @Get()
  findAll(@Query() query) {
    return this.feedbackService.findAll(query);
  }

  @Get("public")
  findPublic() {
    return this.feedbackService.findAll({ isPublic: true });
  }

  @Get("user")
  @UseGuards(JwtAuthGuard)
  async getUserFeedbacks(@Request() req) {
    this.logger.log(`Getting feedbacks for user: ${JSON.stringify(req.user)}`);
    const feedbacks = await this.feedbackService.getFeedbacksByUserId(req.user.id);
    this.logger.log(`Found ${feedbacks.length} feedbacks for user`);
    return {
      data: feedbacks,
      total: feedbacks.length,
    };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.feedbackService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  update(@Param("id") id: string, @Body() updateData: any) {
    return this.feedbackService.update(+id, updateData);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  remove(@Param("id") id: string) {
    return this.feedbackService.remove(+id);
  }
}
