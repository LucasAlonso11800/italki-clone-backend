CREATE DEFINER=`root`@`%` PROCEDURE `StudentProfileUpd`(
	In	PfirstName 	varchar(40),
    In	PlastName 	varchar(40),
    In	Pgender 	char(1),
    In	Pimage	 	varchar(100),
    In	PcountryId 	int,
	IN 	PstudentId 	int,
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

IF NOT EXISTS (SELECT	student_id
				FROM	students
				WHERE	student_id = PstudentId) THEN
	SET Rcode := 0;
	SET Rmessage := "Student not found";
    LEAVE SP;
END IF;

IF PcountryId IS NOT NULL AND NOT EXISTS (SELECT	country_id
											FROM	countries
											WHERE	country_id = PcountryId) THEN
	SET Rcode := 0;
	SET Rmessage := "Country not found";
    LEAVE SP;
END IF;

UPDATE	students
	SET	student_first_name = PfirstName, 
        student_last_name = PlastName, 
        student_gender = Pgender, 
        student_image = Pimage, 
        country_id = PcountryId
WHERE	student_id = PstudentId;

END