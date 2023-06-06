CREATE DEFINER=`root`@`%` PROCEDURE `StudentIns`(
IN 	PfirstName 	varchar(40), 
IN 	PlastName 	varchar(40), 
IN	Pbirthdate	datetime, 
IN	Pemail		varchar(40), 
IN	Pgender		char(1), 
IN	Ppassword	varchar(40), 
IN	PcountryId	int,
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
START TRANSACTION;

SET Rcode := 1;
SET Rmessage := NULL;

IF NOT EXISTS (SELECT 	country_id
				FROM	countries
				WHERE	country_id = PcountryId) THEN
	SET Rcode := 0,
		Rmessage := "Country does not exists";
	ROLLBACK;
    LEAVE SP;
END IF;

IF EXISTS (SELECT 	student_id
			FROM	students
			WHERE	student_email = Pemail) THEN
	SET Rcode := 0,
		Rmessage := "Student with this email registered";
	ROLLBACK;
    LEAVE SP;
END IF;

INSERT INTO 	students
(student_first_name, student_last_name, student_birthdate, student_email, student_gender, student_password, country_id)
VALUES (
PfirstName,
PlastName, 
Pbirthdate, 
Pemail, 
Pgender, 
Ppassword, 
PcountryId
);

commit;
END