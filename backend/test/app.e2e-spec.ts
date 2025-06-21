import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";
import { Server } from "http";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  // Increase timeout for slower CI environments
  jest.setTimeout(30000);

  beforeAll(async () => {
    // Create a simplified test module that only includes what we need to test
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // Instead of importing the full AppModule which requires DB connections,
      // we'll create a minimal module with just the controller and service we need to test
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer() as Server)
      .get("/")
      .expect(200)
      .expect("NUS Tour Backend");
  });
});
