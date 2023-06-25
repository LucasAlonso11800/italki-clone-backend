CREATE DEFINER=`root`@`%` PROCEDURE `TeacherInfoGet`(
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

SELECT 
    t.teacher_id,
    t.teacher_first_name,
    t.teacher_last_name,
    t.teacher_birthdate,
    t.teacher_description,
    t.teacher_about_me,
    t.teacher_me_as_a_teacher,
    t.teacher_teaching_style,
    t.teacher_email,
    t.teacher_gender,
    t.teacher_image,
    t.teacher_video,
    t.teacher_professional,
    t.teacher_startdate,
    t.country_id,
    c.country_name,
    AVG(tr.teacher_review_rating) AS average_rating,
    COUNT(DISTINCT l.lesson_id) AS total_lessons,
    COUNT(DISTINCT l.student_id) AS total_students
FROM
    teachers t
    JOIN countries c ON c.country_id = t.country_id
    LEFT JOIN teacher_reviews tr ON tr.teacher_id = t.teacher_id
    LEFT JOIN lessons_posts lp ON lp.teacher_id = t.teacher_id
    LEFT JOIN lessons l ON l.lesson_post_id = lp.lesson_post_id
WHERE
    t.teacher_id = PteacherId
GROUP BY
    t.teacher_id;

END