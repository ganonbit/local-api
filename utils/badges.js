export const uploadToCloudinary = async (stream, folder, imagePublicId) => {
  const options = imagePublicId
    ? { public_id: imagePublicId, overwrite: true }
    : { public_id: `${folder}/${uuid()}` };

  return new Promise((resolve, reject) => {
    const streamLoad = cloudinary.v2.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    stream.pipe(streamLoad);
  });
};


export const deleteFromCloudinary = async publicId => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(publicId, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
  });
};
