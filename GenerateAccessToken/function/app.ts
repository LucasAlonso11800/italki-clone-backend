import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "./env";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract user information from the event payload or request parameters
    const { student_id, teacher_id } = JSON.parse(event.body as string);

    if (!student_id && !teacher_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Bad request",
          result: [],
        }),
      };
    }
    // Generate the JWT token with the user information
    const access_token = jwt.sign(
      { student_id, teacher_id },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: 60 * 15,
      }
    );

    return {
      statusCode: 200,
      headers: {
        access_token,
      },
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        code: 0,
        errmsg: error.message,
        result: [],
      }),
    };
  }
};
