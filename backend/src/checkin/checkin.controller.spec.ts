import { Test, TestingModule } from "@nestjs/testing";
import { CheckinController } from "./checkin.controller";
import { CheckinService } from "./checkin.service";
import { CheckinDto } from "./dto/checkin.dto";

describe("CheckinController", () => {
  let controller: CheckinController;
  let service: jest.Mocked<CheckinService>;

  beforeEach(async () => {
    const mockCheckinService = {
      checkIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckinController],
      providers: [
        {
          provide: CheckinService,
          useValue: mockCheckinService,
        },
      ],
    }).compile();

    controller = module.get<CheckinController>(CheckinController);
    service = module.get(CheckinService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("checkIn", () => {
    it("should successfully check in a booking", async () => {
      const checkinDto: CheckinDto = {
        bookingId: "booking-1",
        email: "test@example.com",
      };

      const serviceResult = { message: "Check-in successful" };
      service.checkIn.mockResolvedValue(serviceResult);

      const result = await controller.checkIn(checkinDto);

      expect(service.checkIn).toHaveBeenCalledWith(checkinDto);
      expect(result).toEqual({ message: "Check-in successful!" });
    });

    it("should handle service errors", async () => {
      const checkinDto: CheckinDto = {
        bookingId: "invalid-booking",
        email: "test@example.com",
      };

      service.checkIn.mockRejectedValue(new Error("Booking not found"));

      await expect(() => controller.checkIn(checkinDto)).rejects.toThrow("Booking not found");
      expect(service.checkIn).toHaveBeenCalledWith(checkinDto);
    });
  });
});
