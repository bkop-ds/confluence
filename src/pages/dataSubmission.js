import { createFolder, uploadFileBox, updateLocalStorage, getFolderItems } from "../shared.js";
import { alertTemplate } from "../components/elements.js";
import { uploadInStudy } from "../components/modal.js";

export const template = async () => {
    // if(localStorage.data_summary === undefined) return '';
    const response = await getFolderItems(0);
    const array = response.entries.filter(obj => obj.type === 'folder' && (obj.name === 'BCAC' || obj.name === 'Confluence_NCI'));
    if(array.length <= 0) return;
    
    // const data_summary = JSON.parse(localStorage.data_summary);
    let template = '';
    
    template += `<div class="row create-study">
                <div class="upload-in-study"><button data-toggle="modal" data-target="#uploadInStudy" class="btn btn-light"><i class="fas fa-upload"></i> Upload data</button></div>
            </div>`;

    template += await uploadInStudy('uploadInStudy');
    
    template += '<div class="data-submission"><ul class="ul-list-style first-list-item">';

    for(let obj of array){
        const consortiaName = obj.name;
        let type = obj.type;
        let liClass = type === 'folder' ? 'collapsible consortia-folder' : '';
        let title = type === 'folder' ? 'Expand / Collapse' : '';
        template += `<li><a class="${liClass}" href="#"><i title="${title}" data-id="${obj.id}" data-status="pending" class="lazy-loading-spinner"></i></a> ${consortiaName}</li>`
    }


    // for(let consortiaId in data_summary){
    //     const consortiaName = data_summary[consortiaId].name;
    //     const studyEntries = data_summary[consortiaId].studyEntries;
    //     let type = data_summary[consortiaId].type;
    //     let liClass = type === 'folder' ? 'collapsible consortia-folder' : '';
    //     let expandClass = type === 'folder' ? 'fas fa-folder-plus' : 'fas fa-file-alt';
    //     let title = type === 'folder' ? 'Expand / Collapse' : '';
    //     template += `<li><a class="${liClass}" href="#"><i title="${title}" class="${expandClass}"></i></a> ${consortiaName}</li>`
    //     if(type === 'folder'){
    //         template += '<ul class="ul-list-style content">'
    //         for(let studyId in studyEntries){
    //             const studyName = studyEntries[studyId].name;
    //             type = studyEntries[studyId].type;
    //             liClass = type === 'folder' ? 'collapsible' : '';
    //             expandClass = type === 'folder' ? 'fas fa-folder-plus' : 'fas fa-file-alt';
    //             title = type === 'folder' ? 'Expand / Collapse' : '';
    //             template += `<li><a class="${liClass}" href="#"><i title="${title}" class="${expandClass}"></i></a> ${studyName}</li>`
    //             if(type === 'folder'){
    //                 const dataEntries = studyEntries[studyId].dataEntries;
    //                 template += '<ul class="ul-list-style content">'
    //                 for(let dataId in dataEntries){
    //                     const dataName = dataEntries[dataId].name;
    //                     type = dataEntries[dataId].type;
    //                     liClass = type === 'folder' ? 'collapsible' : '';
    //                     expandClass = type === 'folder' ? 'fas fa-folder-plus' : 'fas fa-file-alt';
    //                     title = type === 'folder' ? 'Expand / Collapse' : '';
    //                     template += `<li><a class="${liClass}" href="#"><i title="${title}" class="${expandClass}"></i></a> ${dataName}</li>`
    //                     if(type === 'folder'){
    //                         const fileEntries = dataEntries[dataId].fileEntries;
    //                         template += '<ul class="ul-list-style content">'
    //                         for(let fileId in fileEntries){
    //                             type = fileEntries[fileId].type;
    //                             const fileName = fileEntries[fileId].name;
    //                             liClass = type === 'folder' ? 'collapsible' : '';
    //                             expandClass = type === 'folder' ? 'fas fa-folder-plus' : 'fas fa-file-alt';
    //                             title = type === 'folder' ? 'Expand / Collapse' : '';
    //                             template += `<li><a class="${liClass}" href="#"><i title="${title}" class="${expandClass}"></i></a> ${fileName}</li>`
    //                         }
    //                         template += `</ul>`
    //                     }
    //                 }
    //                 template += `</ul>`
    //             }
    //         }
    //         template += `</ul>`
    //     }
    // }
    template += '</ul></div>';
    return template;
};

export const lazyload = () => {
    const spinners = document.getElementsByClassName('lazy-loading-spinner');
    Array.from(spinners).forEach(async element => {
        const id = element.dataset.id;
        const status = element.dataset.status;
        if(status !== 'pending') return;
        const allEntries = (await getFolderItems(id)).entries;
        element.dataset.status = 'complete';
        const entries = allEntries.filter(obj => obj.type === 'folder' && obj.name !== 'Confluence - CPSIII' && obj.name !== 'Confluence - Documents for NCI Participating Studies' && obj.name !== 'Samples');
        const fileEntries = allEntries.filter(obj => obj.type === 'file');
        if (entries.length > 0){
            const ul = document.createElement('ul');
            ul.classList.add('ul-list-style');
            ul.classList.add('content');

            for(const obj of entries){
                const li = document.createElement('li');
                let type = obj.type;
                let liClass = type === 'folder' ? 'collapsible consortia-folder' : '';
                let title = type === 'folder' ? 'Expand / Collapse' : '';
                li.innerHTML = `<a class="${liClass}" href="#"><i title="${title}" data-id="${obj.id}" data-status="pending" class="lazy-loading-spinner"></i></a> ${obj.name}`;
                ul.appendChild(li);
            }

            element.classList.remove('lazy-loading-spinner');
            element.classList.add('fas');
            element.classList.add('fa-folder-plus');
            element.parentNode.parentNode.appendChild(ul);
            dataSubmission(element.parentNode);
        }
        else if(fileEntries.length > 0) {
            const ul = document.createElement('ul');
            ul.classList.add('ul-list-style');
            ul.classList.add('content');

            for(const obj of fileEntries){
                const li = document.createElement('li');
                li.innerHTML = `<a href="#"><i title="files" data-id="${obj.id}" data-status="pending" class="fas fa-file-alt"></i></a> ${obj.name}`;
                ul.appendChild(li);
            }

            element.classList.remove('lazy-loading-spinner');
            element.classList.add('fas');
            element.classList.add('fa-folder-plus');
            element.parentNode.parentNode.appendChild(ul);
            dataSubmission(element.parentNode);
        }
    });
}

export const dataSubmission = (element) => {
    element.addEventListener('click', e => {
        e.preventDefault();
        element.classList.toggle('.active');
        let content = element.nextElementSibling;
        if (content.style.maxHeight){
            content.style.maxHeight = null;
            element.getElementsByClassName('fa-folder-minus')[0].classList.add('fa-folder-plus');
            element.getElementsByClassName('fa-folder-minus')[0].classList.remove('fa-folder-minus');
        } else {
            element.getElementsByClassName('fa-folder-plus')[0].classList.add('fa-folder-minus');
            element.getElementsByClassName('fa-folder-plus')[0].classList.remove('fa-folder-plus');
            content.style.maxHeight = "1000px";
            if(document.getElementsByClassName('lazy-loading-spinner').length !== 0){
                lazyload();
            }
        }
    });
    
    // let consortiaFolder = document.getElementsByClassName('consortia-folder');
    // Array.from(consortiaFolder).forEach(element => {
    //     element.dispatchEvent(new Event('click'));
    // });
};
