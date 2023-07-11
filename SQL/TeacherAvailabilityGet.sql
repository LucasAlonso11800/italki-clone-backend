CREATE DEFINER=`root`@`%` PROCEDURE `TeacherAvailabilityGet`(
    IN	PteacherId			int,
	IN	PdateFrom			date,
    IN	PdateTo				date,
	OUT Rcode 				int,
    OUT Rmessage 			varchar(100)
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

SELECT 	teacher_availability_id, 
		teacher_availability_day_of_week, 
        teacher_availability_start_time, 
        teacher_availability_end_time
FROM 	teacher_availability
WHERE 	teacher_id = PteacherId
ORDER 
	BY 	FIELD(teacher_availability_day_of_week,'MO','TU', 'WE', 'TH', 'FR', 'SA', 'SU');

END