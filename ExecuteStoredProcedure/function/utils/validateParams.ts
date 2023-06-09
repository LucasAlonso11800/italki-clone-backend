import { DynamoDB } from "aws-sdk";
import { BodyType } from "italki-clone-common";
import moment from "moment";
// import { ParamType } from "italki-clone-common";

const dynamodb = new DynamoDB();

type UnionType = string | number | null;
type ParamType = { [key: string]: UnionType };
type ReturnType = {
  requires_student_id: boolean;
  requires_teacher_id: boolean;
  orderedParams: UnionType[];
};

export const VALIDATE_PARAMS_ERRORS = {
    internal: "Error validating parameters"
};

export async function validateParams(
  procedure: string,
  params: ParamType
): Promise<BodyType<ReturnType>> {
  try {
    const getItemParams: DynamoDB.GetItemInput = {
      TableName: "SPMetadata",
      Key: {
        procedure: { S: procedure },
      },
    };

    const { Item } = await dynamodb.getItem(getItemParams).promise();

    if (!Item) {
      return {
        code: 0,
        errmsg: `Procedure "${procedure}" not found.`,
        result: [],
      };
    }

    const storedParameters = DynamoDB.Converter.unmarshall({
      M: Item.params,
    });
    console.log("storedParameters", storedParameters);

    const orderedParams = [];

    for (const storedParam in storedParameters) {
      const { name, order, required } = storedParameters[storedParam];
      const receivedParam = params[name];

      if (required && !receivedParam) {
        return {
            code: 0,
            errmsg: `Required parameter "${name}" is missing.`,
            result: [],
          };
      }
      orderedParams[order] = receivedParam;
    }

    if (Item.requires_timestamp.BOOL) {
        orderedParams.push(moment().format('YYYY-MM-DD HH:mm:ss.SSS'))
    };

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
    return {
      code: 0,
      errmsg: VALIDATE_PARAMS_ERRORS.internal,
      result: [],
    };
  }
}
