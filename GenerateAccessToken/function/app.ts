import jwt from "jsonwebtoken";
import { ContextType } from "italki-clone-common";
import { ACCESS_TOKEN_SECRET } from "./env";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent,
  context: ContextType
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract user information from the event payload or request parameters
    const { student_id, teacher_id } = JSON.parse(event.body as string);

    // Generate the JWT token with the user information
    const access_token = jwt.sign(
      { student_id, teacher_id },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: 60 * 15,
      }
    );

    return {
      statusCode: 200,
      headers: {
        access_token,
      },
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        code: 1,
        errmsg: "Some error ocurred",
        result: [],
      }),
    };
  }
};
