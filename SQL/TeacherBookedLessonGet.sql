CREATE DEFINER=`root`@`%` PROCEDURE `TeacherBookedLessonGet`(
	IN 	PteacherId 	int,
	IN	PdateFrom	date,
    IN	PdateTo		date,
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

SELECT 	lesson_id, 
        lesson_datetime,
        student_id
FROM 	lessons l
JOIN	lessons_posts lp
	ON	lp.lesson_post_id = l.lesson_post_id
WHERE 	lp.teacher_id = PteacherId
	AND	DATE(lesson_datetime) BETWEEN PdateFrom AND PdateTo;

END