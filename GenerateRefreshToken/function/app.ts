import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "./env";
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

    const noIDs = !student_id && !teacher_id;
    const twoIDs = student_id && teacher_id
    if (noIDs || twoIDs) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid data",
          result: [],
        }),
      };
    }

    // Generate the JWT token with the user information
    const refresh_token = jwt.sign(
      { student_id, teacher_id },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: 60 * 60 * 24,
      }
    );

    return {
      statusCode: 200,
      headers: {
        refresh_token,
      },
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };
  } catch (error: any) {
    console.error(error);
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
