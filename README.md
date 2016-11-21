# indexSidebar
一步一步实现字母索引导航栏  
![img](https://github.com/luobotang/index-sidebar/raw/master/demo.gif)  
# Usage  
Install:  
```
npm i index-sidebar
```  
###### Require it in your code:
```
var IndexSidebar = require('index-sidebar')

var sidebar = new IndexSidebar()
sidebar.on('charChange', function (ch) {
  console.log(ch)
})
```
###### Or in your HTML include the script file:
```
<script src="index-sidebar/index.js"></script>
<script>
var sidebar = new IndexSidebar()
sidebar.on('charChange', function (ch) {
  console.log(ch)
})
</script>
```

