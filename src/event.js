import { countSpecificData, clearGraphAndParameters } from './pages/dataSummary.js';
import { getData } from './visulization.js'
import { showAnimation } from './shared.js';

export const addEventStudiesCheckBox = (dataObject, folderId) => {
    const studiesCheckBox = document.getElementsByName('studiesCheckBox');
    Array.from(studiesCheckBox).forEach(element => {
        element.addEventListener('click', () => {
            clearGraphAndParameters();
            const selectedValues = getAllSelectedStudies();
            if(selectedValues.length > 0){
                showAnimation();
                countSpecificData(selectedValues, dataObject[folderId].studyEntries);
            }
            else{
                document.getElementById('dataDropDown').hidden = true;
                document.getElementById('dataCount').textContent = '0';
            }
        });
    });
};

const getAllSelectedStudies = () => {
    let selectedValues = [];
    const studiesCheckBox = document.getElementsByName('studiesCheckBox');
    Array.from(studiesCheckBox).forEach(element => {
        if(element.checked) selectedValues.push(element.value);
    });
    return selectedValues;
}

const triggerEventStudies = (studyEntries) => {
    let studyIds = [];
    let values = [];
    let status = null;
    const dataTypeCheckBox = document.getElementsByName('dataTypeCheckBox');
    const casesCheckBox = document.getElementById('casesCheckBox');
    const controlsCheckBox = document.getElementById('controlsCheckBox');
    const studiesCheckBox = document.getElementsByName('studiesCheckBox');
    
    studiesCheckBox.forEach(element => {
        if(element.checked) studyIds.push(element.value);
    });
    dataTypeCheckBox.forEach(element => {
        if(element.checked) values.push(element.value);
    })
    if(casesCheckBox.checked && controlsCheckBox.checked) status = null;
    if(!casesCheckBox.checked && controlsCheckBox.checked) status = "0";
    if(casesCheckBox.checked && !controlsCheckBox.checked) status = "1";

    if(studyIds.length === 0) document.getElementById('dataDropDown').hidden = true;
    if(studyIds.length === 0 || values.length === 0) {
        clearGraphAndParameters();
    }
    else{
        clearGraphAndParameters();
        showAnimation();
        let caseCounter = 0;
        let controlCounter = 0;
        let dataCount = 0;
        studyIds.forEach(id => {
            dataCount += Object.keys(studyEntries[id].dataEntries).length;
            const dataEntries = studyEntries[id].dataEntries;
            for(let dataId in dataEntries){
                const fileEntries = dataEntries[dataId].fileEntries;
                for(let fileId in fileEntries){
                    controlCounter += fileEntries[fileId].controls;
                    caseCounter += fileEntries[fileId].cases;
                }
            }
        });
        document.getElementById('dataCount').textContent = dataCount;
        document.getElementById('caseCount').textContent = caseCounter;
        document.getElementById('controlCount').textContent = controlCounter;
        getData(studyEntries, studyIds, values, status);
    }
}

export const addEventSearchStudies = () => {
    const studiesCheckBox = document.getElementsByName('studiesCheckBox');
    const searchStudies = document.getElementById('searchStudies');
    searchStudies.addEventListener('keyup', () => {
        const keyword = searchStudies.value.toLowerCase().trim();
        if(keyword === "") {
            Array.from(studiesCheckBox).forEach(element => {
                element.parentNode.style.display = "";
            });
        }
        else{
            Array.from(studiesCheckBox).forEach(element => {
                const elementValue = element.nextElementSibling.innerHTML;
                if(elementValue.toLowerCase().trim().indexOf(keyword) === -1){
                    element.parentNode.style.display = "none";
                }
            });
        };
    });
};

export const addEventSelectAllStudies = (studyEntries) => {
    const studySelectAll = document.getElementById('studySelectAll');
    studySelectAll.addEventListener('click', () => {
        const studiesCheckBox = document.getElementsByName('studiesCheckBox');
        if(studySelectAll.checked === true){
            Array.from(studiesCheckBox).forEach(element => {
                if(element.checked === false && element.parentNode.style.display !== "none"){
                    element.checked = true;
                }
            });
        }
        else{
            Array.from(studiesCheckBox).forEach(element => {
                if(element.checked === true && element.parentNode.style.display !== "none"){
                    element.checked = false;
                }
            });
            document.getElementById('dataCount').textContent = '0';
            document.getElementById('caseCount').textContent = '0';
            document.getElementById('controlCount').textContent = '0';
        };
        triggerEventStudies(studyEntries);
    });
};

