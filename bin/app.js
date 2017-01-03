import koa from "koa";
import responseTime from "koa-response-time";
import compress from "koa-compress";
import middlewares from "../middlewares";

import resourceUtil from "../resource-util/static-resource-util";

resourceUtil.startLoadProperties();


var app = new koa();
// x-response-time

app.use(responseTime());

// compression

app.use(compress());


app.use(middlewares.error());

app.use((ctx)=>{
    ctx.body = "hello";
});

export default app;