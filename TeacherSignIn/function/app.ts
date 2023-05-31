import {
    internalAPICallDo,
    PATHS,
  } from "italki-clone-common";
  import bcrypt from "bcryptjs";
  import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
  
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
  
      // Check if the teacher exists
      const teacherCheckResponse = await internalAPICallDo(PATHS.services, {
        procedure: "TeacherCheck",
        params: [email]
      });
  
      if (
        !teacherCheckResponse.data ||
        teacherCheckResponse.data.code !== 1 ||
        teacherCheckResponse.data.result.length === 0
      ) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            code: 0,
            errmsg: "Invalid credentials",
            result: [],
          })
        };
      }
  
      // Verify the password
      const teacher = teacherCheckResponse.data.result[0];
      const passwordMatch = await bcrypt.compare(password, teacher.password);
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
      const generateJwtResponse = await internalAPICallDo(
        PATHS.auth.generate_access_token,
        {
          teacher_id: teacher.teacher_id,
        }
      );
  
      // Generate refresh token
      const generateRefreshTokenResponse = await internalAPICallDo(
        PATHS.auth.generate_refresh_token,
        {
          teacher_id: teacher.teacher_id,
        }
      );
      // Return the JWT token
      return {
        statusCode: 200,
        headers: {
          access_token: generateJwtResponse.headers["token"],
          refresh_token: generateRefreshTokenResponse.headers["token"],
        },
        body: JSON.stringify({
          code: 1,
          errmsg: "",
          result: []
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
        })
      };
    }
  };
  