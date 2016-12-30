// export default async (ctx,next) => {
//     await next();
//     console.log(ctx);
// }

export default (ctx,next)=>{
    return next().then(()=>{
        console.log(ctx);
    });
}