export const addEventDataTypeCheckBox = (studyEntries) => {
    let values = [];
    const dataTypeCheckBox = document.getElementsByName('dataTypeCheckBox');
    const casesCheckBox = document.getElementById('casesCheckBox');
    const controlsCheckBox = document.getElementById('controlsCheckBox');
    let status = null;
    Array.from(dataTypeCheckBox).forEach(element => {
        element.addEventListener('click', () => {
            clearGraphAndParameters();
            const value = element.value;
            const studyIds = element.dataset.studyId.split(',');

            if(casesCheckBox.checked && controlsCheckBox.checked) status = null;
            if(!casesCheckBox.checked && controlsCheckBox.checked) status = "0";
            if(casesCheckBox.checked && !controlsCheckBox.checked) status = "1";
            if(element.checked){
                values.push(value);
                showAnimation();
                getData(studyEntries, studyIds, values, status);
            }
            else{
                values.splice(values.indexOf(value), 1);
                if(checkBoxchecker(dataTypeCheckBox) === true) {
                    showAnimation();
                    getData(studyEntries, studyIds, values, status);
                }
            }
        });
    });
};

export const addEventSearchDataType = () => {
    const dataTypeCheckBox = document.getElementsByName('dataTypeCheckBox');
    const searchdataTypes = document.getElementById('searchdataTypes');
    searchdataTypes.addEventListener('keyup', () => {
        const keyword = searchdataTypes.value.toLowerCase().trim();
        if(keyword === "") {
            Array.from(dataTypeCheckBox).forEach(element => {
                element.parentNode.style.display = "";
            });
        }
        else{
            Array.from(dataTypeCheckBox).forEach(element => {
                const elementValue = element.value;
                if(elementValue.toLowerCase().trim().indexOf(keyword) === -1){
                    element.parentNode.style.display = "none";
                }
            });
        };
    });
};

export const addEventSelectAllDataType = (studyEntries) => {
    const dataTypeSelectAll = document.getElementById('dataTypeSelectAll');
    dataTypeSelectAll.addEventListener('click', () => {
        const dataTypeCheckBox = document.getElementsByName('dataTypeCheckBox');
        if(dataTypeSelectAll.checked === true){
            Array.from(dataTypeCheckBox).forEach(element => {
                if(element.checked === false && element.parentNode.style.display !== "none"){
                    element.checked = true;
                }
            });
        }
        else{
            Array.from(dataTypeCheckBox).forEach(element => {
                if(element.checked === true && element.parentNode.style.display !== "none"){
                    element.checked = false;
                }
            });
        }
        dispatchEventDataTypeSelectAll(studyEntries);
    });
};

const dispatchEventDataTypeSelectAll = (studyEntries) => {
    let studyIds = [];
    let values = [];
    const dataTypeCheckBox = document.getElementsByName('dataTypeCheckBox');
    const studiesCheckBox = document.getElementsByName('studiesCheckBox');
    
    studiesCheckBox.forEach(element => {
        if(element.checked) studyIds.push(element.value);
    });
    dataTypeCheckBox.forEach(element => {
        if(element.checked) values.push(element.value);
    });
    if(studyIds.length === 0 || values.length === 0) {
        clearGraphAndParameters();
    }
    else{
        clearGraphAndParameters();
        showAnimation();
        getData(studyEntries, studyIds, values, null);
    }
}

export const addEventCasesControls = (studyEntries) => {
    let status = null;
    let values = [];
    let studiesId = [];
    
    const casesCheckBox = document.getElementById('casesCheckBox');
    const controlsCheckBox = document.getElementById('controlsCheckBox');
    casesCheckBox.addEventListener('click', () => {
        const dataTypeCheckBox = document.getElementsByName('dataTypeCheckBox');
        Array.from(dataTypeCheckBox).forEach(element => {
            if(element.checked){
                values.push(element.value);
                studiesId = element.dataset.studyId.split(',');
            }
        });
        if(casesCheckBox.checked){
            if(controlsCheckBox.checked) status = null;
            if(!controlsCheckBox.checked) status = "1";
            getData(studyEntries, studiesId, values, status);
        }
        else{
            if(controlsCheckBox.checked) status = "0";
            if(!controlsCheckBox.checked) status = null;
            getData(studyEntries, studiesId, values, status);
        }
    });

    controlsCheckBox.addEventListener('click', () => {
        const dataTypeCheckBox = document.getElementsByName('dataTypeCheckBox');
        Array.from(dataTypeCheckBox).forEach(element => {
            if(element.checked){
                values.push(element.value);
                studiesId = element.dataset.studyId.split(',');
            }
        });
        if(controlsCheckBox.checked){
            if(casesCheckBox.checked) status = null;
            if(!casesCheckBox.checked) status = "0";
            getData(studyEntries, studiesId, values, status);
        }
        else{
            if(casesCheckBox.checked) status = "1";
            if(!casesCheckBox.checked) status = null;
            getData(studyEntries, studiesId, values, status);
        }
    });
}

const checkBoxchecker = (chkbox) => {
    let checkElements = false;
    Array.from(chkbox).forEach(element => {
        if(checkElements === true) return;
        checkElements = element.checked;
    });
    return checkElements;
};