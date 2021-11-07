/*
 * @Description: 
 * @Version: 1.0
 * @Autor: z.cejay@gmail.com
 * @Date: 2021-09-02 13:36:15
 * @LastEditors: cejay
 * @LastEditTime: 2021-09-03 17:35:18
 */
var express = require('express');
var router = express.Router();
var process = require('child_process');
const { env } = require('process');


const ss_port = env.ss_post;
console.log(`port:${ss_port}`);

/**
 * 一个ip 对应多个用户key
 */
var user_ip_map = new Map();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: '网络授权' });
});
router.post('/', async (req, res, next) => {
  let resp = {
    status: 1
  };
  let ip = req.headers['x-real-ip'];//req.ip.match(/\d+\.\d+\.\d+\.\d+/)[0];
  console.log(ip);
  if (ip && ip.length >= 7 && ip.length <= 15) {
    if (req.body && req.body.key && req.body.type) {
      let ip_set = await getAllow();
      if (env.proxy_ip == ip || ip_set.has(ip)) {
        //已经存在
        resp.status = 0;
      } else {
        if (req.body.type === 'set') {
          //清除当前设备授权的其他ip
          console.log('set - 当前记录中已经允许的key 与 ip')
          console.log(user_ip_map);
          for (const iterator of user_ip_map.entries()) {
            if (iterator[1].has(req.body.key)) {
              iterator[1].delete(req.body.key);
              if (iterator[1].size === 0) {
                console.log('set - 删除已经授权的ip:' + iterator[0]);
                await removeIP(iterator[0]);
              }
            }

          }
          //添加当前ip
          try {
            let a1 = await execShell('ufw allow proto tcp from ' + ip + ' to any port ' + ss_port);
            console.log(a1);
            //添加到user_ip_map
            if (!user_ip_map.has(ip)) {
              let tmp_set = new Set();
              user_ip_map.set(ip, tmp_set);
            }
            user_ip_map.get(ip).add(req.body.key);

            resp.status = 0;
          } catch (e) {
            errorStr = e;
          }
        }
      }

    }
    console.log(req.body);
  }
  res.json(resp);
});

router.get('/list', async (req, res, next) => {
  console.log('获取已经授权列表')
  let ip_set = await getAllow();
  let strList = [];
  let i = 0;
  for (const iterator of ip_set) {
    strList.push(iterator);
  }
  res.render('list', { title: '已授权列表', list: strList });
});
async function removeIP(ip) {
  try {
    let a1 = await execShell("echo y |  ufw delete $(ufw status numbered |(grep '" + ip + "' | grep '" + ss_port + "'|awk -F'[][]' '{print $2}'))");
    console.log(a1);
  } catch (e) {
    console.log(e);
  }
}


async function getAllow() {
  let allow_ip = new Set();
  let list1 = await execShell("iptables -L -n -v| grep '" + ss_port + "' |awk -F' ' '{print $8}'");
  let listarr1 = list1.split('\n');
  for (var i = 0; i < listarr1.length; i++) {
    let ip = listarr1[i].trim();
    if (ip) {
      allow_ip.add(ip);
    }
  }
  return allow_ip;
}




function execShell(command) {
  console.log(command);
  return new Promise((resolve, reject) => {
    process.exec(command, (error, stdout, stderr) => {
      console.log('error=>' + error);
      console.log('stdout=>' + stdout);
      console.log('stderr=>' + stderr);
      if (error == null) {
        resolve(stdout + stderr);
      } else {
        reject(error);
      }
    });
  })
}

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress).replace('::ffff:', '');
};


/**
 * 异步延迟 调用方法 await sleep(1000)
 * @param {any} time
 */
function sleep(time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  })
}

async function deamon() {
  console.log('deamon start');
  while (true) {
    console.log('deamon each');
    try {
      if (new Date().getHours() === 5) {
        for (var i = 0; i < 100; i++) {
          try {
            let a1 = await execShell("echo y |  ufw delete $(ufw status numbered |(grep '" + ss_port + "'|awk -F'[][]' '{print $2}'))");
            console.log(a1);
            if (a1.indexOf('Invalid syntax') > -1) {
              break;
            }
          } catch (e) {
            console.log(e);
            break;
          }
        }
        user_ip_map = new Map();
      }
    } catch (e) {
      console.log(e);
    }

    await sleep(1000 * 60 * 60);
  }
}

deamon();


module.exports = router;
