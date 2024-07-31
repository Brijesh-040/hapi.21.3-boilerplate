const fs = require('fs')

const { S3Client, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, CopyObjectCommand } = require("@aws-sdk/client-s3");

const config = require('config')
const { resolve } = require('path')
const { reject } = require('bluebird')
const Boom = require('@hapi/boom')
const { Readable } = require("stream");

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

const uploadLocalFile = (file, filePath) => {
  return new Promise((resolve, reject) => {
    let filename = file.hapi.filename
    const fileType = file.hapi.filename.replace(/^.*\./, '')

    const data = file._data
    let fpath = 'uploads/'
    let path = './uploads'

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    if (filePath) {
      path = `${path}/${filePath}`
      fpath = `${fpath}${filePath}/`
    }

    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true })
    }

    fs.writeFile(`${path}/` + filename, data, err => {
      if (err) {
        reject(err)
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${fpath}${filename}`,
        fileName: filename,
        fileType: fileType
      })
    })
  })
}

const writeFileLocalDirectory = (processId, filesData) => {
  return new Promise(resolve => {
    const mainImagePath = 'temp/'
    const mainPath = './temp'
    const videoMainPath = `${mainPath}/${processId}/video`
    const videoPath = `${mainImagePath}${processId}/video`
    const imagesMainPath = `${mainPath}/${processId}/images`
    const imagesPath = `${mainImagePath}${processId}/images`

    if (!fs.existsSync(mainPath)) {
      fs.mkdirSync(mainPath, { recursive: true })
    }
    if (!fs.existsSync(videoMainPath)) {
      fs.mkdirSync(videoMainPath, { recursive: true })
    }
    if (!fs.existsSync(imagesMainPath)) {
      fs.mkdirSync(imagesMainPath, { recursive: true })
    }
    const writeVideoPath = `${videoPath}/${filesData.name}`
    fs.writeFile(writeVideoPath, filesData.data, err => {
      if (err) {
        resolve({
          error: err,
          success: false
        })
      }
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${writeVideoPath}`,
        videoFolder: `${videoPath}`,
        imageFolder: `${imagesPath}`,
        fileName: filesData.name
      })
    })

  })
}

const handleFileUpload = async (file, filePath = null, bucket = 'public_bucket') => {
  return await uploadFileToBucket(file, filePath, bucket);
}

const uploadFileToBucket = async (file, filePath, bucket) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = file._data;
      let filename = file.hapi.filename;
      const fileType = filename.replace(/^.*\./, '');

      const uniqueNum = new Date().getMilliseconds();
      filename = uniqueNum + '_' + filename.replace(' ', '_');
      if (!filePath) {
        filePath = 'profile';
      }
      const params = {
        Bucket: config.connections.aws.ses[bucket], // pass your bucket name
        Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
        Body: data,
        ContentType: file.hapi.headers['content-type']
      };
      const command = new PutObjectCommand(params);
      const uploadResult = await s3.send(command);
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType,
        uploadResult: uploadResult
      });
    } catch (error) {
      resolve({
        message: 'Upload Fail!',
        success: false,
        error: JSON.stringify(error)
      })
    }
  });
}

const handleFileUploadWithSameFileName = async (file, filePath = null, bucket = 'public_bucket') => {
  return await uploadFileToBucketWithSameFileName(file, filePath, bucket)
}

