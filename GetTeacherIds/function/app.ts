import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
  } from "aws-lambda";
  import { internalAPICallDo, PATHS } from "italki-clone-common";
  
  export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> => {
    try {
      const teacherIds = await internalAPICallDo({
        method: "POST",
        path: PATHS.services,
        body: {
          procedure: "TeacherIdsGet",
          params: {  },
        },
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          code: 1,
          message: "",
          result: teacherIds.data.result,
        }),
      };
    } catch (err: any) {
      console.error(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          code: 0,
          message: err.message,
          result: [],
        }),
      };
    }
  };
  