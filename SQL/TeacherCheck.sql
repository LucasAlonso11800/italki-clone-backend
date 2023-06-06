CREATE DEFINER=`root`@`%` PROCEDURE `TeacherCheck`(
	IN Pemail varchar(40),
	OUT Rcode int,
    OUT Rmessage varchar(100)
)
BEGIN

DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
	GET DIAGNOSTICS CONDITION 1
    Rmessage = MESSAGE_TEXT;
    SET RCode := 0;
	ROLLBACK;
END;

SET RCode := 1;
SET Rmessage := NULL;

SELECT 	teacher_id
FROM	teachers
WHERE	teacher_email = Pemail;

END