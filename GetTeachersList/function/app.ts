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
    console.log("event.queryStringParameters", event.queryStringParameters);
    if (!event.queryStringParameters || !event.queryStringParameters.language)
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          message: "Missing language",
          result: [],
        }),
      };

    const teacherListGet = internalAPICallDo({
      method: "POST",
      path: PATHS.services,
      body: {
        procedure: "TeacherListGet",
        params: {
          language: event.queryStringParameters.language,
          page: event.queryStringParameters.page,
        },
      },
    });
    const teacherIdsGet = internalAPICallDo({
      method: "POST",
      path: PATHS.services,
      body: {
        procedure: "TeacherIdsGet",
        params: {
          language: event.queryStringParameters.language,
        },
      },
    });

    const [teacherList, teacherIds] = await Promise.all([
      teacherListGet,
      teacherIdsGet,
    ]);

    console.log("teacherList", teacherList);
    console.log("teacherIds", teacherIds);
    const response = [];
    for await (const teacher of teacherList.data.result) {
      const languages = (
        await internalAPICallDo({
          method: "POST",
          path: PATHS.services,
          body: {
            procedure: "TeacherLanguageGet",
            params: {
              teacher_id: teacher.teacher_id.toString(),
            },
          },
        })
      ).data.result;
      response.push({ ...teacher, teacher_languages: languages });
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 1,
        message: "",
        result: [{
            total: teacherIds.data.result.length,
            teachers: response
        }],
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
