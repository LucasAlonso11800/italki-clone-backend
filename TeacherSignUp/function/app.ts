import bcrypt from "bcrypt";
import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from "aws-lambda";
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
        firstName,
        lastName,
        birthdate,
        email,
        gender,
        password,
        country,
        startDate = new Date().toISOString().slice(0, 10),
        professional,
        description,
        experience,
        methods,
        image,
        video,
        languages,
      } = JSON.parse(event.body as string);
  
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
  
      // Check if the birthdate is at least 18 years ago
      const currentDate = new Date();
      const eighteenYearsAgo = new Date();
      eighteenYearsAgo.setFullYear(currentDate.getFullYear() - 18);
      if (new Date(birthdate) > eighteenYearsAgo) {
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
  
      // Transform the languages array into two strings with the ids separated by ";"
      const languageIds = languages.map((lang: Language) => lang.language_id).join(";");
      const languageLevelIds = languages
        .map((lang: Language) => lang.language_level_id)
        .join(";");
  
      // Call the stored procedure to insert the teacher into the database
      const teacherInsResponse = await internalAPICallDo(PATHS.services, {
        procedure: "TeacherIns",
        params: [
          firstName,
          lastName,
          birthdate,
          email,
          gender,
          hashedPassword,
          country,
          startDate,
          professional,
          description,
          experience,
          methods,
          image,
          video,
          languageIds,
          languageLevelIds,
        ],
      });
  
      // Check if the teacher was inserted successfully
      if (teacherInsResponse.data.code !== 1) {
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
      const teacherCheckResponse = await internalAPICallDo(PATHS.services, {
        procedure: "TeacherCheck",
        params: [email],
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
            errmsg: "Failed to retrieve teacher",
            result: [],
          }),
        };
      }
  
      const { teacher_id } = teacherCheckResponse.data.result[0];
  
      // Generate access token
      const generateJwtResponse = await internalAPICallDo(
        PATHS.auth.generate_access_token,
        {
          teacher_id,
        }
      );
  
      // Generate refresh token
      const generateRefreshTokenResponse = await internalAPICallDo(
        PATHS.auth.generate_refresh_token,
        {
          teacher_id,
        }
      );
      // Return the JWT token
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 1,
          errmsg: "",
          result: [
            {
              access_token: generateJwtResponse.headers["token"],
              refresh_token: generateRefreshTokenResponse.headers["token"],
            },
          ],
        }),
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          code: 0,
          errmsg: "Internal server error",
          result: [],
        }),
      };
    }
  };
  