const Koa = require("koa");
const router = require("koa-router")();
const app = new Koa();
const path = require('path');
const mime = require('mime');
const fss = require('fs')
const fs = require('mz/fs');
var indexData = null;
fss.readFile("./view/page/index.html",  'utf8', (err, data)=>{
	if(err){
		throw err
	}
	indexData = data;
});
router.get("/view/page/index.html", async (ctx, next)=>{
	let rpath = ctx.request.path;
	ctx.response.type = mime.lookup(rpath);
	ctx.response.body = indexData;
})

// url: 类似 '/view/static/'
// dir: 类似 __dirname + '/view/static'
function staticFiles(url, dir) {
    return async (ctx, next) => {
        let rpath = ctx.request.path;
        // 判断是否以指定的url开头:
        if (rpath.startsWith(url)) {
            // 获取文件完整路径:
            let fp = path.join(dir, rpath.substring(url.length));
            // 判断文件是否存在:
            if (await fs.exists(fp)) {
                // 查找文件的mime:
                ctx.response.type = mime.lookup(rpath);
                // 读取文件内容并赋值给response.body:
                ctx.response.body = await fs.readFile(fp);
            } else {
                // 文件不存在:
                ctx.response.status = 404;
            }
        } else {
            // 不是指定前缀的URL，继续处理下一个middleware:
            await next();
        }
    };
}

app.use(staticFiles('/view/static/', __dirname + '/view/static'));
app.use(router.routes())
app.listen(3000);

console.log("app 已经起来了")