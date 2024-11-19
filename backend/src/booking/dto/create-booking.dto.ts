export class CreateBookingDto {
  name: string;
  email: string;
  date: string;
  groupSize: number;
  timeSlot: string;
  deposit?: number;
}
