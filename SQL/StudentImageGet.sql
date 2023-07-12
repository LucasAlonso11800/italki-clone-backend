CREATE DEFINER=`root`@`%` PROCEDURE `StudentImageGet`(
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

SELECT 	student_image
FROM	students
WHERE	student_id = PstudentId;

END