const mode = {
    h5 : true,
    app : false,
    mini_program : false
}

class DownloadFile {
    start = async (blob, fileName) => {
        if (mode.h5) {
            if (window.showSaveFilePicker) {
                let opts = {
                    suggestedName: `${fileName}.ydk`,
                    types: [{
                        description: '',
                        accept: {
                            'application/octet-stream': ['.ydk']
                        }
                    }],
                    excludeAcceptAllOption: true
                };
    
                let handle = await window.showSaveFilePicker(opts);
                let writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } else {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fileName}.ydk`;
                link.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 10000);
                return;
            }
        }

    };
}

const Download = new DownloadFile();

export default Download;