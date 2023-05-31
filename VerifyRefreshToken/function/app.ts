import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import jwt, { JwtPayload } from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "./env";
import { internalAPICallDo, PATHS } from "italki-clone-common";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Retrieve the refresh token from the request
    const refreshToken = event.headers.Authorization as string;

    // Validate the refresh token
    const decodedToken = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET
    ) as JwtPayload;
    if (!decodedToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid token",
          result: [],
        })
      };
    }

    // Generate JWT token
    const generateJwtResponse = await internalAPICallDo(
      PATHS.auth.generate_access_token,
      {
        student_id: decodedToken.student_id,
        teacher_id: decodedToken.teacher_id,
      }
    );

    // Return success response with the new access token
    return {
      statusCode: 200,
      headers: {
        access_token: generateJwtResponse.headers["token"],
        refresh_token: refreshToken,
      },
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };
  } catch (error: any) {
    console.error(error)
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
