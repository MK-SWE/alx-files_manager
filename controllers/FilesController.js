/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import { tmpdir } from 'os';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { mkdir, writeFile } from 'fs';
import { join as joinPath } from 'path';
import mongoDBCore from 'mongodb/lib/core';
import { Request, Response } from 'express';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import isValidId from '../utils/id_validator';

const VALID_TYPES = {
  folder: 'folder',
  file: 'file',
  image: 'image',
};
const ROOT_FOLDER_ID = 0;
const DEFAULT_ROOT_FOLDER = 'files_manager';
const mkDirAsync = promisify(mkdir);
const writeFileAsync = promisify(writeFile);
const MAX_FILES_PER_PAGE = 20;
const NULL_ID = Buffer.alloc(24, '0').toString('utf-8');

export default class FilesController {
  /**
   * Uploads a file.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   */
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getUser(userId);
    const name = req.body ? req.body.name : null;
    const type = req.body ? req.body.type : null;
    const parentId = req.body && req.body.parentId ? req.body.parentId : ROOT_FOLDER_ID;
    const isPublic = req.body && req.body.isPublic ? req.body.isPublic : false;
    const base64Data = req.body && req.body.data ? req.body.data : '';

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !Object.values(VALID_TYPES).includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== VALID_TYPES.folder && !req.body.data) {
      return res.status(400).json({ error: 'Missing data' });
    }
    if ((parentId !== ROOT_FOLDER_ID) && (parentId !== ROOT_FOLDER_ID.toString())) {
      const file = await (await dbClient.filesCollection())
        .findOne({
          _id: new mongoDBCore.BSON.ObjectId(isValidId(parentId) ? parentId : NULL_ID),
        });

      if (!file) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (file.type !== VALID_TYPES.folder) {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    const baseDir = `${process.env.FOLDER_PATH || ''}`.trim().length > 0
      ? process.env.FOLDER_PATH.trim()
      : joinPath(tmpdir(), DEFAULT_ROOT_FOLDER);
    const newFile = {
      userId: new mongoDBCore.BSON.ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: (parentId === ROOT_FOLDER_ID) || (parentId === ROOT_FOLDER_ID.toString())
        ? '0'
        : new mongoDBCore.BSON.ObjectId(parentId),
    };
    await mkDirAsync(baseDir, { recursive: true });
    if (type !== VALID_TYPES.folder) {
      const localPath = joinPath(baseDir, uuidv4());
      await writeFileAsync(localPath, Buffer.from(base64Data, 'base64'));
      newFile.localPath = localPath;
    }
    const insertionInfo = await (await dbClient.filesCollection())
      .insertOne(newFile);
    const fileId = insertionInfo.insertedId.toString();
    return res.status(201).json({
      id: fileId,
      userId,
      name,
      type,
      isPublic,
      parentId: (parentId === ROOT_FOLDER_ID) || (parentId === ROOT_FOLDER_ID.toString())
        ? 0
        : parentId,
    });
  }

  /**
   * Retrieves a file.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   * @returns {Promise<void>}
   */
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getUser(userId);
    const id = req.params ? req.params.id : NULL_ID;
    const file = await (await dbClient.filesCollection())
      .findOne({
        _id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
        userId: new mongoDBCore.BSON.ObjectId(isValidId(userId) ? userId : NULL_ID),
      });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json({
      id,
      userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId === ROOT_FOLDER_ID.toString()
        ? 0
        : file.parentId.toString(),
    });
  }

  /**
   * Retrieves files associated with a specific user.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
  */
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getUser(userId);
    const parentId = req.query.parentId || ROOT_FOLDER_ID.toString();
    const page = /\d+/.test((req.query.page || '').toString())
      ? Number.parseInt(req.query.page, 10)
      : 0;
    const filesFilter = {
      userId: user._id,
      parentId: parentId === ROOT_FOLDER_ID.toString()
        ? parentId
        : new mongoDBCore.BSON.ObjectId(isValidId(parentId) ? parentId : NULL_ID),
    };

    const files = await (await (await dbClient.filesCollection())
      .aggregate([
        { $match: filesFilter },
        { $sort: { _id: -1 } },
        { $skip: page * MAX_FILES_PER_PAGE },
        { $limit: MAX_FILES_PER_PAGE },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: '$userId',
            name: '$name',
            type: '$type',
            isPublic: '$isPublic',
            parentId: {
              $cond: { if: { $eq: ['$parentId', '0'] }, then: 0, else: '$parentId' },
            },
          },
        },
      ])).toArray();
    return res.status(200).json(files);
  }

  /**
   * Updates a file.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   * @returns {Promise<Object>}
   */
  static async putPublish(req, res) {
    const { user } = req;
    const { id } = req.params;
    const userId = user._id.toString();
    const fileFilter = {
      _id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
      userId: new mongoDBCore.BSON.ObjectId(isValidId(userId) ? userId : NULL_ID),
    };
    const file = await (await dbClient.filesCollection())
      .findOne(fileFilter);

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await (await dbClient.filesCollection())
      .updateOne(fileFilter, { $set: { isPublic: true } });
    res.status(200).json({
      id,
      userId,
      name: file.name,
      type: file.type,
      isPublic: true,
      parentId: file.parentId === ROOT_FOLDER_ID.toString()
        ? 0
        : file.parentId.toString(),
    });
  }

  /**
   * Updates a file.
   * @param {Request} req The Express request object.
   * @param {Response} res The Express response object.
   * @returns {Promise<void>}
   */
  static async putUnpublish(req, res) {
    const { user } = req;
    const { id } = req.params;
    const userId = user._id.toString();
    const fileFilter = {
      _id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
      userId: new mongoDBCore.BSON.ObjectId(isValidId(userId) ? userId : NULL_ID),
    };
    const file = await (await dbClient.filesCollection())
      .findOne(fileFilter);

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    await (await dbClient.filesCollection())
      .updateOne(fileFilter, { $set: { isPublic: false } });
    res.status(200).json({
      id,
      userId,
      name: file.name,
      type: file.type,
      isPublic: false,
      parentId: file.parentId === ROOT_FOLDER_ID.toString()
        ? 0
        : file.parentId.toString(),
    });
  }

  /**
   * return the content of the file document based on the ID
   * @param {Request} request The Express request object.
   * @param {Response} response The Express response object.
   * @returns {Promise<Object>}
   */
  static async getFile(request, response) {
    const { user } = request;
    const { id } = request.params;
    const userId = user._id.toString();
    const fileFilter = {
      _id: new mongoDBCore.BSON.ObjectId(isValidId(id) ? id : NULL_ID),
      userId: new mongoDBCore.BSON.ObjectId(isValidId(userId) ? userId : NULL_ID)
    };
    const file = await (await dbClient.filesCollection())
      .findOne(fileFilter);

    if (!file) {
      response.status(404).json({ error: 'Not found' });
      return;
    }
    console.log(file.localPath);
    if (!file.isPublic) {
      const user = await FilesController.getUser(request);
      if (!user) {
        return response.status(404).json({ error: 'Not found' });
      }
      if (file.userId.toString() !== user._id.toString()) {
        console.log(`Wrong user: file.userId=${file.userId}; userId=${user._id}`);
        return response.status(404).json({ error: 'Not found' });
      }
      if (file.type === 'folder') {
        return response.status(400).json({ error: "A folder doesn't have content" });
      }
      try {
        let fileName = file.localPath;
        const size = request.param('size');
        if (size) {
          fileName = `${file.localPath}_${size}`;
        }
        const contentType = mime.contentType(file.name);
        return response.header('Content-Type', contentType).status(200).sendFile(fileName);
      } catch (error) {
        console.log(error);
        return response.status(404).json({ error: 'Not found' });
      }
    }
    if (file.type === 'folder') {
      return response.status(400).json({ error: "A folder doesn't have content" });
    }
    try {
      let fileName = file.localPath;
      const size = request.param('size');
      if (size) {
        fileName = `${file.localPath}_${size}`;
      }
      const data = await fs.readFile(fileName);
      const contentType = mime.contentType(file.name);
      return response.header('Content-Type', contentType).status(200).send(data);
    } catch (error) {
      console.log(error);
      return response.status(404).json({ error: 'Not found' });
    }
  }
}
