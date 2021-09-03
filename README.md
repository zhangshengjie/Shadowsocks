<!--
 * @Description: 
 * @Version: 1.0
 * @Autor: z.cejay@gmail.com
 * @Date: 2021-09-01 20:21:24
 * @LastEditors: cejay
 * @LastEditTime: 2021-09-03 15:34:22
-->
# Shadowsocks
# 自己使用的ss搭建

1. 创建docker：
   docker build -f ./Dockerfile -t cejay_ss:1.8.0 .

2. 发布docker:
   docker tag cejay_ss:1.8.0 cejay/shadowsocks:1.8.0
   docker push cejay/shadowsocks:1.8.0


# 远程服务器上面部署 (Ubuntu 20)
apt update

apt-get -y install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update

apt-get -y install docker-ce docker-ce-cli containerd.io nginx

docker pull cejay/shadowsocks:1.8.0

docker run -d -p 0.0.0.0:8011:8011/tcp -p 8801:8012 --cap-add NET_ADMIN --cap-add NET_RAW --name "shadowsocks" -e PORT="8011" -e ss_post="8012" -e ss_pwd="我的密码" -e proxy_ip="47.242.211.230" cejay/shadowsocks:1.8.0

        #测试docker是否正常
        docker ps -a
        curl http://127.0.0.1:8011
        telnet 127.0.0.1 8012

#配置nginx代理

echo -e "server {\n\
    listen 80;\n\
    server_name ss.cejay.online;\n\
    access_log /var/log/nginx/access.log;\n\
    location / {\n\
        proxy_set_header Host \$host;\n\
        proxy_set_header X-Real-IP \$remote_addr;\n\
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto \$scheme;\n\
        proxy_pass http://127.0.0.1:8011;\n\
        proxy_read_timeout 90;\n\
    }\n\
}" > /etc/nginx/conf.d/ss.conf



nginx -s reload
