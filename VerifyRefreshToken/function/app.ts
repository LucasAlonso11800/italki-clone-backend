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
    const refreshToken = event.headers.authorization as string;
    console.log("event.headers.authorization", refreshToken);
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
        }),
      };
    }

    const noIDs = !decodedToken.student_id && !decodedToken.teacher_id;
    const twoIDs = decodedToken.student_id && decodedToken.teacher_id;
    if (noIDs || twoIDs) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid token",
          result: [],
        }),
      };
    }

    // Generate JWT token
    const generateJwtResponse = await internalAPICallDo({
      path: PATHS.auth.generate_access_token,
      method: "POST",
      body: {
        student_id: decodedToken.student_id,
        teacher_id: decodedToken.teacher_id,
      },
    });
    console.log("generateJwtResponse", generateJwtResponse);
    
    if (
      !generateJwtResponse.data ||
      generateJwtResponse.status !== 200 ||
      generateJwtResponse.data.code !== 1 ||
      !generateJwtResponse.headers["access_token"]
    ) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          code: 0,
          errmsg: "Error generating access token",
          result: [],
        }),
      };
    }
    // Return success response with the new access token
    return {
      statusCode: 200,
      headers: {
        access_token: generateJwtResponse.headers["access_token"],
        refresh_token: refreshToken,
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
      statusCode: 401,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid token",
        result: [],
      }),
    };
  }
};
