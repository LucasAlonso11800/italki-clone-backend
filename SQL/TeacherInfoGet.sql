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

SELECT 	teacher_id, 
		teacher_first_name, 
        teacher_last_name, 
        teacher_birthdate, 
        teacher_description, 
        teacher_experience, 
        teacher_methods, 
        teacher_email, 
        teacher_password, 
        teacher_gender, 
        teacher_image, 
        teacher_video, 
        teacher_professional, 
        teacher_startdate, 
        t.country_id,
		country_name
FROM 	teachers t
JOIN	countries c
	ON	c.country_id = t.country_id
WHERE 	teacher_id = PteacherId;

END