CREATE DEFINER=`root`@`%` PROCEDURE `TeacherLessonGet`(
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

SELECT 	lesson_post_id, 
		teacher_id, 
        lesson_post_title, 
        lesson_post_price, 
        lesson_post_description, 
        l.language_id,
        language_level_id_from, 
        ll1.language_level_name,
        ll1.language_level_code,
        language_level_id_to,
        ll2.language_level_name,
        ll2.language_level_code
FROM	lesson_posts lp
JOIN	languages l
	ON	l.language_id = lp.language_id
JOIN	language_levels ll1
	ON	ll1.language_level_id = language_level_id_from
JOIN	language_levels ll2
	ON	ll2.language_level_id = language_level_id_to
WHERE	teacher_id = PteacherId;

END