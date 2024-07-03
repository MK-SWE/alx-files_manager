import { userQueue } from './utils/queue';
import { getMe } from './controllers/UsersController';
import { fileQueue } from './utils/queue';
import getFile from './controllers/UsersController'; // Assuming File is your file model
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';

fileQueue.process(async (job, done) => {
  try {
    const { userId, fileId } = job.data;
    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const file = await getFile.findOne({ _id: fileId, userId });
    if (!file) throw new Error('File not found');

    const filePath = file.path; // Assuming file.path is the path to the stored file
    const sizes = [500, 250, 100];

    for (const size of sizes) {
      const thumbnail = await imageThumbnail(filePath, { width: size });
      const thumbnailPath = `${filePath}_${size}`;
      fs.writeFileSync(thumbnailPath, thumbnail);
    }

    done();
  } catch (error) {
    done(error);
  }
});

userQueue.process(async (job, done) => {
  try {
    const { userId } = job.data;
    if (!userId) {
      throw new Error('Missing userId');
    }

    const user = await getMe(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log(`Welcome ${user.email}!`);
    // Here you would integrate with an email service to send the actual email

    done();
  } catch (error) {
    done(error);
  }
});