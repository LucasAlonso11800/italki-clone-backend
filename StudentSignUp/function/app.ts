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
    console.log('event.body', event.body);

    const {
      first_name,
      last_name,
      birthdate,
      email,
      gender,
      password,
      country,
    } = JSON.parse(event.body as string);

    // Check if the first name is valid
    if (!first_name || first_name.length > 40) {
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
    if (!last_name || last_name.length > 40) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid last name",
          result: [],
        }),
      };
    }

    // Check if the birthdate is at least 18 years ago
    const currentDate = new Date();
    const min = new Date();
    min.setFullYear(currentDate.getFullYear() - 18);
    if (!birthdate || new Date(birthdate) > min) {
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
    const studentInsResponse = await internalAPICallDo({
      path: PATHS.services,
      method: "POST",
      body: {
        procedure: "StudentIns",
        params: {
          first_name,
          last_name,
          birthdate,
          email,
          gender,
          password: hashedPassword,
          country,
        },
      },
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
    const studentCheckResponse = await internalAPICallDo({
      path: PATHS.services,
      method: "POST",
      body: {
        procedure: "StudentCheck",
        params: { email },
      },
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
    const generateJwtResponse = await internalAPICallDo({
      path: PATHS.auth.generate_access_token,
      method: "POST",
      body: {
        student_id: student_id,
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
        student_id: student_id,
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
    // Return the tokens
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
