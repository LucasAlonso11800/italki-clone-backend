import bcrypt from "bcryptjs";
import { internalAPICallDo, PATHS } from "italki-clone-common";
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
    // Retrieve the login data from the request body
    const { email, password } = JSON.parse(event.body as string);

    // Check if the email and password are provided
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Email and password are required",
          result: [],
        }),
      };
    }

    // Check if the student exists
    const studentCheckResponse = await internalAPICallDo({
      path: PATHS.services,
      method: "POST",
      body: {
        procedure: "StudentCheck",
        params: { email },
      },
    });
    console.log('studentCheckResponse', studentCheckResponse.data)
    if (
      !studentCheckResponse.data ||
      studentCheckResponse.data.code !== 1 ||
      studentCheckResponse.data.result.length === 0
    ) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid credentials",
          result: [],
        }),
      };
    }

    // Verify the password
    const student = studentCheckResponse.data.result[0];

    const passwordMatch = await bcrypt.compare(password, student.password);
    if (!passwordMatch) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid credentials",
          result: [],
        }),
      };
    }

    // Generate access token
    const generateJwtResponse = await internalAPICallDo({
      path: PATHS.auth.generate_access_token,
      method: "POST",
      body: {
        student_id: student.student_id,
      },
    });

    if (
      !generateJwtResponse.data ||
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
    // Generate refresh token
    const generateRefreshTokenResponse = await internalAPICallDo({
      path: PATHS.auth.generate_refresh_token,
      method: "POST",
      body: {
        student_id: student.student_id,
      },
    });

    if (
      !generateRefreshTokenResponse.data ||
      generateRefreshTokenResponse.data.code !== 1 ||
      !generateRefreshTokenResponse.headers["refresh_token"]
    ) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          code: 0,
          errmsg: "Error generating refresh token",
          result: [],
        }),
      };
    }
    // Return tokens
    return {
      statusCode: 200,
      headers: {
        access_token: generateJwtResponse.headers["access_token"],
        refresh_token: generateRefreshTokenResponse.headers["refresh_token"],
      },
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };
  } catch (error: any) {
    console.log(error);
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
