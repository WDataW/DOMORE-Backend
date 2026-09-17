const { createClient } = require('@supabase/supabase-js');
const toPFP = require('../utils/toPFP');
const { StatusCodes } = require('http-status-codes');

const getPFP = async (req, res) => {
    const { id: userId } = req.user;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    const { data, _ } = await supabase.storage.from('Avatars').createSignedUrl(`${userId}.webp`, 3600);
    const url = data?.signedUrl ? `${data?.signedUrl}&wv=${Date.now()}` : '/images/defaultPFP.png'
    res.status(StatusCodes.OK).json({ signedUrl: url });
}


const uploadPFP = async (req, res) => {
    const { id: userId } = req.user;
    const image = req.files.image;
    const pfp = await toPFP(image);
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    const { __, error } = await supabase.storage.from('Avatars').upload(`${userId}.webp`, pfp, {
        contentType: 'image/webp',
        upsert: true
    });
    const { data, _ } = await supabase.storage.from('Avatars').createSignedUrl(`${userId}.webp`, 3600);
    if (error) throw new Error(error.message);
    res.status(StatusCodes.OK).json({ signedUrl: `${data?.signedUrl}&wv=${Date.now()}` ?? '' });
}
const removePFP = async (req, res) => {
    const { id: userId } = req.user;
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    const { _, error } = await supabase.storage.from('Avatars').remove(`${userId}.webp`);
    if (error) throw new Error(error.message);
    res.status(StatusCodes.OK).json({ message: 'Image removed successfully' })
}


module.exports = { getPFP, uploadPFP, removePFP }