import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
  Context,
} from "aws-lambda";
import { handler } from "../../app";
import { expect, describe, it, jest, afterEach } from "@jest/globals";

import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  ...(jest.requireActual("jsonwebtoken") as any),
  sign: jest.fn().mockReturnValue("mytoken"),
}));

describe("Lambda Function Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 status code and error message if a body without ids is used", async () => {
    const mockEvent = {
      body: JSON.stringify({ foo: "bar" }),
    } as APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;

    const mockContext = {};

    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid data",
        result: [],
      }),
    };

    const result = await handler(mockEvent, mockContext as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 400 status code and error message if a body with two ids is used", async () => {
    const mockEvent = {
      body: JSON.stringify({
        student_id: 123,
        teacher_id: 123,
      }),
    } as APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;

    const mockContext = {};

    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid data",
        result: [],
      }),
    };

    const result = await handler(mockEvent, mockContext as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 200 status code and new refresh token", async () => {
    const mockEvent = {
      body: JSON.stringify({
        student_id: 123,
      }),
    } as APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;

    const sign = jest.spyOn(jwt, "sign");
    sign.mockImplementation(() => "mytoken");

    const expectedResponse = {
      statusCode: 200,
      headers: {
        refresh_token: "mytoken",
      },
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };

    const result = await handler(mockEvent, {} as Context);
    expect(result).toEqual(expectedResponse);
  });

  it("should return 500 status code and error message if an error occurs", async () => {
    const mockEvent = {
      body: JSON.stringify({
        student_id: "your-student-id",
      }),
    } as APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;

    const mockError = new Error("Some error");

    jest.spyOn(jwt, "sign").mockImplementation(() => {
      throw mockError;
    });

    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({
        code: 0,
        errmsg: "Some error",
        result: [],
      }),
    };

    const result = await handler(mockEvent, {} as Context);

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        student_id: "your-student-id",
      },
      "somesecret",
      {
        expiresIn: 60 * 60 * 24,
      }
    );
    expect(result).toEqual(expectedResponse);
  });
});
