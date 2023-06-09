import type { Connection } from "mysql2";

export function connectToMySQL(connection: Connection): Promise<void> {
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
