import { IAttendee } from './api';

export function getUIHandles() {
    return {
        strategy: document.getElementById('strategy') as HTMLSelectElement,
        apiTimeout: document.getElementById('apiTimeout') as HTMLInputElement,
        cacheExpires: document.getElementById('cacheExpires') as HTMLInputElement,
        apiResponseTime: document.getElementById('apiResponseTime') as HTMLInputElement,
        apiError: document.getElementById('apiError') as HTMLInputElement,
        goButton: document.getElementById('goButton') as HTMLButtonElement,
        status: document.getElementById('status') as HTMLSpanElement,
        loader: document.getElementById('loader') as HTMLDivElement,
        dataTable: document.getElementById('dataTable') as HTMLTableElement,
        dataBody: document.getElementById('dataBody') as HTMLTableSectionElement,

        showLoader(show: boolean) {
            this.loader.style.display = show ? 'block' : 'none';
        },
        setStatus(status: string) {
            this.status.innerText = status;
        },
        showResult(result: IAttendee[] | null) {
            if (!result) {
                this.dataTable.style.display = 'none';
            } else {
                while (this.dataBody.firstChild) {
                    this.dataBody.removeChild(this.dataBody.firstChild);
                }
                result.forEach((row) => {
                    const tr = this.dataBody.insertRow();
                    tr.insertCell().innerText = String(row.attendeeId);
                    tr.insertCell().innerText = String(row.name);
                    tr.insertCell().innerText = String(row.city);
                });
                this.dataTable.style.display = 'table';
            }
        },
    };
}
