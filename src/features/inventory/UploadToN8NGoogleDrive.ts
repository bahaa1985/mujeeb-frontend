
export async function uploadExcelFile(excelFile:File) {
    // const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    // if (fileInput.files && fileInput.files.length > 0) {
    if(excelFile){
//  const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', excelFile);
        try {
          const res = await fetch('https://n8n.srv1133301.hstgr.cloud/webhook-test/my-work-flow', {
            method: 'POST',
            mode: 'cors',
            // credentials: 'include',
            // headers: {
            //   'Accept': 'application/json',
            //   'X-Requested-With': 'XMLHttpRequest',
            //   'Access-Control-Allow-Origin':'*'
            // },
            body: formData
          });

          
          const content = await res.text();
          if (!res.ok) throw new Error(content || res.statusText);
        //  setStatus('Upload successful');
        } catch (err:unknown) {
            const message = err instanceof Error ? err.message : String(err);
            throw new Error('Upload failed: ' + message);
        //   setStatus('Upload failed: ' + message);
        }
    }
       
    // }
}