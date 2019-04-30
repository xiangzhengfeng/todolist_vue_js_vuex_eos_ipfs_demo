import IpfsAPI from 'ipfs-api';
import axios from 'axios';

const ipfs = IpfsAPI('ipfs.infura.io', '5001', {protocol: 'https'});
//const ipfsPrefix = 'https://ipfs.io/ipfs/'; 
const ipfsPrefix =  'http://localhost:8080/ipfs/'
//const ipfsPrefix =  'https://gateway.ipfslabs.com/ipfs/'  
//const ipfsPrefix =  'http://www.ipfs.guide:8080/ipfs/'
//const ipfsPrefix =  'https://ipfs.greyh.at/ipfs/'
//const ipfsPrefix =  'https://gateway.temporal.cloud/ipfs/'
//const ipfsPrefix =  'https://gateway.pinata.cloud/ipfs/'
//const ipfsPrefix =  'https://ipfs.greyh.at/ipfs/'

const pinataApiKey = '7f6281d069410fd3a2c7';
const pinataSecretApiKey = '5dd9ef467c830d553d8e47ab91d22d76aa5280f756e614625bcc79d5e5960258';

/**
 * 保存文件到IPFS
 */
export const saveFileToIPFS = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      const buffer = Buffer.from(reader.result);
      ipfs.add(buffer).then(res => {
        resolve(res[0].hash);
      }).catch(error => {
        console.log(error);
      });
    };
  });
};

/**
 * 保存文本到IPFS
 */
export const saveTextToIPFS = (text) => {
  return new Promise((resolve, reject) => {
    const descBuf = Buffer.from(text, 'utf-8');
    ipfs.add(descBuf).then(res => {
      resolve(res[0].hash);
    }).catch(error => {
      console.log(error);
    });
  });
};

/**
 * 从IPFS读取文本
 */
export const readTextFromIPFS = (hash) => {
  return new Promise((resolve, reject) => {
    ipfs.cat(hash).then(res => {
      let content = new TextDecoder('utf-8').decode(res);
      resolve(content);
    }).catch(error => {
      console.log(error);
    });
  });
};

/**
 * 通过哈希值访问IPFS上的文件 
 */
export const ipfsUrl = (hash) => {
  return ipfsPrefix + hash;
};

/**
 * 使用Infura固定服务
 */
export const pinByInfura = (hash) => {
  axios.get('https://ipfs.infura.io:5001/api/v0/pin/add?arg=/ipfs/' + hash)
  .then(res => {
    console.log(res);
  })
  .catch(error => {
    console.log(error);
  });
};

/**
 * 使用Pinata固定服务
 */
export const pinByPinata = (hash) => {
  axios.post('https://api.pinata.cloud/pinning/pinHashToIPFS',
    { hashToPin: hash },
    { headers: 
      {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
      }
    }).then(res => {
      console.log(res);    
    }).catch(function (error) {
      console.log(error);
    });
}
