import { handler } from "../../app";
import jwt from "jsonwebtoken";
import * as italkiCloneCommon from "italki-clone-common";
import { expect, describe, it, jest, afterEach } from "@jest/globals";
import { Context } from "aws-lambda";

jest.mock("italki-clone-common");

describe("Lambda Function Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 status code and error message if refresh token is invalid", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwic3R1ZGVudF9pZCI6MTIzLCJ0ZWFjaGVyX2lkIjpudWxsfQ.eGVpS3sATVZTzSgNlZLrRsx8G6kkXRBWvahAngrZb34";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    } as any;

    const expectedResponse = {
      statusCode: 401,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid token",
        result: [],
      }),
    };

    const result = await handler(mockEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 401 status code and error message if refresh token contains two ids", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwic3R1ZGVudF9pZCI6MTIzLCJ0ZWFjaGVyX2lkIjoxMjN9.vc4u9utxT7pfi9Iwq7cbAqKkPP514JN7T3OyvUIihEA";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    } as any;

    const expectedResponse = {
      statusCode: 401,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid token",
        result: [],
      }),
    };

    const result = await handler(mockEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 401 status code and error message if refresh token doesnt contain any id", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.RvBB-NzHVSvVSP016idh-5KAv_6mcePKPXNE0X0mw7E";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    } as any;

    const expectedResponse = {
      statusCode: 401,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid token",
        result: [],
      }),
    };

    const result = await handler(mockEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 500 status code and error message if call to GenerateAccessToken lambda fails", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwic3R1ZGVudF9pZCI6MTIzLCJpYXQiOjE1MTYyMzkwMjJ9.sJN41xuemspYBcy0bnitT9kMCr05cehHkm5izgJuaT4";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    } as any;

    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({
        code: 0,
        errmsg: "Error generating access token",
        result: [],
      }),
    };

    jest.spyOn(italkiCloneCommon, "internalAPICallDo").mockImplementation(
      () =>
        ({
          status: 500,
          data: {
            code: 0,
            errmsg: "Internal error",
            result: [],
          },
        } as any)
    );

    const result = await handler(mockEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 200 status code and new access token if refresh token is valid", async () => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwic3R1ZGVudF9pZCI6MTIzLCJpYXQiOjE1MTYyMzkwMjJ9.sJN41xuemspYBcy0bnitT9kMCr05cehHkm5izgJuaT4";
    const mockEvent = {
      headers: {
        Authorization: token,
      },
    } as any;

    const expectedResponse = {
      statusCode: 200,
      headers: {
        access_token: "access_token",
        refresh_token: token,
      },
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };

    jest.spyOn(italkiCloneCommon, "internalAPICallDo").mockImplementation(
      () =>
        ({
          status: 200,
          headers: {
            access_token: "access_token",
          },
          data: {
            code: 1,
            errmsg: "",
            result: [],
          },
        } as any)
    );

    const result = await handler(mockEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });
});
