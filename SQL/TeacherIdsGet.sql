CREATE DEFINER=`root`@`%` PROCEDURE `TeacherIdsGet`(
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

select 	teacher_id
from	teachers;
END