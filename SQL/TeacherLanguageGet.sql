CREATE DEFINER=`root`@`%` PROCEDURE `TeacherLanguageGet`(
	IN 	PteacherId 	int,
	OUT Rcode 		int,
    OUT Rmessage 	varchar(100)
)
SP:BEGIN

DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
	GET DIAGNOSTICS CONDITION 1
    Rmessage = MESSAGE_TEXT;
    SET Rcode := 0;
END;

SET Rcode := 1;
SET Rmessage := NULL;

SELECT	teacher_language_id, 
		teacher_id, 
        language_id,
        language_name,
        language_level_id,
        language_level_name,
        language_level_code,
        teacher_teaches
FROM	teacher_languages tl
JOIN	languages l
	ON	l.language_id = tl.language_id
JOIN	language_levels ll
	ON	ll.language_level_id = tl.language_level_id
WHERE	tl.teacher_id = PteacherId;
END