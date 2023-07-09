import AWS from "aws-sdk";
import { BodyType, ParamType, UnionType } from "italki-clone-common";
import moment from "moment";

type ReturnType = {
  requires_student_id: boolean;
  requires_teacher_id: boolean;
  requires_login: boolean;
  orderedParams: UnionType[];
};

export const VALIDATE_PARAMS_ERRORS = {
  internal: "Error validating parameters",
};

export async function validateParams(
  procedure: string,
  params: ParamType
): Promise<BodyType<ReturnType>> {
  try {
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const { Item } = await dynamodb
      .get({
        TableName: "SPMetadata",
        Key: {
          procedure,
        },
      })
      .promise();

    if (!Item) {
      return {
        code: 0,
        errmsg: `Procedure "${procedure}" not found.`,
        result: [],
      };
    }

    const storedParameters = Item.params;
    console.log("storedParameters", storedParameters);

    const orderedParams = [];

    for (const storedParam in storedParameters) {
      const { order, required, type } = storedParameters[storedParam];
      const receivedParam = params[storedParam];

      if (!receivedParam && required) {
        return {
          code: 0,
          errmsg: `Required parameter '${storedParam}' is missing.`,
          result: [],
        };
      }
      if (!receivedParam && !required) {
        orderedParams[order - 1] = null;
        continue;
      }

      if (type !== typeof receivedParam) {
        return {
          code: 0,
          errmsg: `Unexpected type '${typeof receivedParam}' for parameter '${storedParam}'. Expected '${type}'`,
          result: [],
        };
      }
      orderedParams[order - 1] = receivedParam;
    }

    if (Item.requires_timestamp) {
      orderedParams.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
    }

    return {
      code: 1,
      errmsg: "",
      result: [
        {
          requires_student_id: Item.requires_student_id,
          requires_teacher_id: Item.requires_teacher_id,
          requires_login: Item.requires_login,
          orderedParams,
        },
      ],
    };
  } catch (error) {
    console.error(error);
    return {
      code: 0,
      errmsg: VALIDATE_PARAMS_ERRORS.internal,
      result: [],
    };
  }
}
