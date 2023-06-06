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
    SET RCode := 0;
	ROLLBACK;
END;
START TRANSACTION;

SET RCode := 1;
SET Rmessage := NULL;

IF NOT EXISTS (SELECT 	country_id
				FROM	countries
				WHERE	country_id = PcountryId) THEN
	SET RCode := 0,
		Rmessage := "Country does not exists";
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