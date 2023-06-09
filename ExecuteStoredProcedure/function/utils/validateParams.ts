import AWS from "aws-sdk";
import { BodyType, ParamType, UnionType } from "italki-clone-common";
import moment from "moment";

type ReturnType = {
  requires_student_id: boolean;
  requires_teacher_id: boolean;
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

    const { Item } = await dynamodb.get({
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
      const { order, required } = storedParameters[storedParam];
      const receivedParam = params[storedParam];

      if (required && !receivedParam) {
        return {
          code: 0,
          errmsg: `Required parameter "${storedParam}" is missing.`,
          result: [],
        };
      }
      orderedParams[order - 1] = receivedParam;
    }

    if (Item.requires_timestamp.BOOL) {
      orderedParams.push(moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
    }

    return {
      code: 1,
      errmsg: "",
      result: [
        {
          requires_student_id: Boolean(Item.requires_student_id.BOOL),
          requires_teacher_id: Boolean(Item.requires_teacher_id.BOOL),
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
