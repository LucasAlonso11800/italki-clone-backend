CREATE DEFINER=`root`@`%` PROCEDURE `TeacherIns`(
IN 	PfirstName 			varchar(40), 
IN 	PlastName 			varchar(40), 
IN	Pbirthdate			date, 
IN	Pemail				varchar(40), 
IN	Pgender				char(1), 
IN	Ppassword			varchar(40), 
IN	PcountryId			int,
IN	Pprofessional 		char(1),
IN	Pdescription 		text,
IN	Pexperience 		text,
IN	Pmethods			text,
IN	Pimage				varchar(255),
IN	Pvideo				varchar(255),
IN	PlanguageIds		varchar(255),
IN	PlanguageLevelIds	varchar(255),
OUT Rcode 				int,
OUT Rmessage 			varchar(100) 
)
SP:BEGIN

DECLARE BlanguageIds varchar(255) default PlanguageIds;
DECLARE	BlanguageLevelIds varchar(255) default PlanguageLevelIds;
DECLARE BlanguageId int;
DECLARE BlanguageLevelId int;
DECLARE BteacherId int;

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

IF EXISTS (SELECT 	teacher_id
			FROM	teachers
			WHERE	teacher_email = Pemail) THEN
	SET RCode := 0,
		Rmessage := "Teacher with this email registered";
	ROLLBACK;
    LEAVE SP;
END IF;

-- Create teacher
INSERT INTO 	teachers
(
teacher_first_name, teacher_last_name, teacher_birthdate, teacher_description, teacher_experience, teacher_methods, teacher_email, teacher_password, teacher_gender, teacher_image, teacher_video, teacher_professional, teacher_startdate, country_id
)
VALUES (
	PfirstName,
	PlastName, 
	Pbirthdate, 
	Pdescription,
	Pexperience,
	Pmethods,
	Pemail, 
	Ppassword, 
	Pgender, 
	Pimage,
	Pvideo,
	Pprofessional,
	DATE(NOW()),
	PcountryId
);

SET BteacherId = last_insert_id();

-- Add languages
my_loop: LOOP
	SET BlanguageId = substring_index(BlanguageIds, ";", 1);
    IF NOT EXISTS (SELECT 	language_id
					FROM	languages
					WHERE	language_id = BlanguageId) THEN
		SET RCode := 0,
			Rmessage := "Language does not exists";
		ROLLBACK;
		LEAVE SP;
	END IF;
    
    SET BlanguageLevelId = substring_index(BlanguageLevelIds, ";", 1);
    IF NOT EXISTS (SELECT 	language_level_id
					FROM	language_levels
					WHERE	language_level_id = BlanguageLevelId) THEN
		SET RCode := 0,
			Rmessage := "Language level does not exists";
		ROLLBACK;
		LEAVE SP;
	END IF;
    
    IF EXISTS (SELECT	teacher_language_id
				FROM	teacher_languages
                WHERE	teacher_id = BteacherId
                AND		language_id = BlanguageId) THEN
		SET RCode := 0,
			Rmessage := "Repeated language";
		ROLLBACK;
		LEAVE SP;
    END IF;
    
    INSERT INTO teacher_languages (
		teacher_id,
		language_id,
		language_level_id
	)
    VALUES (
		BteacherId,
        BlanguageId,
        BlanguageLevelId
    );
    
    SET	BlanguageIds = SUBSTR(BlanguageIds,LOCATE(';',BlanguageIds)+1);
	SET	BlanguageLevelIds = SUBSTR(BlanguageLevelIds,LOCATE(';',BlanguageLevelIds)+1);
    
	IF BlanguageIds = '' AND BlanguageLevelIds = '' THEN
		leave my_loop;
    END IF;
END LOOP my_loop;

COMMIT;
END