# 构建阶段
FROM node:20-alpine AS client-builder

# workspace
WORKDIR /app/client

# 设置 npm 镜像源
RUN npm config set registry https://registry.npmmirror.com/

# 安装 pnpm 并设置 pnpm 镜像源
RUN npm install -g pnpm \
    && pnpm config set registry https://registry.npmmirror.com/

# 复制包管理文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖包
RUN pnpm install

# 复制源代码
COPY . .

# 构建生产环境代码
RUN pnpm run build


# 运行阶段
FROM nginx:1.19.2  AS client-server

WORKDIR /usr/share/nginx/html/frontend-stack

COPY --from=client-builder /app/client/doc_build ./
COPY --from=client-builder /app/client/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
