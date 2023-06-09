import bcrypt from "bcryptjs";
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";
import { internalAPICallDo, PATHS } from "italki-clone-common";

type Language = {
  language_id: string;
  language_level_id: string;
};

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Retrieve the sign-up data from the request body
    const {
      first_name,
      last_name,
      birthdate,
      email,
      gender,
      password,
      country,
      professional,
      description,
      experience,
      methods,
      image,
      video,
      languages,
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
    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18);
    if (!birthdate || new Date(birthdate) > eighteenYearsAgo) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "You must be at least 18 years old to sign up as a teacher",
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

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

    // Check if the professional value is valid
    const validProfessionalValues = ["Y", "N"];
    if (!professional || !validProfessionalValues.includes(professional)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid value for professional",
          result: [],
        }),
      };
    }

    // Check if the description is valid
    if (!description || description.length > 1000) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid value for description",
          result: [],
        }),
      };
    }

    // Check if the experience is valid
    if (!experience || experience.length > 1000) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid value for experience",
          result: [],
        }),
      };
    }

    // Check if the methods is valid
    if (!methods || methods.length > 1000) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid value for methods",
          result: [],
        }),
      };
    }

    // Check if the image is a valid URL
    const imageRegex = /^(http|https):\/\/[^ "]+$/;
    if (image && !imageRegex.test(image)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid image",
          result: [],
        }),
      };
    }

    // Check if the video is a valid URL
    const videoRegex = /^(http|https):\/\/[^ "]+$/;
    if (video && !videoRegex.test(video)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid video",
          result: [],
        }),
      };
    }
    // Check if languages are valid
    if (
      !languages ||
      !languages.every((lang: Language) => lang.language_id && lang.language_level_id)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid value for languages",
          result: [],
        }),
      };
    }

    // Transform the languages array into two strings with the ids separated by ";"
    const languageIds =
      languages.map((lang: Language) => lang.language_id).join(";") + ";";
    const languageLevelIds =
      languages.map((lang: Language) => lang.language_level_id).join(";") + ";";

    // Call the stored procedure to insert the teacher into the database
    const teacherInsResponse = await internalAPICallDo({
        path: PATHS.services,
        method: "POST",
        body: {
          procedure: "TeacherIns",
          params: {
            first_name,
            last_name,
            birthdate,
            email,
            gender,
            password: hashedPassword,
            country,
            professional,
            description,
            experience,
            methods,
            image,
            video,
            language_ids: languageIds,
            language_level_ids: languageLevelIds,
          },
        } 
    });

    // Check if the teacher was inserted successfully
    if (!teacherInsResponse.data || teacherInsResponse.data.code !== 1) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          code: 0,
          errmsg: "Failed to create teacher",
          result: [],
        }),
      };
    }

    // Check if the teacher exists
    const teacherCheckResponse = await internalAPICallDo({
      path: PATHS.services,
      method: "POST",
      body: {
        procedure: "TeacherCheck",
        params: {email},
      }
    });

    if (
      !teacherCheckResponse.data ||
      teacherCheckResponse.data.code !== 1 ||
      teacherCheckResponse.data.result.length === 0
    ) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          code: 0,
          errmsg: "Failed to retrieve teacher ID",
          result: [],
        }),
      };
    }

    const { teacher_id } = teacherCheckResponse.data.result[0];

    // Generate access token
    const generateJwtResponse = await internalAPICallDo({
      path: PATHS.auth.generate_access_token,
      method: "POST",
      body: {
        teacher_id,
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
        teacher_id,
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
    // Return the JWT token
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
