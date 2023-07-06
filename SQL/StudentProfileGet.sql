CREATE DEFINER=`root`@`%` PROCEDURE `StudentProfileGet`(
	IN 	PstudentId int,
	OUT Rcode int,
    OUT Rmessage varchar(100)
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

SELECT 	student_id, 
		student_first_name, 
        student_last_name, 
        student_birthdate, 
        student_email, 
        student_gender, 
        student_image, 
        s.country_id,
        country_name
FROM	students s
JOIN	countries c
	ON	s.country_id = c.country_id
WHERE	student_id = PstudentId;

END