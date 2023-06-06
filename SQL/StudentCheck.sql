CREATE DEFINER=`root`@`%` PROCEDURE `StudentCheck`(
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
END;

SET Rcode := 1;
SET Rmessage := NULL;

SELECT 	student_id
FROM	students
WHERE	student_email = Pemail;

IF FOUND_ROWS() = 0 THEN
	SET Rcode := 0;
	SET Rmessage := "Not found";
    LEAVE SP;
END IF;

END