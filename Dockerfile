FROM ubuntu

ENV TZ=Asia/Shanghai \
    DEBIAN_FRONTEND=noninteractive

RUN set -ex \
    && apt -y update \
    && apt -y upgrade \
    && apt install -y tzdata \
    && ln -fs /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo ${TZ} > /etc/timezone \
    && dpkg-reconfigure --frontend noninteractive tzdata

#为了测试 安装 vim curl wget telnet
RUN set -ex \
    && apt -y install vim curl wget telnet
#新系统已经默认开始了 bbr fastopen
RUN set -ex \
    && apt -y install shadowsocks-libev nodejs npm iptables ufw
RUN set -ex \
    && npm install -g n \
    && n lts

#部署网页
COPY ./web /root/web
#启动脚本
COPY ./start.sh /root/start.sh

RUN set -ex \
    && cd /root/web/;npm install \
    && chmod +x /root/start.sh \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*


#web页面的端口
ENV PORT="80"

#默认使用配置
ENV ss_post="8801"
ENV ss_pwd="reset_password_here"

ENV proxy_ip = "127.0.0.1"

# EXPOSE ${PORT} 
# EXPOSE ${ss_post}
ENTRYPOINT ["/root/start.sh"]
