# Shadowsocks
# 自己使用的ss搭建

## 编译 发布
1. 创建docker：
   docker build -f ./Dockerfile -t cejay_ss:0.0.1 .

2. 发布docker:
   docker tag cejay_ss:0.0.1 cejay/shadowsocks:0.0.1
   docker push cejay/shadowsocks:0.0.1

## 部署 远程服务器上面部署 (Ubuntu 20)
    假设shadowsocks连接密码为 password
    你服务器的公网IP为:1.2.3.4
    指向你服务器的域名为:www.ss.com
    假设你固定授权的IP为:3.4.5.6
sudo apt update
sudo curl -sSL https://get.daocloud.io/docker | sh
apt-get -y install  nginx
sudo docker pull cejay/shadowsocks:0.0.1
sudo docker run -d -p 0.0.0.0:8011:8011/tcp -p 8801:8012 --cap-add NET_ADMIN --cap-add NET_RAW --name "shadowsocks" -e PORT="8011" -e ss_post="8012" -e ss_pwd="password" -e proxy_ip="1.2.3.4" -e allow_ip="3.4.5.6" cejay/shadowsocks:0.0.1


    测试docker是否正常
    docker ps -a
    curl http://127.0.0.1:8011
    telnet 127.0.0.1 8801
    在云服务器管理界面中开放 80、8012 （tcp 和 udp）端口
配置nginx代理

echo -e "server {\n\
    listen 80;\n\
    server_name www.ss.com;\n\
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

    下载客户端[shadowsocks](https://github.com/shadowsocks/shadowsocks-windows/releases)
    添加节点：
    地址：www.ss.com
    端口：8012
    加密方式:chacha20-ietf-poly1305
    密码:password

每次使用前都需要打开 www.ss.com 点击允许后才可以使用
