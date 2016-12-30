export default (locale) => { 
    return async (ctx,next) => {
        var _locale = locale || 'EN';
        var msg;
        var code = 500;
        try {
            await next();
        } catch (e) {
            console.error('---> Global Exception Handler: \x1b[31m%s\x1b[0m => %s', e.name, e.message);
            msg = e.message;
            if (e.name == "token_error") {
                code = 302;
            } else if (e.name == "access_denied") {
                code = 403;
            } else if (["login_error", "checkcode_error", "Error"].indexOf(e.name) > -1) {
                // Do nothing. Just output origin message.
            } else {
                // internationalization
                switch (_locale) {
                    case 'CN':
                        msg = "操作失败,系统异常!";
                        break;
                    case 'EN':
                        msg = "Oops, system is busy now!";
                        break;
                    default:
                        msg = "Oops, system is busy now!";
                        break;
                }
            }

        } finally {
            if (msg) {
                this.body = { code: code, msg: msg };
            }
        }
    }
}