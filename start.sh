#!/bin/bash
###
 # @Description: 
 # @Version: 1.0
 # @Autor: z.cejay@gmail.com
 # @Date: 2021-09-02 11:00:22
 # @LastEditors: cejay
 # @LastEditTime: 2021-09-02 23:13:07
###
echo '执行启动脚本'


echo '配置iptables'
echo 'IPV6=no' >> /etc/default/ufw
ufw enable
ufw status
ufw allow $PORT

echo '设置代理端口以及密码'
echo -e "{\n    \"server\":[\"0.0.0.0\"],\n    \"mode\":\"tcp_and_udp\",\n    \"server_port\":$ss_post,\n    \"local_port\":1080,\n    \"password\":\"$ss_pwd\",\n    \"timeout\":60,\n    \"method\":\"chacha20-ietf-poly1305\"\n}" > /etc/shadowsocks-libev/config.json

echo '启动代理服务器'
/etc/init.d/shadowsocks-libev start 

echo '启动web'
cd /root/web/
npm run start > /root/web.log

# while [ 1 ]
# do
#       sleep 10
# done