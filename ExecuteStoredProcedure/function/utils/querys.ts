import { BodyType } from "italki-clone-common";
import type { Connection, RowDataPacket } from "mysql2";

export async function doQuery<T>(
  connection: Connection,
  query: string
): Promise<T> {
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

export async function doesSPExist(
  connection: Connection,
  procedure: string
): Promise<boolean> {
  try {
    const result: RowDataPacket[] = await doQuery(
      connection,
      `SHOW PROCEDURE STATUS WHERE name = '${procedure}'`
    );
    return result.length > 0;
  } catch (err) {
    throw new Error("Error checking SP existence");
  }
}

export async function callSP(
  connection: Connection,
  procedure: string,
  params: string
): Promise<BodyType<any>> {
  try {
    const query = `CALL ${procedure}(${params}); SELECT @Rcode as 'code', @Rmessage as 'message'`;
    console.log("MYSQL query", query);
    const results: RowDataPacket[][] = await doQuery(connection, query);
    console.log("DB results", results);
    if (results.length === 2) {
      return {
        code: results[1][0].code,
        errmsg: results[1][0].message,
        result: [],
      };
    }
    return {
      code: results[2][0].code,
      errmsg: results[2][0].message,
      result: results[0],
    };
  } catch (err: any) {
    console.error(err);
    throw new Error(err.message);
  }
}
