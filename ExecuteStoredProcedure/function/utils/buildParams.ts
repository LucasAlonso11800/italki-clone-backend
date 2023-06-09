import { ParamType } from "italki-clone-common";

const joinParams = (params: ParamType[]): string => {
    return params.map((p) => {
      if (typeof p === "string") {
        return '"' + p + '"';
      }
      return p;
    })
    .join(",");
};

export function buildParams(
  params: ParamType[] = [],
  student_id_required: boolean = false,
  student_id: string = "",
  teacher_id_required: boolean = false,
  teacher_id: string = ""
): string {
  let SPparams = joinParams(params);

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
    SPparams = '@Rcode, @Rmessage';
  }
  return SPparams;
}
