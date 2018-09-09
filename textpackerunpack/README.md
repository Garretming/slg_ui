# cocostudio的骨骼动画编辑器可以直接导出碎图

## python 脚本处理
需要提前安装好python环境，并安装Pillow才行

使用Python处理图片时需要第三方库支持——Python Imaging Library，这是Python下非常强大的处理图像的工具库

否则报错：

ImportError: No module named PIL

图形处理模块：

Pillow


1、在终端下使用命令：pip  如果报错：

sudo: pip: command not found
使用命令进行安装：

$ sudo easy_install pip



2、使用 pip 下载获取 Pillow

$ pip install pillow

下载不了可以手动下载：https://pypi.python.org/simple/pillow/

Pillow-2.5.1-cp27-none-macosx_10_6_intel.macosx_10_9_intel.macosx_10_9_x86_64.whl

安装whl文件使用：$ sudo pip install xxxx.xxxxxx.xxxxx.whl



### Mac OS下安装python 扩展库 PIL


sudo pip uninstall PIL
 
sudo pip install PIL --allow-external PIL --allow-unverified PIL


2014年09月04日 11:15:25 阅读数：17054
下载libjpeg和zlib：

http://www.ijg.org/files/jpegsrc.v6b.tar.gz

http://www.zlib.net

或者下载我上传的集合包

http://download.csdn.net/detail/zkdemon/7862399



安装libjpeg：

[python] view plaincopy

$ tar zxvf jpegsrc.v7.tar.gz   
$ cd jpeg-7  
$ ./configure --enable-shared --enable-static  
$ make  
$ sudo make install  
默认安装在了：/usr/local/lib下。

安装zlib：

[plain] view plaincopy

$ tar zxvf zlib-1.2.7.tar.gz  
$ ./configure  
$ make  
$ sudo make install  
默认安装在了：/usr/local/lib下。

修改PIL的setup.py：

[python] view plaincopy

JPEG_ROOT = "/usr/local/include"  
ZLIB_ROOT = "/usr/local/include"  
编译PIL：


[python] view plaincopy

$ python setup.py build_ext -i 
测试：

[python] view plaincopy

$ python selftest.py  
如果通过测试后
安装：

[plain] view plaincopy

$ python setup.py install
安装在/Library/Python/2.7/site-packages文件夹下
“X11/Xlib.h” mac os x SDK10.8 ／10.9 的问题


原因：  Mountain Lion 未随附 X11，但 XQuartz 项目提供适用于 OS X Mountain Lion 的 X11 服务器和客户端库：http://xquartz.macosforge.org。您应使用 XQuartz 2.7.2 版本或更高版本。

  解决方法：http://xquartz.macosforge.org下载安装 XQuartz 

  然后修改header 位置就好

[plain] view plaincopy

sudo ln -s /opt/X11/include/X11 /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX10.9.sdk/usr/include/
