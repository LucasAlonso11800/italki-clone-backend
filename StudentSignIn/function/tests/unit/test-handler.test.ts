import { handler } from "../../app";
import { expect, describe, it, jest, afterEach } from "@jest/globals";
import * as italkiCloneCommon from "italki-clone-common";

jest.mock("italki-clone-common");

describe("Lambda Function Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 status code and error message if email is missing", async () => {
    const mockEvent = {
      body: JSON.stringify({
        email: "",
        password: "password123",
      }),
    };

    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Email and password are required",
        result: [],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 400 status code and error message if password is missing", async () => {
    const mockEvent = {
      body: JSON.stringify({
        email: "blahblah@gmail.com",
        password: "",
      }),
    };

    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Email and password are required",
        result: [],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 404 status code and error message if student does not exist", async () => {
    const mockEvent = {
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "password123",
      }),
    };

    const studentCheckResponse = {
      status: 500,
      data: {
        code: 0,
        errmsg: "Internal error",
        result: [],
      },
    } as any;

    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementation(() => studentCheckResponse);

    const expectedResponse = {
      statusCode: 404,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid credentials",
        result: [],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
    expect(italkiCloneCommon.internalAPICallDo).toHaveBeenCalledWith(
      italkiCloneCommon.PATHS.services,
      {
        procedure: "StudentCheck",
        params: ["nonexistent@example.com"],
      }
    );
  });

  it("should return 401 status code and error message if password is incorrect", async () => {
    const mockEvent = {
      body: JSON.stringify({
        email: "student@example.com",
        password: "wrongpassword",
      }),
    };

    const studentCheckResponse = {
      status: 200,
      data: {
        code: 1,
        errmsg: "",
        result: [
          {
            student_id: 123,
            password: "hashed-password",
          },
        ],
      },
    } as any;

    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementation(() => studentCheckResponse);

    const expectedResponse = {
      statusCode: 401,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid credentials",
        result: [],
      }),
    };

    const result = await handler(mockEvent as any, {} as any);

    expect(result).toEqual(expectedResponse);
    expect(italkiCloneCommon.internalAPICallDo).toHaveBeenCalledWith(
      italkiCloneCommon.PATHS.services,
      {
        procedure: "StudentCheck",
        params: ["student@example.com"],
      }
    );
  });
});
