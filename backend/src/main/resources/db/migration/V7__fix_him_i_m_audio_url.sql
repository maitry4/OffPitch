-- Migration V7: Update audio_url for 'Him & I' to the correct Cloudinary URL.
UPDATE song
SET audio_url = 'https://res.cloudinary.com/fzkoxpca/video/upload/v1785436018/him-i_m_zzgxzu.mp3'
WHERE title = 'Him & I';
