class UniappFuncs {
    async selectFile (type : string, f : Function = () : void => { return; }) : Promise<any> {
        let result;
        try {
            uni.chooseFile({
                extension : [type],
                success : async (res : UniApp.ChooseFileSuccessCallbackResult) => {
                    result = await f(res);
                }
            });
        } catch (err) {
            console.error('选择文件失败:', err);
        } finally {
            return result;
        }
    }

    async readFile (file) : Promise<string> {
        if (typeof window !== 'undefined' && window.FileReader) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result as string);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        } else {
            return new Promise((resolve, reject) => {
                uni.readFile({
                    filePath: file.path,
                    encoding: 'utf-8',
                    success: (res) => resolve(res.data),
                    fail: reject
                });
            });
        }
    }
}

const Uniapp = new UniappFuncs()

export default Uniapp;