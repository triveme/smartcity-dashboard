import multer = require('multer');
import { v4 as uuid } from 'uuid';

export const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      file ? cb(null, __dirname + process.env.IMAGE_DIR) : cb(null, '');
    },
    filename: (req, file, cb) => {
      file
        ? cb(null, `${uuid()}-infopin.${file.mimetype.substring(6)}`)
        : cb(null, '');
    },
  }),
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      return cb(
        new Error(
          'Zur Zeit werden nur folgende Bildformate unterstüzt: jpg, jpeg, png',
        ),
        false,
      );
    }
  },
  limits: { fileSize: 104857600 },
};
