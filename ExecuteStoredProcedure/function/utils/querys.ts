import { BodyType , UnionType} from "italki-clone-common";
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

const joinParams = (params: UnionType[]): string => {
  return params
    .map((p) => {
      if (typeof p === "string") {
        return '"' + p + '"';
      }
      return p;
    })
    .join(",");
};

const buildQuery = (
  procedure: string,
  params: UnionType[],
  student_id: UnionType = null,
  teacher_id: UnionType = null
): string => {
  student_id = student_id?.toString() || null;
  teacher_id = teacher_id?.toString() || null;
  let query = `CALL ${procedure}`;

  let SPparams = joinParams(params);

  if (student_id) {
    if (SPparams) {
      SPparams = SPparams.concat(", ", student_id);
    } else {
      SPparams = student_id;
    }
  };
  if (teacher_id) {
    if (SPparams) {
      SPparams = SPparams.concat(", ", teacher_id);
    } else {
      SPparams = teacher_id;
    }
  };

  query += params.length
    ? `(${params}, @Rcode, @Rmessage);`
    : "(@Rcode, @Rmessage)";

  query += "SELECT @Rcode as 'code', @Rmessage as 'message';";
  return query;
};

export async function callSP(
  connection: Connection,
  procedure: string,
  params: UnionType[],
  student_id: UnionType = null,
  teacher_id: UnionType = null
): Promise<BodyType<any>> {
  try {
    const query = buildQuery(procedure, params, student_id, teacher_id);
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
