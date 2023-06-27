CREATE DEFINER=`root`@`%` PROCEDURE `TeacherListGet`(
	IN	Ppage			int,
    IN	PlanguageName 	varchar(20),
	OUT Rcode 			int,
    OUT Rmessage 		varchar(100)
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

SELECT	t.teacher_id,
		teacher_image,
		country_image,
		AVG(teacher_review_rating) as average_rating,
		teacher_first_name,
		teacher_last_name,
        teacher_description,
		teacher_professional,
		teacher_me_as_a_teacher,
		lp.lesson_post_price as trial_lesson_price,
        COUNT(distinct(l.lesson_id)) as total_lessons
FROM	teachers t
JOIN	countries c
	ON	c.country_id = t.country_id
JOIN	teacher_reviews tr
	ON	tr.teacher_id = t.teacher_id
JOIN	lessons_posts lp
	ON	lp.teacher_id = t.teacher_id
    AND	lesson_post_is_trial = "Y"
JOIN	lessons l
	ON	l.lesson_post_id = lp.lesson_post_id
WHERE	lp.language_id = (select	language_id
							from	languages
                            where	language_name = PlanguageName)
GROUP BY	t.teacher_id
LIMIT 	Boffset, 10;

END