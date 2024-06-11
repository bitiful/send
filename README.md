## 缤纷快传

![bitiful-send](https://github.com/bitiful/biti-transfer/assets/168170389/a11f3329-a30d-4f93-986d-140c5ce68c53)

## 介绍

[Wetransfer](https://wetransfer.com) 和 [奶牛快传](https://cowtransfer.com) 的开源替代。

支持缤纷云领先的独特功能「即传即下」。

## 特点

1. 高性能广兼容：支持兼容 S3 协议的对象存储直传直取，不经过服务器中转，性能最大化；
2. 依赖简单：无账户体系、无各种数据库依赖，自部署只需简单配置；
3. 功能完整：下载链接限速、下载链接限时、下载链接限次；
4. 架构、代码简单，易于改造和二次开发。

## 独有特点

若使用 [缤纷云 S4](https://www.bitiful.com) 做底层存储可原生获得以下特性：
1. 上传一开始，便可进行下载，不用等待上传完毕（基于 缤纷云特有的「Simul-Transfer 即传即下」技术）
2. 利用缤纷云 S4 的「X-Bitiful-Max-Requests」参数原生限制分享后的下载次数（不用再在业务层面自己写逻辑实现）

## How to run

1. Clone 项目
2. 运行
```shell
   npm install
```
3. 运行
```shell
npm run dev
```
运行预签名接口服务：
见：https://github.com/bitiful/s3-presigned-api-server
