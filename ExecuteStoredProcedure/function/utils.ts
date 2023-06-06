import { ParamType } from "italki-clone-common";

export const buildParams = (
  params: ParamType[] = [],
  student_id_required: boolean | undefined = false,
  student_id: string = "",
  teacher_id_required: boolean | undefined = false,
  teacher_id: string = ""
): string => {
  let SPparams: string = "";
  if (params.length > 0) {
    SPparams = params
      .map((p) => {
        if (typeof p === "string") {
          return '"' + p + '"';
        }
        return p;
      })
      .join(",");
  }

  if (student_id_required) {
    if (SPparams) {
      SPparams = SPparams.concat(", ", student_id);
    } else {
      SPparams = student_id;
    }
  }
  if (teacher_id_required) {
    if (SPparams) {
      SPparams = SPparams.concat(", ", teacher_id);
    } else {
      SPparams = teacher_id;
    }
  }

  if (SPparams) {
    SPparams = SPparams.concat(", ", "@Rcode", ", ", "@Rmessage");
  } else {
    SPparams = '"@Rcode", "@Rmessage"';
  }
  return SPparams;
};
