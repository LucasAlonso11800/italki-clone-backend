import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import mysql from "mysql2";
import {
  BodyType,
  PATHS,
  internalAPICallDo,
} from "italki-clone-common";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "./env";
import { SPList } from "./SPList";
import { buildParams } from "./utils";

let connection: mysql.Connection;

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
    connection = mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });
    
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
    const SPParams = buildParams(
      params,
      SP.student_id_required,
      student_id,
      SP.teacher_id_required,
      teacher_id
    );

    const { code, errmsg, result } = await callSP(procedure, SPParams);

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

async function mysqlQuery<T>(query: string): Promise<T> {
  return new Promise((resolve, reject) => {
    connection.query(query, (error: any, results: T) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

function checkSPExists(procedure: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    connection.query(
      `SHOW PROCEDURE STATUS WHERE name = '${procedure}'`,
      (error, results: mysql.RowDataPacket[]) => {
        if (error) {
          reject(error);
        } else {
          resolve(results.length > 0);
        }
      }
    );
  });
}

async function callSP(
  procedure: string,
  params: string
): Promise<BodyType<any>> {
  try {
    const SPQuery = `CALL ${procedure}(${params})`;
    console.log("MYSQL SPQuery", SPQuery);
    const outParamsQuery = `SELECT @Rcode as 'code', @Rmessage as 'message'`;
    const SPQueryResults = await mysqlQuery<mysql.RowDataPacket[][]>(SPQuery);
    console.log("SPQueryResults", SPQueryResults);
    const outParamsQueryResults = await mysqlQuery<mysql.RowDataPacket[]>(
      outParamsQuery
    );
    console.log("outParamsQueryResults", outParamsQueryResults);
    return {
      code: outParamsQueryResults[0].code,
      errmsg: outParamsQueryResults[0].message,
      result: SPQueryResults[0],
    };
  } catch (err: any) {
    console.error(err);
    return {
      code: 0,
      errmsg: err.message,
      result: [],
    };
  }
}
