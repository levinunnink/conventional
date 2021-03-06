const path = require('path');
const {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: process.env.S3_BUCKET_REGION,
});

const config = {
  s3Bucket: process.env.S3_BUCKET,
};

class Client {
  constructor(_client) {
    this.client = _client;
    this.noCacheTypes = [
      'text/html', 'text/css', 'text/javascript',
      'application/javascript', 'application/json', 'text/plain',
      'application/xml', 'text/csv', 'text/calendar',
    ];
  }

  cacheControlForType(type) {
    const maxAge = process.env.CACHE_MAX_AGE || 86400;
    return this.noCacheTypes.includes(type) ? 'no-cache' : `max-age: ${maxAge}`;
  }
  
  async listAllObjects(key = null) {
    const Prefix = (key || "").replace(/\/?$/, '/');
    const allResults = [];
    let { CommonPrefixes, Contents, IsTruncated, NextContinuationToken } = {};
    do {
      const input = {
        Bucket: config.s3Bucket,
        Delimiter: '/',
        Prefix,
        NextContinuationToken,
      }
      // console.log('Input', input);
      const command = new ListObjectsV2Command(input);  
      const results = await client.send(command);
      // console.log('Results', results);
      ({ Contents, IsTruncated, NextContinuationToken, CommonPrefixes } = results);
      if(Contents) allResults.push(...Contents);
      if(CommonPrefixes) allResults.push(...CommonPrefixes.map(({ Prefix }) => ({ Key: Prefix })));
    } while (NextContinuationToken);
    return allResults;
  }

  async getObject(key) {
    const input = {
      Bucket: config.s3Bucket,
      Key: key,
    }
    const command = new GetObjectCommand(input);
    return client.send(command);
  }
  
  async putObject(key, body, mimeType) {
    const input = {
      Bucket: config.s3Bucket,
      Key: key,
      Body: body,
      ACL: 'public-read',
      ContentType: mimeType,
      CacheControl: this.cacheControlForType(mimeType),
    }
    const command = new PutObjectCommand(input);
    return client.send(command);
  }

  async headObject(key) {
    const input = {
      Bucket: config.s3Bucket,
      Key: key,
    }
    const command = new HeadObjectCommand(input);
    return client.send(command);
  }
}

module.exports = new Client(client);
