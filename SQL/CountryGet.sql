CREATE DEFINER=`root`@`%` PROCEDURE `CountryGet`(
	IN 	PcountryId 	int,
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

SELECT	*
FROM	countries
WHERE	country_id = IFNULL(PcountryId, country_id);
END