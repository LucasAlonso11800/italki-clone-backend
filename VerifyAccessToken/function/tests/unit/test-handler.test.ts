import { handler } from "../../app";
import {
  expect,
  describe,
  it,
  jest,
  afterEach
} from "@jest/globals";

describe("Lambda Function Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 status code and error message if token is invalid", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.uk2_JH80ds1KzwSrvdxY3L9V-Uwh9tbv_PEJ0NUxTpU";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    };

    const expectedResponse = {
      statusCode: 401,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid token",
        result: [],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 401 status code and error message if token doesn't have the correct info", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.iYIIldDJWYJRo-EZhcFS5PqdsQiArHCQF1XONE6AqGI";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    };

    const expectedResponse = {
      statusCode: 401,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid token",
        result: [],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 401 status code and error message if token has the two ids", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidGVhY2hlcl9pZCI6MTIzLCJzdHVkZW50X2lkIjoxMjMsImlhdCI6MTUxNjIzOTAyMn0.rGSZNYjQxHNpzm9kD_9P2gATs7ytlslHRIy4uR1vHlY";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    };

    const expectedResponse = {
      statusCode: 401,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid token",
        result: [],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
  });
  
  it("should return 200 status code and decoded token data if token is valid with a student_id", async () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwic3R1ZGVudF9pZCI6MTIzLCJpYXQiOjE1MTYyMzkwMjJ9.sJN41xuemspYBcy0bnitT9kMCr05cehHkm5izgJuaT4";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    };

    const decodedToken = {
      student_id: 123,
    };

    const expectedResponse = {
      statusCode: 200,
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [decodedToken],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 200 status code and decoded token data if token is valid with a teacher_id", async () => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidGVhY2hlcl9pZCI6MTIzLCJpYXQiOjE1MTYyMzkwMjJ9.SLuoGKFE5sS_3YqJ44kiYE7zZAiMvWjOnNj9xVm7xLo";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    };

    const decodedToken = {
      teacher_id: 123,
    };

    const expectedResponse = {
      statusCode: 200,
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [decodedToken],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
  });
});
