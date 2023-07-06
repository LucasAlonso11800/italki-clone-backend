import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { internalAPICallDo, PATHS } from "italki-clone-common";
import { Context } from "vm";
const s3 = new AWS.S3();

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const token = event.headers.authorization as string;
  const { first_name, last_name, gender, image, country_id, email } =
    JSON.parse(event.body as string);
  // Check if the first name is valid
  if (!first_name || first_name.length > 40) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid first name",
        result: [],
      }),
    };
  }

  // Check if the last name is valid
  if (!last_name || last_name.length > 40) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid last name",
        result: [],
      }),
    };
  }
  // Check if the gender is valid
  const validGenders = ["F", "M", "X"];
  if (!gender || !validGenders.includes(gender)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid gender",
        result: [],
      }),
    };
  }
  // Check if the country is valid
  if (!country_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid country",
        result: [],
      }),
    };
  }

  const bucketName = "italki-clone-students";
  const key = `${email}.jpg`;
  const imageData = Buffer.from(image, 'base64')
  // Set up the parameters for S3 upload
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: imageData,
    ContentType: "image/jpg",
  };

  let imageUrl;
  try {
    if (image) {
      await s3.upload(params).promise();
      imageUrl = `https://${bucketName}.s3-us-west-2.amazonaws.com/${key}`;
    }
    const response = await internalAPICallDo({
      method: "POST",
      path: PATHS.services,
      body: {
        procedure: "StudentProfileUpd",
        params: {
          first_name,
          last_name,
          gender,
          image: imageUrl,
          country_id,
        },
      },
      headers: {
        authorization: token,
      },
    });
    if (!response.data || response.data.code !== 1) {
      return {
        statusCode: response.status,
        body: JSON.stringify(response.data),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        code: 0,
        errmsg: error.message,
        result: [],
      }),
    };
  }
};
