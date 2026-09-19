const { fileTypeFromBuffer } = require("file-type");
const { BadRequest } = require("../errors");

const isImage = async (image) => {
    const { mime } = await fileTypeFromBuffer(image.data);
    if (mime.startsWith('image/')) return image;
    else throw new BadRequest('Please attach a valid image file')
}
module.exports = isImage