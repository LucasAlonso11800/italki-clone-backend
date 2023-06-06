import { ParamType } from "italki-clone-common";

export const buildParams = (
    params: ParamType[] = [],
    student_id_required: boolean | undefined = false,
    student_id: string = '',
    teacher_id_required: boolean | undefined = false,
    teacher_id: string = ''
): string => {
    let SPparams: string = params.length > 0 ? params.join(", ") : "";

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
    console.log('SPparams', SPparams)
    if (SPparams) {
        SPparams = SPparams.concat(", ", "1", ", ", "''");
    } else {
      SPparams = "1, ''";
    }
    return SPparams;
}