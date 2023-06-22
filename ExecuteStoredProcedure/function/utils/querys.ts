import { BodyType , UnionType} from "italki-clone-common";
import type { Connection, RowDataPacket } from "mysql2";

const joinParams = (params: UnionType[]): string => params.reduce((acc: string, param, index) => {
  let result = '';
  if (typeof param === 'string') {
      result += `"${param}"`
  } else {
      result += param
  }
  if (index < params.length -1) result += ',' 
  return acc + result;
}, '');

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
  }
  if (teacher_id) {
    if (SPparams) {
      SPparams = SPparams.concat(", ", teacher_id);
    } else {
      SPparams = teacher_id;
    }
  }

  query += SPparams.length
    ? `(${SPparams}, @Rcode, @Rmessage);`
    : "(@Rcode, @Rmessage);";

  query += "SELECT @Rcode as 'code', @Rmessage as 'message';";
  return query;
};

export function callSP(
  connection: Connection,
  procedure: string,
  params: UnionType[],
  student_id: UnionType = null,
  teacher_id: UnionType = null
): Promise<BodyType<any>> {
  return new Promise((resolve, reject) => {
    const query = buildQuery(procedure, params, student_id, teacher_id);
    console.log("MYSQL query", query);
    connection.query(query, (error: any, results: RowDataPacket[][]) => {
      if (error) {
        reject(error);
      } else {
        console.log("DB results", results);
        console.log("DB results length", results.length);
        if (results.length === 2) {
          resolve({
            code: results[1][0].code,
            errmsg: results[1][0].message,
            result: [],
          });
        }
        resolve({
          code: results[2][0].code,
          errmsg: results[2][0].message,
          result: results[0],
        });
      }
    });
  });
}

