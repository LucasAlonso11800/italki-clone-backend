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
    const token = event.headers.authorization as string;
    console.log("event.queryStringParameters", event.queryStringParameters);
    if (!event.queryStringParameters)
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          message: "Missing dates",
          result: [],
        }),
      };

    const { teacher_id, date_from, date_to } = event.queryStringParameters;
    if (!date_from || !date_to)
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          message: "Missing dates",
          result: [],
        }),
      };

    let decoded_teacher_id;
    const diff =
      (new Date(date_to).getTime() - new Date(date_from).getTime()) /
      (1000 * 3600 * 24);

    if (diff !== 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          code: 0,
          message: "Invalid dates",
          result: [],
        }),
      };
    }

    // If there's no teacher id present in the request we look for it in the token
    if (!teacher_id) {
      if (!token) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            code: 0,
            message: "Unauthorized",
            result: [],
          }),
        };
      }
      const authResponse = await internalAPICallDo({
        path: PATHS.auth.verify_access_token,
        method: "POST",
        headers: {
          authorization: token,
        },
      });
      console.log("authResponse", authResponse.data);
      if (
        authResponse.status !== 200 ||
        authResponse.data.code !== 1 ||
        authResponse.data.result.length === 0
      ) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            code: 0,
            errmsg: "Invalid token",
            result: [],
          }),
        };
      }
      decoded_teacher_id = authResponse.data.result[0].teacher_id;
      if (!decoded_teacher_id) {
        return {
          statusCode: 401,
          body: JSON.stringify({
            code: 0,
            errmsg: "Invalid token",
            result: [],
          }),
        };
      }
    }

    const teacherAvailabilityGet = internalAPICallDo({
      method: "POST",
      path: PATHS.services,
      body: {
        procedure: "TeacherAvailabilityGet",
        params: {
          teacher_id: decoded_teacher_id
            ? decoded_teacher_id.toString()
            : teacher_id,
        },
      },
    });
    const teacherBookedLessonGet = internalAPICallDo({
      method: "POST",
      path: PATHS.services,
      body: {
        procedure: "TeacherBookedLessonGet",
        params: {
          teacher_id: decoded_teacher_id
            ? decoded_teacher_id.toString()
            : teacher_id,
          date_from,
          date_to,
        },
      },
    });

    const [teacherAvailability, teacherBookedLessons] = await Promise.all([
      teacherAvailabilityGet,
      teacherBookedLessonGet,
    ]);
    if (!teacherAvailability.data || teacherAvailability.data.code === 0) {
      return {
        statusCode: teacherAvailability.status,
        body: JSON.stringify(teacherAvailability.data),
      };
    }
    if (!teacherBookedLessons.data || teacherBookedLessons.data.code === 0) {
      return {
        statusCode: teacherBookedLessons.status,
        body: JSON.stringify(teacherBookedLessons.data),
      };
    }
    const result = checkAvailability(
      teacherAvailability.data.result,
      teacherBookedLessons.data.result
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 1,
        message: "",
        result,
      }),
    };
  } catch (err: any) {
    console.error(err.response);
    return {
      statusCode: 500,
      body: JSON.stringify(err.response.data),
    };
  }
};

type AvailableHours = {
  teacher_availability_id: number;
  teacher_availability_day_of_week: string;
  teacher_availability_start_time: string;
  teacher_availability_end_time: string;
  is_booked: boolean;
};
type BookedHours = {
  lesson_id: number;
  lesson_datetime: string;
  student_id: number;
};

function checkAvailability(
  availableHours: AvailableHours[],
  bookedHours: BookedHours[]
): AvailableHours[] {
  const availableIntervals: AvailableHours[] = [];

  // Divide each available hour into one-hour intervals
  availableHours.forEach((availableHour) => {
    const startTime = new Date(
      "2023-01-01T" + availableHour.teacher_availability_start_time
    );
    const endTime = new Date(
      "2023-01-01T" + availableHour.teacher_availability_end_time
    );

    while (startTime < endTime) {
      const intervalEnd = new Date(startTime.getTime() + 60 * 60 * 1000); // Add one hour
      const interval = {
        teacher_availability_id: availableHour.teacher_availability_id,
        teacher_availability_day_of_week:
          availableHour.teacher_availability_day_of_week,
        teacher_availability_start_time: startTime
          .toISOString()
          .substring(11, 16),
        teacher_availability_end_time: intervalEnd
          .toISOString()
          .substring(11, 16),
        is_booked: false,
      };
      availableIntervals.push(interval);
      startTime.setTime(intervalEnd.getTime()); // Move to the next hour
    }
  });

  const getDayOfWeek = (datetime: string) => {
    return new Date(datetime).toDateString().slice(0, 2).toUpperCase();
  };
  const getTime = (datetime: string) => {
    return new Date(datetime).toISOString().slice(11, 16);
  };

  // Check if any one-hour interval is booked
  bookedHours.forEach((bookedHour) => {
    availableIntervals.forEach((availableInterval) => {
      const isBooked =
        availableInterval.teacher_availability_day_of_week ===
          getDayOfWeek(bookedHour.lesson_datetime) &&
        availableInterval.teacher_availability_start_time ===
          getTime(bookedHour.lesson_datetime);

      if (isBooked) {
        availableInterval.is_booked = true;
      }
    });
  });

  return availableIntervals;
}
