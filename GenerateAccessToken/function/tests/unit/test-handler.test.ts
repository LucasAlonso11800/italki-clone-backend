import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    Context,
  } from "aws-lambda";
  import { handler } from "../../app";
  import jwt, { JwtPayload } from "jsonwebtoken";
  import { expect, describe, it, jest } from "@jest/globals";
  
  describe("Lambda Function", () => {
    // Test case for successful execution with student_id
    it("should return a valid response with access_token when student_id is provided", async () => {
      const student_id = "123";
      const event = {
        body: JSON.stringify({
          student_id,
        }),
      } as APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;
  
      const context = {} as Context;
  
      const result = await handler(event, context);
  
      expect(result.statusCode).toBe(200);
      expect(result.headers?.access_token).toBeDefined();
      expect(typeof result.body).toBe("string");
  
      const body = JSON.parse(result.body);
      expect(body.code).toBe(1);
      expect(body.errmsg).toBe("");
      expect(Array.isArray(body.result)).toBe(true);
  
      const decodedToken = jwt.decode(
        result.headers?.access_token as string
      ) as JwtPayload;
      expect(decodedToken.student_id).toBe(student_id);
    });
  
    // Test case for successful execution with teacher_id
    it("should return a valid response with access_token when teacher_id is provided", async () => {
      const teacher_id = "456";
      const event = {
        body: JSON.stringify({
          teacher_id,
        }),
      } as APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;
  
      const context = {} as Context;
  
      const result = await handler(event, context);
  
      expect(result.statusCode).toBe(200);
      expect(result.headers?.access_token).toBeDefined();
      expect(typeof result.body).toBe("string");
  
      const body = JSON.parse(result.body);
      expect(body.code).toBe(1);
      expect(body.errmsg).toBe("");
      expect(Array.isArray(body.result)).toBe(true);
  
      const decodedToken = jwt.decode(
        result.headers?.access_token as string
      ) as JwtPayload;
  
      expect(decodedToken.teacher_id).toBe(teacher_id);
    });
  
    // Test case for handling an error
    it("should return an error response when an exception is thrown", async () => {
      const event = {
        body: JSON.stringify({
          student_id: null,
          teacher_id: null,
        }),
      } as APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;
  
      const context = {} as Context;
  
      // Simulate an error by throwing an exception
      jest.spyOn(JSON, "parse").mockImplementation(() => {
        throw new Error("Some error occurred");
      });
  
      const result = await handler(event, context);
      expect(result.statusCode).toBe(500);
      expect(typeof result.body).toBe("string");
  
      const body = JSON.parse(result.body);
      expect(body.code).toBe(1);
      expect(body.errmsg).toBe("Some error occurred");
      expect(Array.isArray(body.result)).toBe(true);
    });
  });
  