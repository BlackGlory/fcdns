# fcdns
DNS relay server with fact-checking.

## Install
```sh
# Please do not use Yarn v1 to install this package globally, Yarn v1 cannot properly patch dependencies.
npm install --global fcdns
```

## Usage
```sh
Usage: fcdns [options]

DNS relay server with fact-checking.

Options:
  -V, --version                output the version number
  --test-server <server>
  --untrusted-server <server>
  --trusted-server <server>
  --port [port]                   (default: "53")
  --timeout [seconds]             (default: "30")
  --ip-whitelist [filename]       (default: "ip-whitelist.txt")
  --hostname-whitelist [filename] (default: "hostname-whitelist.txt")
  --hostname-blacklist [filename] (default: "hostname-blacklist.txt")
  --route-cache [filename]        (default: "route.db")
  --test-cache [filename]         (default: "test.db")
  --test-timeout [ms]             (default: "200")
  --log [level]                   (default: "info")
  -h, --help                      display help for command
```

Example:
```sh
fcdns \
  --test-server=162.125.7.1 \
  --untrusted-server=127.0.0.1:5301 \
  --trusted-server=127.0.0.1:5302
```

## 原理
![流程图](./res/flow-chart.svg)

## 必要条件
使用fcdns需要指定3个服务器地址, 1份IP地址白名单, 1份主机名白名单.

### 投毒测试服务器(test server)
投毒测试服务器是一台非DNS服务器,
当客户端向该远程主机的53端口发送DNS查询(question)时, 查询将会超时或被拒绝.
当网络内存在DNS污染时, 向该远程主机发送DNS查询时, 将得到查询结果(answer).
基于此上述两个事实, fcdns通过查询A记录的方式以判断相关主机名是否被投毒.

通常, 在存在DNS污染的网络里, 任意不提供DNS服务器功能的在线主机都可以作为投毒测试服务器使用.
由于投毒测试可能由于网络原因导致失败, 为了能够区分网络原因导致的失败,
fcdns会在发出DNS查询的同时发出ping, 因此投毒测试服务器必须能够被ping通.

fcdns会持久化缓存投毒测试的结果, 同一个主机名只在第一次查询时会经历投毒测试.

### 不可信DNS服务器(untrusted server)
不可信DNS服务器是一台DNS服务器, 客户端与该服务器的连接是被污染的, 或该服务器可能返回被污染的结果.
从该服务器返回的结果虽然并不总是可信, 但借助投毒测试, 可以从中筛选出大量的可信结果.

之所以需要依赖不可信DNS服务器, 是因为不可信DNS服务器通常比可信DNS服务器更快响应, 且返回的结果更准确.

由于fcdns只提供DNS转发功能, 建议使用CoreDNS等程序建立本地DNS服务器作为背后的代理.

### 可信DNS服务器(trusted server)
可信DNS服务器是一台DNS服务器, 客户端与该服务器的连接是不被污染的, 且该服务器不会返回被污染的结果.

之所以需要可信DNS服务器, 是为了能够查询那些被投毒的主机名的正确记录.
可信DNS服务器返回的结果可能并不总是最准确, 但至少是具备可用性的.

由于fcdns只提供DNS转发功能, 建议使用CoreDNS等程序建立本地DNS服务器作为背后的代理.

### IP地址白名单(ip whitelist)
IP地址白名单用于指定允许用"不可信DNS服务器"返回的IP地址或IP地址范围,
所有不在白名单内的IP地址都会转用"可信DNS服务器"进行二次查询.

如果DNS查询返回了多条A记录, 则只要有一条A记录的IP地址与白名单匹配, 就算作命中.

fcdns会持久化缓存查询最终选择的服务器, 同一个主机名只在第一次查询时会被IP地址白名单影响.

之所以使用白名单而不是黑名单, 是因为通常情况下白名单所需记录的内容条数较少.

#### 文件格式
白名单是一个文本文件, 以行为分隔符储存地址或地址范围.
地址范围由起点IP和终点IP组成, 以`-`相连.

IPv4地址示例:
```
1.1.1.1
```

IPv6地址示例:
```
2606:4700:4700::1111
```

IPv4地址范围示例:
```
1.0.1.0-1.0.3.255
```

IPv6地址范围示例:
```
2001:250::-2001:252:ffff:ffff:ffff:ffff:ffff:ffff
```

如果不需要此功能, 则只需要将白名单设置为:
```
0.0.0.0-255.255.255.255
::-ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff
```

### 主机名白名单(hostname whitelist)
主机名白名单用于强制使某些主机名在解析时使用不可信DNS服务器, 其优先级高于fcdns里的其他规则.

### 主机名黑名单(hostname blacklist)
主机名白名单用于强制使某些主机名在解析时使用可信DNS服务器, 其优先级低于白名单, 高于fcdns里的其他规则.

#### 文件格式
白名单是一个文本文件, 以行为分隔符存储主机名模式.
主机名模式使用`*`作为通配符, 可以匹配任意个字符.
fcdns认为的合法主机名模式只能由数字, 字母, 连字符(`-`), 点(`.`), 通配符(`*`)组成.

主机名模式示例:
```
wikipedia.org
*.wikipedia.org
```

## 针对fcdns的攻击
### 以黑名单/白名单形式污染DNS服务器
禁止向非DNS服务器发送DNS数据包将会破坏fcdns的投毒测试功能.

### 无差别污染主机名
劫持所有DNS响应将会破坏fcdns的投毒测试功能.

### 随机投毒
随机投毒将会使fcdns生成错误的缓存记录.

### 禁止ping
禁止发送ping(echo request)或丢弃reply(echo reply)将会破坏fcdns的投毒测试功能.
