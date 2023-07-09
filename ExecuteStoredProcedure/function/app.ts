import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import mysql from "mysql2";
import { PATHS, internalAPICallDo } from "italki-clone-common";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "./env";
import {
  VALIDATE_PARAMS_ERRORS,
  callSP,
  connectToMySQL,
  validateParams,
} from "./utils";

let connection: mysql.Connection;

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract the JWT from the request headers
    const token = event.headers.authorization as string;
    console.log("event.headers.authorization", token);

    // Retrieve the stored procedure name and parameters from the event
    console.log("event", event);
    const { procedure, params } = JSON.parse(event.body as string);

    if (!procedure) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Missing procedure",
          result: [],
        }),
      };
    }
    if (!params) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          errmsg: "Missing params",
          result: [],
        }),
      };
    }
    // Param validation with dynamo db
    const validateParamsResponse = await validateParams(procedure, params);
    console.log("validateParamsResponse", validateParamsResponse);

    if (validateParamsResponse.code === 0) {
      return {
        statusCode:
          validateParamsResponse.errmsg === VALIDATE_PARAMS_ERRORS.internal
            ? 500
            : 400,
        body: JSON.stringify({
          code: validateParamsResponse.code,
          errmsg: validateParamsResponse.errmsg,
          result: [],
        }),
      };
    }

    const {
      orderedParams,
      requires_student_id,
      requires_teacher_id,
      requires_login,
    } = validateParamsResponse.result[0];

    let student_id, teacher_id;

    // Verify token with verification lambda and validates if required ids are present
    if (requires_login) {
      const authResponse = await internalAPICallDo({
        path: PATHS.auth.verify_access_token,
        method: "POST",
        headers: {
          authorization: token,
        },
      });
      console.log("authResponse", authResponse.data);
      if (
        authResponse.status !== 200 ||
        authResponse.data.code !== 1 ||
        authResponse.data.result.length === 0
      ) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            code: 0,
            errmsg: "Invalid token",
            result: [],
          }),
        };
      }

      student_id = authResponse.data.result[0].student_id;
      teacher_id = authResponse.data.result[0].teacher_id;

      if (!student_id && !teacher_id) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            code: 0,
            errmsg: "Invalid token",
            result: [],
          }),
        };
      }

      if (requires_student_id && student_id){
        orderedParams.push(student_id)
      }
      if (requires_teacher_id && teacher_id){
        orderedParams.push(teacher_id)
      }
    }

    // Connect to the database
    connection = mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
    });

    await connectToMySQL(connection);

    // Execute the stored procedure with the provided parameters
    const { code, errmsg, result } = await callSP(
      connection,
      procedure,
      orderedParams
    );

    // Close the database connection
    connection.end();

    return {
      statusCode: code === 0 ? 400 : 200,
      body: JSON.stringify({
        code,
        errmsg,
        result,
      }),
    };
  } catch (error: any) {
    console.error(error);
    // Close the database connection in case of error
    connection.end();
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
