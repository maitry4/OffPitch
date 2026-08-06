-- Normalize song audio_url to Cloudinary public_ids (not versioned copy URLs).
UPDATE song
SET audio_url = 'offpitch/songs/him-i_m'
WHERE title = 'Him & I'
  AND (audio_url IS DISTINCT FROM 'offpitch/songs/him-i_m');

UPDATE song
SET audio_url = 'offpitch/songs/Gallan_Goodiyaan_m'
WHERE title = 'Gallan Goodiyaan'
  AND (audio_url IS DISTINCT FROM 'offpitch/songs/Gallan_Goodiyaan_m');
