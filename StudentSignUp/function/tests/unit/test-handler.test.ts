import { handler } from "../../app";
import { expect, describe, it, jest, afterEach } from "@jest/globals";
import * as italkiCloneCommon from "italki-clone-common";
import { Context } from "aws-lambda";

describe("Input validations", () => {
  it("should return 400 status code and error messages if first name is invalid", async () => {
    const event = {
      body: JSON.stringify({})
    };
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid first name",
        result: [],
      }),
    };
    const result = await handler(event as any, {} as Context);
    expect(result).toEqual(expectedResponse);
  });

  it("should return 400 status code and error messages if last name is invalid", async () => {
    const event = {
      body: JSON.stringify({
        first_name: 'Name'
      })
    };
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid last name",
        result: [],
      }),
    };
    const result = await handler(event as any, {} as Context);
    expect(result).toEqual(expectedResponse);
  });

  it("should return 400 status code and error messages if birthdate is invalid", async () => {
    const event = {
      body: JSON.stringify({
        first_name: 'Name',
        last_name: 'Name'
      })
    };
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid birthdate",
        result: [],
      }),
    };
    const result = await handler(event as any, {} as Context);
    expect(result).toEqual(expectedResponse);
  });
  it("should return 400 status code and error messages if birthdate is invalid", async () => {
    const event = {
      body: JSON.stringify({
        first_name: 'Name',
        last_name: 'Name',
        birthdate: '2000-01-01'
      })
    };
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid email",
        result: [],
      }),
    };
    const result = await handler(event as any, {} as Context);
    expect(result).toEqual(expectedResponse);
  });
  it("should return 400 status code and error messages if gender is invalid", async () => {
    const event = {
      body: JSON.stringify({
        first_name: 'Name',
        last_name: 'Name',
        birthdate: '2000-01-01',
        email: 'mail@gmail.com'
      })
    };
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid gender",
        result: [],
      }),
    };
    const result = await handler(event as any, {} as Context);
    expect(result).toEqual(expectedResponse);
  });
  it("should return 400 status code and error messages if password is invalid", async () => {
    const event = {
      body: JSON.stringify({
        first_name: 'Name',
        last_name: 'Name',
        birthdate: '2000-01-01',
        email: 'mail@gmail.com',
        gender: 'M'
      })
    };
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Password is required",
        result: [],
      }),
    };
    const result = await handler(event as any, {} as Context);
    expect(result).toEqual(expectedResponse);
  });
  it("should return 400 status code and error messages if country is invalid", async () => {
    const event = {
      body: JSON.stringify({
        first_name: 'Name',
        last_name: 'Name',
        birthdate: '2000-01-01',
        email: 'mail@gmail.com',
        gender: 'M',
        password: 'passowrd'
      })
    };
    const expectedResponse = {
      statusCode: 400,
      body: JSON.stringify({
        code: 0,
        errmsg: "Invalid country",
        result: [],
      }),
    };
    const result = await handler(event as any, {} as Context);
    expect(result).toEqual(expectedResponse);
  });
});

describe("API Calls", () => {
  const validEvent: any = {
    body: JSON.stringify({
      first_name: "John",
      last_name: "Doe",
      birthdate: "1990-01-01",
      email: "john.doe@example.com",
      gender: "M",
      password: "password",
      country: "USA",
    }),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return 500 status code and error message if call to StudentIns fails", async () => {
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({
        code: 0,
        errmsg: "Error creating the student",
        result: [],
      }),
    };

    const studentInsResponse: any = {
      status: 500,
      data: {
        code: 0,
        errmsg: "Internal error",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentInsResponse);

    const result = await handler(validEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 500 status code and error message if call to StudentCheck fails", async () => {
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({
        code: 0,
        errmsg: "Failed to retrieve student ID",
        result: [],
      }),
    };

    const studentInsResponse: any = {
      status: 200,
      data: {
        code: 1,
        errmsg: "",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentInsResponse);

    const studentCheckResponse: any = {
      status: 500,
      data: {
        code: 0,
        errmsg: "Internal error",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentCheckResponse);

    const result = await handler(validEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 500 status code and error message if generating access token fails", async () => {
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({
        code: 0,
        errmsg: "Error generating access token",
        result: [],
      }),
    };

    const studentInsResponse: any = {
      status: 200,
      data: {
        code: 1,
        errmsg: "",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentInsResponse);

    const studentCheckResponse: any = {
      status: 200,
      data: {
        code: 1,
        errmsg: "",
        result: [{ student_id: 1 }],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentCheckResponse);

    const generateJwtResponse: any = {
      status: 500,
      data: {
        code: 0,
        errmsg: "Internal error",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => generateJwtResponse);

    const result = await handler(validEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });

  it("should return 500 status code and error message if generating refresh token fails", async () => {
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({
        code: 0,
        errmsg: "Error generating refresh token",
        result: [],
      }),
    };

    const studentInsResponse: any = {
      status: 200,
      data: {
        code: 1,
        errmsg: "",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentInsResponse);

    const studentCheckResponse: any = {
      status: 200,
      data: {
        code: 1,
        errmsg: "",
        result: [{ student_id: 1 }],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentCheckResponse);

    const generateJwtResponse: any = {
      status: 200,
      headers: {
        access_token: "access_token",
      },
      data: {
        code: 1,
        errmsg: "",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => generateJwtResponse);

    const generateRefreshTokenResponse: any = {
      status: 500,
      data: {
        code: 0,
        errmsg: "Internal error",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => generateRefreshTokenResponse);

    const result = await handler(validEvent, {} as Context);
    expect(result).toEqual(expectedResponse);
  });

  it("should return 200 status code and tokens in headers if everything went okay", async () => {
    const expectedResponse = {
      statusCode: 200,
      headers: {
        access_token: "access_token",
        refresh_token: "refresh_token",
      },
      body: JSON.stringify({
        code: 1,
        errmsg: "",
        result: [],
      }),
    };

    const studentInsResponse: any = {
      status: 200,
      data: {
        code: 1,
        errmsg: "",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentInsResponse);

    const studentCheckResponse: any = {
      status: 200,
      data: {
        code: 1,
        errmsg: "",
        result: [{ student_id: 1 }],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => studentCheckResponse);

    const generateJwtResponse: any = {
      status: 200,
      headers: {
        access_token: "access_token",
      },
      data: {
        code: 1,
        errmsg: "",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => generateJwtResponse);

    const generateRefreshTokenResponse: any = {
      status: 200,
      headers: {
        refresh_token: "refresh_token",
      },
      data: {
        code: 1,
        errmsg: "",
        result: [],
      },
    };
    jest
      .spyOn(italkiCloneCommon, "internalAPICallDo")
      .mockImplementationOnce(() => generateRefreshTokenResponse);

    const result = await handler(validEvent, {} as Context);

    expect(result).toEqual(expectedResponse);
  });
});
