CREATE DEFINER=`root`@`%` PROCEDURE `TeacherReviewGet`(
	IN 	PteacherId 	int,
	IN	Ppage		int,
	OUT Rcode 		int,
    OUT Rmessage 	varchar(100)
)
SP:BEGIN

DECLARE Boffset INT;

DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
	GET DIAGNOSTICS CONDITION 1
    Rmessage = MESSAGE_TEXT;
    SET Rcode := 0;
END;

SET Rcode := 1;
SET Rmessage := NULL;

IF Ppage IS NULL THEN
	SET Boffset := 0;
ELSE
	SET Boffset := Ppage * 10;
END IF;

SELECT 	teacher_review_id, 
		teacher_id, 
        s.student_id, 
        student_first_name,
        student_last_name,
        student_image,
        teacher_review_date, 
        teacher_review_text, 
        teacher_review_is_pick,
        count(l.lesson_id) as 'student_total_lessons'
FROM 	teacher_reviews tr
LEFT OUTER JOIN	students s
	ON	s.student_id = tr.student_id
LEFT OUTER JOIN	lessons l
	ON	l.student_id = s.student_id
WHERE	teacher_id = PteacherId
GROUP BY l.student_id
ORDER 
	BY 	FIELD(teacher_review_is_pick,'Y','N'), teacher_review_date desc
LIMIT 	Boffset, 10;

END