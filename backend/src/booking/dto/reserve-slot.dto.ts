import { IsInt, Min, Max, IsDateString, IsString } from "class-validator";

export class ReserveSlotDto {
  @IsDateString()
  date!: string;

  @IsInt()
  @Min(1, { message: "Group size must be at least 1 person" })
  @Max(50, { message: "Group size cannot exceed 50 people" })
  groupSize!: number;

  @IsString()
  timeSlot!: string;

  deposit?: number;
}
