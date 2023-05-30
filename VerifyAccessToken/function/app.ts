import jwt, { JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "./env";
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const token = event.headers.Authorization as string;

    const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;

    if (!decodedToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid token",
          result: [],
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [
          {
            student_id: decodedToken.student_id,
            teacher_id: decodedToken.teacher_id,
          },
        ],
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
