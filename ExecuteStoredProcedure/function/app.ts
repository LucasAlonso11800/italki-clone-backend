import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import mysql from "mysql2";
import {
  BodyType,
  ParamType,
  PATHS,
  internalAPICallDo,
} from "italki-clone-common";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "./env";
import { SPList } from "./SPList";

const connection = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Extract the JWT from the request headers
    const token = event.headers.authorization;
    console.log("event.headers.authorization", token);
    // Retrieve the stored procedure name and parameters from the event
    const { procedure, params } = JSON.parse(event.body as string);
    console.log("procedure", procedure);
    console.log("params", params);

    const SP = SPList.find((sp) => sp.name === procedure);
    console.log("SP", SP);
    if (!SP) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          code: 0,
          errmsg: "Invalid service",
          result: [],
        }),
      };
    }

    let student_id, teacher_id;

    if (SP.student_id_required || SP.teacher_id_required) {
      // Make an HTTP request to the authentication Lambda function
      const authResponse = await internalAPICallDo(
        PATHS.auth.verify_access_token,
        {},
        {
          authorization: token,
        }
      );
      console.log("authResponse", authResponse);
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

      if (!student_id && !SP.student_id_required) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            code: 0,
            errmsg: "Invalid token",
            result: [],
          }),
        };
      }
      if (!teacher_id && !SP.teacher_id_required) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            code: 0,
            errmsg: "Invalid token",
            result: [],
          }),
        };
      }
    }
    // Connect to the database
    await connectToDatabase();

    // Check if the stored procedure exists
    const exists = await checkSPExists(procedure);

    if (!exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          code: 0,
          errmsg: `Stored procedure '${procedure}' does not exist.`,
          result: [],
        }),
      };
    }

    // Execute the stored procedure with the provided parameters
    const { code, errmsg, result } = await callSP(
      procedure,
      params,
      SP.student_id_required,
      student_id,
      SP.teacher_id_required,
      teacher_id
    );

    // Close the database connection
    connection.end();

    if (code === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code,
          errmsg,
          result: [],
        }),
      };
    }

    return {
      statusCode: 200,
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

function connectToDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    connection.connect((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function checkSPExists(procedure: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    connection.query(
      `SHOW PROCEDURE STATUS WHERE name = '${procedure}'`,
      (error, results: mysql.RowDataPacket[][]) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      }
    );
  });
}

function callSP(
  procedure: string,
  params: ParamType[],
  student_id_required: boolean | undefined,
  student_id: string | undefined,
  teacher_id_required: boolean | undefined,
  teacher_id: string | undefined
): Promise<BodyType<any>> {
  return new Promise((resolve, reject) => {
    const paramString = params.length > 0 ? params.join(",") : "";

    let authParams = "";
    if (student_id_required) {
      authParams.concat(", ", student_id as string);
    }
    if (teacher_id_required) {
      authParams.concat(", ", teacher_id as string);
    }

    const query = `CALL ${procedure}(${paramString}${authParams}, 1, "")`;
    console.log("MYSQL query", query);

    connection.query(query, (error, results: mysql.RowDataPacket[][]) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          code: results[0][0].code,
          errmsg: results[0][0].errmsg,
          result: results[1],
        });
      }
    });
  });
}
