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
    if (!event.pathParameters || !event.pathParameters.id)
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          message: "Missing teacher id",
          result: [],
        }),
      };
    const teacherId = event.pathParameters.id;

    const teacherInfoGet = internalAPICallDo({
      method: "POST",
      path: PATHS.services,
      body: {
        procedure: "TeacherInfoGet",
        params: { teacherId },
      },
    });
    const teacherReviewGet = internalAPICallDo({
      method: "POST",
      path: PATHS.services,
      body: {
        procedure: "TeacherReviewGet",
        params: { teacherId },
      },
    });

    const teacherLessonGet = internalAPICallDo({
      method: "POST",
      path: PATHS.services,
      body: {
        procedure: "TeacherLessonGet",
        params: { teacherId },
      },
    });

    const [teacherInfo, teacherReviews, teacherLessons] = await Promise.all([
      teacherInfoGet,
      teacherReviewGet,
      teacherLessonGet,
    ]);
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 1,
        message: "",
        result: [{
          ...teacherInfo.data.result[0],
          teacher_reviews: teacherReviews.data.result,
          teacher_lessons: teacherLessons.data.result
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
