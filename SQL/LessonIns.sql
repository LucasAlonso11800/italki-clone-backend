CREATE DEFINER=`root`@`%` PROCEDURE `LessonIns`(
	IN 	PlessonPostId 	int,
    IN	Pdatetime		datetime,
    IN	PstudentId		int,
    IN	Ptimestamp 		datetime,
	OUT Rcode 			int,
    OUT Rmessage 		varchar(100)
)
SP:BEGIN

DECLARE BteacherId int;
DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
	GET DIAGNOSTICS CONDITION 1
    Rmessage = MESSAGE_TEXT;
    SET Rcode := 0;
END;

SET Rcode := 1;
SET Rmessage := NULL;

SELECT 	teacher_id
INTO	BteacherId
FROM 	lessons_posts
WHERE	lesson_post_id = PlessonPostId;

IF BteacherId IS NULL THEN
	SET Rcode := 0;
	SET Rmessage := "Lesson doesn't exists";
    LEAVE SP;
END IF;

IF NOT EXISTS (SELECT 	student_id
				FROM 	students
                WHERE	student_id = PstudentId) THEN
	SET Rcode := 0;
	SET Rmessage := "Student doesn't exists";
    LEAVE SP;
END IF;

IF Pdatetime <= Ptimestamp THEN
	SET Rcode := 0;
	SET Rmessage := "Invalild date";
    LEAVE SP;
END IF;

IF NOT EXISTS (SELECT 	teacher_availability_id
				FROM	teacher_availability
                WHERE	teacher_id = BteacherId
                AND		UPPER(SUBSTRING(DAYNAME(DATE(Pdatetime)), 1, 2)) = teacher_availability_day_of_week
                AND 	TIME(Pdatetime) >= teacher_availability_start_time
                AND		TIME(ADDTIME(Pdatetime, '01:00:00')) <= teacher_availability_end_time) THEN
	SET Rcode := 0;
	SET Rmessage := "Teacher not available";
    LEAVE SP;
END IF;

IF EXISTS (SELECT 	lesson_id
			FROM	lessons l
            WHERE	l.lesson_post_id IN (SELECT lp.lesson_post_id
										FROM	lessons_posts lp
										WHERE	lp.teacher_id = BteacherId)
			AND		DATE(l.lesson_datetime) = DATE(Pdatetime)
			AND		(l.lesson_datetime > ADDTIME(Pdatetime, '01:00:00')
            OR		ADDTIME(l.lesson_datetime, '01:00:00') > Pdatetime)) THEN
	SET Rcode := 0;
	SET Rmessage := "Teacher not available";
    LEAVE SP;
END IF;

INSERT INTO lessons
(`lesson_post_id`,
`student_id`,
`lesson_completed`,
`lesson_datetime`)
VALUES (PlessonPostId, PstudentId, "N", Pdatetime);

END