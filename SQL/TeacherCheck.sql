CREATE DEFINER=`root`@`%` PROCEDURE `TeacherCheck`(
	IN Pemail varchar(40),
	OUT Rcode int,
    OUT Rmessage varchar(100)
)
SP:BEGIN

DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
	GET DIAGNOSTICS CONDITION 1
    Rmessage = MESSAGE_TEXT;
    SET Rcode := 0;
	ROLLBACK;
END;

SET Rcode := 1;
SET Rmessage := NULL;

SELECT 	teacher_id,
		teacher_password as 'password'
FROM	teachers
WHERE	teacher_email = Pemail;

IF FOUND_ROWS() = 0 THEN
	SET Rcode := 0;
	SET Rmessage := "Not found";
    LEAVE SP;
END IF;

END