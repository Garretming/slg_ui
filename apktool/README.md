apktool反编译cm的settings失败，文件夹是空的，说无法打开其中的arsc文件（未损坏
apktool反编译cm的settings失败，文件夹是空的，说无法打开其中的arsc文件（未损坏），arsceditor等也不行，xml文件是16进制，xml编辑器打不开（打开也没用，是乱码）有jdk环境了，wi... 展开
 我来答
分享 举报 浏览 232 次
1个回答 热点话题： 咪蒙被爆离婚，你还会相信她的毒鸡汤吗？
最佳答案 匿名用户 
2016-01-07
反编译=回编译后分别是
　　　　smali目录 回编译为 classes.dex 文件
　　　　　res目录 回编译为 resources.arsc 文件
2、回编译顺序
在回编译时，会先检查“源”即resources
当你汉化文件，修改出错了（缺少一个符号也不行），
那么回编译会自动跳过编译res文件夹，直接回编译smali 。
所以，如果没有对smali（classes.dex）汉化，那么建议大家删掉这个文件夹，
这要会大大加快回编译速度。1、反编译=回编译后分别是
　　　　smali目录 回编译为 classes.dex 文件
　　　　　res目录 回编译为 resources.arsc 文件
2、回编译顺序
在回编译时，会先检查“源”即resources
当你汉化文件，修改出错了（缺少一个符号也不行），
那么回编译会自动跳过编译res文件夹，直接回编译smali 。
所以，如果没有对smali（classes.dex）汉化，那么建议大家删掉这个文件夹，
这要会大大加快回编译速度。
3、出错问题1
在汉化时，往往会不小心删掉一些符号，如 "<" ">"符号等等。
　　<string name="app_name">File Manager</string>
　　<string name="app_name">文件管理器/string>
　　<string name="app_name"文件管理器</string>
这些小小的错误都会导致回编时译检查出错。
所以汉化时，注意对校，然后再回编译。
建议使用一些高级的文本编辑器，支持语法高亮视图的。
4、出错问题2
最近发现有些APK文件 反编译后，就算不汉化直接回编译，都会出错。
有可能的原因1，反编译后XML文件语法中@符号 前面多了"\" （\@ ），
用文本编辑工具 直接替换【\@】为【@】，应该可以解决。
建议使用最新版本的反编译工具。
5、建议大家使用新版本的APKTool工具，
当然如果新的有问题也可以试试旧的一、系统文件汉化再次强调
1、汉化Settings.apk(系统设置)、MMS.apk（信息）、Phone.apk（电话）、
等等系统文件，一定要先 安装构架，具体看另个文件
<关于APKTool工具反编译Settings.apk问题>。
2、系统文件汉化完后不需要签名，直接替换汉化后的文件，就可以了。
主要是，系统文件放在系统目录，无需再次读取签名获得权限，已经是高级了。
二、打包说明
1、通常汉化完回编译后，会自动生成所有APK内的文件，或者自动生成*.APK文件。
但是建议大家不要直接使用该文件，进了使用替换法，替换掉你汉化后的文件，
如：resources.arsc，如果修改过的图片，等等…
2、很多人对于APK文件 解压缩或压缩 都用“WinRAR”或“好压”，这里不推荐。
　 希望大家安装7-Zip这个压缩工具，对于zip格式的支持是最好的。而且很方便，
不需要重新关联apk 直接右键打开就行了。替换直接拖拉进去，就OK了一、回编译出错问题
　　　　(1.提示 strings.xml 最后一行错误，检查是否</string>符号错误；
在汉化时，往往会不小心删掉一些符号，如 "<" ">"符号等等。
　　<string name="app_name">File Manager</string>
　　<string name="app_name">文件管理器/string>
　　<string name="app_name"文件管理器</string>
　　　　(2.提示 strings.xml 最顶部含中文代码首行错误，编码格式不对，转换成 UTF-8；
　　　　(3.提示 public.xml 出错，检查改动过的 arrays.xml 是否代码有错误的地方；
二、一切能正常但无法回编译
　　还有一种情况，apktool最新版本能正常反编译一个apk文件，在未做任何修改的情况下，无法回编译。
　　这是就要注意了，可以尝试一下用低版本的apktool进行【反编译】，然后在用高版本的apktoo工具【回编译】。
　　这里向大家推荐用 【APKDB】 这个工具，很方便，反编译时可以选择apktool的版本。
追问
额，安框架了，没用解不开
 本回答由提问者推荐
 赞    评论 分享 举报 收起
为你推荐：

其他类似问题
2016-11-28apktool编译问题，反编译失败.求助
2017-06-19apktool破arsc防修改 密码多少
2016-07-25apktool 回编译失败 怎么解决1
2016-11-21用apktool反编译framework-res.apk为什...
2016-11-14APK 反编译失败 是为啥
2018-04-05E4A写的APK用apktool反编译成功，但是修改后回编译...
2017-12-15APKTOOL怎样用的，我反编译成功之后回编译失败，出现下图... 27
2016-10-13apk反编译后为什么没有res文件夹，只有一个smali文件...12
更多相关apktool反编译出来的文件损坏的问题 >