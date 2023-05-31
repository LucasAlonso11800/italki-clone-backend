import bcrypt from "bcryptjs";
import { PATHS, internalAPICallDo } from "italki-clone-common";
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
    // Retrieve the sign-up data from the request body
    const { firstName, lastName, birthdate, email, gender, password, country } =
      JSON.parse(event.body as string);

    // Check if the first name is valid
    if (!firstName || firstName.length > 40) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid first name",
          result: [],
        }),
      };
    }

    // Check if the last name is valid
    if (!lastName || lastName.length > 40) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid last name",
          result: [],
        }),
      };
    }

    // Check if the birthdate is at least 12 years ago
    const currentDate = new Date();
    const twelveYearsAgo = new Date();
    twelveYearsAgo.setFullYear(currentDate.getFullYear() - 12);
    if (new Date(birthdate) > twelveYearsAgo) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid birthdate",
          result: [],
        }),
      };
    }

    // Check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid email",
          result: [],
        }),
      };
    }

    // Check if the gender is valid
    const validGenders = ["F", "M", "X"];
    if (!gender || !validGenders.includes(gender)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid gender",
          result: [],
        }),
      };
    }

    // Check if the password is provided
    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Password is required",
          result: [],
        }),
      };
    }

    // Check if the country is valid
    if (!country) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid country",
          result: [],
        }),
      };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Call the stored procedure to store the student information
    const studentInsResponse = await internalAPICallDo(PATHS.services, {
      procedure: "StudentIns",
      params: [
        firstName,
        lastName,
        birthdate,
        email,
        gender,
        hashedPassword,
        country,
      ],
    });

    // Check if the stored procedure execution was successful
    if (studentInsResponse.data.code !== 1) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          code: 0,
          errmsg: "Error creating the student",
          result: [],
        }),
      };
    }

    // Check if the student exists
    const studentCheckResponse = await internalAPICallDo(PATHS.services, {
      procedure: "StudentCheck",
      params: [email],
    });

    if (
      !studentCheckResponse.data ||
      studentCheckResponse.data.code !== 1 ||
      studentCheckResponse.data.result.length === 0
    ) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          code: 0,
          errmsg: "Failed to retrieve student ID",
          result: [],
        }),
      };
    }

    const { student_id } = studentCheckResponse.data.result[0];

    // Generate access token
    const generateJwtResponse = await internalAPICallDo(
      PATHS.auth.generate_access_token,
      {
        student_id: student_id,
      }
    );
    // Generate refresh token
    const generateRefreshTokenResponse = await internalAPICallDo(
      PATHS.auth.generate_refresh_token,
      {
        student_id: student_id,
      }
    );
    // Return the tokens
    return {
      statusCode: 200,
      headers: {
          access_token: generateJwtResponse.headers["token"],
          refresh_token: generateRefreshTokenResponse.headers["token"],
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