const uploadFileToBucketWithSameFileName = async (file, filePath, bucket) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = file.data
      let filename = file.hapi.path
      const fileType = filename.replace(/^.*\./, '')
      if (!filePath) {
        filePath = 'profile'
      }
      const params = {
        Bucket: config.connections.aws.ses[bucket], // pass your bucket name
        Key: `${filePath}/${filename}`, // file will be saved as testBucket/contacts.csv
        Body: data,
        ContentType: file.hapi.headers['content-type']
      }
      const command = new PutObjectCommand(params);
      const uploadResult = await s3.send(command);
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${filename}`,
        fileName: filename,
        fileType: fileType,
        uploadResult: uploadResult
      });
    } catch (error) {
      resolve({
        message: 'Upload Fail!',
        success: false,
        error: JSON.stringify(error)
      })
    }
  });
}

const uploadJSONFileToBucket = async (objectData, filePath, name, bucket = 'public_bucket') => {
  return new Promise(async (resolve, reject) => {
    try {
      const params = {
        Bucket: config.connections.aws.ses[bucket], // pass your bucket name
        Key: `${filePath}/${name}`, // file will be saved as testBucket/contacts.csv
        Body: objectData,
        ContentType: "application/json",
      }
      const command = new PutObjectCommand(params);
      const uploadResult = await s3.send(command);
      // console.log(`File uploaded successfully at ${uploadResult.Location}`)
      resolve({
        message: 'Uploaded successfully!',
        success: true,
        filePath: `${filePath}/${name}`,
        fileName: name,
        fileType: "application/json",
        uploadResult: uploadResult
      });
    } catch (error) {
      resolve({
        message: 'Upload Fail!',
        success: false,
        error: JSON.stringify(error)
      })
    }
  });
}

const deleteFile = async (filePath, fileName = null, bucket = 'public_bucket') => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fileName) {
        var params = {
          Bucket: config.connections.aws.ses[bucket], // pass your bucket name
          Key: `${filePath}` // file will be saved as testBucket/contacts.csv
        }
      }

      if (fileName) {
        var params = {
          Bucket: config.connections.aws.ses[bucket], // pass your bucket name
          Key: `${filePath}/${fileName}` // file will be saved as testBucket/contacts.csv
        }
      }
      const command = new DeleteObjectCommand(params);
      const uploadResult = await s3.send(command);
      resolve({
        message: 'File deleted successfully!',
        success: true,
        uploadResult: uploadResult
      })
    } catch (error) {
      resolve({
        message: 'Check if you have sufficient permissions!',
        status: false,
        error: JSON.stringify(error)
      })
    }
  });
}

const deletePublicFile = async (filePath, fileName = null, bucket = 'public_bucket') => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fileName) {
        var params = {
          Bucket: config.connections.aws.ses[bucket], // pass your bucket name
          Key: `${filePath}` // file will be saved as testBucket/contacts.csv
        }
      }

      if (fileName) {
        var params = {
          Bucket: config.connections.aws.ses[bucket], // pass your bucket name
          Key: `${filePath}/${fileName}` // file will be saved as testBucket/contacts.csv
        }
      }
      const command = new DeleteObjectCommand(params);
      const uploadResult = await s3.send(command);
      resolve({
        message: 'Deleted successfully!',
        success: true,
        uploadResult: uploadResult
      })
    } catch (error) {
      resolve({
        message: 'Check if you have sufficient permissions!',
        status: false,
        error: JSON.stringify(error)
      })
    }
  });
}

const downloadFile = async (_key, rangeHeader, bucket = 'public_bucket') => {
  return new Promise(async (resolve, reject) => {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: config.connections.aws.ses[bucket],
        Prefix: _key,
      });
      const res = await s3.send(listCommand).catch(e => console.log(e));
      if (res && res.Contents && res.Contents.length) {
        const params = {
          Bucket: config.connections.aws.ses[bucket],
          Key: _key
        }

        // If a Range header is provided, set it in the S3 request
        if (rangeHeader) {
          params.Range = rangeHeader;
        }
        const command = new GetObjectCommand(params);
        const s3Object = await s3.send(command);

        // Extract relevant information from the S3 response
        const data = s3Object.Body;
        const name = `${_key.split('/').pop()}`;
        const contents = res.Contents;

        resolve({
          data,
          name,
          contents,
          success: true,
        });
      } else {
        resolve({
          data: null,
          name: null,
          res: res ? res : null,
          ket: _key,
          success: false
        })
      }
    } catch (error) {
      resolve({
        data: null,
        name: null,
        res: error,
        key: _key,
        success: false,
      });
    }
  });
};

// download as a stream
const downloadFileStandard = async _key => {
  // console.log('_key: ', _key);
  return new Promise(async (resolve, reject) => {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: config.connections.aws.ses[bucket],
        Prefix: _key,
      });
      const res = await s3.send(listCommand).catch(e => console.log(e));
      if (res && res.Contents && res.Contents.length) {
        const params = {
          Bucket: config.connections.aws.ses.private_bucket, // public_bucket
          Key: _key
        }
        const command = new GetObjectCommand(params);
        const s3Object = await s3.send(command);
        const readStream = Readable.from(s3Object.Body);
        // console.log('readStream: ', readStream);
        resolve({
          data: readStream,
          name: `${_key.split('/').pop()}`,
          contents: res.Contents,
          success: true
        })
      } else {
        resolve({
          data: null,
          name: null,
          res: res ? res : null,
          ket: _key,
          success: false
        })
      }
    } catch (error) {
      resolve({
        data: null,
        name: null,
        res: error,
        key: _key,
        success: false,
      });
    }
  })
}

const getFilePath = async _key => {
  // console.log('_key: ', _key);
  return new Promise(async (resolve, reject) => {
    let isTruncated = true;
    let marker;
    let allObject = []
    while (isTruncated) {
      try {
        const listCommand = new ListObjectsV2Command({
          Bucket: config.connections.aws.ses[bucket],
          Prefix: _key
        });
        const response = await s3.send(listCommand).catch(e => console.log(e));
        if (response && response.Contents && response.Contents.length) {
          response.Contents.forEach(item => {
            allObject.push(item);
          });
        }
        isTruncated = response.IsTruncated;
        if (isTruncated) {
          marker = response.Contents.slice(-1)[0].Key;
        }
      } catch (error) {
        throw error;
      }
    }
    let finalData = {}
    if (allObject.length) {
      finalData['contents'] = allObject
    } else {
      finalData['contents'] = []
    }
    resolve(finalData)
  })
}

const getBase64 = async _key => {
  return new Promise(async resolve => {
    try {
      const command = new GetObjectCommand({
        Bucket: config.connections.aws.ses.public_bucket,
        key: _key
      });
      const _data = await s3.send(command);
      resolve({
        success: true,
        data: _data ? _data.Body.toString('base64') : null,
        filePath: _key,
        fileName: _key.split('/').pop()
      })
    } catch (error) {
      resolve({
        success: false,
        message: error.message ? error.message : JSON.stringify(error)
      })
    }
  })
}

const readJson = async _key => {
  return new Promise(async resolve => {
    try {
      const command = new GetObjectCommand({
        Bucket: config.connections.aws.ses.public_bucket,
        key: _key
      });
      const _data = await s3.send(command);
      resolve({
        success: true,
        data: _data ? jsonFromBuffer(_data.Body) : null,
        filePath: _key,
        fileName: _key.split('/').pop()
      })
    } catch (error) {
      resolve({
        success: false,
        message: error.message ? error.message : JSON.stringify(error)
      })
    }
  })
}

//  -------------------------------------*************------------------------------------------------------------------

const deleteFolder = async (path, bucket = 'public_bucket') => {
  return new Promise(async (resolve, reject) => {
    // get all keys and delete objects
    const getAndDelete = async (ct = null) => {
      try {
        const listParams = {
          Bucket: config.connections.aws.ses[bucket], // pass your bucket name
          Prefix: `${path}/`,
          Delimiter: ""
        };
        const listCommand = new ListObjectsV2Command(listParams);
        const data = await s3.send(listCommand);

        let deleteParams = {
          Bucket: 'mkst-uploads',
          Delete: { Objects: [] },
        };

        // add keys to Delete Object
        data.Contents.forEach((content) => {
          deleteParams.Delete.Objects.push({ Key: content.Key });
        });

        // delete all keys
        if (deleteParams.Delete.Objects.length > 0) {
          const deleteCommand = new DeleteObjectsCommand(deleteParams);
          await s3.send(deleteCommand);
        }

        // check if ct is present
        if (data.NextContinuationToken) {
          getAndDelete(data.NextContinuationToken);
        } else {
          resolve({
            message: 'Folder deleted successfully!',
            status: true,
          });
        }
      } catch (error) {
        reject(error);
      }
    }

    getAndDelete();  // intial call
  })
}

const deleteMultipleFile = async _key => {
  return new Promise(async (resolve, reject) => {
    try {
      // List objects in the bucket with the given prefix
      const listParams = {
        Bucket: 'mkst-uploads',
        Prefix: _key,
      };
      const listCommand = new ListObjectsV2Command(listParams);
      const res = await s3.send(listCommand);

      // If there are objects to delete, prepare the delete parameters
      if (res && res.Contents && res.Contents.length) {
        const deleteParams = {
          Bucket: 'mkst-uploads',
          Delete: { Objects: res.Contents.map(({ Key }) => ({ Key })) }
        };
        const deleteCommand = new DeleteObjectsCommand(deleteParams);
        await s3.send(deleteCommand);
      }
      resolve(true);
    } catch (error) {
      console.error(error);
      resolve(false);
    }
  })
};

const jsonFromBuffer = (buf) => {
  if (buf) {
    return JSON.parse(Buffer.from(buf.toString('base64'), 'base64').toString())
  }
  return {}
}

const removeDir = path => {
  fs.rmdirSync(path, { recursive: true })
}

// write file
const uploadFile = (file) => {
  file => {
    return new Promise((resolve, reject) => {
      fs.writeFile('upload', file, err => {
        if (err) {
          reject(err)
        }
        resolve({
          message: 'Upload successfully!'
        })
      })
    })
  }
}

module.exports = {
  getBase64,
  uploadLocalFile,
  handleFileUpload,
  deleteMultipleFile,
  handleFileUploadWithSameFileName,
  deleteFile,
  deletePublicFile,
  writeFileLocalDirectory,
  removeDir,
  uploadFile,
  downloadFile,
  readJson,
  uploadJSONFileToBucket,
  getFilePath,
  deleteFolder,
  downloadFileStandard
}
